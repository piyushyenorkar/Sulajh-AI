import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Merchant, Role, User } from '@sulajh/shared';
import { db } from '../lib/db.js';
import { createAdminClient } from '../lib/supabase.js';

const TEST_JWT_SECRET = 'test-only-sulajh-jwt-secret-that-is-never-used-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_ISSUER = 'sulajh-api';
const JWT_AUDIENCE = 'sulajh-web';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;

  // Vitest does not load the application's environment by default. Keeping this
  // exception tightly scoped to tests avoids a production fallback secret.
  if (process.env.NODE_ENV === 'test') return TEST_JWT_SECRET;

  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}

/** Fail fast during application start rather than accepting a known fallback key. */
export function assertAuthConfiguration(): void {
  if (process.env.NODE_ENV === 'test') return;
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured');
  }
}

export interface AuthPayload {
  userId: string;
  role: Role;
  merchantId?: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

/**
 * Generates signed JWT for an authenticated user
 */
export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN as any,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

/**
 * Middleware: validates JWT and attaches auth payload to request
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        message: 'Missing or invalid authorization header (Bearer token required)',
        code: 'UNAUTHORIZED',
      },
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({
      error: {
        message: 'Token required',
        code: 'UNAUTHORIZED',
      },
    });
    return;
  }

  try {
    // 1. Check if token is a locally signed JWT (used by seed users, demo sessions, and staff)
    try {
      const decoded = jwt.verify(token, getJwtSecret(), {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }) as AuthPayload;
      const user = db.getUserById(decoded.userId);
      if (user && user.active) {
        req.auth = decoded;
        next();
        return;
      }
    } catch {
      // If locally signed verification fails or user not in memory, proceed to Supabase check
    }

    // 2. Otherwise verify via Supabase Auth session
    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) throw new Error('Invalid Supabase session');

    const { data: profile, error: profileError } = await admin
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .maybeSingle();
    if (profileError || !profile || !profile.active) throw new Error('Inactive profile');

    const validRoles: Role[] = ['merchant', 'ops_agent', 'ops_manager', 'admin', 'system_agent'];
    if (!validRoles.includes(profile.role as Role)) throw new Error('Invalid role');

    let merchant: Merchant | undefined;
    if (profile.role === 'merchant') {
      const merchantResult = await admin.from('merchants').select('*').eq('user_id', profile.id).maybeSingle();
      if (merchantResult.error || !merchantResult.data) throw new Error('Missing merchant profile');
      merchant = merchantResult.data as Merchant;
    }

    const user = profile as User;
    if (!db.getUserById(user.id)) db.getUsers().push(user);
    if (merchant && !db.getMerchantById(merchant.id)) db.getMerchants().push(merchant);
    req.auth = { userId: user.id, role: user.role, merchantId: merchant?.id, name: user.name };
    next();
  } catch {
    res.status(401).json({
      error: {
        message: 'Invalid or expired session token',
        code: 'TOKEN_INVALID',
      },
    });
  }
}

/**
 * Middleware factory: restricts access to specific roles
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({
        error: {
          message: 'Not authenticated',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    if (!roles.includes(req.auth.role)) {
      res.status(403).json({
        error: {
          message: `Access denied. Role '${req.auth.role}' is not authorized. Required: ${roles.join(', ')}`,
          code: 'FORBIDDEN',
          requiredRole: roles[0],
        },
      });
      return;
    }

    next();
  };
}

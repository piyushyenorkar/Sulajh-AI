import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@sulajh/shared';
import { db } from '../lib/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sulajh-ai-production-super-secret-key-32chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: (JWT_EXPIRES_IN as any) || '24h' });
}

/**
 * Middleware: validates JWT and attaches auth payload to request
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
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
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    // Verify user is active in DB
    const user = db.getUserById(decoded.userId);
    if (!user || !user.active) {
      res.status(401).json({
        error: {
          message: 'User account is deactivated or invalid',
          code: 'USER_INACTIVE',
        },
      });
      return;
    }

    req.auth = decoded;
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

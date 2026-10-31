import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { assertAuthConfiguration } from './middleware/auth.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { casesRouter } from './routes/cases.js';
import { settlementsRouter } from './routes/settlements.js';
import { incidentsRouter } from './routes/incidents.js';
import { metricsRouter } from './routes/metrics.js';
import { policiesRouter } from './routes/policies.js';
import { auditRouter } from './routes/audit.js';
import { evidenceRouter } from './routes/evidence.js';
import { mockEventsRouter } from './routes/mockEvents.js';
import { voiceRouter } from './routes/voice.js';

const app = express();

assertAuthConfiguration();

// ─── Global middleware ───────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));

// ─── Request logging ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'incoming request');
  next();
});

// ─── Health Route ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'sulajh-api', timestamp: new Date().toISOString() });
});
app.use('/api/health', healthRouter);

// ─── Core API Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/cases', casesRouter);
app.use('/api/merchant/settlements', settlementsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/audit', auditRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/mock/events', mockEventsRouter);
app.use('/api/voice', voiceRouter);

// ─── Central Error Handler (must be last) ────────────────────────────────────
app.use(errorHandler);

// ─── Start server ────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV ?? 'development' }, '🚀 Sulajh API is running');
});

export { app };

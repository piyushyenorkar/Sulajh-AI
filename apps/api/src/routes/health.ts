import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'sulajh-api',
    timestamp: new Date().toISOString(),
  });
});

export { healthRouter };

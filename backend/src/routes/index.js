import { Router } from 'express';
import healthRouter from './health.js';
import aiRouter from './ai.js';

const router = Router();

// Add sub-routers here
router.use('/health', healthRouter);
router.use('/ai', aiRouter);

export default router;

import { Router } from 'express';
import healthRouter from './health.js';

const router = Router();

// Add sub-routers here
router.use('/health', healthRouter);

export default router;

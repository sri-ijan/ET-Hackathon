import { Router } from 'express';
import healthRouter from './health.js';
import aiRouter from './ai.js';
import scheduleRouter from './schedule.js';
import dashboardRouter from "./dashboard.js";
const router = Router();

// Add sub-routers here
router.use('/health', healthRouter);
router.use('/ai', aiRouter);

router.use("/schedule", scheduleRouter);
router.use("/dashboard", dashboardRouter);
export default router;



import { Router } from "express";

import {
  uploadSchedule,
  getScheduleHistory,
  getScheduleAnalysis,
  deleteScheduleAnalysis,
} from "../controllers/schedule.js";

import { uploadScheduleFile } from "../middlewares/upload.js";
const router = Router();

// Upload & Analyze Schedule
router.post(
  "/upload",
  uploadScheduleFile,
  uploadSchedule
);

// Previous analyses
router.get(
  "/history",
  getScheduleHistory
);

// Single report
router.get(
  "/:id",
  getScheduleAnalysis
);

// Delete report
router.delete(
  "/:id",
  deleteScheduleAnalysis
);

export default router;


import { getAiHealth, getAiLlmStatus, postAiLlmTest, compareSpecs, ingestRfi, askRfi, getRfiStats } from '../controllers/ai.js';
import { validate } from '../middlewares/validate.js';
import { llmTestSchema } from '../validators/aiValidator.js';
import { uploadComplianceDocuments, uploadRfiDocument,uploadScheduleFile } from '../middlewares/upload.js';
import { Router } from 'express';
import {
  uploadSchedule,
  getScheduleHistory,
  getScheduleAnalysis,
  deleteScheduleAnalysis,
} from "../controllers/schedule.js";


const router = Router();


// =======
// POST /api/v1/ai/rfi/ingest   -> add a document to the RFI knowledge corpus
router.post('/rfi/ingest', uploadRfiDocument, ingestRfi);

// POST /api/v1/ai/rfi/ask      -> ask a question against the ingested corpus
router.post('/rfi/ask', askRfi);

// GET /api/v1/ai/rfi/stats     -> how many chunks are in the corpus right now
router.get('/rfi/stats', getRfiStats);

router.post(
  "/schedule/upload",
  uploadScheduleFile,
  uploadSchedule
);

router.get(
  "/schedule/history",
  getScheduleHistory
);

router.get(
  "/schedule/:id",
  getScheduleAnalysis
);

router.delete(
  "/schedule/:id",
  deleteScheduleAnalysis
);
export default router;
// >>>>>>> d243e42 (RAG pipeline sorted)

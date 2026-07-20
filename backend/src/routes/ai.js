

import { getAiHealth, getAiLlmStatus, postAiLlmTest, compareSpecs, ingestRfi, askRfi, getRfiStats } from '../controllers/ai.js';
import { validate } from '../middlewares/validate.js';
import { llmTestSchema } from '../validators/aiValidator.js';
import { uploadComplianceDocuments, uploadRfiDocument } from '../middlewares/upload.js';
import { Router } from 'express';

const router = Router();


// =======
// POST /api/v1/ai/rfi/ingest   -> add a document to the RFI knowledge corpus
router.post('/rfi/ingest', uploadRfiDocument, ingestRfi);

// POST /api/v1/ai/rfi/ask      -> ask a question against the ingested corpus
router.post('/rfi/ask', askRfi);

// GET /api/v1/ai/rfi/stats     -> how many chunks are in the corpus right now
router.get('/rfi/stats', getRfiStats);

export default router;
// >>>>>>> d243e42 (RAG pipeline sorted)

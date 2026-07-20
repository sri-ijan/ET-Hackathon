import { Router } from 'express';
<<<<<<< HEAD
import { getAiHealth, getAiLlmStatus, postAiLlmTest, compareSpecs } from '../controllers/ai.js';
import { validate } from '../middlewares/validate.js';
import { llmTestSchema } from '../validators/aiValidator.js';
import { uploadComplianceDocuments } from '../middlewares/upload.js';
=======
import { getAiHealth, getAiLlmStatus, postAiLlmTest, compareSpecs, ingestRfi, askRfi, getRfiStats } from '../controllers/ai.js';
import { validate } from '../middlewares/validate.js';
import { llmTestSchema } from '../validators/aiValidator.js';
import { uploadComplianceDocuments, uploadRfiDocument } from '../middlewares/upload.js';
>>>>>>> d243e42 (RAG pipeline sorted)

const router = Router();

// GET /api/v1/ai/health        -> is the Python AI service process up?
router.get('/health', getAiHealth);

// GET /api/v1/ai/llm-status    -> which LLM providers are configured there?
router.get('/llm-status', getAiLlmStatus);

// POST /api/v1/ai/llm-test     -> round-trip a prompt through Groq/Gemini fallback
router.post('/llm-test', validate(llmTestSchema), postAiLlmTest);

// POST /api/v1/ai/compare-specs -> upload and compare two spec files side-by-side
router.post('/compare-specs', uploadComplianceDocuments, compareSpecs);

<<<<<<< HEAD
export default router;
=======
// POST /api/v1/ai/rfi/ingest   -> add a document to the RFI knowledge corpus
router.post('/rfi/ingest', uploadRfiDocument, ingestRfi);

// POST /api/v1/ai/rfi/ask      -> ask a question against the ingested corpus
router.post('/rfi/ask', askRfi);

// GET /api/v1/ai/rfi/stats     -> how many chunks are in the corpus right now
router.get('/rfi/stats', getRfiStats);

export default router;
>>>>>>> d243e42 (RAG pipeline sorted)

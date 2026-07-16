import { Router } from 'express';
import { getAiHealth, getAiLlmStatus, postAiLlmTest } from '../controllers/ai.js';
import { validate } from '../middlewares/validate.js';
import { llmTestSchema } from '../validators/aiValidator.js';

const router = Router();

// GET /api/v1/ai/health        -> is the Python AI service process up?
router.get('/health', getAiHealth);

// GET /api/v1/ai/llm-status    -> which LLM providers are configured there?
router.get('/llm-status', getAiLlmStatus);

// POST /api/v1/ai/llm-test     -> round-trip a prompt through Groq/Gemini fallback
router.post('/llm-test', validate(llmTestSchema), postAiLlmTest);

export default router;

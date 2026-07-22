import { Router } from "express";

import {
  getAiHealth,
  getAiLlmStatus,
  postAiLlmTest,
  compareSpecs,
  ingestRfi,
  askRfi,
  getRfiStats,
  generateExecSummary,
  generateRfi,
} from "../controllers/ai.js";

import { validate } from "../middlewares/validate.js";
import { llmTestSchema, generateRfiSchema } from "../validators/aiValidator.js";

import {
  uploadComplianceDocuments,
  uploadRfiDocument,
  uploadRfiQuestion,
} from "../middlewares/upload.js";

const router = Router();

// AI Service Health
router.get("/health", getAiHealth);
router.get("/llm-status", getAiLlmStatus);
router.post("/llm-test", validate(llmTestSchema), postAiLlmTest);

// Specification Compliance
router.post("/compare-specs", uploadComplianceDocuments, compareSpecs);

// RFI Copilot
router.post("/rfi/generate-from-failure", validate(generateRfiSchema), generateRfi);
router.post("/rfi/ingest", uploadRfiDocument, ingestRfi);
router.post("/rfi/ask", uploadRfiQuestion, askRfi);
router.get("/rfi/stats", getRfiStats);

// Executive Summary
router.post("/exec-summary", generateExecSummary);

export default router;
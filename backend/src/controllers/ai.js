import { catchAsync } from '../utils/catchAsync.js';
<<<<<<< HEAD
import { checkAiHealth, checkAiLlmStatus, testAiLlm, compareSpecifications } from '../services/aiService.js';
import { ComplianceReport } from '../models/ComplianceReport.js';
=======
import { checkAiHealth, checkAiLlmStatus, testAiLlm, compareSpecifications, ingestRfiDocument, askRfiCopilot, getRfiCorpusStats } from '../services/aiService.js';
import { ComplianceReport } from '../models/ComplianceReport.js';
import { RFIQuery } from '../models/RFIQuery.js';
>>>>>>> d243e42 (RAG pipeline sorted)
import { AppError } from '../utils/AppError.js';

export const getAiHealth = catchAsync(async (req, res) => {
  const data = await checkAiHealth();
  res.status(200).json({ status: 'success', data });
});

export const getAiLlmStatus = catchAsync(async (req, res) => {
  const data = await checkAiLlmStatus();
  res.status(200).json({ status: 'success', data });
});

export const postAiLlmTest = catchAsync(async (req, res) => {
  const { prompt, system } = req.body;
  const data = await testAiLlm(prompt, system);
  res.status(200).json({ status: 'success', data });
});

export const compareSpecs = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.specification || !req.files.submittal) {
    return next(new AppError('Please upload both specification and submittal documents.', 400));
  }

  const specificationFile = req.files.specification[0];
  const submittalFile = req.files.submittal[0];

  // Send the documents to the AI FastAPI Service for extraction & comparison
  const data = await compareSpecifications(specificationFile, submittalFile);

  // Map and save the returned compliance analysis to our MongoDB database
  const report = await ComplianceReport.create({
    specificationFileName: specificationFile.originalname,
    submittalFileName: submittalFile.originalname,
    overallStatus: data.overall_status,
    summary: data.summary,
    source: data.source || 'live_llm',
    parameters: data.parameters.map((p) => ({
      parameterName: p.parameter_name,
      specificationValue: p.specification_value,
      submittalValue: p.submittal_value,
      status: p.status,
      deviationReason: p.deviation_reason,
      locationInSpec: p.location_in_spec,
      locationInSubmittal: p.location_in_submittal,
    })),
  });

  res.status(201).json({
    status: 'success',
    data: report,
  });
<<<<<<< HEAD
=======
});

export const ingestRfi = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a document to ingest.', 400));
  }
  const data = await ingestRfiDocument(req.file);
  res.status(201).json({ status: 'success', data });
});

export const askRfi = catchAsync(async (req, res, next) => {
  const { question } = req.body;
  if (!question || !question.trim()) {
    return next(new AppError('Question cannot be empty.', 400));
  }

  const data = await askRfiCopilot(question);

  // Log every Q&A — useful history for the RFI page, and future Exec Summary context.
  const saved = await RFIQuery.create({
    question: data.question,
    answer: data.answer,
    citations: (data.citations || []).map((c) => ({
      sourceFilename: c.source_filename,
      chunkIndex: c.chunk_index,
      excerpt: c.excerpt,
      similarity: c.similarity,
    })),
    source: data.source || 'live_llm',
  });

  res.status(200).json({ status: 'success', data: saved });
});

export const getRfiStats = catchAsync(async (req, res) => {
  const data = await getRfiCorpusStats();
  res.status(200).json({ status: 'success', data });
>>>>>>> d243e42 (RAG pipeline sorted)
});
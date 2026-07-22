import { catchAsync } from '../utils/catchAsync.js';
import {
  checkAiHealth,
  checkAiLlmStatus,
  testAiLlm,
  compareSpecifications,
  ingestRfiDocument,
  askRfiCopilot,
  getRfiCorpusStats,
  generateExecutiveSummary,
  generateRfiFromFailure,
} from '../services/aiService.js';
import { ComplianceReport } from '../models/ComplianceReport.js';
import { RFIQuery } from '../models/RFIQuery.js';
import { GeneratedRFI } from '../models/GeneratedRFI.js';
import { ScheduleAnalysis } from '../models/ScheduleAnalysis.js';
import { ExecSummary } from '../models/ExecSummary.js';
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
});

/**
 * Drafts a formal RFI from a single failed/flagged parameter of a Spec Compliance
 * audit (Module 1), via a live LLM call to the AI service, and persists the result.
 */
export const generateRfi = catchAsync(async (req, res, next) => {
  const {
    complianceReportId,
    parameterName,
    specificationValue,
    submittalValue,
    status,
    deviationReason,
    locationInSpec,
    locationInSubmittal,
    specificationFileName,
    submittalFileName,
  } = req.body;

  // If a report id is given, pull the original document filenames from it so the
  // AI service can reference them in the RFI, even if the frontend didn't send them.
  let specFileName = specificationFileName || null;
  let submittalFileNameResolved = submittalFileName || null;

  if (complianceReportId) {
    const report = await ComplianceReport.findById(complianceReportId);
    if (!report) {
      return next(new AppError('Compliance report not found for the given complianceReportId.', 404));
    }
    specFileName = specFileName || report.specificationFileName;
    submittalFileNameResolved = submittalFileNameResolved || report.submittalFileName;
  }

  const aiPayload = {
    parameter_name: parameterName,
    specification_value: specificationValue,
    submittal_value: submittalValue,
    status,
    deviation_reason: deviationReason || null,
    location_in_spec: locationInSpec || null,
    location_in_submittal: locationInSubmittal || null,
    specification_file_name: specFileName,
    submittal_file_name: submittalFileNameResolved,
  };

  const data = await generateRfiFromFailure(aiPayload);

  const saved = await GeneratedRFI.create({
    complianceReportId: complianceReportId || undefined,
    parameterName,
    specificationValue,
    submittalValue,
    status,
    deviationReason: deviationReason || null,
    rfiNumber: data.rfi_number,
    subject: data.subject,
    body: data.body,
    recommendedPriority: data.recommended_priority,
    source: data.source || 'live_llm',
  });

  res.status(201).json({ status: 'success', data: saved });
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
});

/**
 * Gathers the latest saved result from each of Modules 1-3 out of MongoDB, sends that
 * context to the AI service for synthesis, and saves the resulting executive summary.
 * This is the one controller that reads across multiple collections — by design, per
 * the PRD: Module 4 does no new extraction/retrieval of its own, only aggregation.
 */
export const generateExecSummary = catchAsync(async (req, res) => {
  const [latestCompliance, latestSchedule, recentRfi] = await Promise.all([
    ComplianceReport.findOne().sort({ createdAt: -1 }),
    ScheduleAnalysis.findOne().sort({ createdAt: -1 }),
    RFIQuery.find().sort({ createdAt: -1 }).limit(5),
  ]);

  const payload = {
    compliance_summary: latestCompliance?.summary || null,
    compliance_flag_count: latestCompliance?.parameters?.filter((p) => p.status !== 'pass').length || 0,
    schedule_summary: latestSchedule?.summary || null,
    schedule_overall_risk: latestSchedule?.overallProjectRisk || null,
    recent_rfi_questions: recentRfi.map((q) => q.question),
  };

  const data = await generateExecutiveSummary(payload);

  const saved = await ExecSummary.create({
    overallStatus: data.overall_status,
    headline: data.headline,
    topRisks: data.top_risks,
    recommendedActions: data.recommended_actions,
    fullSummary: data.full_summary,
    source: data.source || 'live_llm',
  });

  res.status(201).json({ status: 'success', data: saved });
});
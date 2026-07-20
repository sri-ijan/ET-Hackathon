import { catchAsync } from '../utils/catchAsync.js';
import { checkAiHealth, checkAiLlmStatus, testAiLlm, compareSpecifications } from '../services/aiService.js';
import { ComplianceReport } from '../models/ComplianceReport.js';
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
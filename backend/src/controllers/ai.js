import { catchAsync } from '../utils/catchAsync.js';
import { checkAiHealth, checkAiLlmStatus, testAiLlm } from '../services/aiService.js';

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

import { z } from 'zod';

export const llmTestSchema = {
  body: z.object({
    prompt: z.string().min(1, 'prompt is required').max(4000, 'prompt must be under 4000 characters'),
    system: z.string().max(2000).optional(),
  }),
};

export const generateRfiSchema = {
  body: z.object({
    complianceReportId: z.string().optional(),
    parameterName: z.string().min(1, 'parameterName is required'),
    specificationValue: z.string().min(1, 'specificationValue is required'),
    submittalValue: z.string().min(1, 'submittalValue is required'),
    status: z.enum(['fail', 'flagged'], {
      errorMap: () => ({ message: "status must be 'fail' or 'flagged'" }),
    }),
    deviationReason: z.string().optional().nullable(),
    locationInSpec: z.string().optional().nullable(),
    locationInSubmittal: z.string().optional().nullable(),
    specificationFileName: z.string().optional().nullable(),
    submittalFileName: z.string().optional().nullable(),
  }),
};
import { z } from 'zod';

export const llmTestSchema = {
  body: z.object({
    prompt: z.string().min(1, 'prompt is required').max(4000, 'prompt must be under 4000 characters'),
    system: z.string().max(2000).optional(),
  }),
};

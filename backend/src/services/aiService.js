import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

/**
 * Thin client for the FastAPI AI service (ai-service/).
 *
 * Nothing outside this file should know the AI service's base URL or
 * response shape — controllers call these functions and get back plain
 * data or a thrown AppError, same as any other service module.
 */

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  timeout: 25_000, // slightly above the AI service's own 20s LLM timeout
});

/**
 * Checks whether the AI service process is up at all.
 * Does not verify LLM provider connectivity — use checkAiLlmStatus for that.
 */
export const checkAiHealth = async () => {
  try {
    const { data } = await aiClient.get('/health');
    return data;
  } catch (err) {
    logger.error(`AI service health check failed: ${err.message}`);
    throw new AppError('AI service is unreachable. Is it running on ' + env.AI_SERVICE_URL + '?', 502);
  }
};

/**
 * Returns which LLM providers (Groq/Gemini) are configured on the AI service,
 * without making a paid/rate-limited call. Good for a dashboard status pill.
 */
export const checkAiLlmStatus = async () => {
  try {
    const { data } = await aiClient.get('/llm/status');
    return data;
  } catch (err) {
    logger.error(`AI service /llm/status failed: ${err.message}`);
    throw new AppError('Could not reach AI service LLM status endpoint.', 502);
  }
};

/**
 * Sends a prompt through the AI service's Groq→Gemini fallback chain.
 * @param {string} prompt
 * @param {string} [system]
 */
export const testAiLlm = async (prompt, system) => {
  try {
    const { data } = await aiClient.post('/llm/test', { prompt, system });
    return data;
  } catch (err) {
    if (err.response) {
      // AI service responded with an error (e.g. 502 all-providers-failed) — pass its message through.
      logger.error(`AI service /llm/test returned ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      throw new AppError(err.response.data?.detail || 'AI service rejected the request.', err.response.status);
    }
    // AI service didn't respond at all (down, network, timeout).
    logger.error(`AI service /llm/test unreachable: ${err.message}`);
    throw new AppError('AI service is unreachable. Is it running on ' + env.AI_SERVICE_URL + '?', 502);
  }
};

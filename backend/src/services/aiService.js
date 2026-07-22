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

/**
 * Forwards uploaded documents to the AI service's spec compliance comparison endpoint.
 * @param {Object} specFile - Multer file object for the specification
 * @param {Object} submittalFile - Multer file object for the submittal
 */
export const compareSpecifications = async (specFile, submittalFile) => {
  try {
    const formData = new FormData();

    // Create Blobs from buffer to append to native FormData (supported in Node 18+)
    const specBlob = new Blob([specFile.buffer], { type: specFile.mimetype });
    const submittalBlob = new Blob([submittalFile.buffer], { type: submittalFile.mimetype });

    formData.append('specification', specBlob, specFile.originalname);
    formData.append('submittal', submittalBlob, submittalFile.originalname);

    const { data } = await aiClient.post('/spec-compliance/compare', formData);
    return data;
  } catch (err) {
    // If the AI service responded at all — 400 (bad input) OR 500 (LLM/logic error on its side) —
    // that is a REAL problem to fix (usually a missing/invalid GROQ_API_KEY/GEMINI_API_KEY in
    // ai-service/.env, or a malformed LLM response). Surface it loudly. Do NOT silently swap in
    // mock data here — that's what was masking the actual failure before.
    if (err.response) {
      logger.error(`AI service /spec-compliance/compare returned ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      throw new AppError(
        err.response.data?.detail || 'AI service rejected the spec compliance request.',
        err.response.status
      );
    }

    // Only reach here if the AI service process is genuinely unreachable (not running / network error /
    // timeout — no HTTP response at all). This is the one case where a demo-safety mock is justified.
    logger.error(`AI service is UNREACHABLE at ${env.AI_SERVICE_URL}: ${err.message}. Returning a clearly-labeled local fallback so the demo doesn't hard-crash — this is NOT a real analysis.`);

    const specName = specFile.originalname.toLowerCase();
    let docType = 'Equipment Unit';
    let specCapacity = '500 kW';
    let submittalCapacity = '400 kW';
    let deviationReason = 'The vendor submittal provides 400 kW of rated capacity, which is lower than the specified 500 kW requirement.';

    if (specName.includes('ups') || specName.includes('battery')) {
      docType = 'Uninterruptible Power Supply (UPS)';
      specCapacity = '500 kVA';
      submittalCapacity = '400 kVA';
      deviationReason = 'Vendor submittal specifies a capacity of 400 kVA, which is below the 500 kVA required in the specification.';
    } else if (specName.includes('generator') || specName.includes('genset')) {
      docType = 'Diesel Generator Set';
      specCapacity = '2000 kW';
      submittalCapacity = '1800 kW';
      deviationReason = 'Vendor offers an 1800 kW standby generator, failing to meet the minimum 2000 kW specification requirement.';
    } else if (specName.includes('chiller') || specName.includes('cooling')) {
      docType = 'Water Cooled Chiller';
      specCapacity = '1200 TR';
      submittalCapacity = '1000 TR';
      deviationReason = 'Submittal specifies a chiller capacity of 1000 TR, which is insufficient for the 1200 TR design requirement.';
    }

    return {
      source: 'backend_fallback_mock',
      overall_status: 'fail',
      summary: `⚠ AI SERVICE UNREACHABLE — this is placeholder demo data, not a real analysis of your uploaded documents. Compliance audit for ${docType} (Local Demo Fallback) identified 1 critical failure (Rated Capacity) and 2 flagged warnings (Dimensions and UL Standards Listing).`,
      parameters: [
        {
          parameter_name: 'Equipment Classification',
          specification_value: docType,
          submittal_value: docType,
          status: 'pass',
          deviation_reason: null,
          location_in_spec: 'Section 1.1, Page 1',
          location_in_submittal: 'Section 1.0, Page 2',
        },
        {
          parameter_name: 'Rated Capacity',
          specification_value: specCapacity,
          submittal_value: submittalCapacity,
          status: 'fail',
          deviation_reason: deviationReason,
          location_in_spec: 'Section 3.2.1, Page 8',
          location_in_submittal: 'Section 2.4, Page 5',
        },
        {
          parameter_name: 'Dimensions (LxWxH)',
          specification_value: 'Max 3000 x 1500 x 2200 mm',
          submittal_value: '3100 x 1450 x 2100 mm',
          status: 'flagged',
          deviation_reason: 'Length (3100 mm) exceeds the specified maximum of 3000 mm. Requires spatial coordinator review for footprint clearance.',
          location_in_spec: 'Section 3.5, Page 10',
          location_in_submittal: 'Data Sheet, Page 11',
        },
        {
          parameter_name: 'Enclosure Protection Rating',
          specification_value: 'IP54 / NEMA 12',
          submittal_value: 'IP54',
          status: 'pass',
          deviation_reason: null,
          location_in_spec: 'Section 3.6, Page 11',
          location_in_submittal: 'Section 3.1, Page 7',
        },
        {
          parameter_name: 'Standards Compliance',
          specification_value: 'IEC 60947, UL 891 listed',
          submittal_value: 'IEC 60947 certified',
          status: 'flagged',
          deviation_reason: 'Missing explicit UL 891 listing documentation in the vendor submittal.',
          location_in_spec: 'Section 2.1, Page 3',
          location_in_submittal: 'Section 1.5, Page 3',
        },
      ],
    };
  }

};

/**
 * Sends a single failed/flagged compliance parameter to the AI service, which drafts
 * a formal RFI around that specific deviation via a live LLM call.
 * @param {Object} payload - { parameter_name, specification_value, submittal_value, status,
 *   deviation_reason, location_in_spec, location_in_submittal, specification_file_name, submittal_file_name }
 */
export const generateRfiFromFailure = async (payload) => {
  try {
    const { data } = await aiClient.post('/rfi-copilot/generate-from-failure', payload);
    return data;
  } catch (err) {
    if (err.response) {
      logger.error(`AI service /rfi-copilot/generate-from-failure failed: ${JSON.stringify(err.response.data)}`);
      throw new AppError(err.response.data?.detail || 'AI service rejected the RFI generation request.', err.response.status);
    }
    logger.error(`AI service unreachable for RFI generation: ${err.message}`);
    throw new AppError('AI service is unreachable. Is it running on ' + env.AI_SERVICE_URL + '?', 502);
  }
};

/**
 * Forwards a document to the AI service's RFI corpus (chunk + embed + store in Chroma).
 * No mock fallback here — ingestion either works or fails loudly. Silently pretending
 * to ingest a document that never actually got embedded would corrupt the demo corpus
 * invisibly, which is worse than a visible error.
 * @param {Object} docFile - Multer file object
 */
export const ingestRfiDocument = async (docFile) => {
  try {
    const formData = new FormData();
    const blob = new Blob([docFile.buffer], { type: docFile.mimetype });
    formData.append('document', blob, docFile.originalname);

    const { data } = await aiClient.post('/rfi-copilot/ingest', formData);
    return data;
  } catch (err) {
    if (err.response) {
      logger.error(`AI service /rfi-copilot/ingest failed: ${JSON.stringify(err.response.data)}`);
      throw new AppError(err.response.data?.detail || 'AI service rejected the RFI document.', err.response.status);
    }
    logger.error(`AI service unreachable for RFI ingest: ${err.message}`);
    throw new AppError('AI service is unreachable. Is it running on ' + env.AI_SERVICE_URL + '?', 502);
  }
};

/**
 * Asks a question against the ingested RFI corpus (RAG: retrieval + cited LLM answer).
 * @param {string} question
 */
export const askRfiCopilot = async (question) => {
  try {
    const formData = new FormData();
    formData.append('question', question);
    const { data } = await aiClient.post('/rfi-copilot/ask', formData);
    return data;
  } catch (err) {
    if (err.response) {
      logger.error(`AI service /rfi-copilot/ask failed: ${JSON.stringify(err.response.data)}`);
      throw new AppError(err.response.data?.detail || 'AI service rejected the question.', err.response.status);
    }
    logger.error(`AI service unreachable for RFI ask: ${err.message}`);
    throw new AppError('AI service is unreachable. Is it running on ' + env.AI_SERVICE_URL + '?', 502);
  }
};

export const getRfiCorpusStats = async () => {
  try {
    const { data } = await aiClient.get('/rfi-copilot/corpus-stats');
    return data;
  } catch (err) {
    logger.error(`AI service /rfi-copilot/corpus-stats failed: ${err.message}`);
    throw new AppError('Could not reach RFI corpus stats endpoint.', 502);
  }

};


/**
 * Sends a project schedule (CSV/XLS/XLSX) to the AI service
 * for Schedule Risk Radar analysis.
 */

export const analyzeSchedule = async (scheduleFile, asOfDate) => {

  try {
    const formData = new FormData();

    const scheduleBlob = new Blob([scheduleFile.buffer], {
      type: scheduleFile.mimetype,
    });

    formData.append(
      "schedule",
      scheduleBlob,
      scheduleFile.originalname
    );

    if (asOfDate) formData.append("as_of_date", asOfDate);

    const { data } = await aiClient.post(
      "/schedule-risk/analyze",
      formData
    );

    return data;
  } catch (err) {


    // No mock fallback here — same reasoning as compareSpecifications above: a
    // masked failure during rehearsal is worse than a visible one. The old fallback
    // also returned a stale response shape (tasks[]) that no longer matches what
    // the AI service actually returns (ranked_risks[]), so it would have silently
    // corrupted saved reports even in "fallback" mode.

    if (err.response) {
      logger.error(
        `AI service /schedule-risk/analyze failed: ${JSON.stringify(
          err.response.data
        )}`
      );

      throw new AppError(
        err.response.data?.detail ||
          "AI service rejected the schedule.",
        err.response.status
      );
    }

    logger.error(
      `AI service unreachable for schedule analysis: ${err.message}`
    );

    throw new AppError('AI service is unreachable. Is it running on ' + env.AI_SERVICE_URL + '?', 502);
  }
};

/**
 * Asks the AI service to synthesize an executive summary from the latest Modules 1-3 outputs.
 * The backend (not the AI service) is responsible for gathering "latest" data from MongoDB
 * and passing it in — the AI service itself has no DB access, by design.
 * @param {Object} payload - { compliance_summary, compliance_flag_count, schedule_summary, schedule_overall_risk, recent_rfi_questions }
 */
export const generateExecutiveSummary = async (payload) => {
  try {
    const { data } = await aiClient.post('/exec-summary/generate', payload);
    return data;
  } catch (err) {
    if (err.response) {
      logger.error(`AI service /exec-summary/generate failed: ${JSON.stringify(err.response.data)}`);
      throw new AppError(err.response.data?.detail || 'AI service rejected the exec summary request.', err.response.status);
    }
    logger.error(`AI service unreachable for exec summary: ${err.message}`);
    throw new AppError('AI service is unreachable. Is it running on ' + env.AI_SERVICE_URL + '?', 502);

  }
};
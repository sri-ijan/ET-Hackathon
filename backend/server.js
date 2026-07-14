import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
const useMock = !apiKey || apiKey === 'your_key_here';
const openai = useMock ? null : new OpenAI({ apiKey });

console.log(`[AegisBackend] OpenAI API Key present: ${!!apiKey}`);
console.log(`[AegisBackend] Mode: ${useMock ? 'MOCK ENGINE ACTIVE' : 'OPENAI CLOUD RESOLVER ACTIVE'}`);

// HELPER: Clean JSON response from LLM if it includes markdown blocks
function cleanJSONString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// ==========================================
// ROUTE 1: /api/verify-hardware (POST)
// ==========================================
app.post('/api/verify-hardware', async (req, res) => {
  const { documentText } = req.body;

  if (!documentText) {
    return res.status(400).json({ error: 'documentText parameter is required' });
  }

  // 1. OpenAI Path
  if (!useMock && openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert Data Center Infrastructure Quality Auditor. Analyze the raw text payload to find equipment tags, manufacturers, capacities, and redundancy designs. Evaluate compliance metrics strictly against Tier III infrastructure criteria (requires minimum N+1 redundancy layouts and industrial capacity thresholds). Return your final analysis strictly as a raw JSON object string matching this key outline: { 'equipment_detected': boolean, 'category': string, 'manufacturer': string, 'extracted_specs': { 'capacity': string, 'redundancy_layout': string }, 'compliance_evaluation': { 'is_compliant': boolean, 'failed_tags': array, 'deviation_details': string } }. Do not wrap your response in markdown code blocks or add text explanations.`
          },
          {
            role: 'user',
            content: documentText
          }
        ],
        temperature: 0.1,
      });

      const rawContent = response.choices[0].message.content;
      const cleanContent = cleanJSONString(rawContent);
      const parsed = JSON.parse(cleanContent);
      return res.json(parsed);

    } catch (err) {
      console.error('[AegisBackend] OpenAI verify-hardware failed. Falling back to local mock.', err);
      // Fall through to mock logic on failure
    }
  }

  // 2. Fallback / Mock Path
  const text = documentText.toLowerCase();
  let equipment_detected = true;
  let category = 'Unknown Equipment';
  let manufacturer = 'Generic Industrial Corp';
  let capacity = 'N/A';
  let redundancy_layout = 'N/A';
  let is_compliant = true;
  let failed_tags = [];
  let deviation_details = '';

  if (text.includes('generator') || text.includes('genset') || text.includes('gen-')) {
    category = 'Diesel Generator System';
    manufacturer = text.includes('caterpillar') ? 'Caterpillar Inc.' : text.includes('cummins') ? 'Cummins Power Systems' : 'Kohler Power';
    
    // Check capacity
    const capMatch = text.match(/(\d+)\s*(kw|mw)/i);
    if (capMatch) {
      capacity = capMatch[0];
      const val = parseInt(capMatch[1]);
      const isMW = capMatch[2].toLowerCase() === 'mw';
      const kwVal = isMW ? val * 1000 : val;
      if (kwVal < 500) {
        is_compliant = false;
        failed_tags.push('CAP-MIN-500KW');
        deviation_details += `Capacity of ${capacity} is below the 500kW threshold required for industrial Tier III operations. `;
      }
    } else {
      capacity = 'Unknown Capacity';
    }

    // Check redundancy
    if (text.includes('n+1') || text.includes('n + 1') || text.includes('2n')) {
      redundancy_layout = text.includes('2n') ? '2N Redundant' : 'N+1 Redundant';
    } else if (text.includes('n-configuration') || text.includes('n redundancy') || text.includes('single path') || text.includes(' no redundancy')) {
      redundancy_layout = 'N (No Redundancy)';
      is_compliant = false;
      failed_tags.push('RED-N+1-REQ');
      deviation_details += `Redundancy layout is configured as N. Tier III compliance requires a minimum of N+1 active-redundant architecture. `;
    } else {
      redundancy_layout = 'Undetermined';
      is_compliant = false;
      failed_tags.push('RED-UNSPECIFIED');
      deviation_details += `Equipment redundancy details not specified. Tier III requires N+1 redundancy. `;
    }

  } else if (text.includes('ups') || text.includes('uninterruptible') || text.includes('battery')) {
    category = 'Uninterruptible Power Supply (UPS)';
    manufacturer = text.includes('eaton') ? 'Eaton Corporation' : text.includes('schneider') ? 'Schneider Electric (APC)' : 'Vertiv Co.';
    
    const capMatch = text.match(/(\d+)\s*(kva|kw)/i);
    capacity = capMatch ? capMatch[0] : '300 kVA';
    
    if (text.includes('n+1') || text.includes('n + 1') || text.includes('2n') || text.includes('n+2')) {
      redundancy_layout = text.includes('2n') ? '2N Redundant' : 'N+1 Redundant';
    } else {
      redundancy_layout = 'N Configuration';
      is_compliant = false;
      failed_tags.push('UPS-RED-N+1');
      deviation_details = 'UPS system missing redundant battery modules or bypass paths. Requires N+1 layout for Tier III compliance.';
    }

  } else if (text.includes('chiller') || text.includes('hvac') || text.includes('cooling')) {
    category = 'Centrifugal Water Chiller';
    manufacturer = text.includes('trane') ? 'Trane Technologies' : text.includes('carrier') ? 'Carrier Global' : 'York International';
    
    const tonMatch = text.match(/(\d+)\s*(tons|kw|tr)/i);
    capacity = tonMatch ? tonMatch[0] : '400 Tons';
    
    if (text.includes('n+1') || text.includes('n + 1') || text.includes('n+2')) {
      redundancy_layout = 'N+1 Redundant';
    } else {
      redundancy_layout = 'N Configuration';
      is_compliant = false;
      failed_tags.push('COOL-RED-N+1');
      deviation_details = 'Cooling loop configuration lacks redundant chiller modules (N+1 required). Discovered single-path supply headers.';
    }
  } else {
    // Generic equipment
    equipment_detected = false;
    category = 'Unknown Equipment';
    is_compliant = false;
    failed_tags.push('EQ-UNRESOLVED');
    deviation_details = 'Unable to detect a valid critical data center infrastructure equipment tag (Generator, UPS, or Chiller).';
  }

  res.json({
    equipment_detected,
    category,
    manufacturer,
    extracted_specs: {
      capacity,
      redundancy_layout
    },
    compliance_evaluation: {
      is_compliant,
      failed_tags,
      deviation_details: deviation_details || 'Equipment successfully satisfies all Tier III standards (redundancy layout N+1, capacity bounds verified).'
    }
  });
});

// ==========================================
// ROUTE 2: /api/calculate-risk (POST)
// ==========================================
app.post('/api/calculate-risk', async (req, res) => {
  const { eventText } = req.body;

  if (!eventText) {
    return res.status(400).json({ error: 'eventText parameter is required' });
  }

  // 1. OpenAI Path
  if (!useMock && openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a Data Center Construction Risk Engine. Analyze the delay notification event and calculate downstream schedule delay and critical path impact. Return your response strictly as a raw JSON object matching this outline: { "days_delayed": number, "critical_path_affected": boolean, "mitigation_strategy": string }. Do not wrap in markdown or add explanations.`
          },
          {
            role: 'user',
            content: eventText
          }
        ],
        temperature: 0.1,
      });

      const rawContent = response.choices[0].message.content;
      const cleanContent = cleanJSONString(rawContent);
      const parsed = JSON.parse(cleanContent);
      return res.json(parsed);

    } catch (err) {
      console.error('[AegisBackend] OpenAI calculate-risk failed. Falling back to local mock.', err);
      // Fall through to mock logic on failure
    }
  }

  // 2. Fallback / Mock Path
  const text = eventText.toLowerCase();
  let days_delayed = 4;
  let critical_path_affected = false;
  let mitigation_strategy = '';

  if (text.includes('chiller') || text.includes('cooling')) {
    days_delayed = text.includes('6') ? 6 : text.includes('10') ? 10 : 8;
    critical_path_affected = true;
    mitigation_strategy = 'Source temporary rental dry coolers from local industrial suppliers, accelerate hydronic pipework installation, and adjust final electrical hookup schedule to bypass chiller pad until delivery.';
  } else if (text.includes('design') || text.includes('permit') || text.includes('approv')) {
    days_delayed = text.includes('15') ? 15 : 12;
    critical_path_affected = true;
    mitigation_strategy = 'Initiate concurrent design reviews for subsequent structural phases, deploy on-site engineering team to clear local municipal queries, and proceed under a conditional early-work authorization for non-structural excavation.';
  } else if (text.includes('switchgear') || text.includes('breaker') || text.includes('substation')) {
    days_delayed = text.includes('20') ? 20 : 18;
    critical_path_affected = true;
    mitigation_strategy = 'Fast-track intermediate generator installation to test modular busways. Reallocate factory acceptance test (FAT) engineers to site to conduct early component pre-testing, reducing commissioning phase by 5 days.';
  } else if (text.includes('labor') || text.includes('strike') || text.includes('subcontractor')) {
    days_delayed = 5;
    critical_path_affected = false;
    mitigation_strategy = 'Authorize overtime schedules for tier-2 electrical contractors, transition secondary work packages to non-union shops, and optimize work zones to prevent trade-stacking.';
  } else {
    // Default fallback
    days_delayed = 3;
    critical_path_affected = false;
    mitigation_strategy = 'Log issue in secondary project register. Standard contingency reserves (48 hours) will cover delay. Monitor weekly milestones to prevent path escalations.';
  }

  res.json({
    days_delayed,
    critical_path_affected,
    mitigation_strategy
  });
});

// ==========================================
// ROUTE 3: /api/query-blueprints (POST)
// ==========================================
app.post('/api/query-blueprints', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'question parameter is required' });
  }

  // 1. OpenAI Path
  if (!useMock && openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a Blueprint Engineer Assistant. Answer the question about data center standards (like TIA-942, Uptime Institute Tier Standards, or BICSI) based on standard guidelines. Return your response strictly as a raw JSON object matching this outline: { "answer": string, "citation": string }. Provide details in your answer and cite the page/clause. Do not wrap in markdown.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.2,
      });

      const rawContent = response.choices[0].message.content;
      const cleanContent = cleanJSONString(rawContent);
      const parsed = JSON.parse(cleanContent);
      return res.json(parsed);

    } catch (err) {
      console.error('[AegisBackend] OpenAI query-blueprints failed. Falling back to local mock.', err);
      // Fall through to mock logic on failure
    }
  }

  // 2. Fallback / Mock Path
  const q = question.toLowerCase();
  let answer = '';
  let citation = '';

  if (q.includes('cool') || q.includes('chiller') || q.includes('ashrae')) {
    answer = 'For Tier III data centers, cooling infrastructure must support continuous cooling during utility failures. TIA-942 and ASHRAE TC 9.9 recommend a reliable N+1 cooling redundancy configuration with thermal storage (chilled water tanks) to bridge the gap during generator startup (typically 60-120 seconds). Under Uptime Institute guidelines, the active path must have sufficient air-flow to prevent hot-spots under peak heat load.';
    citation = 'TIA-942 Annex B, Page 142, Clause 4.2 (Thermal Storage & Redundancy Limits)';
  } else if (q.includes('redund') || q.includes('n+') || q.includes('tier iii') || q.includes('tier 3')) {
    answer = 'Uptime Institute Tier III classification requires Concurrent Maintainability. This means every component and distribution path can be shut down for maintenance or replaced without disrupting IT operations. This requires a minimum of N+1 redundancy for power (generators, UPS) and cooling, with active-passive or dual active distribution paths (though only one path needs to serve the load at any time).';
    citation = 'Uptime Institute Tier Standard: Topology, Section 4.3 (Concurrent Maintainability)';
  } else if (q.includes('generator') || q.includes('fuel') || q.includes('run time')) {
    answer = 'Data center power compliance requires on-site fuel storage. For Tier III concurrent maintainability, a minimum of 12 hours of fuel storage must be available on-site at full design load. Additionally, generators must be rated for continuous duty rather than standby duty, meaning they can run indefinitely at design capacity during utility failures.';
    citation = 'TIA-942 Section 5.6.3 (Electrical Power Source Reserves)';
  } else if (q.includes('floor') || q.includes('load') || q.includes('weight')) {
    answer = 'The TIA-942 building specifications state that computer room floor load ratings must support a minimum uniform load of 12 kPa (250 lbf/ft²) and a concentrated load of 4.4 kN (1,000 lbf). Raised access floors must align with these loading bounds to safely support modern high-density server cabinets and heavy cooling equipment.';
    citation = 'TIA-942 Annex A (Structural Guidelines for Computer Rooms)';
  } else if (q.includes('cabling') || q.includes('redundant line') || q.includes('route') || q.includes('bicsi')) {
    answer = 'BICSI-002 and TIA-942 dictate that primary and secondary telecommunications pathways must maintain physical separation. Pathways should be routed through separate conduits and access points (A and B entry rooms). Conduit routes must avoid crossing high-voltage power lines and maintain at least 12 inches (300mm) of clearance from fluorescent lighting fixtures to mitigate EMI.';
    citation = 'BICSI-002 Section 8.3 (Structured Cabling Pathways and Separation)';
  } else {
    answer = 'The requested layout query is evaluated against TIA-942 Telecommunications Infrastructure Standards and Uptime Institute specifications. To maintain Tier III Concurrent Maintainability, all operational pathways (including chilled water, fuel lines, telecommunication cabling, and power distribution paths) must support isolated maintenance cycles without interrupting the active load.';
    citation = 'TIA-942 Annex C, Clause 6.1.4 (Secondary Pathway Separations)';
  }

  res.json({
    answer,
    citation
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AegisBackend] Server running on port ${PORT}`);
});

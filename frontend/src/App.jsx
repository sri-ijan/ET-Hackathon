import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Cpu,
  AlertTriangle,
  Terminal,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  FileCheck,
  RefreshCw,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Database,
  ChevronRight,
  Plus
} from 'lucide-react';

// Hardcoded standard invoice templates for Tab 1 Quick-fill
const HARDWARE_TEMPLATES = [
  {
    name: 'Non-Compliant Generator (N Layout / 450kW)',
    type: 'generator_fail',
    text: `EQUIPMENT SUBMITTAL - CRITICAL EMERGENCY POWER SYSTEMS
Submittal Reference: SUB-4029-GEN-02
Manufacturer: Cummins Power Generation
Equipment: Standalone Diesel Generator System (Genset-03)
Rated Capacity: 450 kW continuous rating (480V, 3-Phase, 60Hz)
Redundancy Configuration: Single Unit N-configuration layout.
Path Design: Direct single-circuit busway hookup to switchboard MSB-02 without redundant crossover bypass routes or external battery backup module bridges.
Location: Sector-B Generator Yard.`
  },
  {
    name: 'Compliant Generator (N+1 Layout / 600kW)',
    type: 'generator_pass',
    text: `EQUIPMENT SUBMITTAL - CRITICAL EMERGENCY POWER SYSTEMS
Submittal Reference: SUB-4029-GEN-01
Manufacturer: Caterpillar Inc.
Equipment: Critical Backup Generator Assembly (Genset-01 / Genset-02)
Rated Capacity: 600 kW continuous rating (480V, 3-Phase, 60Hz)
Redundancy Configuration: Active N+1 parallel redundant module arrangement.
Path Design: Duel-fed primary and secondary switchboards via independent automatic transfer switches (ATS-01/02) and active bypass isolation loops.
Location: Sector-A Generator Yard.`
  },
  {
    name: 'Non-Compliant Chiller (N Layout / 300 Ton)',
    type: 'chiller_fail',
    text: `TECHNICAL SPECIFICATION - HEAT REJECTION SYSTEMS
Submittal Reference: SUB-1082-COOL-05
Manufacturer: Carrier Global
Equipment: AquaForce Chillers (CH-01)
Capacity: 300 Tons nominal capacity
Redundancy Configuration: Single-chassis N layout
Distribution Paths: Single-path chilled water loop distribution headers. No backup heat-exchanger loop or secondary pumps available on primary cooling circuit.`
  },
  {
    name: 'Compliant UPS (N+1 / 600 kVA)',
    type: 'ups_pass',
    text: `TECHNICAL SPECIFICATION - UNINTERRUPTIBLE POWER SUPPLY
Submittal Reference: SUB-5011-UPS-12
Manufacturer: Vertiv Co.
Equipment: Liebert EXL S1 UPS Modules
Capacity: 600 kVA system rating
Redundancy Configuration: N+1 module layout with internal static bypass switches and dual active-active utility input lines. Supports hot-swappable power cores.`
  }
];

// Delay events for Tab 2 Risk Engine
const DELAY_EVENTS = [
  {
    id: 'evt-chiller',
    title: 'Port Congestion Delay: Chillers',
    snippet: '3x Chiller Units delayed 6 days due to port congestion.',
    impactText: 'Notification: 3x Chiller Units delayed 6 days due to port congestion. Immediate schedule recalculation required.',
    affectedSector: 'Procurement'
  },
  {
    id: 'evt-permit',
    title: 'Structural Permit Delay',
    snippet: 'City structural permit approval delayed 15 days.',
    impactText: 'Notification: City Council structural permit approval delayed 15 days. Critical path impacts detected.',
    affectedSector: 'Design'
  },
  {
    id: 'evt-switchgear',
    title: 'Switchgear Test Failure',
    snippet: 'High-voltage switchgear factory test failure causes 20-day transit hold.',
    impactText: 'Notification: High-voltage switchgear factory test failure causes 20-day transit hold. Main Substation affected.',
    affectedSector: 'Building'
  }
];

// Pre-built suggestions for Tab 3 Chatbot
const CHAT_SUGGESTIONS = [
  'Verify Tier III cooling redundancy requirements',
  'Check generator fuel reserve specifications',
  'What are BICSI-002 pathway clearance standards?',
  'Determine floor load limits under TIA-942'
];

function App() {
  const [activeTab, setActiveTab] = useState('compliance'); // 'compliance', 'timeline', 'chatbot'
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');

  // --- TAB 1 STATE (Specification Compliance Hub) ---
  const [documentText, setDocumentText] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // --- TAB 2 STATE (Interactive Risk Timeline) ---
  const [activeEvent, setActiveEvent] = useState(null);
  const [isCalculatingRisk, setIsCalculatingRisk] = useState(false);
  const [riskImpact, setRiskImpact] = useState(null);

  // Timeline schedule blocks standard settings
  const defaultTimeline = [
    { name: 'Design', duration: 45, date: 'Oct 15, 2026', health: 100, status: 'good' },
    { name: 'Procurement', duration: 90, date: 'Jan 20, 2027', health: 100, status: 'good' },
    { name: 'Building', duration: 180, date: 'Jun 10, 2027', health: 100, status: 'good' },
    { name: 'Testing', duration: 60, date: 'Sep 01, 2027', health: 100, status: 'good' }
  ];
  const [timelineBlocks, setTimelineBlocks] = useState(defaultTimeline);

  // --- TAB 3 STATE (Blueprint Chatbot) ---
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Aegis Blueprint RAG Agent initialized. Connected to TIA-942, Uptime Institute Topologies, and BICSI commissioning standards database. Input a query or select a suggestion pill below.',
      citation: 'System Baseline Initialization'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // --- TAB 1 API CALL: AI Compliance Audit ---
  const handleRunAudit = async () => {
    if (!documentText.trim()) return;
    setIsAuditing(true);
    setAuditResult(null);

    try {
      const res = await fetch(`${backendUrl}/api/verify-hardware`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText })
      });
      if (!res.ok) throw new Error('API server returned status ' + res.status);
      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error('[AegisFront] Audit API Error:', err);
      // Hardcoded UI fallback client-side if server is offline
      setAuditResult({
        equipment_detected: true,
        category: 'Diesel Generator System (Client Fallback)',
        manufacturer: 'Cummins Power Systems',
        extracted_specs: {
          capacity: '450 kW',
          redundancy_layout: 'N Configuration'
        },
        compliance_evaluation: {
          is_compliant: false,
          failed_tags: ['CAP-MIN-500KW', 'RED-N+1-REQ'],
          deviation_details: 'Fallback Evaluation: Generator capacity 450 kW is below the 500 kW critical threshold. Single path N configuration does not support concurrent maintainability. Minimum N+1 redundancy required.'
        }
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // --- TAB 2 API CALL: Risk Calculation ---
  const handleEventClick = async (eventObj) => {
    setActiveEvent(eventObj.id);
    setIsCalculatingRisk(true);
    setRiskImpact(null);

    try {
      const res = await fetch(`${backendUrl}/api/calculate-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventText: eventObj.impactText })
      });
      if (!res.ok) throw new Error('API error ' + res.status);
      const data = await res.json();
      setRiskImpact(data);
      updateTimeline(eventObj, data.days_delayed);
    } catch (err) {
      console.error('[AegisFront] Risk API Error:', err);
      // Fallback calculation
      let mockDelay = 5;
      let mitigation = '';
      let isCritical = true;

      if (eventObj.id === 'evt-chiller') {
        mockDelay = 6;
        mitigation = 'Source temporary rental dry coolers, accelerate primary pipework installation, adjust electrical hookups.';
      } else if (eventObj.id === 'evt-permit') {
        mockDelay = 15;
        mitigation = 'Initiate concurrent design reviews, deploy site engineers to clear city hall queries, work under early-excavation waiver.';
      } else if (eventObj.id === 'evt-switchgear') {
        mockDelay = 20;
        mitigation = 'Fast-track generator setup. Conduct pre-testing at factory level with site engineers present to shave 5 days off final comms.';
      }

      const mockData = {
        days_delayed: mockDelay,
        critical_path_affected: isCritical,
        mitigation_strategy: mitigation
      };
      setRiskImpact(mockData);
      updateTimeline(eventObj, mockDelay);
    } finally {
      setIsCalculatingRisk(false);
    }
  };

  // Update timeline blocks dynamically
  const updateTimeline = (eventObj, days) => {
    const updated = defaultTimeline.map((block) => {
      let isAffected = false;
      let health = 100;
      let status = 'good';
      let delayDays = days;

      if (eventObj.id === 'evt-chiller') {
        // Chillers are procurement phase items, downstream is Building and Testing
        if (block.name === 'Procurement') {
          isAffected = true;
          health = 80;
          status = 'warning';
        } else if (block.name === 'Building' || block.name === 'Testing') {
          isAffected = true;
          health = 85;
          status = 'warning';
        }
      } else if (eventObj.id === 'evt-permit') {
        // Permits affect Design phase onwards (whole timeline)
        isAffected = true;
        health = 45;
        status = 'critical';
      } else if (eventObj.id === 'evt-switchgear') {
        // Switchgear impacts Building phase, affecting Testing
        if (block.name === 'Building' || block.name === 'Testing') {
          isAffected = true;
          health = 35;
          status = 'critical';
        }
      }

      if (isAffected) {
        // Calculate new estimated dates by adding days
        let newDateStr = '';
        if (block.name === 'Design') newDateStr = 'Oct 30, 2026';
        else if (block.name === 'Procurement') newDateStr = eventObj.id === 'evt-permit' ? 'Feb 04, 2027' : 'Jan 26, 2027';
        else if (block.name === 'Building') newDateStr = eventObj.id === 'evt-permit' ? 'Jun 25, 2027' : eventObj.id === 'evt-switchgear' ? 'Jun 30, 2027' : 'Jun 16, 2027';
        else if (block.name === 'Testing') newDateStr = eventObj.id === 'evt-permit' ? 'Sep 16, 2027' : eventObj.id === 'evt-switchgear' ? 'Sep 21, 2027' : 'Sep 07, 2027';

        return {
          ...block,
          date: `${newDateStr} (+${delayDays}d)`,
          health,
          status
        };
      }
      return block;
    });
    setTimelineBlocks(updated);
  };

  const handleResetTimeline = () => {
    setActiveEvent(null);
    setRiskImpact(null);
    setTimelineBlocks(defaultTimeline);
  };

  // --- TAB 3 API CALL: Blueprint Chatbot ---
  const handleSendMessage = async (queryText = null) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim()) return;

    // Add user message to state
    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setChatInput('');

    setChatLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/query-blueprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend })
      });
      if (!res.ok) throw new Error('API server error ' + res.status);
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.answer,
        citation: data.citation
      }]);
    } catch (err) {
      console.error('[AegisFront] Chatbot API Error:', err);
      // Fallback response generator
      let fallbackText = 'Analyzing database... Defaulting to standard TIA-942 specifications. Under Clause 4.2.1, all redundant infrastructure lines must support independent operations.';
      let fallbackCitation = 'TIA-942 Section 5.3 (Client-side Fallback Reference)';

      const lower = textToSend.toLowerCase();
      if (lower.includes('cool') || lower.includes('chiller')) {
        fallbackText = 'For Tier III data centers, cooling infrastructure must support continuous cooling during utility failures. TIA-942 recommends a minimum of N+1 cooling redundancy with active-passive thermal reserves to bridge generator transition gaps.';
        fallbackCitation = 'TIA-942 Annex B, Page 142, Clause 4.2';
      } else if (lower.includes('redund') || lower.includes('tier 3') || lower.includes('tier iii')) {
        fallbackText = 'Uptime Institute Tier III classification requires Concurrent Maintainability. This mandates that any component (UPS, generator, chilled water pump) can be isolated for repair or replacement without interrupting operations.';
        fallbackCitation = 'Uptime Institute Topology Standards, Section 4.3';
      } else if (lower.includes('generator') || lower.includes('fuel')) {
        fallbackText = 'Tier III specifications mandate continuous-rated generators with a minimum of 12 hours of on-site fuel storage calculated under peak design load conditions.';
        fallbackCitation = 'TIA-942 Section 5.6.3 (Electrical Power Reserves)';
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallbackText,
        citation: fallbackCitation
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Click suggestions or reference standard in Chatbot
  const handlePillClick = (text) => {
    handleSendMessage(text);
  };

  const handleRefClick = (refName) => {
    setChatInput(`Explain requirements from ${refName}`);
  };

  // Quick fill tab 1
  const handleQuickFill = (text) => {
    setDocumentText(text);
    setAuditResult(null);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans select-none relative bg-dots">
      {/* Top HUD Header Banner */}
      <header className="border-b border-obsidian-800 bg-obsidian-900/80 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neon-emerald/10 border border-neon-emerald/30 rounded flex items-center justify-center glow-emerald">
            <Shield className="w-6 h-6 text-neon-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-mono text-slate-100 uppercase">
                Aegis<span className="text-neon-emerald">EPC</span>
              </h1>
              <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                v2.4.9-PROD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Control Room System Console
            </p>
          </div>
        </div>

        {/* Project Horizon Info */}
        <div className="flex items-center gap-3 bg-obsidian-950 border border-obsidian-800 px-4 py-2 rounded-md">
          <div className="w-2.5 h-2.5 bg-neon-emerald rounded-full animate-pulse"></div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Site Focus</div>
            <div className="text-sm font-semibold font-mono text-slate-200">
              Project Horizon - 900MW Facility Expansion
            </div>
          </div>
        </div>

        {/* API Selector Helper */}
        <div className="flex items-center gap-2 bg-obsidian-950 border border-obsidian-800 px-3 py-1 rounded">
          <span className="text-[10px] font-mono text-slate-500">API:</span>
          <input
            type="text"
            className="bg-transparent font-mono text-xs border-0 focus:outline-none focus:ring-0 text-slate-300 w-32"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="Backend URL"
          />
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* SIDEBAR: Project Metadata Tracking */}
        <aside className="w-full lg:w-80 border-r border-obsidian-800 bg-obsidian-900/50 p-6 flex flex-col justify-between gap-6 shrink-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">PROJECT PROFILE</span>
              <Cpu className="w-4 h-4 text-neon-emerald" />
            </div>

            {/* Static HUD Specifications */}
            <div className="space-y-4">
              <div className="bg-obsidian-950 border border-obsidian-800 p-3.5 rounded-lg space-y-1 hover:border-slate-700 transition">
                <div className="text-[10px] font-mono text-slate-500 uppercase">PROJECT SCALE</div>
                <div className="text-lg font-bold font-mono text-slate-200">2,700 MW</div>
                <div className="text-xs font-mono text-neon-emerald">Target Capacity by 2027</div>
              </div>

              <div className="bg-obsidian-950 border border-obsidian-800 p-3.5 rounded-lg space-y-1 hover:border-slate-700 transition">
                <div className="text-[10px] font-mono text-slate-500 uppercase">LINE EQUIPMENT SCOPE</div>
                <div className="text-lg font-bold font-mono text-slate-200">40,000 Items</div>
                <div className="text-xs font-mono text-slate-400">Line Items Registered</div>
              </div>

              <div className="bg-obsidian-950 border border-obsidian-800 p-3.5 rounded-lg space-y-1 hover:border-slate-700 transition">
                <div className="text-[10px] font-mono text-slate-500 uppercase">AUDIT COMPLIANCE LEVEL</div>
                <div className="text-lg font-bold font-mono text-slate-200">Tier III / IV</div>
                <div className="text-xs font-mono text-neon-amber">Uptime Institute Standards</div>
              </div>

              <div className="bg-obsidian-950 border border-obsidian-800 p-3.5 rounded-lg space-y-1 hover:border-slate-700 transition">
                <div className="text-[10px] font-mono text-slate-500 uppercase">PRIMARY PIPELINE CLASSIFICATION</div>
                <div className="text-lg font-bold font-mono text-slate-200">Concurrent Maintainability</div>
                <div className="text-xs font-mono text-neon-emerald">Active Dual-Path Active/Passive</div>
              </div>
            </div>
          </div>

          {/* Telemetry Visual Feed */}
          <div className="bg-obsidian-950 border border-obsidian-800 p-4 rounded-lg space-y-2 mt-auto font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-obsidian-800 pb-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Live Engine Diagnostics</span>
              <span className="w-2 h-2 bg-neon-emerald rounded-full animate-ping"></span>
            </div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div>SYS.LOAD: <span className="text-neon-emerald">4.2% (OK)</span></div>
              <div>BUFFERS: <span className="text-neon-emerald">1024MB / CLEAR</span></div>
              <div>API_NODE: <span className="text-slate-300 truncate block">{backendUrl}</span></div>
            </div>
            <div className="h-1 bg-obsidian-800 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-neon-emerald rounded-full"></div>
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 flex flex-col bg-obsidian-950">
          
          {/* Real-time counters / Status HUD grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 border-b border-obsidian-800 bg-obsidian-900/20">
            <div className="border-r border-b md:border-b-0 border-obsidian-800 p-5 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Equipment Checked</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-200">24,192</span>
                <span className="text-xs font-mono text-slate-500">/ 40k</span>
              </div>
              <div className="w-full bg-obsidian-850 h-1 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-neon-emerald" style={{ width: '60.48%' }}></div>
              </div>
            </div>

            <div className="border-r border-b md:border-b-0 border-obsidian-800 p-5 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Contractors</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-200">142</span>
                <span className="text-xs font-mono text-neon-emerald">▲ 8% this wk</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-2">Trades on site currently</div>
            </div>

            <div className="border-r border-obsidian-800 p-5 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Critical Paths Flagged</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-neon-amber">3</span>
                <span className="text-xs font-mono text-slate-500">Active Risks</span>
              </div>
              <div className="text-[10px] font-mono text-neon-amber mt-2">Require Mitigation Plan</div>
            </div>

            <div className="p-5 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Compliance Score (%)</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-neon-emerald">94.2%</span>
                <span className="text-xs font-mono text-slate-500">Tier III Target</span>
              </div>
              <div className="text-[10px] font-mono text-neon-emerald mt-2">98.5% needed for audits</div>
            </div>
          </section>

          {/* 3-TAB CONTROLS */}
          <div className="border-b border-obsidian-800 bg-obsidian-900/60 flex items-center justify-between px-6">
            <nav className="flex space-x-1" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('compliance')}
                className={`py-4 px-6 font-mono text-xs font-semibold uppercase tracking-wider border-b-2 focus:outline-none transition-all flex items-center gap-2 ${
                  activeTab === 'compliance'
                    ? 'border-neon-emerald text-neon-emerald bg-neon-emerald/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-obsidian-800'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Specification Compliance Hub
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 px-6 font-mono text-xs font-semibold uppercase tracking-wider border-b-2 focus:outline-none transition-all flex items-center gap-2 ${
                  activeTab === 'timeline'
                    ? 'border-neon-emerald text-neon-emerald bg-neon-emerald/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-obsidian-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                Interactive Risk Timeline
              </button>
              <button
                onClick={() => setActiveTab('chatbot')}
                className={`py-4 px-6 font-mono text-xs font-semibold uppercase tracking-wider border-b-2 focus:outline-none transition-all flex items-center gap-2 ${
                  activeTab === 'chatbot'
                    ? 'border-neon-emerald text-neon-emerald bg-neon-emerald/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-obsidian-800'
                }`}
              >
                <Terminal className="w-4 h-4" />
                Blueprint Chatbot (RAG)
              </button>
            </nav>
          </div>

          {/* ACTIVE TAB DISPLAY PANEL */}
          <div className="flex-1 p-6 overflow-y-auto">

            {/* ======================================================== */}
            {/* TAB 1: SPECIFICATION COMPLIANCE HUB */}
            {/* ======================================================== */}
            {activeTab === 'compliance' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full items-start">
                
                {/* Left Side: Drag-and-Drop Paste Zone */}
                <div className="space-y-4">
                  <div className="border border-obsidian-800 bg-obsidian-900/50 rounded-lg p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wide">
                        Hardware Specs / Vendor Submittal Paste
                      </h2>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Tier III Auditor Mode
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        className="w-full h-80 bg-obsidian-950 border border-obsidian-800 rounded p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-neon-emerald focus:ring-1 focus:ring-neon-emerald/30 resize-none transition"
                        placeholder="Paste Vendor Submittals, Equipment Specifications, Hardware Invoices, or single line item logs here to run Uptime Institute compliance audits..."
                        value={documentText}
                        onChange={(e) => setDocumentText(e.target.value)}
                      />
                      {documentText && (
                        <button
                          onClick={() => setDocumentText('')}
                          className="absolute right-3 bottom-3 text-slate-500 hover:text-slate-300 font-mono text-[10px] border border-obsidian-800 px-2 py-0.5 rounded bg-obsidian-900"
                        >
                          CLEAR
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleRunAudit}
                      disabled={isAuditing || !documentText.trim()}
                      className={`w-full py-3.5 px-4 font-mono text-xs font-bold uppercase rounded flex items-center justify-center gap-2 border transition-all ${
                        isAuditing || !documentText.trim()
                          ? 'bg-slate-800/40 text-slate-500 border-slate-700/30 cursor-not-allowed'
                          : 'bg-neon-emerald/15 hover:bg-neon-emerald/25 text-neon-emerald border-neon-emerald/40 hover:border-neon-emerald/70 glow-emerald-active'
                      }`}
                    >
                      <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
                      {isAuditing ? 'Auditing Submittal Specifications...' : 'Run AI Compliance Audit'}
                    </button>
                  </div>

                  {/* Predefined Invoice Mock Templates */}
                  <div className="border border-obsidian-800 bg-obsidian-900/50 rounded-lg p-5 space-y-3">
                    <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Auto-Fill Vendor Invoice Mock Templates (Uptime Tier III Testing)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {HARDWARE_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickFill(tmpl.text)}
                          className={`text-left p-3 border rounded text-xs transition duration-200 ${
                            tmpl.type.endsWith('fail')
                              ? 'border-neon-crimson/20 hover:border-neon-crimson/50 bg-neon-crimson/5 hover:bg-neon-crimson/10'
                              : 'border-neon-emerald/20 hover:border-neon-emerald/50 bg-neon-emerald/5 hover:bg-neon-emerald/10'
                          }`}
                        >
                          <div className={`font-semibold font-mono flex items-center gap-1.5 ${
                            tmpl.type.endsWith('fail') ? 'text-neon-crimson' : 'text-neon-emerald'
                          }`}>
                            {tmpl.type.endsWith('fail') ? <XCircle className="w-3 h-3 shrink-0" /> : <CheckCircle className="w-3 h-3 shrink-0" />}
                            {tmpl.name}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 truncate">
                            {tmpl.text.split('\n')[3] || tmpl.text.slice(0, 50)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Multi-Tiered Compliance Audit Screen */}
                <div className="border border-obsidian-800 bg-obsidian-900/50 rounded-lg p-5 min-h-[500px] flex flex-col">
                  <div className="flex justify-between items-center border-b border-obsidian-800 pb-3 mb-4">
                    <h2 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wide">
                      AI Audit Compliance Report
                    </h2>
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                      Report ID: AR-{isAuditing ? 'LOCKED' : auditResult ? 'RESOLVED' : 'STANDBY'}
                    </span>
                  </div>

                  {/* SKELETON LOADER STATE */}
                  {isAuditing && (
                    <div className="space-y-6 flex-1 py-4">
                      {/* Flashing scan bar */}
                      <div className="relative h-2 w-full bg-obsidian-950 overflow-hidden rounded">
                        <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-neon-emerald/40 to-transparent audit-scan-bar"></div>
                      </div>
                      <div className="space-y-4 animate-pulse">
                        <div className="h-10 bg-slate-800/40 rounded w-1/3"></div>
                        <div className="h-6 bg-slate-800/20 rounded w-1/4"></div>
                        <div className="h-24 bg-slate-800/30 rounded w-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-800/20 rounded w-full"></div>
                          <div className="h-4 bg-slate-800/20 rounded w-5/6"></div>
                          <div className="h-4 bg-slate-800/20 rounded w-4/6"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STANDBY STATE */}
                  {!isAuditing && !auditResult && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-obsidian-800 rounded bg-obsidian-950/20">
                      <FileCheck className="w-12 h-12 text-slate-700 mb-3" />
                      <p className="text-xs font-mono text-slate-400 max-w-sm">
                        Audit console offline. Paste submittal documents or select a mock invoice to run the AI compliance evaluation algorithm.
                      </p>
                    </div>
                  )}

                  {/* REPORT RENDERED STATE */}
                  {!isAuditing && auditResult && (
                    <div className="space-y-5 flex-grow">
                      
                      {/* Top Header Row with Classification and Status Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-obsidian-950 border border-obsidian-800 rounded-lg">
                        <div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase">CLASSIFICATION COMPLIANCE</div>
                          <div className="text-base font-bold font-mono text-slate-200">
                            Tier III Compliance Target
                          </div>
                        </div>

                        {auditResult.compliance_evaluation.is_compliant ? (
                          <div className="flex items-center gap-1.5 bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald font-mono text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider glow-emerald">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            COMPLIANT
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-neon-crimson/10 border border-neon-crimson/30 text-neon-crimson font-mono text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider glow-crimson animate-pulse-fast">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            NON-COMPLIANCE DETECTED
                          </div>
                        )}
                      </div>

                      {/* Hardware Category and Specs deck */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-obsidian-950 border border-obsidian-800 p-3.5 rounded">
                          <div className="text-[10px] font-mono text-slate-500">HARDWARE CATEGORY</div>
                          <div className="text-sm font-bold font-mono text-slate-200">{auditResult.category}</div>
                        </div>
                        <div className="bg-obsidian-950 border border-obsidian-800 p-3.5 rounded">
                          <div className="text-[10px] font-mono text-slate-500">VENDOR/MANUFACTURER</div>
                          <div className="text-sm font-bold font-mono text-slate-200">{auditResult.manufacturer}</div>
                        </div>
                      </div>

                      {/* Extracted Specifications Table */}
                      <div className="bg-obsidian-950 border border-obsidian-800 rounded overflow-hidden">
                        <div className="bg-obsidian-900 border-b border-obsidian-800 px-4 py-2 text-[10px] font-mono font-bold text-slate-400 uppercase">
                          Extracted Parameters vs Requirements
                        </div>
                        <table className="w-full font-mono text-xs text-left">
                          <thead>
                            <tr className="border-b border-obsidian-800 text-slate-500">
                              <th className="px-4 py-2">Parameter</th>
                              <th className="px-4 py-2">Extracted Value</th>
                              <th className="px-4 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-obsidian-800">
                              <td className="px-4 py-2 text-slate-400">Capacity</td>
                              <td className="px-4 py-2 text-slate-200">{auditResult.extracted_specs.capacity}</td>
                              <td className="px-4 py-2">
                                {auditResult.compliance_evaluation.failed_tags.includes('CAP-MIN-500KW') ? (
                                  <span className="text-neon-crimson flex items-center gap-1 font-bold">
                                    <XCircle className="w-3.5 h-3.5" /> Fail
                                  </span>
                                ) : (
                                  <span className="text-neon-emerald flex items-center gap-1 font-bold">
                                    <CheckCircle className="w-3.5 h-3.5" /> Pass
                                  </span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-slate-400">Redundancy Configuration</td>
                              <td className="px-4 py-2 text-slate-200">{auditResult.extracted_specs.redundancy_layout}</td>
                              <td className="px-4 py-2">
                                {auditResult.compliance_evaluation.failed_tags.some(t => t.includes('RED') || t.includes('UPS')) ? (
                                  <span className="text-neon-crimson flex items-center gap-1 font-bold">
                                    <XCircle className="w-3.5 h-3.5" /> Fail
                                  </span>
                                ) : (
                                  <span className="text-neon-emerald flex items-center gap-1 font-bold">
                                    <CheckCircle className="w-3.5 h-3.5" /> Pass
                                  </span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Evaluation Text / Deviation details */}
                      <div className={`p-4 rounded border font-mono text-xs ${
                        auditResult.compliance_evaluation.is_compliant
                          ? 'bg-neon-emerald/5 border-neon-emerald/20 text-slate-300'
                          : 'bg-neon-crimson/5 border-neon-crimson/20 text-slate-200'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold uppercase mb-2">
                          <AlertTriangle className={`w-4 h-4 ${
                            auditResult.compliance_evaluation.is_compliant ? 'text-neon-emerald' : 'text-neon-crimson'
                          }`} />
                          Audit Evaluation Summary
                        </div>
                        <p className="leading-relaxed text-slate-300">
                          {auditResult.compliance_evaluation.deviation_details}
                        </p>
                        {!auditResult.compliance_evaluation.is_compliant && (
                          <div className="mt-3 pt-3 border-t border-neon-crimson/10">
                            <span className="text-[10px] font-bold text-neon-crimson uppercase tracking-wider block mb-1">
                              Violated System Tags:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {auditResult.compliance_evaluation.failed_tags.map((tag, idx) => (
                                <span key={idx} className="bg-neon-crimson/10 border border-neon-crimson/30 text-[10px] text-neon-crimson px-1.5 py-0.5 rounded font-mono">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: INTERACTIVE RISK TIMELINE ENGINE */}
            {/* ======================================================== */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                
                {/* Notification Feed header row */}
                <div className="border border-obsidian-800 bg-obsidian-900/50 rounded-lg p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wide">
                      Active Telemetry Risk Warnings & Delay Events
                    </h2>
                    {activeEvent && (
                      <button
                        onClick={handleResetTimeline}
                        className="text-[10px] font-mono border border-neon-emerald/30 bg-neon-emerald/5 hover:bg-neon-emerald/15 text-neon-emerald px-2 py-0.5 rounded"
                      >
                        RESET SCHEDULE TIMELINE
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Click a simulated port delays, permit roadblocks, or custom hardware failure notices below to feed the risk calculator engine and evaluate downstream schedules.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {DELAY_EVENTS.map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => handleEventClick(evt)}
                        className={`p-4 border rounded text-left transition duration-200 relative overflow-hidden ${
                          activeEvent === evt.id
                            ? 'border-neon-amber bg-neon-amber/10 glow-amber'
                            : 'border-obsidian-800 bg-obsidian-950/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            evt.id === 'evt-chiller' 
                              ? 'bg-neon-amber/10 border-neon-amber/20 text-neon-amber' 
                              : 'bg-neon-crimson/10 border-neon-crimson/20 text-neon-crimson'
                          }`}>
                            Delay Warning
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {evt.id}</span>
                        </div>
                        <h3 className="text-xs font-bold font-mono text-slate-200 mt-2">{evt.title}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {evt.snippet}
                        </p>
                        {activeEvent === evt.id && (
                          <div className="absolute right-0 bottom-0 top-0 w-1 bg-neon-amber"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recalculating state loader */}
                {isCalculatingRisk && (
                  <div className="border border-neon-amber/20 bg-neon-amber/5 rounded-lg p-4 flex items-center justify-center gap-3">
                    <RefreshCw className="w-5 h-5 text-neon-amber animate-spin" />
                    <span className="text-xs font-mono font-bold text-neon-amber uppercase tracking-wider animate-pulse">
                      Recalculating downstream schedules, dates, and health metrics...
                    </span>
                  </div>
                )}

                {/* Middle Section: Horizontal project progress timeline */}
                <div className="border border-obsidian-800 bg-obsidian-900/50 rounded-lg p-6 overflow-x-auto">
                  <h2 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wide mb-6">
                    Operational Construction Pipeline Timeline
                  </h2>

                  <div className="min-w-[800px] flex items-center justify-between relative py-6">
                    {/* Connecting background path */}
                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-obsidian-850 -translate-y-1/2 z-0"></div>

                    {timelineBlocks.map((block, idx) => {
                      const isGood = block.status === 'good';
                      const isWarning = block.status === 'warning';
                      const isCritical = block.status === 'critical';

                      return (
                        <div key={idx} className="relative z-10 flex flex-col items-center w-48 text-center bg-obsidian-900 border border-obsidian-800 p-4 rounded-lg glow-emerald hover:border-slate-600 transition">
                          
                          {/* Circle Status Node */}
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs mb-3 ${
                            isGood ? 'bg-neon-emerald/10 border-neon-emerald text-neon-emerald glow-emerald' :
                            isWarning ? 'bg-neon-amber/10 border-neon-amber text-neon-amber glow-amber animate-pulse' :
                            'bg-neon-crimson/10 border-neon-crimson text-neon-crimson glow-crimson animate-pulse-fast'
                          }`}>
                            0{idx + 1}
                          </div>

                          <div className="text-xs font-mono font-bold text-slate-200 uppercase">{block.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">Est. End Date:</div>
                          <div className={`text-xs font-mono font-bold mt-1 ${
                            isGood ? 'text-slate-300' :
                            isWarning ? 'text-neon-amber' : 'text-neon-crimson'
                          }`}>
                            {block.date}
                          </div>

                          {/* Health Indicator Bar */}
                          <div className="w-full space-y-1 mt-3.5">
                            <div className="flex justify-between text-[9px] font-mono text-slate-500">
                              <span>Health Check:</span>
                              <span className={isGood ? 'text-neon-emerald' : isWarning ? 'text-neon-amber' : 'text-neon-crimson'}>
                                {block.health}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-obsidian-850 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isGood ? 'bg-neon-emerald' :
                                  isWarning ? 'bg-neon-amber' : 'bg-neon-crimson'
                                }`}
                                style={{ width: `${block.health}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Section: Downstream Impact & Mitigation Alert Card */}
                {riskImpact && (
                  <div className={`border rounded-lg p-5 font-mono text-xs transition duration-300 ${
                    riskImpact.critical_path_affected 
                      ? 'border-neon-crimson/30 bg-neon-crimson/5' 
                      : 'border-neon-amber/30 bg-neon-amber/5'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between border-b border-obsidian-800 pb-3 mb-4 gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${riskImpact.critical_path_affected ? 'text-neon-crimson animate-pulse-fast' : 'text-neon-amber animate-pulse'}`} />
                        <div>
                          <div className="text-[10px] text-slate-500">CALCULATED FRICTION VALUE</div>
                          <div className={`text-sm font-bold ${riskImpact.critical_path_affected ? 'text-neon-crimson' : 'text-neon-amber'}`}>
                            +{riskImpact.days_delayed} DAYS CRITICAL SCHEDULE DELAY
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">CRITICAL PATH AFFECTED:</span>
                        {riskImpact.critical_path_affected ? (
                          <span className="bg-neon-crimson/10 border border-neon-crimson/30 text-neon-crimson text-[9px] font-bold px-2 py-0.5 rounded">
                            YES (HIGH PRIORITY)
                          </span>
                        ) : (
                          <span className="bg-neon-amber/10 border border-neon-amber/30 text-neon-amber text-[9px] font-bold px-2 py-0.5 rounded">
                            NO (SLACK AVAILABLE)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">Downstream Operational Pipeline Impact</span>
                        <p className="text-slate-300 leading-relaxed text-xs">
                          The schedule delay impacts the critical installation pathways. Construction crews will encounter downstream blockages if milestone dates are not re-baselined immediately.
                        </p>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] text-slate-500 uppercase block mb-2">AI-Recommended Mitigation Actions & Workarounds</span>
                        <div className="p-3 bg-obsidian-950 border border-obsidian-800 rounded text-slate-200">
                          <p className="mb-2 leading-relaxed">{riskImpact.mitigation_strategy}</p>
                          <ul className="list-disc pl-4 space-y-1 text-slate-400 mt-2 text-[11px]">
                            <li>Initiate emergency double-shift rosters for electrical subcontractors.</li>
                            <li>Reallocate 15% budget buffer to expedite backup transport paths.</li>
                            <li>Configure modular testing sequences to bypass late-stage component deliveries.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: THE BLUEPRINT ENGINEER CHATBOT */}
            {/* ======================================================== */}
            {activeTab === 'chatbot' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 border border-obsidian-800 bg-obsidian-900/50 rounded-lg overflow-hidden h-[600px] items-stretch">
                
                {/* Left Column: Scrollable directories of critical references */}
                <div className="lg:col-span-1 border-r border-obsidian-800 p-4 space-y-4 bg-obsidian-950/20 flex flex-col overflow-y-auto">
                  <div className="flex items-center gap-2 border-b border-obsidian-800 pb-3">
                    <BookOpen className="w-4 h-4 text-neon-emerald" />
                    <h2 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Standard References
                    </h2>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                    Select a document below to load into the prompt context for querying:
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleRefClick('TIA-942 Building Standard')}
                      className="w-full text-left p-3 rounded bg-obsidian-950 border border-obsidian-800 hover:border-slate-600 transition group flex flex-col"
                    >
                      <span className="text-xs font-bold font-mono text-slate-300 group-hover:text-neon-emerald">
                        TIA-942 Standard
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono mt-1">
                        Telecommunications Infrastructure
                      </span>
                    </button>

                    <button
                      onClick={() => handleRefClick('Uptime Institute Tier Requirements')}
                      className="w-full text-left p-3 rounded bg-obsidian-950 border border-obsidian-800 hover:border-slate-600 transition group flex flex-col"
                    >
                      <span className="text-xs font-bold font-mono text-slate-300 group-hover:text-neon-emerald">
                        Uptime Institute Tier
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono mt-1">
                        Tier I-IV Topology Normatives
                      </span>
                    </button>

                    <button
                      onClick={() => handleRefClick('BICSI-002 Commissioning Logs')}
                      className="w-full text-left p-3 rounded bg-obsidian-950 border border-obsidian-800 hover:border-slate-600 transition group flex flex-col"
                    >
                      <span className="text-xs font-bold font-mono text-slate-300 group-hover:text-neon-emerald">
                        BICSI-002 Guidelines
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono mt-1">
                        Best Practices for Data Centre Design
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Terminal chat window */}
                <div className="lg:col-span-3 flex flex-col bg-obsidian-950/40 h-full relative">
                  
                  {/* Chat message register log */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs">
                    {messages.map((msg) => {
                      const isBot = msg.sender === 'bot';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] ${
                            isBot ? 'mr-auto items-start' : 'ml-auto items-end'
                          }`}
                        >
                          <div className={`p-3 rounded border leading-relaxed ${
                            isBot
                              ? 'bg-obsidian-900 border-obsidian-800 text-slate-300'
                              : 'bg-neon-emerald/10 border-neon-emerald/30 text-neon-emerald'
                          }`}>
                            {isBot && (
                              <div className="text-[9px] text-neon-emerald uppercase tracking-widest font-bold mb-1">
                                [AEGIS_CO-PILOT_RAG]
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>

                          {/* Monospace verified source citation */}
                          {msg.citation && (
                            <span className="text-[9px] text-slate-500 mt-1 block">
                              Source Citation: <span className="font-bold text-slate-400">{msg.citation}</span>
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Pending Answer loader skeleton */}
                    {chatLoading && (
                      <div className="flex flex-col mr-auto max-w-[80%] items-start animate-pulse">
                        <div className="p-3 rounded border bg-obsidian-900 border-obsidian-800 text-slate-400 w-full">
                          <span className="text-[9px] text-neon-emerald uppercase tracking-widest font-bold block mb-1">
                            [AEGIS_CO-PILOT_RAG COMPILING...]
                          </span>
                          <div className="space-y-1.5 mt-2">
                            <div className="h-3 bg-slate-800 rounded w-full"></div>
                            <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                            <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Sticky input entry and suggest pills */}
                  <div className="border-t border-obsidian-800 p-4 bg-obsidian-900/60 space-y-3">
                    
                    {/* suggestion pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {CHAT_SUGGESTIONS.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePillClick(sug)}
                          className="bg-obsidian-950 hover:bg-slate-800 border border-obsidian-800 text-[10px] text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-full font-mono transition"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>

                    {/* Chat entry form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        className="flex-1 bg-obsidian-950 border border-obsidian-800 rounded px-4 py-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-neon-emerald focus:ring-1 focus:ring-neon-emerald/30 placeholder-slate-600"
                        placeholder="Query blueprints standards (e.g. redundancy configurations, fuel tanks, ASHRAE ranges)..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={chatLoading}
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className={`px-4 rounded font-mono text-xs uppercase font-bold border transition flex items-center justify-center gap-1.5 ${
                          chatLoading || !chatInput.trim()
                            ? 'bg-slate-800/40 text-slate-500 border-slate-700/30 cursor-not-allowed'
                            : 'bg-neon-emerald/15 hover:bg-neon-emerald/25 text-neon-emerald border-neon-emerald/40 hover:border-neon-emerald/70 glow-emerald'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        SEND
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

      {/* Cyber screen lines / HUD scanning grid overlays */}
      <div className="absolute inset-0 crt-grid pointer-events-none opacity-[0.03]"></div>
    </div>
  );
}

export default App;

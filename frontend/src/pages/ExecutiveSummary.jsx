import { useState } from "react";
import axios from "axios";
import { Sparkles, Loader2, AlertCircle, ShieldAlert, TrendingUp } from "lucide-react";

import KPIBox from "../components/summary/KPIBox";
import ProjectHealth from "../components/summary/ProjectHealth";
import ExecutiveInsights from "../components/summary/ExecutiveInsights";
import MilestoneTable from "../components/summary/MilestoneTable";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function ExecutiveSummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/exec-summary`, {});
      setSummary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || "Failed to generate summary. Is the AI service running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Executive Summary</h1>
          <p className="text-slate-500 mt-2">
            One-click project pulse, synthesized from Spec Compliance, Schedule Risk, and RFI Copilot.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4 text-red-800">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KPIBox
              title="Overall Status"
              value={summary.overallStatus?.replace("_", " ")}
              subtitle={summary.headline}
              icon={<ShieldAlert className="text-indigo-600" size={22} />}
            />
            <KPIBox
              title="Top Risks Identified"
              value={summary.topRisks?.length ?? 0}
              subtitle="Across all modules"
              icon={<TrendingUp className="text-indigo-600" size={22} />}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ExecutiveInsights text={summary.fullSummary} />
              <MilestoneTable topRisks={summary.topRisks} recommendedActions={summary.recommendedActions} />
            </div>
            <ProjectHealth status={summary.overallStatus} />
          </div>
        </>
      )}

      {!summary && !loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Click "Generate Summary" to synthesize the latest results from all modules.
          Run Spec Compliance and Schedule Risk first for a meaningful summary.
        </div>
      )}
    </div>
  );
}

export default ExecutiveSummary;

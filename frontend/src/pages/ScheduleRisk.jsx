import { useState } from "react";
import axios from "axios";
import { Loader2, AlertCircle, ListChecks, TriangleAlert, ShieldCheck } from "lucide-react";

import UploadBox from "../components/common/UploadBox";
import RiskTable from "../components/schedule/RiskTable";
import RiskStatCard from "../components/schedule/RiskStatCard";
import RecommendationCard from "../components/schedule/RecommendationCard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const RISK_COLOR = {
  critical: "bg-red-100 text-red-600",
  high: "bg-orange-100 text-orange-600",
  medium: "bg-yellow-100 text-yellow-600",
  low: "bg-green-100 text-green-600",
};

function ScheduleRisk() {
  const [scheduleFile, setScheduleFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const handleAnalyze = async () => {
    if (!scheduleFile) {
      setError("Please select a schedule CSV file.");
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const formData = new FormData();
      formData.append("schedule", scheduleFile);

      const response = await axios.post(`${API_BASE_URL}/schedule/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReport(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || "Failed to analyze schedule. Is the AI service running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Schedule Risk Radar</h1>
        <p className="text-slate-500 mt-2">
          Upload a project schedule CSV to identify tasks at risk of delay before they become a problem.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <UploadBox
          title="Project Schedule"
          subtitle="Upload a CSV with task_id, task_name, start_date, end_date, dependency_id, percent_complete"
          accept=".csv"
          file={scheduleFile}
          onFileSelect={setScheduleFile}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-4 flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <ListChecks size={18} />}
          {loading ? "Analyzing..." : "Analyze Schedule"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4 text-red-800">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
          <p>{error}</p>
        </div>
      )}

      {report && report.source && report.source !== "live_llm" && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-start gap-4 text-amber-900">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={24} />
          <div>
            <h4 className="font-bold text-lg">This is placeholder data, not a real analysis</h4>
            <p className="text-sm mt-1">The AI service was unreachable. Check that it's running and try again.</p>
          </div>
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RiskStatCard
              title="Total Tasks"
              value={report.totalTasks}
              color="bg-indigo-100 text-indigo-600"
              icon={<ListChecks size={22} />}
            />
            <RiskStatCard
              title="Flagged At-Risk"
              value={report.flaggedTasks}
              color="bg-orange-100 text-orange-600"
              icon={<TriangleAlert size={22} />}
            />
            <RiskStatCard
              title="Overall Project Risk"
              value={report.overallProjectRisk}
              color={RISK_COLOR[report.overallProjectRisk] || RISK_COLOR.low}
              icon={<ShieldCheck size={22} />}
            />
          </div>

          <RecommendationCard text={report.summary} />

          <div>
            <h2 className="text-lg font-semibold mb-4">Ranked Risks</h2>
            <RiskTable
              risks={report.rankedRisks?.map((r) => ({
                task_id: r.taskId,
                task_name: r.taskName,
                end_date: r.endDate,
                percent_complete: r.percentComplete,
                risk_score: r.riskScore,
                risk_level: r.riskLevel,
                risk_reason: r.riskReason,
                has_downstream_dependents: r.hasDownstreamDependents,
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ScheduleRisk;

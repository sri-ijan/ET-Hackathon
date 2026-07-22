import { useState } from "react";
import axios from "axios";
import {
  Loader2,
  AlertCircle,
  ListChecks,
  TriangleAlert,
  ShieldCheck,
} from "lucide-react";

import UploadBox from "../components/common/UploadBox";
import RiskTable from "../components/schedule/RiskTable";
import RiskStatCard from "../components/schedule/RiskStatCard";
import RecommendationCard from "../components/schedule/RecommendationCard";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const RISK_COLOR = {
  critical:
    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  high:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
  medium:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300",
  low:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
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

      const response = await axios.post(
        `${API_BASE_URL}/schedule/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setReport(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to analyze schedule. Is the AI service running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Schedule Risk Radar
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Upload a project schedule CSV to identify tasks at risk of delay
          before they become a problem.
        </p>
      </div>

      {/* Upload */}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <UploadBox
          title="Project Schedule"
          subtitle="Upload a CSV containing task_id, task_name, start_date, end_date, dependency_id and percent_complete."
          accept=".csv"
          file={scheduleFile}
          onFileSelect={setScheduleFile}
        />

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="
            mt-5
            flex
            items-center
            gap-2
            rounded-xl
            bg-indigo-600
            px-5
            py-3
            text-white
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-indigo-700
            hover:shadow-lg
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <ListChecks size={18} />
          )}

          {loading ? "Analyzing..." : "Analyze Schedule"}
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="flex items-start gap-4 rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            size={24}
          />

          <p>{error}</p>
        </div>
      )}

      {/* Placeholder Warning */}

      {report && report.source && report.source !== "live_llm" && (
        <div className="flex items-start gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertCircle
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            size={24}
          />

          <div>
            <h4 className="text-lg font-bold">
              Placeholder Analysis Detected
            </h4>

            <p className="mt-1 text-sm">
              The AI service was unreachable, so placeholder data has been
              returned. Ensure the backend AI service is running before relying
              on this analysis.
            </p>
          </div>
        </div>
      )}

      {/* Report */}

      {report && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <RiskStatCard
              title="Total Tasks"
              value={report.totalTasks}
              color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
              icon={<ListChecks size={22} />}
            />

            <RiskStatCard
              title="Flagged At-Risk"
              value={report.flaggedTasks}
              color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
              icon={<TriangleAlert size={22} />}
            />

            <RiskStatCard
              title="Overall Project Risk"
              value={report.overallProjectRisk}
              color={
                RISK_COLOR[report.overallProjectRisk] || RISK_COLOR.low
              }
              icon={<ShieldCheck size={22} />}
            />
          </div>

          <RecommendationCard text={report.summary} />

          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
              Ranked Risks
            </h2>

            <RiskTable
              risks={report.rankedRisks?.map((r) => ({
                task_id: r.taskId,
                task_name: r.taskName,
                end_date: r.endDate,
                percent_complete: r.percentComplete,
                risk_score: r.riskScore,
                risk_level: r.riskLevel,
                risk_reason: r.riskReason,
                has_downstream_dependents:
                  r.hasDownstreamDependents,
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ScheduleRisk;
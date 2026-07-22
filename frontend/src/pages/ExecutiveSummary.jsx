import { useState } from "react";
import axios from "axios";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import KPIBox from "../components/summary/KPIBox";
import ProjectHealth from "../components/summary/ProjectHealth";
import ExecutiveInsights from "../components/summary/ExecutiveInsights";
import MilestoneTable from "../components/summary/MilestoneTable";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function ExecutiveSummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai/exec-summary`,
        {}
      );

      setSummary(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to generate summary. Is the AI service running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Executive Summary
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Generate an AI-powered executive overview combining Spec
            Compliance, Schedule Risk, and RFI Copilot into a single project
            health report.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-indigo-600
            px-6
            py-3
            font-medium
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
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Sparkles size={18} />
          )}

          {loading ? "Generating..." : "Generate Summary"}
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="flex items-start gap-4 rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle
            size={24}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <p>{error}</p>
        </div>
      )}

      {/* Summary */}

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <KPIBox
              title="Overall Status"
              value={summary.overallStatus?.replace("_", " ")}
              subtitle={summary.headline}
              icon={
                <ShieldAlert
                  size={22}
                  className="text-indigo-600"
                />
              }
            />

            <KPIBox
              title="Top Risks Identified"
              value={summary.topRisks?.length ?? 0}
              subtitle="Across all modules"
              icon={
                <TrendingUp
                  size={22}
                  className="text-indigo-600"
                />
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <ExecutiveInsights
                text={summary.fullSummary}
              />

              <MilestoneTable
                topRisks={summary.topRisks}
                recommendedActions={summary.recommendedActions}
              />
            </div>

            <ProjectHealth
              status={summary.overallStatus}
            />
          </div>
        </>
      )}

      {/* Empty State */}

      {!summary && !loading && !error && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <Sparkles
              size={30}
              className="text-indigo-600 dark:text-indigo-300"
            />
          </div>

          <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
            Executive Summary Not Generated
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
            Click <strong>Generate Summary</strong> to create an
            AI-powered executive report from all available
            project intelligence.
          </p>

          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
            For the most meaningful report, run Spec Compliance,
            Schedule Risk and RFI Copilot first.
          </p>
        </div>
      )}
    </div>
  );
}

export default ExecutiveSummary;
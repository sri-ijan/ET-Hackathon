import React from "react";
import { TriangleAlert, CheckCircle2 } from "lucide-react";

// topRisks: string[]
// recommendedActions: string[]

const MilestoneTable = ({ topRisks = [], recommendedActions = [] }) => {
  if (topRisks.length === 0 && recommendedActions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <TriangleAlert
            size={28}
            className="text-slate-500 dark:text-slate-400"
          />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
          No Executive Findings
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Generate an executive summary to view the most important risks and
          recommended actions.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Risks */}

        <div>
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400">
            <TriangleAlert size={20} />
            <span>Top Risks</span>
          </div>

          <div className="space-y-3">
            {topRisks.map((risk, index) => (
              <div
                key={index}
                className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-slate-700 dark:border-red-900 dark:bg-red-950/30 dark:text-slate-300"
              >
                {risk}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}

        <div>
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
            <span>Recommended Actions</span>
          </div>

          <div className="space-y-3">
            {recommendedActions.map((action, index) => (
              <div
                key={index}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-slate-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-slate-300"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneTable;

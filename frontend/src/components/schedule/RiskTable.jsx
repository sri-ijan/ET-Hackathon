import React from "react";
import { AlertTriangle, CalendarDays, TrendingUp } from "lucide-react";
import RiskBadge from "./RiskBadge";

// risks: array of {
// task_id,
// task_name,
// end_date,
// percent_complete,
// risk_score,
// risk_level,
// risk_reason,
// has_downstream_dependents
// }

const RiskTable = ({ risks = [] }) => {
  if (risks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <AlertTriangle
            size={28}
            className="text-slate-500 dark:text-slate-400"
          />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
          No Risks Detected
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Upload a project schedule CSV to identify critical scheduling risks.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Task
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                End Date
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Progress
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Risk Level
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                AI Analysis
              </th>
            </tr>
          </thead>

          <tbody>
            {risks.map((item) => (
              <tr
                key={item.task_id}
                className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                {/* Task */}

                <td className="px-6 py-5 align-top">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {item.task_name}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.has_downstream_dependents && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        Blocks downstream tasks
                      </span>
                    )}

                    {item.risk_score !== undefined && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <TrendingUp size={12} />
                        Score: {item.risk_score}
                      </span>
                    )}
                  </div>
                </td>

                {/* End Date */}

                <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} />
                    {item.end_date}
                  </div>
                </td>

                {/* Progress */}

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{
                          width: `${Math.min(
                            Math.max(item.percent_complete || 0, 0),
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.percent_complete}%
                    </span>
                  </div>
                </td>

                {/* Risk */}

                <td className="px-6 py-5">
                  <RiskBadge level={item.risk_level} />
                </td>

                {/* Analysis */}

                <td className="max-w-md px-6 py-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.risk_reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskTable;

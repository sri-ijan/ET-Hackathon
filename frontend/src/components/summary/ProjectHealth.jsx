import React from "react";
import { Activity } from "lucide-react";

const STATUS_STYLE = {
  on_track: {
    ring: "border-green-500",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20",
    label: "On Track",
    pct: "92%",
  },

  at_risk: {
    ring: "border-yellow-500",
    text: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    label: "At Risk",
    pct: "60%",
  },

  critical: {
    ring: "border-red-500",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/20",
    label: "Critical",
    pct: "30%",
  },
};

const DEFAULT_STYLE = {
  ring: "border-slate-300 dark:border-slate-600",
  text: "text-slate-600 dark:text-slate-300",
  bg: "bg-slate-50 dark:bg-slate-800",
  label: "No Data",
  pct: "—",
};

const ProjectHealth = ({ status }) => {
  const style = STATUS_STYLE[status] || DEFAULT_STYLE;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
          <Activity size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Project Health
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Overall project health indicator
          </p>
        </div>
      </div>

      {/* Health Indicator */}

      <div className="flex justify-center">
        <div
          className={`
            ${style.bg}
            relative
            flex
            h-48
            w-48
            items-center
            justify-center
            rounded-full
            border-[14px]
            ${style.ring}
            transition-all
            duration-300
          `}
        >
          <div className="text-center">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">
              {style.pct}
            </h1>

            <p className={`mt-2 text-sm font-semibold uppercase tracking-wider ${style.text}`}>
              {style.label}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}

      <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This indicator combines compliance, schedule risk and AI findings to
          provide a single executive view of project health.
        </p>
      </div>
    </div>
  );
};

export default ProjectHealth;
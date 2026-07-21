import React from "react";

const STATUS_STYLE = {
  on_track: { ring: "border-green-500", label: "On Track", pct: "92%" },
  at_risk: { ring: "border-yellow-500", label: "At Risk", pct: "60%" },
  critical: { ring: "border-red-500", label: "Critical", pct: "30%" },
};

// status: 'on_track' | 'at_risk' | 'critical' | undefined
const ProjectHealth = ({ status }) => {
  const style = STATUS_STYLE[status] || { ring: "border-slate-300", label: "No Data", pct: "—" };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold mb-6">Overall Project Health</h2>
      <div className="flex justify-center">
        <div className={`relative w-44 h-44 rounded-full border-[14px] ${style.ring} flex items-center justify-center`}>
          <div className="text-center">
            <h1 className="text-4xl font-bold">{style.pct}</h1>
            <p className="text-slate-500 capitalize">{style.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHealth;

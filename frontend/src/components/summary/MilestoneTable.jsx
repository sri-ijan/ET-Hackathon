import React from "react";
import { TriangleAlert, CheckCircle2 } from "lucide-react";

// topRisks: string[], recommendedActions: string[]
const MilestoneTable = ({ topRisks = [], recommendedActions = [] }) => {
  if (topRisks.length === 0 && recommendedActions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        No summary generated yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 grid md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3 text-red-600 font-semibold">
          <TriangleAlert size={18} /> Top Risks
        </div>
        <ul className="space-y-2">
          {topRisks.map((r, i) => (
            <li key={i} className="text-sm text-slate-700 bg-red-50 rounded-lg p-3">{r}</li>
          ))}
        </ul>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3 text-emerald-600 font-semibold">
          <CheckCircle2 size={18} /> Recommended Actions
        </div>
        <ul className="space-y-2">
          {recommendedActions.map((a, i) => (
            <li key={i} className="text-sm text-slate-700 bg-emerald-50 rounded-lg p-3">{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MilestoneTable;

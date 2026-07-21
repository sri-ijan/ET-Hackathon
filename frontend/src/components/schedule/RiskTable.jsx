import React from "react";
import RiskBadge from "./RiskBadge";

// risks: array of { task_id, task_name, end_date, percent_complete, risk_score, risk_level, risk_reason, has_downstream_dependents }
const RiskTable = ({ risks = [] }) => {
  if (risks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        No risks flagged. Upload a schedule CSV to analyze.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="text-left p-4">Task</th>
            <th className="text-left p-4">End Date</th>
            <th className="text-left p-4">% Complete</th>
            <th className="text-left p-4">Risk</th>
            <th className="text-left p-4">Why</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((item) => (
            <tr key={item.task_id} className="border-t border-slate-100 hover:bg-slate-50 align-top">
              <td className="p-4 font-medium">
                {item.task_name}
                {item.has_downstream_dependents && (
                  <span className="block text-xs text-red-500 font-normal mt-1">blocks other tasks</span>
                )}
              </td>
              <td className="p-4 text-slate-600">{item.end_date}</td>
              <td className="p-4 text-slate-600">{item.percent_complete}%</td>
              <td className="p-4">
                <RiskBadge level={item.risk_level} />
              </td>
              <td className="p-4 text-slate-600 text-sm max-w-sm">{item.risk_reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiskTable;

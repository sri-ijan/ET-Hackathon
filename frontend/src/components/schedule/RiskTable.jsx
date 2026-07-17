import React from "react";
import RiskBadge from "./RiskBadge";

const rows = [
  {
    task: "Cable Procurement",
    delay: "12 Days",
    risk: "High",
  },
  {
    task: "Transformer Delivery",
    delay: "7 Days",
    risk: "Medium",
  },
  {
    task: "Civil Foundation",
    delay: "2 Days",
    risk: "Low",
  },
  {
    task: "Cooling System",
    delay: "15 Days",
    risk: "High",
  },
];

const RiskTable = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="text-left p-4">Task</th>
            <th className="text-left p-4">Predicted Delay</th>
            <th className="text-left p-4">Risk</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((item, index) => (
            <tr
              key={index}
              className="border-t border-slate-100 hover:bg-slate-50"
            >
              <td className="p-4">{item.task}</td>

              <td className="p-4">{item.delay}</td>

              <td className="p-4">
                <RiskBadge level={item.risk} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiskTable;
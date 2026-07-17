import React from "react";

const RiskStatCard = ({ title, value, color, icon }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default RiskStatCard;
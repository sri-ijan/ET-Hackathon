import React from "react";

const KPIBox = ({ title, value, subtitle, icon }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="text-3xl font-bold mt-2">{value}</h2>

          <p className="text-xs text-slate-400 mt-2">
            {subtitle}
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPIBox;
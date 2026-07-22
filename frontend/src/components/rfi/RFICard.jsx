import React from "react";

const RFICard = ({ title, value }) => {
  return (
    <div
      className="
        rounded-3xl
        border border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <h2 className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">
        {value}
      </h2>
    </div>
  );
};

export default RFICard;

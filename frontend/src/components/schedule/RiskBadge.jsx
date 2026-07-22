import React from "react";

const colors = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",

  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",

  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",

  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const RiskBadge = ({ level }) => {
  const key = (level || "low").toLowerCase();

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        capitalize
        ${colors[key] || colors.low}
      `}
    >
      {key}
    </span>
  );
};

export default RiskBadge;

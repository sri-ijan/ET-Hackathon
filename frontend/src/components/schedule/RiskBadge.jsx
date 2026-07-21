import React from "react";

const colors = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const RiskBadge = ({ level }) => {
  const key = (level || "low").toLowerCase();
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colors[key] || colors.low}`}>
      {key}
    </span>
  );
};

export default RiskBadge;

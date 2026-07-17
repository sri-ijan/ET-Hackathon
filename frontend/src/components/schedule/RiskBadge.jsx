import React from "react";

const colors = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const RiskBadge = ({ level }) => {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[level]
      }`}
    >
      {level}
    </span>
  );
};

export default RiskBadge;
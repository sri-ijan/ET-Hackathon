import React from "react";

const styles = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const PriorityBadge = ({ priority }) => {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
};

export default PriorityBadge;
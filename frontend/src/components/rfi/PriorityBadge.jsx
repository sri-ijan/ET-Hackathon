import React from "react";

const styles = {
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",

  Medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",

  Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const PriorityBadge = ({ priority }) => {
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
        ${styles[priority] || styles.Low}
      `}
    >
      {priority}
    </span>
  );
};

export default PriorityBadge;

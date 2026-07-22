function StatusBadge({ status }) {
  const normalized = (status || "").trim().toLowerCase();

  const variants = {
    pass: {
      label: "Pass",
      dot: "bg-emerald-500",
      classes:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    },
    flagged: {
      label: "Flagged",
      dot: "bg-amber-500",
      classes:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    },
    fail: {
      label: "Failed",
      dot: "bg-rose-500",
      classes:
        "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
    },
  };

  const config =
    normalized === "pass"
      ? variants.pass
      : normalized === "flagged"
      ? variants.flagged
      : variants.fail;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${config.classes}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${config.dot} animate-pulse`}
      />
      {config.label}
    </span>
  );
}

export default StatusBadge;
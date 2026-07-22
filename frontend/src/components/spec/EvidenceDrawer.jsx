import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  FileSearch,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  CircleX,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

function EvidenceDrawer({ parameter, onClose, onGenerateRfi }) {
  const open = !!parameter;

  const normalized = (parameter?.status || "").toLowerCase();

  const isFailedOrFlagged = normalized === "fail" || normalized === "flagged";

  const statusIcon =
    normalized === "pass" ? (
      <CheckCircle2 size={18} className="text-emerald-500" />
    ) : normalized === "flagged" ? (
      <AlertTriangle size={18} className="text-amber-500" />
    ) : (
      <CircleX size={18} className="text-rose-500" />
    );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Drawer */}

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 260,
            }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
          >
            {/* Header */}

            <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 opacity-95" />

              <div className="relative px-7 py-7">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                      <Sparkles size={14} />
                      AI Evidence
                    </div>

                    <h2 className="mt-4 text-2xl font-bold leading-tight text-white">
                      {parameter?.parameterName}
                    </h2>

                    <div className="mt-4 flex items-center gap-3">
                      {statusIcon}

                      <StatusBadge status={parameter?.status} />
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}

            <div className="flex-1 overflow-y-auto px-7 py-7 space-y-7">
              {/* Comparison */}

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Specification Comparison
                </h3>

                <div className="space-y-4">
                  {/* Specification */}

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <FileText size={16} />

                      <span className="text-xs font-bold uppercase tracking-wider">
                        Governing Specification
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-line font-mono text-lg font-semibold text-slate-900 dark:text-white">
                      {parameter?.specificationValue}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                      <FileText size={13} />

                      {parameter?.locationInSpec || "Location unavailable"}
                    </div>
                  </motion.div>

                  {/* Arrow */}

                  <div className="flex justify-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg">
                      <ArrowRight size={18} className="rotate-90" />
                    </div>
                  </div>

                  {/* Vendor Card */}

                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`rounded-2xl border p-5 shadow-sm transition-all ${
                      isFailedOrFlagged
                        ? "border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-900/20"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <FileText size={16} />

                      <span className="text-xs font-bold uppercase tracking-wider">
                        Vendor Submittal
                      </span>
                    </div>

                    <p
                      className={`mt-4 whitespace-pre-line font-mono text-lg font-semibold ${
                        isFailedOrFlagged
                          ? "text-rose-700 dark:text-rose-300"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {parameter?.submittalValue}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                      <FileText size={13} />

                      {parameter?.locationInSubmittal || "Location unavailable"}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* AI Analysis */}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                    <FileSearch
                      size={18}
                      className="text-indigo-600 dark:text-indigo-300"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      AI Deviation Analysis
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Generated from specification and vendor document
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5">
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {parameter?.deviationReason ||
                      "No deviation detected. The submitted value satisfies the governing specification and no engineering clarification is required."}
                  </p>
                </div>
              </motion.div>

              {/* Summary */}

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{statusIcon}</div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      AI Compliance Summary
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {normalized === "pass" &&
                        "The submitted parameter complies with the governing specification. No engineering action is required."}

                      {normalized === "flagged" &&
                        "The AI detected a possible deviation that should be reviewed by the engineering team before approval."}

                      {normalized === "fail" &&
                        "The submitted value deviates from the governing specification and should be clarified with the vendor through an RFI before approval."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-7 py-5">
              {isFailedOrFlagged ? (
                <button
                  onClick={() => onGenerateRfi(parameter)}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <Sparkles
                    size={18}
                    className="transition-transform duration-300 group-hover:rotate-12"
                  />
                  Generate Engineering RFI
                </button>
              ) : (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    ✓ No action required. This parameter passed the compliance
                    audit.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EvidenceDrawer;

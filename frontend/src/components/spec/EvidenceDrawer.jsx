import { AnimatePresence, motion } from "framer-motion";
import { X, FileSearch, FileText, ArrowRight, Sparkles } from "lucide-react";
import StatusBadge from "./StatusBadge";

function EvidenceDrawer({ parameter, onClose, onGenerateRfi }) {
  const open = !!parameter;
  const isFailedOrFlagged =
    parameter && ["fail", "flagged"].includes((parameter.status || "").toLowerCase());

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
          >
            {/* Header */}
            <div className="px-7 py-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} />
                  AI Evidence
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mt-1">
                  {parameter?.parameterName}
                </h2>
                <div className="mt-2">
                  <StatusBadge status={parameter?.status} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-2 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
              {/* Spec vs Submittal comparison */}
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Specification
                  </p>
                  <p className="text-lg font-mono font-semibold text-slate-800 whitespace-pre-line">
                    {parameter?.specificationValue}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <FileText size={13} />
                    {parameter?.locationInSpec || "Location not specified"}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <ArrowRight size={16} className="rotate-90" />
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${
                    isFailedOrFlagged
                      ? "border-rose-200 bg-rose-50/40"
                      : "border-slate-200"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Vendor Submittal
                  </p>
                  <p
                    className={`text-lg font-mono font-semibold whitespace-pre-line ${
                      isFailedOrFlagged ? "text-rose-700" : "text-slate-800"
                    }`}
                  >
                    {parameter?.submittalValue}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <FileText size={13} />
                    {parameter?.locationInSubmittal || "Location not specified"}
                  </div>
                </div>
              </div>

              {/* AI reasoning */}
              <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60">
                <div className="flex items-center gap-2 mb-2">
                  <FileSearch size={16} className="text-indigo-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Deviation Reasoning
                  </p>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {parameter?.deviationReason || "No deviation detected — this parameter passed compliance."}
                </p>
              </div>
            </div>

            {/* Footer action */}
            {isFailedOrFlagged && (
              <div className="px-7 py-5 border-t border-slate-100 bg-white">
                <button
                  onClick={() => onGenerateRfi(parameter)}
                  className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-3.5 rounded-xl transition"
                >
                  <Sparkles size={18} />
                  Generate RFI from this Finding
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EvidenceDrawer;
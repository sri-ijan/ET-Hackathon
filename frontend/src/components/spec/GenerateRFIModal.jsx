import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import {
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Copy,
  CheckCheck,
  FileWarning,
  FileText,
  Flag,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const PRIORITY_STYLES = {
  low: {
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  medium: {
    badge:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  },
  high: {
    badge:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
  },
  critical: {
    badge:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
  },
};

function GenerateRFIModal({
  parameter,
  complianceReportId,
  specFileName,
  submittalFileName,
  onClose,
}) {
  const open = !!parameter;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rfi, setRfi] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!parameter) {
      setLoading(false);
      setError(null);
      setRfi(null);
      setCopied(false);
      return;
    }

    const generate = async () => {
      setLoading(true);
      setError(null);
      setRfi(null);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/ai/rfi/generate-from-failure`,
          {
            complianceReportId: complianceReportId || undefined,
            parameterName: parameter.parameterName,
            specificationValue: parameter.specificationValue,
            submittalValue: parameter.submittalValue,
            status: (parameter.status || "").toLowerCase(),
            deviationReason: parameter.deviationReason || null,
            locationInSpec: parameter.locationInSpec || null,
            locationInSubmittal: parameter.locationInSubmittal || null,
            specificationFileName: specFileName || null,
            submittalFileName: submittalFileName || null,
          },
        );

        if (response.data?.status === "success") {
          setRfi(response.data.data);
        } else {
          setError("Failed to generate RFI.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "AI service failed to generate the RFI.",
        );
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [parameter]);

  const handleCopy = () => {
    if (!rfi) return;

    navigator.clipboard.writeText(
      `${rfi.rfiNumber}\n${rfi.subject}\n\n${rfi.body}`,
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}

          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl h-[92vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
            >
              {/* Header */}

              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-red-600 to-orange-500" />

                <div className="relative flex items-center justify-between px-7 py-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                      <FileWarning className="text-white" size={28} />
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                        <Sparkles size={13} />
                        AI Generated RFI
                      </div>

                      <h2 className="mt-3 text-2xl font-bold text-white">
                        {parameter?.parameterName}
                      </h2>
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

              {/* Body */}

              <div className="flex-1 min-h-0 overflow-y-auto px-7 py-7">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="animate-spin text-rose-500" size={42} />

                    <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                      Generating Engineering RFI...
                    </h3>

                    <p className="mt-2 text-center text-slate-500 dark:text-slate-400 max-w-md">
                      AI is analyzing the compliance failure and drafting a
                      professional Request For Information.
                    </p>
                  </div>
                )}

                {error && !loading && (
                  <div className="rounded-2xl border border-rose-200 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20 p-6">
                    <div className="flex gap-4">
                      <AlertCircle
                        size={26}
                        className="text-rose-600 shrink-0"
                      />

                      <div>
                        <h3 className="font-bold text-rose-700 dark:text-rose-300">
                          Failed to Generate RFI
                        </h3>

                        <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {rfi && !loading && !error && (
                  <div className="space-y-6">
                    {/* Top Info */}

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {rfi.rfiNumber}
                      </span>

                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize ${
                          PRIORITY_STYLES[rfi.recommendedPriority]?.badge ||
                          PRIORITY_STYLES.medium.badge
                        }`}
                      >
                        <Flag size={12} className="inline mr-1" />
                        {rfi.recommendedPriority} Priority
                      </span>
                    </div>

                    {/* Subject */}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Subject
                      </p>

                      <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                        {rfi.subject}
                      </h3>
                    </motion.div>

                    {/* Documents */}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="grid gap-4 md:grid-cols-2"
                    >
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                        <div className="flex items-center gap-2">
                          <FileText
                            size={17}
                            className="text-indigo-600 dark:text-indigo-400"
                          />

                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            Governing Specification
                          </p>
                        </div>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 break-all">
                          {specFileName || "Not Available"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                        <div className="flex items-center gap-2">
                          <FileText
                            size={17}
                            className="text-indigo-600 dark:text-indigo-400"
                          />

                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            Vendor Submittal
                          </p>
                        </div>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 break-all">
                          {submittalFileName || "Not Available"}
                        </p>
                      </div>
                    </motion.div>

                    {/* AI Draft */}

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-6 py-4">
                        <Sparkles
                          size={18}
                          className="text-rose-600 dark:text-rose-400"
                        />

                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          AI Generated RFI Draft
                        </h3>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-6">
                        <div className="whitespace-pre-line rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-5 text-[15px] leading-8 text-slate-700 dark:text-slate-300">
                          {rfi.body}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Footer */}

              {rfi && !loading && !error && (
                <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-7 py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      onClick={handleCopy}
                      className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold transition-all duration-300 ${
                        copied
                          ? "bg-emerald-600 text-white"
                          : "bg-gradient-to-r from-slate-800 to-slate-900 hover:scale-[1.02] text-white"
                      }`}
                    >
                      {copied ? <CheckCheck size={18} /> : <Copy size={18} />}

                      {copied ? "Copied Successfully" : "Copy RFI"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GenerateRFIModal;

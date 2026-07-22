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
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const PRIORITY_STYLES = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
};

/**
 * parameter: the failed/flagged ParameterComparison row
 * complianceReportId: Mongo _id of the parent ComplianceReport (for traceability)
 * specFileName / submittalFileName: original document names, for the RFI header
 */
function GenerateRFIModal({ parameter, complianceReportId, specFileName, submittalFileName, onClose }) {
  const open = !!parameter;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rfi, setRfi] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!parameter) {
      setRfi(null);
      setError(null);
      setCopied(false);
      return;
    }

    const generate = async () => {
      setLoading(true);
      setError(null);
      setRfi(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/ai/rfi/generate-from-failure`, {
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
        });

        if (response.data?.status === "success") {
          setRfi(response.data.data);
        } else {
          setError("Failed to generate RFI. Please try again.");
        }
      } catch (err) {
        const errMsg =
          err.response?.data?.message ||
          err.response?.data?.error?.message ||
          "AI service failed to draft the RFI. Is the ai-service running with GROQ_API_KEY/GEMINI_API_KEY set?";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameter]);

  const handleCopy = () => {
    if (!rfi) return;
    const text = `${rfi.rfiNumber}: ${rfi.subject}\n\n${rfi.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                    <FileWarning size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      AI-Generated RFI
                    </p>
                    <h2 className="text-lg font-bold text-slate-800">
                      {parameter?.parameterName}
                    </h2>
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
              <div className="flex-1 overflow-y-auto px-7 py-6">
                {loading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                    <Loader2 className="animate-spin text-rose-500" size={32} />
                    <p className="font-medium">Drafting RFI from this compliance finding...</p>
                  </div>
                )}

                {error && !loading && (
                  <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 flex items-start gap-4 text-rose-800">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={22} />
                    <div>
                      <h4 className="font-bold">RFI Generation Failed</h4>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {rfi && !loading && !error && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-mono font-semibold">
                        {rfi.rfiNumber}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                          PRIORITY_STYLES[rfi.recommendedPriority] || PRIORITY_STYLES.medium
                        }`}
                      >
                        {rfi.recommendedPriority} priority
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Subject
                      </p>
                      <h3 className="text-xl font-bold text-slate-800">{rfi.subject}</h3>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        RFI Body
                      </p>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {rfi.body}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {rfi && !loading && !error && (
                <div className="px-7 py-5 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    {copied ? <CheckCheck size={18} /> : <Copy size={18} />}
                    {copied ? "Copied" : "Copy RFI Text"}
                  </button>
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

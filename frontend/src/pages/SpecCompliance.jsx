import { useState } from "react";
import axios from "axios";
import {
  Sparkles,
  ShieldCheck,
  TriangleAlert,
  CircleCheckBig,
  Loader2,
  FileCheck2,
  AlertCircle
} from "lucide-react";

import UploadBox from "../components/common/UploadBox";
import ComparisonTable from "../components/spec/ComparisonTable";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function SpecCompliance() {
  const [specificationFile, setSpecificationFile] = useState(null);
  const [submittalFile, setSubmittalFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const handleCompare = async () => {
    if (!specificationFile || !submittalFile) {
      setError("Please select both the Specification and Vendor Submittal documents.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    const formData = new FormData();
    formData.append("specification", specificationFile);
    formData.append("submittal", submittalFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/ai/compare-specs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.status === "success") {
        setReport(response.data.data);
      } else {
        setError("Failed to fetch compliance report. Please try again.");
      }
    } catch (err) {
      console.error("Comparison request failed:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || "An unexpected error occurred during document comparison.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic stats
  const parametersCount = report?.parameters?.length || 0;
  const passedCount = report?.parameters?.filter(p => p.status?.toLowerCase() === "pass").length || 0;
  const deviationsCount = report?.parameters?.filter(p => p.status?.toLowerCase() !== "pass").length || 0;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-12">
          <Sparkles size={300} />
        </div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="uppercase tracking-[0.3em] text-blue-200 text-sm font-semibold">
              AI MODULE
            </p>
            <h1 className="text-5xl font-bold mt-3">
              Spec Compliance Agent
            </h1>
            <p className="text-blue-100 mt-5 max-w-3xl leading-8">
              Upload the governing project specification and the vendor submittal. The agent extracts engineering parameters, compares them side-by-side, and highlights deviations with clear explanations.
            </p>
          </div>
          <div className="hidden xl:flex w-28 h-28 rounded-3xl bg-white/10 backdrop-blur items-center justify-center border border-white/20">
            <Sparkles size={55} />
          </div>
        </div>
      </section>

      {/* Stats - Rendered dynamically when a report is loaded */}
      {report && (
        <section className="grid lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-medium">Parameters Checked</p>
              <h2 className="text-4xl font-bold mt-2 text-slate-800">
                {String(parametersCount).padStart(2, '0')}
              </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CircleCheckBig size={30} />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-medium">Passed Parameters</p>
              <h2 className="text-4xl font-bold mt-2 text-emerald-600">
                {String(passedCount).padStart(2, '0')}
              </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={30} />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-medium">Deviations / Warnings</p>
              <h2 className="text-4xl font-bold mt-2 text-rose-600">
                {String(deviationsCount).padStart(2, '0')}
              </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <TriangleAlert size={30} />
            </div>
          </div>
        </section>
      )}

      {/* Upload Inputs */}
      <section className="grid xl:grid-cols-2 gap-8">
        <UploadBox
          title="Specification Document"
          subtitle="Upload EPC specification PDF or DOCX."
          file={specificationFile}
          onFileSelect={setSpecificationFile}
        />
        <UploadBox
          title="Vendor Submittal"
          subtitle="Upload vendor submitted document."
          file={submittalFile}
          onFileSelect={setSubmittalFile}
        />
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 flex items-start gap-4 text-rose-800">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={24} />
          <div>
            <h4 className="font-bold text-lg">Upload Failed</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <section className="flex flex-col items-center justify-center gap-4">
        <button
          onClick={handleCompare}
          disabled={loading || !specificationFile || !submittalFile}
          className={`flex items-center gap-3 text-lg px-12 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${
            loading 
              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              : !specificationFile || !submittalFile
                ? "bg-blue-300 text-white cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 cursor-pointer shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Auditing Documents...
            </>
          ) : (
            <>
              <FileCheck2 size={24} />
              Compare Documents
            </>
          )}
        </button>
      </section>

      {/* Results summary */}
      {report && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-inner animate-fade-in">
          <h3 className="text-xl font-bold text-slate-800 mb-3">Audit Summary</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            {report.summary}
          </p>
        </div>
      )}

      {/* Results Table */}
      <ComparisonTable parameters={report?.parameters} />
    </div>
  );
}

export default SpecCompliance;
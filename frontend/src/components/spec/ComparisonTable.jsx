import { Sparkles } from "lucide-react";
import StatusBadge from "./StatusBadge";

function ComparisonTable({ parameters = [], onViewEvidence, onGenerateRfi }) {
  if (!parameters || parameters.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
        No comparison parameters to display. Upload a specification and vendor submittal above to audit compliance.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Compliance Audit Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Side-by-side comparison of engineering parameter specifications and vendor submittal values.
          </p>
        </div>
        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-semibold">
          {parameters.length} Parameters Audited
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Parameter</th>
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Governing Specification</th>
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Vendor Submittal</th>
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Deviation Reason</th>
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Document References</th>
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parameters.map((p, index) => {
              const isFailedOrFlagged = ["fail", "flagged"].includes((p.status || "").toLowerCase());
              return (
                <tr
                  key={p._id || index}
                  onClick={() => onViewEvidence?.(p)}
                  className="hover:bg-slate-50/40 transition-colors cursor-pointer"
                  title="Click to view AI evidence"
                >
                  <td className="p-5 font-semibold text-slate-800 align-top">
                    {p.parameterName}
                  </td>
                  <td className="p-5 text-slate-700 font-mono text-sm align-top whitespace-pre-line">
                    {p.specificationValue}
                  </td>
                  <td className="p-5 text-slate-700 font-mono text-sm align-top whitespace-pre-line">
                    {p.submittalValue}
                  </td>
                  <td className="p-5 align-top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewEvidence?.(p);
                      }}
                      className="inline-flex items-center gap-1.5 hover:opacity-75 transition"
                      title="View AI evidence for this status"
                    >
                      <StatusBadge status={p.status} />
                    </button>
                  </td>
                  <td className="p-5 text-slate-500 text-sm align-top max-w-xs whitespace-pre-line">
                    {p.deviationReason || (
                      <span className="text-slate-300 italic">No deviation detected</span>
                    )}
                  </td>
                  <td className="p-5 text-slate-400 text-xs font-medium align-top leading-relaxed">
                    <div className="flex flex-col gap-1">
                      <span className="truncate max-w-[180px]">
                        <strong className="text-slate-500">Spec:</strong> {p.locationInSpec || "N/A"}
                      </span>
                      <span className="truncate max-w-[180px]">
                        <strong className="text-slate-500">Submittal:</strong> {p.locationInSubmittal || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 align-top">
                    {isFailedOrFlagged ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateRfi?.(p);
                        }}
                        className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition whitespace-nowrap"
                      >
                        <Sparkles size={14} />
                        Generate RFI
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs italic">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComparisonTable;
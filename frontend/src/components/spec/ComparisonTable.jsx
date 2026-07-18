import StatusBadge from "./StatusBadge";

function ComparisonTable({ parameters = [] }) {
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parameters.map((p, index) => (
              <tr key={p._id || index} className="hover:bg-slate-50/40 transition-colors">
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
                  <StatusBadge status={p.status} />
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComparisonTable;
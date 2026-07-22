import { Sparkles } from "lucide-react";
import StatusBadge from "./StatusBadge";

function ComparisonTable({ parameters = [], onViewEvidence, onGenerateRfi }) {
  if (!parameters || parameters.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-12 text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
          No Compliance Report Yet
        </h3>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Upload a Specification and Vendor Submittal to generate the AI audit.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-8 py-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Compliance Audit Report
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Side-by-side comparison of engineering specifications and vendor
            submitted values.
          </p>
        </div>

        <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
          {parameters.length} Parameters Audited
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Parameter
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Governing Specification
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Vendor Submittal
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Deviation Reason
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Document References
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {parameters.map((p, index) => {
              const isFailedOrFlagged = ["fail", "flagged"].includes(
                (p.status || "").toLowerCase(),
              );

              return (
                <tr
                  key={p._id || index}
                  onClick={() => onViewEvidence?.(p)}
                  className="cursor-pointer transition hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  <td className="px-5 py-5 font-semibold text-slate-900 dark:text-white align-top">
                    {p.parameterName}
                  </td>

                  <td className="px-5 py-5 font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line align-top">
                    {p.specificationValue}
                  </td>

                  <td className="px-5 py-5 font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line align-top">
                    {p.submittalValue}
                  </td>

                  <td className="px-5 py-5 align-top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewEvidence?.(p);
                      }}
                      className="hover:opacity-80 transition"
                    >
                      <StatusBadge status={p.status} />
                    </button>
                  </td>

                  <td className="px-5 py-5 max-w-xs whitespace-pre-line text-sm text-slate-600 dark:text-slate-300 align-top">
                    {p.deviationReason ? (
                      p.deviationReason
                    ) : (
                      <span className="italic text-slate-400 dark:text-slate-500">
                        No deviation detected
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-5 text-sm align-top">
                    <div className="space-y-2">
                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-800 dark:text-white">
                          Spec:
                        </span>{" "}
                        {p.locationInSpec || "N/A"}
                      </p>

                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-800 dark:text-white">
                          Submittal:
                        </span>{" "}
                        {p.locationInSubmittal || "N/A"}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-5 align-top">
                    {isFailedOrFlagged ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateRfi?.(p);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        <Sparkles size={15} />
                        Generate RFI
                      </button>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        —
                      </span>
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

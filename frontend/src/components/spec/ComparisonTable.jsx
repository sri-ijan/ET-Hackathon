import StatusBadge from "./StatusBadge";

const rows = [
  {
    parameter: "Cooling Capacity",
    spec: "250 TR",
    vendor: "240 TR",
    status: "Failed",
  },
  {
    parameter: "Voltage",
    spec: "415V",
    vendor: "415V",
    status: "Pass",
  },
  {
    parameter: "Material",
    spec: "Copper",
    vendor: "Copper",
    status: "Pass",
  },
  {
    parameter: "IP Rating",
    spec: "IP65",
    vendor: "IP54",
    status: "Flagged",
  },
];

function ComparisonTable() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

      <div className="px-8 py-6 border-b">

        <h2 className="text-2xl font-bold">
          Comparison Result
        </h2>

      </div>

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="text-left p-5">Parameter</th>

            <th className="text-left p-5">Specification</th>

            <th className="text-left p-5">Vendor</th>

            <th className="text-left p-5">Status</th>

          </tr>

        </thead>

        <tbody>

          {rows.map((row) => (

            <tr
              key={row.parameter}
              className="border-t hover:bg-slate-50"
            >

              <td className="p-5 font-medium">
                {row.parameter}
              </td>

              <td className="p-5">
                {row.spec}
              </td>

              <td className="p-5">
                {row.vendor}
              </td>

              <td className="p-5">

                <StatusBadge
                  status={row.status}
                />

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default ComparisonTable;
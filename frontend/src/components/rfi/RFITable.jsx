import React from "react";
import PriorityBadge from "./PriorityBadge";

const data = [
  {
    id: "RFI-1021",
    subject: "Cooling Pipe Diameter",
    priority: "High",
    status: "Pending",
  },
  {
    id: "RFI-1022",
    subject: "Transformer Foundation",
    priority: "Medium",
    status: "Draft",
  },
  {
    id: "RFI-1023",
    subject: "Cable Tray Layout",
    priority: "Low",
    status: "Resolved",
  },
];

const RFITable = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-4 text-left">RFI ID</th>
            <th className="p-4 text-left">Subject</th>
            <th className="p-4 text-left">Priority</th>
            <th className="p-4 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-t border-slate-100 hover:bg-slate-50"
            >
              <td className="p-4">{item.id}</td>

              <td className="p-4">{item.subject}</td>

              <td className="p-4">
                <PriorityBadge priority={item.priority} />
              </td>

              <td className="p-4">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RFITable;
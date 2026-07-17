import React from "react";

const milestones = [
  {
    name: "Civil Work",
    progress: "100%",
    status: "Completed",
  },
  {
    name: "Electrical Installation",
    progress: "82%",
    status: "In Progress",
  },
  {
    name: "Cooling System",
    progress: "63%",
    status: "Delayed",
  },
  {
    name: "Testing & Commissioning",
    progress: "28%",
    status: "Upcoming",
  },
];

const MilestoneTable = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="text-left p-4">Milestone</th>

            <th className="text-left p-4">Progress</th>

            <th className="text-left p-4">Status</th>

          </tr>

        </thead>

        <tbody>

          {milestones.map((item, index) => (

            <tr
              key={index}
              className="border-t border-slate-100 hover:bg-slate-50"
            >

              <td className="p-4">{item.name}</td>

              <td className="p-4">{item.progress}</td>

              <td className="p-4">{item.status}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default MilestoneTable;
import {
  LayoutDashboard,
  FileSearch,
  CalendarClock,
  Bot,
  ClipboardList,
  Database,
  HardDrive,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Spec Compliance",
    path: "/spec-compliance",
    icon: FileSearch,
  },
  {
    title: "Schedule Risk",
    path: "/schedule-risk",
    icon: CalendarClock,
  },
  {
    title: "RFI Copilot",
    path: "/rfi-copilot",
    icon: Bot,
  },
  {
    title: "Executive Summary",
    path: "/executive-summary",
    icon: ClipboardList,
  },
];

function Sidebar() {
  return (
    <aside className="w-72 bg-slate-950 text-white flex flex-col">

      <div className="p-8 border-b border-slate-800">

        <div className="w-14 h-14 rounded-2xl bg-linear-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-2xl font-bold">

          AI

        </div>

        <h1 className="text-2xl font-bold mt-5">
          AI EPC
        </h1>

        <p className="text-slate-400 mt-1">
          Intelligence Platform
        </p>

      </div>

      <nav className="flex-1 p-4 space-y-2">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 shadow-lg"
                    : "hover:bg-slate-900"
                }`
              }
            >
              <Icon size={20} />

              {item.title}
            </NavLink>
          );
        })}

      </nav>

      <div className="p-5">

        <div className="bg-slate-900 rounded-2xl p-5">

          <div className="flex justify-between">

            <div>

              <p className="text-sm text-slate-400">
                API Status
              </p>

              <h2 className="font-semibold mt-1">
                Connected
              </h2>

            </div>

            <Database className="text-green-400" />

          </div>

          <div className="mt-5">

            <div className="flex justify-between text-sm">

              <span>Storage</span>

              <span>72%</span>

            </div>

            <div className="mt-2 h-2 rounded-full bg-slate-700">

              <div className="h-2 w-3/4 rounded-full bg-blue-500"></div>

            </div>

          </div>

          <div className="flex items-center gap-3 mt-6">

            <HardDrive size={18} />

            <span className="text-sm">
              Demo Environment
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;
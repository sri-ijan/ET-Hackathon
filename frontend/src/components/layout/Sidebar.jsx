import {
  LayoutDashboard,
  FileSearch,
  CalendarClock,
  Bot,
  ClipboardList,
  Cpu,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

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
  const [aiStatus, setAiStatus] = useState("checking");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const { data } = await axios.get("/api/v1/health");

        setAiStatus(data?.data?.ai ? "connected" : "offline");
      } catch {
        setAiStatus("offline");
      }
    };

    fetchHealth();
  }, []);

  const statusConfig = {
    checking: {
      text: "Checking...",
      dot: "bg-yellow-500",
      border: "border-yellow-200 dark:border-yellow-900",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      label: "text-yellow-700 dark:text-yellow-400",
    },
    connected: {
      text: "Connected",
      dot: "bg-green-500",
      border: "border-green-200 dark:border-green-900",
      bg: "bg-green-50 dark:bg-green-950/30",
      label: "text-green-700 dark:text-green-400",
    },
    offline: {
      text: "Offline",
      dot: "bg-red-500",
      border: "border-red-200 dark:border-red-900",
      bg: "bg-red-50 dark:bg-red-950/30",
      label: "text-red-700 dark:text-red-400",
    },
  };

  const current = statusConfig[aiStatus];

  return (
    <aside
      className="
      w-72
      border-r
      border-slate-200
      dark:border-slate-800
      bg-white
      dark:bg-slate-950
      flex
      flex-col
      transition-all
      duration-300
    "
    >
      {/* Logo */}

      <div className="px-7 pt-8 pb-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="
          flex
          items-center
          gap-4
          rounded-3xl
          bg-gradient-to-r
          from-blue-600
          to-cyan-500
          p-4
          shadow-lg
        "
        >
          <div
            className="
            w-14
            h-14
            rounded-2xl
            bg-white/20
            backdrop-blur
            flex
            items-center
            justify-center
          "
          >
            <Cpu className="text-white" size={28} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-blue-100">
              AI Platform
            </p>

            <h2 className="text-white font-bold text-lg">ET AI</h2>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}

      <nav className="flex-1 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400 px-3 mb-5">
          Navigation
        </p>

        <div className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.path} to={item.path}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 6 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      group
                      relative
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      px-4
                      py-3.5
                      transition-all
                      duration-300

                      ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebar"
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-white"
                      />
                    )}

                    <Icon size={20} />

                    <span className="font-medium">{item.title}</span>
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}

      <div className="p-5">
        <div
          className={`rounded-3xl border p-5 ${current.border} ${current.bg}`}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full animate-ping ${current.dot}`}
              ></span>

              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${current.dot}`}
              ></span>
            </span>

            <div>
              <p
                className={`text-xs uppercase tracking-wider ${current.label}`}
              >
                AI Status
              </p>

              <h3 className="font-semibold text-slate-800 dark:text-white">
                {current.text}
              </h3>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 dark:border-slate-800 pt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Version
            </p>

            <p className="font-semibold text-slate-800 dark:text-white mt-1">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

import { Moon, Sun, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

function Navbar() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [aiStatus, setAiStatus] = useState("checking");

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchHealth = async () => {
  try {
    const { data } = await axios.get("/api/v1/health");

    console.log("Health Response:", data);

    if (data?.data?.ai) {
      setAiStatus("connected");
    } else {
      setAiStatus("offline");
    }
  } catch (err) {
    console.log("Health Error:", err);
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
      bg: "bg-yellow-50 dark:bg-yellow-950/40",
      label: "text-yellow-700 dark:text-yellow-400",
    },
    connected: {
      text: "Connected",
      dot: "bg-green-500",
      border: "border-green-200 dark:border-green-900",
      bg: "bg-green-50 dark:bg-green-950/40",
      label: "text-green-700 dark:text-green-400",
    },
    offline: {
      text: "Offline",
      dot: "bg-red-500",
      border: "border-red-200 dark:border-red-900",
      bg: "bg-red-50 dark:bg-red-950/40",
      label: "text-red-700 dark:text-red-400",
    },
  };

  const current = statusConfig[aiStatus];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-8 py-5">

        {/* Left */}

        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="uppercase tracking-[0.25em] text-xs text-blue-600 font-semibold">
            AI EPC Platform
          </p>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Engineering Intelligence
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            AI powered document analysis & project monitoring
          </p>
        </motion.div>

        {/* Right */}

        <div className="flex items-center gap-4">

          {/* AI Status */}

          <motion.div
            whileHover={{ scale: 1.04 }}
            className={`hidden md:flex items-center gap-3 rounded-2xl px-5 py-3 border ${current.border} ${current.bg}`}
          >
            <span className="relative flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${current.dot}`}
              ></span>

              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${current.dot}`}
              ></span>
            </span>

            <div>
              <p
                className={`text-xs uppercase tracking-wider font-semibold ${current.label}`}
              >
                AI STATUS
              </p>

              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {current.text}
              </p>
            </div>
          </motion.div>

          {/* Theme Toggle */}

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ rotate: 15 }}
            onClick={() => setDarkMode(!darkMode)}
            className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm hover:shadow-lg transition-all"
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-slate-700" />
            )}
          </motion.button>

          {/* Logo */}

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="text-white" size={22} />
            </div>

            <div className="hidden sm:block">
              <p className="text-xs text-blue-100 uppercase tracking-wider">
                Enterprise
              </p>

              <h2 className="text-white font-semibold">
                @dishu0209
              </h2>
            </div>
          </motion.div>

        </div>

      </div>
    </header>
  );
}

export default Navbar;
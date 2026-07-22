import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Search, ChevronDown } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const POLL_INTERVAL_MS = 15000; // recheck every 15s — cheap call, keeps the badge honest through a demo

function Navbar() {
  // 'checking' | 'connected' | 'disconnected'
  const [aiStatus, setAiStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        await axios.get(`${API_BASE_URL}/ai/health`, { timeout: 5000 });
        if (!cancelled) setAiStatus("connected");
      } catch {
        if (!cancelled) setAiStatus("disconnected");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const statusStyles = {
    checking: "bg-slate-100 text-slate-500",
    connected: "bg-green-100 text-green-700",
    disconnected: "bg-red-100 text-red-700",
  };

  const statusDot = {
    checking: "bg-slate-400 animate-pulse",
    connected: "bg-green-500",
    disconnected: "bg-red-500",
  };

  const statusLabel = {
    checking: "Checking AI...",
    connected: "AI Connected",
    disconnected: "AI Disconnected",
  };

  return (
    <header className="sticky top-0 z-40 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          AI Intelligence Platform
        </h1>
        <p className="text-sm text-slate-500">
          Data Centre EPC Delivery
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-80">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none px-3 w-full"
          />
        </div>

        <div
          title={
            aiStatus === "disconnected"
              ? "Cannot reach the AI service. Check that it's running on port 8001."
              : ""
          }
          className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-colors ${statusStyles[aiStatus]}`}
        >
          <div className={`w-2 h-2 rounded-full ${statusDot[aiStatus]}`}></div>
          {statusLabel[aiStatus]}
        </div>

        <button className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition">
          Demo Project
          <ChevronDown size={16} />
        </button>

        <button className="relative">
          <Bell />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <img
          src="https://ui-avatars.com/api/?name=AI&background=2563eb&color=fff"
          className="w-11 h-11 rounded-full"
        />
      </div>
    </header>
  );
}

export default Navbar;
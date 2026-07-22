import {
  FolderKanban,
  ShieldCheck,
  TriangleAlert,
  Files,
  FileSearch,
  CalendarClock,
  Bot,
  ClipboardList,
  Upload,
  CalendarPlus,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import StatCard from "../components/dashboard/StatCard";
import ModuleCard from "../components/dashboard/ModuleCard";
import QuickActionCard from "../components/dashboard/QuickActionCard";
import RecentActivity from "../components/dashboard/RecentActivity";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
function Dashboard() {
  const [stats, setStats] = useState({
    complianceReports: 0,
    complianceFindings: 0,
    generatedRFIs: 0,
    uploadedDocuments: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);

        if (response.data?.status === "success") {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);
  return (
    <div className="space-y-10">
      {/* Hero */}

      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-10 shadow-xl">
        <p className="text-blue-200 text-sm font-medium uppercase tracking-widest">
          AI Powered EPC Platform
        </p>

        <h1 className="text-5xl font-bold mt-3">Welcome Back !</h1>

        <p className="mt-4 text-blue-100 max-w-2xl leading-8">
          Monitor project compliance, schedule risks, RFIs and executive
          insights from one intelligent dashboard.
        </p>
      </div>

      {/* Stats */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
        <StatCard
          title="Compliance Reports"
          value={stats.complianceReports}
          change="AI Generated"
          color="from-blue-600 to-cyan-500"
          icon={<FolderKanban />}
        />

        <StatCard
          title="Compliance Findings"
          value={stats.complianceFindings}
          change="Fail + Flagged"
          color="from-green-500 to-emerald-600"
          icon={<ShieldCheck />}
        />

        <StatCard
          title="Generated RFIs"
          value={stats.generatedRFIs}
          change="AI Drafted"
          color="from-red-500 to-orange-500"
          icon={<TriangleAlert />}
        />

        <StatCard
          title="Uploaded Documents"
          value={stats.uploadedDocuments}
          change="Spec + Vendor"
          color="from-violet-600 to-fuchsia-500"
          icon={<Files />}
        />
      </div>

      {/* Quick Actions */}

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Frequently Used
          </p>{" "}
        </div>

        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
          <QuickActionCard
            title="Upload Specs"
            description="Upload specification documents for AI validation."
            icon={<Upload />}
            color="bg-blue-600"
            to="/spec-compliance"
          />

          <QuickActionCard
            title="Analyze Schedule"
            description="Detect delays before they impact delivery."
            icon={<CalendarPlus />}
            color="bg-red-500"
            to="/schedule-risk"
          />

          <QuickActionCard
            title="Ask AI"
            description="Search RFIs using natural language."
            icon={<MessageSquareText />}
            color="bg-green-600"
            to="/rfi-copilot"
          />

          <QuickActionCard
            title="Generate Summary"
            description="Create executive reports instantly."
            icon={<Sparkles />}
            color="bg-purple-600"
            to="/executive-summary"
          />
        </div>
      </section>

      {/* Modules + Activity */}

      <div className="grid xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              AI Modules
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              4 Modules Available
            </p>{" "}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ModuleCard
              title="Spec Compliance"
              description="Compare specifications with vendor submittals using AI."
              icon={<FileSearch />}
              to="/spec-compliance"
            />

            <ModuleCard
              title="Schedule Risk Radar"
              description="Predict schedule delays before execution."
              icon={<CalendarClock />}
              to="/schedule-risk"
            />

            <ModuleCard
              title="RFI Knowledge Copilot"
              description="Search historical RFIs using semantic AI."
              icon={<Bot />}
              to="/rfi-copilot"
            />

            <ModuleCard
              title="Executive Summary"
              description="Generate one-click project health summaries."
              icon={<ClipboardList />}
              to="/executive-summary"
            />
          </div>
        </div>

        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

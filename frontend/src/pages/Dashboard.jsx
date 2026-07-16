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

import StatCard from "../components/dashboard/StatCard";
import ModuleCard from "../components/dashboard/ModuleCard";
import QuickActionCard from "../components/dashboard/QuickActionCard";
import RecentActivity from "../components/dashboard/RecentActivity";

function Dashboard() {
  return (
    <div className="space-y-10">

      {/* Hero */}

      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-10 shadow-xl">

        <p className="text-blue-200 text-sm font-medium uppercase tracking-widest">
          AI Powered EPC Platform
        </p>

        <h1 className="text-5xl font-bold mt-3">
          Welcome Back 👋
        </h1>

        <p className="mt-4 text-blue-100 max-w-2xl leading-8">
          Monitor project compliance, schedule risks, RFIs and executive insights
          from one intelligent dashboard.
        </p>

      </div>

      {/* Stats */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">

        <StatCard
          title="Active Projects"
          value="04"
          change="+1 this week"
          color="bg-blue-600"
          icon={<FolderKanban />}
        />

        <StatCard
          title="Compliance Flags"
          value="17"
          change="3 Critical"
          color="bg-green-600"
          icon={<ShieldCheck />}
        />

        <StatCard
          title="Schedule Risks"
          value="05"
          change="2 High"
          color="bg-red-500"
          icon={<TriangleAlert />}
        />

        <StatCard
          title="Documents"
          value="146"
          change="Updated Today"
          color="bg-violet-600"
          icon={<Files />}
        />

      </div>

      {/* Quick Actions */}

      <section>

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-slate-800">
            Quick Actions
          </h2>

          <span className="text-sm text-slate-500">
            Frequently Used
          </span>

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

            <h2 className="text-2xl font-bold text-slate-800">
              AI Modules
            </h2>

            <span className="text-sm text-slate-500">
              4 Modules Available
            </span>

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
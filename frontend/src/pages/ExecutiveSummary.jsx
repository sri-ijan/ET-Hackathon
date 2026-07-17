import React from "react";
import {
  BarChart3,
  CalendarClock,
  CircleCheckBig,
  DollarSign,
} from "lucide-react";

import KPIBox from "../components/summary/KPIBox";
import ProjectHealth from "../components/summary/ProjectHealth";
import ExecutiveInsights from "../components/summary/ExecutiveInsights";
import MilestoneTable from "../components/summary/MilestoneTable";

const ExecutiveSummary = () => {
  return (
    <div className="space-y-8">
      {/* Hero */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Executive Summary
          </h1>

          <p className="text-slate-500 mt-2">
            AI-powered project overview for leadership and decision makers.
          </p>
        </div>

        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl transition">
          Export Report
        </button>
      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPIBox
          title="Project Progress"
          value="78%"
          subtitle="Overall completion"
          icon={<BarChart3 className="text-indigo-600" />}
        />

        <KPIBox
          title="Budget Utilized"
          value="₹8.2 Cr"
          subtitle="Current expenditure"
          icon={<DollarSign className="text-green-600" />}
        />

        <KPIBox
          title="Upcoming Milestones"
          value="12"
          subtitle="Next 30 days"
          icon={<CalendarClock className="text-yellow-600" />}
        />

        <KPIBox
          title="Completed Tasks"
          value="248"
          subtitle="Successfully delivered"
          icon={<CircleCheckBig className="text-emerald-600" />}
        />
      </div>

      {/* Health + AI */}

      <div className="grid lg:grid-cols-3 gap-6">
        <ProjectHealth />

        <div className="lg:col-span-2">
          <ExecutiveInsights />
        </div>
      </div>

      {/* Milestones */}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Project Milestones
        </h2>

        <MilestoneTable />
      </div>
    </div>
  );
};

export default ExecutiveSummary;
import React from "react";
import {
  AlertTriangle,
  Clock3,
  ShieldCheck,
  Upload,
} from "lucide-react";

import UploadBox from "../components/common/UploadBox";
import RiskStatCard from "../components/schedule/RiskStatCard";
import RiskTable from "../components/schedule/RiskTable";
import RecommendationCard from "../components/schedule/RecommendationCard";

const ScheduleRisk = () => {
  return (
    <div className="space-y-8">

      {/* Hero */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Schedule Risk Radar
          </h1>

          <p className="text-slate-500 mt-2">
            AI predicts project delays before they become critical.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition">
          <Upload size={18} />
          Analyze Schedule
        </button>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <RiskStatCard
          title="Overall Risk"
          value="82%"
          color="bg-red-100"
          icon={<AlertTriangle className="text-red-600" />}
        />

        <RiskStatCard
          title="Predicted Delay"
          value="21 Days"
          color="bg-yellow-100"
          icon={<Clock3 className="text-yellow-600" />}
        />

        <RiskStatCard
          title="Healthy Tasks"
          value="74%"
          color="bg-green-100"
          icon={<ShieldCheck className="text-green-600" />}
        />

      </div>

      {/* Upload */}

      <UploadBox
        title="Upload Primavera / MS Project Schedule"
        description="CSV or Excel schedule exported from planning software."
      />

      {/* Content */}

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">
          <RiskTable />
        </div>

        <RecommendationCard />

      </div>

    </div>
  );
};

export default ScheduleRisk;
import React from "react";
import { Sparkles } from "lucide-react";

const RecommendationCard = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles />

        <h2 className="font-semibold text-lg">
          AI Recommendation
        </h2>
      </div>

      <p className="leading-7 text-indigo-100">
        Critical delays are expected in procurement and cooling systems.
        Expedite vendor approvals and increase manpower allocation to avoid
        cascading schedule impacts.
      </p>
    </div>
  );
};

export default RecommendationCard;
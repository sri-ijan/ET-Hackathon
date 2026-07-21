import React from "react";
import { Sparkles } from "lucide-react";

const RecommendationCard = ({ text }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles />
        <h2 className="font-semibold text-lg">AI Risk Summary</h2>
      </div>
      <p className="leading-7 text-indigo-100">
        {text || "Upload a schedule to get an AI-generated risk summary."}
      </p>
    </div>
  );
};

export default RecommendationCard;

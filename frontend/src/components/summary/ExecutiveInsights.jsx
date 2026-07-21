import React from "react";
import { Sparkles } from "lucide-react";

const ExecutiveInsights = ({ text }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-5">
        <Sparkles />
        <h2 className="font-semibold text-lg">AI Executive Insight</h2>
      </div>
      <p className="leading-8 text-indigo-100">
        {text || "Generate a summary to see AI-synthesized insights across all modules."}
      </p>
    </div>
  );
};

export default ExecutiveInsights;

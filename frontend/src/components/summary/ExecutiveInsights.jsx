import React from "react";
import { Sparkles } from "lucide-react";

const ExecutiveInsights = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">

      <div className="flex items-center gap-3 mb-5">

        <Sparkles />

        <h2 className="font-semibold text-lg">
          AI Executive Insight
        </h2>

      </div>

      <p className="leading-8 text-indigo-100">
        Project execution remains healthy overall. Procurement activities
        require immediate attention to avoid schedule slippage. The AI model
        recommends fast-tracking vendor approvals and increasing manpower
        during the next two weeks to maintain milestone completion.
      </p>

    </div>
  );
};

export default ExecutiveInsights;
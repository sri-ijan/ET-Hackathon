import React from "react";
import { Sparkles } from "lucide-react";

const AIPanel = () => {
  return (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles />

        <h2 className="font-semibold text-lg">
          AI Generated Response
        </h2>
      </div>

      <p className="leading-7 text-indigo-100">
        The proposed cooling pipe diameter does not comply with the design
        specification. Based on previous approved RFIs, a 250 mm diameter is
        recommended to ensure thermal compliance and adequate flow capacity.
      </p>
    </div>
  );
};

export default AIPanel;
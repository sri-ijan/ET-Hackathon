import React from "react";
import { Sparkles, Bot } from "lucide-react";

const RecommendationCard = ({ text }) => {
  const summary =
    text?.trim() ||
    "Upload a project schedule to receive an AI-generated summary highlighting critical risks, schedule bottlenecks, and recommended mitigation strategies.";

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        bg-gradient-to-br
        from-indigo-600
        via-blue-600
        to-violet-700
        p-7
        text-white
        shadow-xl
      "
    >
      {/* Background Glow */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Bot size={26} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-200">
              AI Insight
            </p>

            <h2 className="mt-1 text-2xl font-bold">Risk Summary</h2>
          </div>
        </div>

        <Sparkles size={24} className="text-indigo-200" />
      </div>

      {/* Body */}
      <p className="relative mt-6 whitespace-pre-wrap text-[15px] leading-8 text-indigo-100">
        {summary}
      </p>

      {/* Footer */}
      <div className="relative mt-8 flex items-center gap-2 border-t border-white/15 pt-4 text-sm text-indigo-200">
        <Sparkles size={14} />
        <span>Generated automatically using AI schedule analysis.</span>
      </div>
    </div>
  );
};

export default RecommendationCard;

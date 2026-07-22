import React from "react";
import { Bot, FileText, Sparkles } from "lucide-react";

// answer: string
// citations: array of { source_filename, chunk_index, excerpt, similarity }

const AIPanel = ({ answer, citations = [] }) => {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        bg-gradient-to-br
        from-violet-600
        via-indigo-600
        to-blue-700
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
              AI Copilot
            </p>

            <h2 className="mt-1 text-2xl font-bold">Generated Response</h2>
          </div>
        </div>

        <Sparkles className="text-indigo-200" size={24} />
      </div>

      {/* Answer */}

      <p className="relative mt-6 whitespace-pre-wrap leading-8 text-indigo-100">
        {answer ||
          "Ask a question about your uploaded engineering documents to receive an AI-generated answer with supporting citations."}
      </p>

      {/* Citations */}

      {citations.length > 0 && (
        <div className="relative mt-8 border-t border-white/15 pt-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-200">
            Supporting Sources
          </h3>

          <div className="space-y-4">
            {citations.map((c, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} />

                  <span className="flex-1 font-medium">
                    {c.source_filename}
                  </span>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                    {Math.round(c.similarity * 100)}% Match
                  </span>
                </div>

                <p className="mt-3 text-sm italic leading-6 text-indigo-100">
                  "{c.excerpt}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPanel;

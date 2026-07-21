import React from "react";
import { Sparkles, FileText } from "lucide-react";

// answer: string, citations: array of { source_filename, chunk_index, excerpt, similarity }
const AIPanel = ({ answer, citations = [] }) => {
  return (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles />
        <h2 className="font-semibold text-lg">AI Generated Response</h2>
      </div>

      <p className="leading-7 text-indigo-100">
        {answer || "Ask a question about the ingested corpus to see a cited answer here."}
      </p>

      {citations.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/20 space-y-3">
          <p className="text-sm font-semibold text-white/90">Sources</p>
          {citations.map((c, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <FileText size={14} />
                {c.source_filename}
                <span className="text-white/60 text-xs ml-auto">{Math.round(c.similarity * 100)}% match</span>
              </div>
              <p className="text-white/70 text-xs mt-1 italic">"{c.excerpt}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIPanel;

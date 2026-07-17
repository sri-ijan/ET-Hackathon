import React from "react";
import { FileText, Sparkles } from "lucide-react";

import RFICard from "../components/rfi/RFICard";
import RFITable from "../components/rfi/RFITable";
import AIPanel from "../components/rfi/AIPanel";

const RFICopilot = () => {
  return (
    <div className="space-y-8">

      {/* Hero */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            AI RFI Copilot
          </h1>

          <p className="text-slate-500 mt-2">
            Generate intelligent RFI drafts and manage engineering queries.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition">
          <Sparkles size={18} />
          Generate Draft
        </button>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <RFICard
          title="Open RFIs"
          value="18"
        />

        <RFICard
          title="Draft Generated"
          value="11"
        />

        <RFICard
          title="Resolved"
          value="54"
        />

      </div>

      {/* New RFI */}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">

        <div className="flex items-center gap-3 mb-5">

          <FileText className="text-indigo-600"/>

          <h2 className="font-semibold text-lg">
            Create New RFI
          </h2>

        </div>

        <textarea
          rows={6}
          placeholder="Describe the engineering issue..."
          className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500"
        />

      </div>

      {/* Table + AI */}

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">

          <RFITable />

        </div>

        <AIPanel />

      </div>

    </div>
  );
};

export default RFICopilot;
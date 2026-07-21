import mongoose from 'mongoose';

const execSummarySchema = new mongoose.Schema(
  {
    overallStatus: { type: String, enum: ['on_track', 'at_risk', 'critical'], required: true },
    headline: { type: String, required: true },
    topRisks: [{ type: String }],
    recommendedActions: [{ type: String }],
    fullSummary: { type: String, required: true },
    source: { type: String, default: 'live_llm' },
  },
  { timestamps: true }
);

export const ExecSummary = mongoose.model('ExecSummary', execSummarySchema);

import mongoose from 'mongoose';

const taskRiskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  taskName: { type: String, required: true },
  endDate: { type: String, required: true },
  percentComplete: { type: Number, required: true },
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  riskReason: { type: String, required: true },
  hasDownstreamDependents: { type: Boolean, default: false },
});

const scheduleRiskReportSchema = new mongoose.Schema(
  {
    scheduleFileName: { type: String, required: true },
    asOfDate: { type: String, required: true },
    totalTasks: { type: Number, required: true },
    flaggedTasks: { type: Number, required: true },
    overallProjectRisk: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    summary: { type: String, required: true },
    rankedRisks: [taskRiskSchema],
    source: { type: String, default: 'live_llm' },
  },
  { timestamps: true }
);

export const ScheduleRiskReport = mongoose.model('ScheduleRiskReport', scheduleRiskReportSchema);

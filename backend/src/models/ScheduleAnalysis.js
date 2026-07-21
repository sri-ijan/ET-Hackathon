import mongoose from "mongoose";

const taskRiskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
  },

  taskName: {
    type: String,
    required: true,
  },

  endDate: String,

  percentComplete: Number,

  riskScore: Number,

  riskLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low",
  },

  riskReason: String,

  hasDownstreamDependents: {
    type: Boolean,
    default: false,
  },
});

const scheduleAnalysisSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      default: "live_llm",
    },

    asOfDate: String,

    totalTasks: Number,

    flaggedTasks: Number,

    overallProjectRisk: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    summary: {
      type: String,
    },

    rankedRisks: [taskRiskSchema],
  },
  {
    timestamps: true,
  }
);

export const ScheduleAnalysis = mongoose.model(
  "ScheduleAnalysis",
  scheduleAnalysisSchema
);
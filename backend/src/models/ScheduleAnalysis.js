import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
  },

  startDate: Date,

  endDate: Date,

  dependency: String,

  percentComplete: Number,

  riskScore: Number,

  riskReason: String,

  status: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
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

    overallRisk: {
      type: String,
      default: "Low",
    },

    summary: {
      type: String,
    },

    tasks: [taskSchema],
  },
  {
    timestamps: true,
  }
);

export const ScheduleAnalysis = mongoose.model(
  "ScheduleAnalysis",
  scheduleAnalysisSchema
);
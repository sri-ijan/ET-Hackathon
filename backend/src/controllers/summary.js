import { catchAsync } from "../utils/catchAsync.js";
import { ComplianceReport } from "../models/ComplianceReport.js";
import { ScheduleAnalysis } from "../models/ScheduleAnalysis.js";
import { RFIQuery } from "../models/RFIQuery.js";

export const generateExecutiveSummary = catchAsync(async (req, res) => {
  const latestCompliance = await ComplianceReport.findOne().sort({
    createdAt: -1,
  });

  const latestSchedule = await ScheduleAnalysis.findOne().sort({
    createdAt: -1,
  });

  const recentRfis = await RFIQuery.find()
    .sort({ createdAt: -1 })
    .limit(5);

  if (!latestCompliance && !latestSchedule && recentRfis.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No project data available.",
    });
  }

  const complianceFlags =
    latestCompliance?.parameters.filter(
      (p) => p.status !== "pass"
    ) || [];

 const highRiskTasks =
  latestSchedule?.tasks.filter(
    (t) => t.riskScore >= 70
  ) || [];

  const summary = {
    generatedAt: new Date(),

    overallStatus:
      complianceFlags.length > 0 ||
      highRiskTasks.length > 0
        ? "Attention Required"
        : "Healthy",

    compliance: {
      overallStatus:
        latestCompliance?.overallStatus || "N/A",

      summary:
        latestCompliance?.summary || "",

      totalFlags: complianceFlags.length,

      flags: complianceFlags.slice(0, 3),
    },

    schedule: {
      overallRisk:
        latestSchedule?.overallRisk || "N/A",

      summary:
        latestSchedule?.summary || "",

      topRisks: highRiskTasks.slice(0, 3),
    },

    rfi: {
      totalQueries: recentRfis.length,

      latestQuestions: recentRfis.map((q) => ({
        question: q.question,
        createdAt: q.createdAt,
      })),
    },

    recommendations: [
      complianceFlags.length
        ? "Resolve specification deviations."
        : "No major specification deviations detected.",

      highRiskTasks.length
        ? "Review high-risk schedule activities."
        : "Schedule progressing normally.",

      recentRfis.length
        ? "Review recent RFIs before next coordination meeting."
        : "No recent RFIs.",
    ],
  };

  res.status(200).json({
    status: "success",
    data: summary,
  });
});
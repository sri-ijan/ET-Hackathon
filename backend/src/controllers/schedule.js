import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { analyzeSchedule as analyzeScheduleRisk } from "../services/aiService.js";
import { ScheduleAnalysis } from "../models/ScheduleAnalysis.js";

export const uploadSchedule = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(
      new AppError(
        "Please upload a schedule CSV or Excel file.",
        400
      )
    );
  }

  const { as_of_date } = req.body;

  const data = await analyzeScheduleRisk(req.file, as_of_date);

  const analysis = await ScheduleAnalysis.create({
    fileName: req.file.originalname,


    source: data.source || "live_llm",

    asOfDate: data.as_of_date,

    totalTasks: data.total_tasks,

    flaggedTasks: data.flagged_tasks,

    overallProjectRisk: data.overall_project_risk,

    summary: data.summary || "",

    rankedRisks: (data.ranked_risks || []).map((task) => ({
      taskId: task.task_id,
      taskName: task.task_name,
      endDate: task.end_date,
      percentComplete: task.percent_complete,
      riskScore: task.risk_score,
      riskLevel: task.risk_level,
      riskReason: task.risk_reason,
      hasDownstreamDependents: task.has_downstream_dependents,

    })),
  });

  res.status(201).json({
    status: "success",
    data: analysis,
  });
});

export const getScheduleHistory = catchAsync(async (req, res) => {
  const history = await ScheduleAnalysis.find()
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: history.length,
    data: history,
  });
});

export const getScheduleAnalysis = catchAsync(
  async (req, res, next) => {
    const report =
      await ScheduleAnalysis.findById(req.params.id);

    if (!report) {
      return next(
        new AppError(
          "Schedule analysis not found.",
          404
        )
      );
    }

    res.status(200).json({
      status: "success",
      data: report,
    });
  }
);

export const deleteScheduleAnalysis = catchAsync(
  async (req, res, next) => {
    const report =
      await ScheduleAnalysis.findByIdAndDelete(
        req.params.id
      );

    if (!report) {
      return next(
        new AppError(
          "Schedule analysis not found.",
          404
        )
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
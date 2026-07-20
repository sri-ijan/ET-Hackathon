import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { analyzeSchedule } from "../services/aiService.js";
import { ScheduleAnalysis } from "../models/ScheduleAnalysis.js";

export const uploadSchedule = catchAsync(async (req, res, next) => {
    console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  console.log(req.headers["content-type"]);
  if (!req.file) {
    return next(
      new AppError(
        "Please upload a schedule CSV or Excel file.",
        400
      )
    );
  }

  const data = await analyzeSchedule(req.file);

  const analysis = await ScheduleAnalysis.create({
    fileName: req.file.originalname,

    overallRisk:
      data.overall_risk || data.overallRisk || "Medium",

    summary:
      data.summary || "",

    source:
      data.source || "live_llm",

    tasks: (data.tasks || []).map((task) => ({
      taskName:
        task.task_name || task.taskName,

      startDate:
        task.start_date || task.startDate,

      endDate:
        task.end_date || task.endDate,

      dependency:
        task.dependency || "",

      percentComplete:
        task.percent_complete ||
        task.percentComplete ||
        0,

      riskScore:
        task.risk_score ||
        task.riskScore ||
        0,

      riskReason:
        task.risk_reason ||
        task.riskReason ||
        "",

      status:
        task.status || "low",
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
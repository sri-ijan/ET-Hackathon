import { ComplianceReport } from "../models/ComplianceReport.js";
import { GeneratedRFI } from "../models/GeneratedRFI.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const reports = await ComplianceReport.find({}, "parameters");

    const complianceReports = reports.length;

    let complianceFindings = 0;

    reports.forEach((report) => {
      report.parameters.forEach((parameter) => {
        if (
          parameter.status === "fail" ||
          parameter.status === "flagged"
        ) {
          complianceFindings++;
        }
      });
    });

    const generatedRFIs = await GeneratedRFI.countDocuments();

    const uploadedDocuments = complianceReports * 2;

    return res.status(200).json({
      status: "success",
      data: {
        complianceReports,
        complianceFindings,
        generatedRFIs,
        uploadedDocuments,
      },
    });
  } catch (error) {
    next(error);
  }
};
import mongoose from 'mongoose';

const parameterComparisonSchema = new mongoose.Schema({
  parameterName: {
    type: String,
    required: true,
  },
  specificationValue: {
    type: String,
    required: true,
  },
  submittalValue: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pass', 'fail', 'flagged'],
    required: true,
  },
  deviationReason: {
    type: String,
    default: null,
  },
  locationInSpec: {
    type: String,
    default: null,
  },
  locationInSubmittal: {
    type: String,
    default: null,
  },
});

const complianceReportSchema = new mongoose.Schema(
  {
    specificationFileName: {
      type: String,
      required: true,
    },
    submittalFileName: {
      type: String,
      required: true,
    },
    overallStatus: {
      type: String,
      enum: ['pass', 'fail', 'flagged'],
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    parameters: [parameterComparisonSchema],
  },
  {
    timestamps: true,
  }
);

export const ComplianceReport = mongoose.model('ComplianceReport', complianceReportSchema);

import mongoose from 'mongoose';

const generatedRfiSchema = new mongoose.Schema(
  {
    complianceReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ComplianceReport',
      required: false,
    },
    parameterName: { type: String, required: true },
    specificationValue: { type: String, required: true },
    submittalValue: { type: String, required: true },
    status: { type: String, enum: ['fail', 'flagged'], required: true },
    deviationReason: { type: String, default: null },
    rfiNumber: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    recommendedPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    source: { type: String, enum: ['live_llm'], default: 'live_llm' },
  },
  { timestamps: true }
);

export const GeneratedRFI = mongoose.model('GeneratedRFI', generatedRfiSchema);
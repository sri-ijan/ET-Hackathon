import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema({
  sourceFilename: { type: String, required: true },
  chunkIndex: { type: Number, required: true },
  excerpt: { type: String, required: true },
  similarity: { type: Number, required: true },
});

const rfiQuerySchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    citations: [citationSchema],
    source: { type: String, enum: ['live_llm'], default: 'live_llm' },
  },
  { timestamps: true }
);

export const RFIQuery = mongoose.model('RFIQuery', rfiQuerySchema);
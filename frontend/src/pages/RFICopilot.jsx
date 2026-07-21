import { useState } from "react";
import axios from "axios";
import { Loader2, AlertCircle, Send, Database } from "lucide-react";

import UploadBox from "../components/common/UploadBox";
import RFICard from "../components/rfi/RFICard";
import RFITable from "../components/rfi/RFITable";
import AIPanel from "../components/rfi/AIPanel";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function RFICopilot() {
  const [ingestFile, setIngestFile] = useState(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState(null);
  const [corpusStats, setCorpusStats] = useState(null);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [history, setHistory] = useState([]);

  const handleIngest = async () => {
    if (!ingestFile) {
      setIngestError("Please select a document to add to the knowledge corpus.");
      return;
    }
    setIngesting(true);
    setIngestError(null);

    try {
      const formData = new FormData();
      formData.append("document", ingestFile);
      const response = await axios.post(`${API_BASE_URL}/ai/rfi/ingest`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCorpusStats(response.data.data);
      setIngestFile(null);
    } catch (err) {
      setIngestError(err.response?.data?.message || err.response?.data?.detail || "Failed to ingest document. Is the AI service running with GEMINI_API_KEY set?");
    } finally {
      setIngesting(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setAskError("Please type a question.");
      return;
    }
    setAsking(true);
    setAskError(null);

    try {
      const formData = new FormData();
      formData.append("question", question);
      const response = await axios.post(`${API_BASE_URL}/ai/rfi/ask`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data.data;
      setCurrentAnswer(data);
      setHistory((prev) => [
        { question: data.question, answer: data.answer, citationCount: data.citations?.length || 0 },
        ...prev,
      ]);
      setQuestion("");
    } catch (err) {
      setAskError(err.response?.data?.message || err.response?.data?.detail || "Failed to get an answer. Is the AI service running?");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI RFI Copilot</h1>
        <p className="text-slate-500 mt-2">
          Seed the knowledge corpus with project documents, then ask questions and get cited answers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RFICard title="Chunks in Corpus" value={corpusStats?.total_chunks_in_corpus ?? "—"} />
        <RFICard title="Questions Asked This Session" value={history.length} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <Database className="text-indigo-600" />
          <h2 className="font-semibold text-lg">Add Document to Knowledge Corpus</h2>
        </div>
        <UploadBox
          title="RFI, Spec, or Meeting Notes"
          subtitle="PDF or DOCX. This gets chunked and embedded so the copilot can cite it."
          file={ingestFile}
          onFileSelect={setIngestFile}
        />
        <button
          onClick={handleIngest}
          disabled={ingesting}
          className="mt-4 flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {ingesting ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
          {ingesting ? "Ingesting..." : "Add to Corpus"}
        </button>
        {ingestError && (
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
            <p>{ingestError}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-lg mb-4">Ask the Corpus</h2>
        <div className="flex gap-3">
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What is the required battery autonomy for the UPS?"
            className="flex-1 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={handleAsk}
          disabled={asking}
          className="mt-4 flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {asking ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {asking ? "Thinking..." : "Ask"}
        </button>
        {askError && (
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
            <p>{askError}</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-lg mb-4">Question History</h2>
          <RFITable history={history} />
        </div>

        <AIPanel answer={currentAnswer?.answer} citations={currentAnswer?.citations || []} />
      </div>
    </div>
  );
}

export default RFICopilot;

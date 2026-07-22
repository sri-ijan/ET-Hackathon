import { useState } from "react";
import axios from "axios";
import {
  Loader2,
  AlertCircle,
  Send,
  Database,
  Bot,
  Sparkles,
  MessageSquareText,
} from "lucide-react";

import UploadBox from "../components/common/UploadBox";
import RFICard from "../components/rfi/RFICard";
import RFITable from "../components/rfi/RFITable";
import AIPanel from "../components/rfi/AIPanel";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

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
      setIngestError(
        "Please select a document to add to the knowledge corpus.",
      );
      return;
    }

    setIngesting(true);
    setIngestError(null);

    try {
      const formData = new FormData();
      formData.append("document", ingestFile);

      const response = await axios.post(
        `${API_BASE_URL}/ai/rfi/ingest`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setCorpusStats(response.data.data);
      setIngestFile(null);
    } catch (err) {
      setIngestError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to ingest document. Is the AI service running?",
      );
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

      const response = await axios.post(
        `${API_BASE_URL}/ai/rfi/ask`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const data = response.data.data;

      setCurrentAnswer(data);

      setHistory((prev) => [
        {
          question: data.question,
          answer: data.answer,
          citationCount: data.citations?.length || 0,
        },
        ...prev,
      ]);

      setQuestion("");
    } catch (err) {
      setAskError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to get an answer. Is the AI service running?",
      );
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-slate-900 p-10 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10">
          <Sparkles size={280} />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">
              AI MODULE
            </p>

            <h1 className="mt-3 text-5xl font-bold">RFI Knowledge Copilot</h1>

            <p className="mt-5 max-w-3xl leading-8 text-blue-100">
              Build an AI-powered engineering knowledge base from RFIs,
              specifications and meeting notes. Ask natural language questions
              and receive cited answers instantly.
            </p>
          </div>

          <div className="hidden h-28 w-28 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur xl:flex">
            <Bot size={54} />
          </div>
        </div>
      </section>

      {/* Stats */}

      <section className="grid gap-6 md:grid-cols-2">
        <RFICard
          title="Chunks in Corpus"
          value={corpusStats?.total_chunks_in_corpus ?? "—"}
        />

        <RFICard title="Questions Asked This Session" value={history.length} />
      </section>

      {/* Knowledge Corpus */}

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <Database size={26} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Knowledge Corpus
            </h2>

            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Upload engineering documents to expand the AI knowledge base.
            </p>
          </div>
        </div>

        <UploadBox
          title="RFI, Specification or Meeting Notes"
          subtitle="Upload PDF or DOCX documents. The AI indexes them and uses them while answering questions."
          file={ingestFile}
          onFileSelect={setIngestFile}
        />

        <button
          onClick={handleIngest}
          disabled={ingesting}
          className="mt-5 flex items-center gap-3 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ingesting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Ingesting...
            </>
          ) : (
            <>
              <Database size={20} />
              Add to Corpus
            </>
          )}
        </button>

        {ingestError && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />

            <p>{ingestError}</p>
          </div>
        )}
      </section>
      {/* Ask AI */}

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <MessageSquareText size={26} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Ask the AI Copilot
            </h2>

            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Ask engineering questions in natural language and receive cited
              answers from your uploaded knowledge corpus.
            </p>
          </div>
        </div>

        <textarea
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: What is the required battery autonomy for the UPS?"
          className="
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            outline-none
            transition
            focus:border-indigo-500
            focus:ring-2
            focus:ring-indigo-500/20
            dark:border-slate-700
            dark:bg-slate-800
            dark:text-white
            dark:placeholder:text-slate-500
          "
        />

        <button
          onClick={handleAsk}
          disabled={asking}
          className="
            mt-5
            flex
            items-center
            gap-3
            rounded-2xl
            bg-indigo-600
            px-6
            py-3
            font-semibold
            text-white
            transition
            hover:bg-indigo-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {asking ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Thinking...
            </>
          ) : (
            <>
              <Send size={20} />
              Ask AI
            </>
          )}
        </button>

        {askError && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />

            <p>{askError}</p>
          </div>
        )}
      </section>

      {/* Results */}

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Conversation History
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {history.length} Questions
            </span>
          </div>

          <RFITable history={history} />
        </div>

        <div>
          <AIPanel
            answer={currentAnswer?.answer}
            citations={currentAnswer?.citations || []}
          />
        </div>
      </section>
    </div>
  );
}

export default RFICopilot;

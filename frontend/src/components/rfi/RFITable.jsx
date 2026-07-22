import React from "react";
import { MessageSquareText } from "lucide-react";

// history: array of { question, answer, citationCount }

const RFITable = ({ history = [] }) => {
  if (history.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <MessageSquareText
            size={28}
            className="text-slate-500 dark:text-slate-400"
          />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
          No Questions Yet
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Start asking questions about your uploaded engineering documents. Your
          conversation history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Question
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                AI Response
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sources
              </th>
            </tr>
          </thead>

          <tbody>
            {history.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                <td className="max-w-sm px-6 py-5 font-semibold text-slate-900 dark:text-white">
                  {item.question}
                </td>

                <td className="max-w-lg px-6 py-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.answer}
                </td>

                <td className="px-6 py-5">
                  <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {item.citationCount} Source
                    {item.citationCount !== 1 ? "s" : ""}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RFITable;

import React from "react";

// history: array of { question, answer, citationCount }
const RFITable = ({ history = [] }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        No questions asked yet this session.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-4 text-left">Question</th>
            <th className="p-4 text-left">Answer</th>
            <th className="p-4 text-left">Sources</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, i) => (
            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 align-top">
              <td className="p-4 font-medium max-w-xs">{item.question}</td>
              <td className="p-4 text-slate-600 text-sm max-w-md">{item.answer}</td>
              <td className="p-4 text-slate-500 text-sm">{item.citationCount} cited</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RFITable;

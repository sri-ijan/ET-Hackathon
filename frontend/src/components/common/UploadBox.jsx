import { UploadCloud, FileText } from "lucide-react";

function UploadBox({
  title,
  subtitle,
  buttonText = "Choose File",
}) {
  return (
    <div className="group rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 hover:border-blue-500 hover:bg-blue-50/40 transition-all duration-300">

      <div className="flex flex-col items-center justify-center text-center">

        <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mb-5 group-hover:scale-110 transition">

          <UploadCloud
            className="text-blue-600"
            size={38}
          />

        </div>

        <h2 className="text-xl font-bold text-slate-800">
          {title}
        </h2>

        <p className="text-slate-500 mt-3 max-w-sm">
          {subtitle}
        </p>

        <button className="mt-7 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition">

          {buttonText}

        </button>

        <div className="flex items-center gap-2 text-slate-400 mt-5">

          <FileText size={18} />

          PDF / DOCX Supported

        </div>

      </div>

    </div>
  );
}

export default UploadBox;
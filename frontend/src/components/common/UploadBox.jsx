import { useRef } from "react";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";

function UploadBox({
  title,
  subtitle,
  buttonText = "Choose File",
  file,
  onFileSelect,
  accept = ".pdf,.docx,.doc"
}) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`group cursor-pointer rounded-3xl border-2 border-dashed p-8 transition-all duration-300 ${
        file 
          ? "border-emerald-500 bg-emerald-50/10 hover:border-emerald-600 hover:bg-emerald-50/20" 
          : "border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50/40"
      }`}
    >
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center text-center">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition ${
          file ? "bg-emerald-100" : "bg-blue-100"
        }`}>
          {file ? (
            <CheckCircle2 className="text-emerald-600" size={38} />
          ) : (
            <UploadCloud className="text-blue-600" size={38} />
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-800">
          {title}
        </h2>

        {file ? (
          <div className="mt-3">
            <span className="font-semibold text-emerald-700 bg-emerald-100/60 px-4 py-1.5 rounded-xl text-sm truncate max-w-xs block shadow-sm border border-emerald-200">
              {file.name}
            </span>
            <p className="text-slate-400 text-xs mt-3 italic">Click to select a different file</p>
          </div>
        ) : (
          <p className="text-slate-500 mt-3 max-w-sm">
            {subtitle}
          </p>
        )}

        {!file && (
          <button 
            type="button" 
            className="mt-7 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300"
          >
            {buttonText}
          </button>
        )}

        <div className="flex items-center gap-2 text-slate-400 mt-5">
          <FileText size={18} />
          PDF / DOCX Supported
        </div>
      </div>
    </div>
  );
}

export default UploadBox;
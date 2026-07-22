import { useRef } from "react";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

function UploadBox({
  title,
  subtitle,
  buttonText = "Choose File",
  file,
  onFileSelect,
  accept = ".pdf,.docx,.doc",
}) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
      <div
        onClick={handleClick}
        className={`
          group
          relative
          overflow-hidden
          cursor-pointer
          rounded-3xl
          border-2
          border-dashed
          p-8
          transition-all
          duration-300

          ${
            file
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-500"
              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500"
          }
        `}
      >
        {/* Background Glow */}

        <div
          className="
            absolute
            -top-16
            -right-16
            h-40
            w-40
            rounded-full
            bg-blue-500/10
            blur-3xl
            opacity-0
            group-hover:opacity-100
            transition
          "
        />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
        />

        <div className="relative flex flex-col items-center text-center">
          <div
            className={`
              w-20
              h-20
              rounded-3xl
              flex
              items-center
              justify-center
              shadow-lg
              transition-all
              duration-300
              group-hover:scale-110
              group-hover:rotate-3

              ${
                file
                  ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
                  : "bg-gradient-to-br from-blue-600 to-cyan-500 text-white"
              }
            `}
          >
            {file ? <CheckCircle2 size={38} /> : <UploadCloud size={38} />}
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          {file ? (
            <>
              <div
                className="
                  mt-4
                  rounded-2xl
                  bg-emerald-100
                  dark:bg-emerald-900/30
                  border
                  border-emerald-200
                  dark:border-emerald-700
                  px-4
                  py-3
                  max-w-full
                "
              >
                <p className="truncate font-semibold text-emerald-700 dark:text-emerald-300">
                  {file.name}
                </p>
              </div>

              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Click anywhere to replace this file
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 max-w-sm leading-7 text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>

              <button
                type="button"
                className="
                  mt-7
                  rounded-2xl
                  bg-blue-600
                  px-7
                  py-3
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-500/20
                  transition
                  hover:bg-blue-700
                "
              >
                {buttonText}
              </button>
            </>
          )}

          <div
            className="
              mt-6
              flex
              items-center
              gap-2
              rounded-full
              bg-slate-100
              dark:bg-slate-800
              px-4
              py-2
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            <FileText size={16} />
            PDF • DOC • DOCX
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default UploadBox;

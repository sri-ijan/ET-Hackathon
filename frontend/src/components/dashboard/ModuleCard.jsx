import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function ModuleCard({ title, description, icon, to }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="h-full"
    >
      <Link
        to={to}
        className="
          group
          relative
          flex
          h-full
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          dark:border-slate-700
          bg-white
          dark:bg-slate-900
          p-6
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-blue-500/40
          hover:shadow-2xl
        "
      >
        {/* Top Gradient */}

        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Glow */}

        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Header */}

        <div className="relative flex items-center justify-between">

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-blue-600
              to-cyan-500
              text-white
              shadow-lg
              transition-all
              duration-300
              group-hover:scale-110
              group-hover:rotate-6
            "
          >
            {icon}
          </div>

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              dark:bg-slate-800
              transition-all
              duration-300
              group-hover:bg-blue-600
              group-hover:text-white
            "
          >
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>

        </div>

        {/* Content */}

        <div className="relative mt-7 flex-1">

          <h2 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {title}
          </h2>

          <p className="mt-3 leading-7 text-slate-500 dark:text-slate-400">
            {description}
          </p>

        </div>

        {/* Footer */}

        <div className="relative mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">

          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Open Module
          </span>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">

            <Sparkles size={13} />

            AI Powered

          </div>

        </div>

      </Link>
    </motion.div>
  );
}

export default ModuleCard;
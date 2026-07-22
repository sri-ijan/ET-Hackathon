import { Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function RecentActivity() {
  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        dark:border-slate-700
        bg-white
        dark:bg-slate-900
        p-6
        shadow-sm
      "
    >
      {/* Header */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Timeline
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h2>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">

          <Activity
            size={20}
            className="text-blue-600 dark:text-blue-400"
          />

        </div>

      </div>

      {/* Empty State */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="
          rounded-3xl
          border-2
          border-dashed
          border-slate-200
          dark:border-slate-700
          px-6
          py-14
          text-center
        "
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">

          <Activity
            size={34}
            className="text-blue-600 dark:text-blue-400"
          />

        </div>

        <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
          No Recent Activity
        </h3>

        <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-500 dark:text-slate-400">
          Run a compliance audit or generate an AI RFI to see the latest
          engineering activities and project updates here.
        </p>

        <Link
          to="/spec-compliance"
          className="
            mt-8
            inline-flex
            items-center
            gap-2
            rounded-2xl
            bg-blue-600
            px-5
            py-3
            font-semibold
            text-white
            transition
            hover:bg-blue-700
          "
        >
          Run Compliance Audit

          <ArrowRight size={18} />

        </Link>

      </motion.div>

    </div>
  );
}

export default RecentActivity;
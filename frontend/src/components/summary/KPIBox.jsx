import React from "react";
import { motion } from "framer-motion";

const KPIBox = ({ title, value, subtitle, icon }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:border-indigo-400/40
        hover:shadow-xl
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* Top Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Glow */}
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 break-words text-4xl font-bold text-slate-900 dark:text-white">
            {value}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className="
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-indigo-100
            text-indigo-600
            shadow-md
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
            dark:bg-indigo-900/30
            dark:text-indigo-300
          "
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default KPIBox;

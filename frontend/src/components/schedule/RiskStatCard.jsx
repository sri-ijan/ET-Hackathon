import React from "react";
import { motion } from "framer-motion";

const RiskStatCard = ({ title, value, color, icon }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="
        group
        relative
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
        hover:border-indigo-400/40
        hover:shadow-xl
      "
    >
      {/* Hover Accent */}

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Glow */}

      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">
            {value}
          </h2>
        </div>

        <div
          className={`
            ${color}
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            shadow-md
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          `}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default RiskStatCard;

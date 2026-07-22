import { motion } from "framer-motion";

function StatCard({
  title,
  value,
  icon,
  color = "from-blue-600 to-cyan-500",
  change,
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{ duration: 0.25 }}
      className="
        group
        rounded-3xl
        border
        border-slate-200
        dark:border-slate-800
        bg-white
        dark:bg-slate-900
        p-6
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">
            {value}
          </h2>

          <p className="mt-4 text-sm font-semibold text-emerald-600">
            {change}
          </p>
        </div>

        <div
          className={`
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            ${color}
            text-white
            shadow-lg
            transition-transform
            duration-300
            group-hover:rotate-6
          `}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;

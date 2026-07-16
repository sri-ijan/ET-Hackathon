import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function QuickActionCard({
  title,
  description,
  icon,
  color,
  to,
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl bg-white border border-slate-200 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div
        className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-white`}
      >
        {icon}
      </div>

      <h2 className="mt-5 text-lg font-semibold text-slate-800">
        {title}
      </h2>

      <p className="mt-2 text-sm text-slate-500 leading-6">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-blue-600 font-semibold">
        Open
        <ArrowRight
          size={17}
          className="group-hover:translate-x-1 transition"
        />
      </div>
    </Link>
  );
}

export default QuickActionCard;
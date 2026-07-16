import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function ModuleCard({
  title,
  description,
  icon,
  to,
}) {
  return (
    <Link
      to={to}
      className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >

      <div className="flex items-center justify-between">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
          {icon}
        </div>

        <ArrowRight size={20} />
      </div>

      <h2 className="text-xl font-semibold mt-6 text-slate-800">
        {title}
      </h2>

      <p className="text-slate-500 mt-3 leading-relaxed">
        {description}
      </p>

    </Link>
  );
}

export default ModuleCard;
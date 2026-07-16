import {
  ShieldCheck,
  TriangleAlert,
  Bot,
  FileText,
} from "lucide-react";

const activities = [
  {
    icon: <ShieldCheck className="text-green-600" />,
    title: "Compliance analysis completed",
    time: "2 mins ago",
  },
  {
    icon: <TriangleAlert className="text-red-500" />,
    title: "2 schedule risks detected",
    time: "15 mins ago",
  },
  {
    icon: <Bot className="text-blue-600" />,
    title: "AI Copilot answered an RFI",
    time: "28 mins ago",
  },
  {
    icon: <FileText className="text-purple-600" />,
    title: "Executive Summary generated",
    time: "1 hour ago",
  },
];

function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">

      <h2 className="text-xl font-bold mb-6">
        Recent Activity
      </h2>

      <div className="space-y-5">

        {activities.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              {item.icon}
            </div>

            <div className="flex-1">

              <p className="font-medium">
                {item.title}
              </p>

              <p className="text-sm text-slate-500">
                {item.time}
              </p>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default RecentActivity;
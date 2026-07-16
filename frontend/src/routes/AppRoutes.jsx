import { Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";

import Dashboard from "../pages/Dashboard";
import SpecCompliance from "../pages/SpecCompliance";
import ScheduleRisk from "../pages/ScheduleRisk";
import RFICopilot from "../pages/RFICopilot";
import ExecutiveSummary from "../pages/ExecutiveSummary";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="spec-compliance" element={<SpecCompliance />} />
        <Route path="schedule-risk" element={<ScheduleRisk />} />
        <Route path="rfi-copilot" element={<RFICopilot />} />
        <Route path="executive-summary" element={<ExecutiveSummary />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
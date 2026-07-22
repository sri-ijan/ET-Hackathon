import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div
      className="
        flex
        h-screen
        bg-slate-50
        dark:bg-slate-950
        transition-colors
        duration-300
      "
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main
          className="
            flex-1
            overflow-y-auto
            bg-slate-50
            dark:bg-slate-950
            transition-all
            duration-300
            px-8
            py-6
            md:px-10
          "
        >
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

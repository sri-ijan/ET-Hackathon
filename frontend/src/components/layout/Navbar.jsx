import { Bell, Search, ChevronDown } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-40 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between">

      <div>

        <h1 className="text-2xl font-bold text-slate-800">
          AI Intelligence Platform
        </h1>

        <p className="text-sm text-slate-500">
          Data Centre EPC Delivery
        </p>

      </div>

      <div className="flex items-center gap-5">

        <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-80">

          <Search size={18} className="text-slate-500" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none px-3 w-full"
          />

        </div>

        <div className="hidden md:flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-xl font-medium">

          <div className="w-2 h-2 rounded-full bg-green-500"></div>

          AI Connected

        </div>

        <button className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition">

          Demo Project

          <ChevronDown size={16} />

        </button>

        <button className="relative">

          <Bell />

          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        <img
          src="https://ui-avatars.com/api/?name=AI&background=2563eb&color=fff"
          className="w-11 h-11 rounded-full"
        />

      </div>

    </header>
  );
}

export default Navbar;
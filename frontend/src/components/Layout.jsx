import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, User } from "lucide-react";
// FIX: import the real notification panel instead of a static Bell icon
import { NotificationPanel } from "./NotificationPanel";

export function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/report", label: "Report Issue", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link
            to="/"
            className="flex items-center gap-3 text-blue-600 font-bold text-xl"
          >
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <LayoutDashboard size={20} />
            </div>
            SmartCampus
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Smart Campus v1.0
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-800">
            {navItems.find((n) => n.path === location.pathname)?.label ||
              "Detail View"}
          </h2>

          <div className="flex items-center gap-4">
            {/* FIX: real notification bell panel */}
            <NotificationPanel />
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <button className="flex items-center gap-2 p-1 pl-3 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-all">
              <span className="text-sm font-medium text-slate-700">
                Technician Portal
              </span>
              <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white">
                <User size={14} />
              </div>
            </button>
          </div>
        </header>

        <main className="p-8 flex-1">{children}</main>

        <footer className="px-8 py-6 text-center text-slate-400 text-sm border-t border-slate-100 bg-white">
          &copy; 2026 Smart Campus PAF Project. Managed by Group WE297.
        </footer>
      </div>
    </div>
  );
}

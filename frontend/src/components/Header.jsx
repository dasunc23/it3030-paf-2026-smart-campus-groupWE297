import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { NotificationPanel } from "../components/NotificationPanel";
import {
  Bell,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  GraduationCap,
  PlusCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedin, userData, logout } = useContext(AppContent);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
          onClick={() => navigate("/")}
        >
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "#064e3b" }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-bold text-sm tracking-tight"
            style={{ color: "#064e3b" }}
          >
            Smart Campus
            <span className="font-normal ml-1" style={{ color: "#6b7280" }}>
              Ops Hub
            </span>
          </span>
        </div>

        {/* Centre nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: isActive ? "#ecfdf5" : "transparent",
                  color: isActive ? "#064e3b" : "#475569",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.color = "#1e293b";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#475569";
                  }
                }}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: bell + user controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <NotificationPanel />

          <div
            className="w-px h-5 mx-1"
            style={{ backgroundColor: "#e2e8f0" }}
          />

          {isLoggedin ? (
            <>
              <div
                className="hidden sm:flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border text-xs font-medium"
                style={{
                  backgroundColor: "#f8fafc",
                  borderColor: "#e2e8f0",
                  color: "#475569",
                }}
              >
                <span>{userData?.name || "Technician Portal"}</span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#cbd5e1" }}
                >
                  <UserIcon size={13} style={{ color: "white" }} />
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
                style={{
                  color: "#dc2626",
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecaca",
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-xs font-semibold px-3 py-1.5 rounded-md transition-all"
                style={{ color: "#475569", backgroundColor: "#f1f5f9" }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-3 py-1.5 text-xs font-bold rounded-md transition-all"
                style={{ backgroundColor: "#064e3b", color: "white" }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

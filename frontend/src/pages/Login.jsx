import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithGoogle } = useContext(AppContent);
  const navigate = useNavigate();

  // ── Local email/password submit ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result) {
      if (result.role === "ROLE_ADMIN") {
        navigate("/admin");
      } else if (result.role === "ROLE_TECHNICIAN") {
        navigate("/technician");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f9fafb" }}>
      {/* ── Left panel — brand / decorative ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: "#064e3b" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: "rgba(52,211,153,0.2)",
              border: "1px solid rgba(52,211,153,0.3)",
            }}
          >
            <GraduationCap className="w-5 h-5" style={{ color: "#34d399" }} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">
              Smart Campus
            </p>
            <p
              className="text-xs font-medium mt-0.5"
              style={{ color: "#6ee7b7" }}
            >
              Operations Hub
            </p>
          </div>
        </div>

        {/* Centre copy */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-8"
            style={{
              backgroundColor: "rgba(209,250,229,0.12)",
              color: "#6ee7b7",
              border: "1px solid rgba(110,231,183,0.25)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#34d399" }}
            />
            Secure Portal Access
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Manage your
            <br />
            campus from
            <br />
            <span style={{ color: "#34d399" }}>one place.</span>
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#a7f3d0", maxWidth: "360px" }}
          >
            Report incidents, book resources, and track maintenance — all
            through a single intelligent dashboard.
          </p>

          {/* Mini stats */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { value: "2,400+", label: "Tickets Resolved" },
              { value: "98%", label: "Resolution Rate" },
              { value: "< 2h", label: "Avg. Response" },
              { value: "15+", label: "Buildings" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <div className="text-xl font-extrabold text-white">
                  {s.value}
                </div>
                <div
                  className="text-xs mt-0.5 font-medium"
                  style={{ color: "#6ee7b7" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs" style={{ color: "#6ee7b7", opacity: 0.6 }}>
          Smart Campus · Enterprise Resource Management · v1.0
        </p>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "#064e3b" }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: "#064e3b" }}>
            Smart Campus{" "}
            <span className="font-normal" style={{ color: "#6b7280" }}>
              Ops Hub
            </span>
          </span>
        </div>

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-2xl font-extrabold tracking-tight mb-1"
              style={{ color: "#064e3b" }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "#64748b" }}>
              Sign in to manage campus operations
            </p>
          </div>

          {/* Divider */}
          

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "#475569" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#94a3b8" }}
                />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    color: "#1e293b",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#059669";
                    e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "#475569" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#94a3b8" }}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    color: "#1e293b",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#059669";
                    e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold mt-2 transition-all"
              style={{ backgroundColor: "#064e3b", color: "white" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#065f46";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#064e3b";
              }}
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Register link */}
          <div
            className="flex items-center justify-between px-5 py-4 rounded-xl mt-6"
            style={{ backgroundColor: "#ecfdf5", border: "1px solid #d1fae5" }}
          >
            <p className="text-sm" style={{ color: "#047857" }}>
              Don't have an account?
            </p>
            <Link
              to="/register"
              className="flex items-center gap-1 text-sm font-bold transition-all"
              style={{ color: "#064e3b" }}
            >
              Register <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

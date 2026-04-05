import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { register } = useContext(AppContent);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    const success = await register(name, email, password);
    if (success) {
      navigate("/login");
    }
  };

  const inputStyle = {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    color: "#1e293b",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "#059669";
    e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.08)";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.boxShadow = "none";
  };

  const PERKS = [
    "Submit and track campus incident tickets",
    "Book lecture halls, labs and equipment",
    "Get real-time maintenance updates",
    "Role-based access for staff and technicians",
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f9fafb" }}
    >

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ── Left: form ── */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-14">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-8">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                style={{
                  backgroundColor: "#ecfdf5",
                  color: "#059669",
                  border: "1px solid #d1fae5",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#34d399" }}
                />
                New Account
              </div>
              <h1
                className="text-2xl font-extrabold tracking-tight mb-1"
                style={{ color: "#064e3b" }}
              >
                Create your account
              </h1>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Join the smart campus community today
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "#475569" }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "#94a3b8" }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "#475569" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{
                      color:
                        confirmPassword && password !== confirmPassword
                          ? "#ef4444"
                          : "#94a3b8",
                    }}
                  />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      ...inputStyle,
                      ...(confirmPassword && password !== confirmPassword
                        ? { borderColor: "#fca5a5", backgroundColor: "#fff7f7" }
                        : confirmPassword && password === confirmPassword
                          ? {
                              borderColor: "#6ee7b7",
                              backgroundColor: "#f0fdf9",
                            }
                          : {}),
                    }}
                    onFocus={handleFocus}
                    onBlur={(e) => {
                      if (confirmPassword && password !== confirmPassword) {
                        e.target.style.borderColor = "#fca5a5";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(239,68,68,0.07)";
                      } else {
                        handleBlur(e);
                      }
                    }}
                  />
                </div>
                {passwordError && (
                  <p
                    className="mt-1.5 text-xs font-medium"
                    style={{ color: "#ef4444" }}
                  >
                    {passwordError}
                  </p>
                )}
                {confirmPassword &&
                  !passwordError &&
                  password === confirmPassword && (
                    <p
                      className="mt-1.5 text-xs font-medium flex items-center gap-1"
                      style={{ color: "#059669" }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passwords match
                    </p>
                  )}
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
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Login link */}
            <div className="flex items-center gap-3 mt-6">
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "#e2e8f0" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "#94a3b8" }}
              >
                or
              </span>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "#e2e8f0" }}
              />
            </div>

            <div
              className="flex items-center justify-between px-5 py-4 rounded-xl mt-4"
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <p className="text-sm" style={{ color: "#64748b" }}>
                Already have an account?
              </p>
              <Link
                to="/login"
                className="flex items-center gap-1 text-sm font-bold transition-all"
                style={{ color: "#064e3b" }}
              >
                Login here <ChevronLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right: perks panel ── */}
        <div
          className="hidden lg:flex lg:w-2/5 xl:w-1/3 flex-col justify-center px-12 py-14"
          style={{ backgroundColor: "#064e3b" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-6"
            style={{ color: "#6ee7b7" }}
          >
            What you get
          </p>
          <h3 className="text-2xl font-extrabold text-white leading-snug mb-8">
            Everything your
            <br />
            campus needs,
            <br />
            <span style={{ color: "#34d399" }}>in one hub.</span>
          </h3>

          <div className="space-y-4">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(52,211,153,0.15)" }}
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5"
                    style={{ color: "#34d399" }}
                  />
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#a7f3d0" }}
                >
                  {perk}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div
            className="mt-12 rounded-xl p-5"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <div className="text-2xl font-extrabold text-white mb-1">
              2,400+
            </div>
            <div className="text-xs font-medium" style={{ color: "#6ee7b7" }}>
              Campus members already onboard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

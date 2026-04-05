import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppContent } from "../context/AppContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Building2,
  Ticket,
  ClipboardList,
  Wrench,
  Bell,
  ShieldCheck,
  ArrowRight,
  Wifi,
  Zap,
  Monitor,
  Hammer,
  LayoutDashboard,
  BookOpen,
  ChevronRight,
  GraduationCap,
  PlusCircle,
} from "lucide-react";

/* ─── Design Tokens ──────────────────────────────────────────────────────────
   Theme: Deep Emerald + Warm Slate
   - Emerald Deep:    #064e3b  (primary structure)
   - Emerald Mid:     #059669  (accents, CTAs)
   - Emerald Light:   #d1fae5  (highlight tints)
   - Slate Dark:      #1e293b  (text primary)
   - Slate Mid:       #475569  (text secondary)
   - Warm White:      #f9fafb  (page background)
   - Surface:         #ffffff
   - Terracotta:      #b45309  (secondary accent)
───────────────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "2,400+", label: "Tickets Resolved" },
  { value: "98%", label: "Resolution Rate" },
  { value: "< 2h", label: "Avg. Response Time" },
  { value: "15+", label: "Campus Buildings" },
];

const FEATURES = [
  {
    icon: <Ticket className="w-5 h-5" />,
    title: "Incident Ticketing",
    desc: "Report and track campus incidents from hardware failures to facility issues — all in one centralised place.",
    tag: "Core",
    color: "#064e3b",
    bg: "#ecfdf5",
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    title: "Resource Booking",
    desc: "Reserve lecture halls, labs, and equipment with real-time availability and conflict detection.",
    tag: "Core",
    color: "#064e3b",
    bg: "#ecfdf5",
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    title: "Maintenance Requests",
    desc: "Submit and monitor maintenance jobs with priority-based dispatch to certified technicians.",
    tag: "Operations",
    color: "#92400e",
    bg: "#fffbeb",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Smart Notifications",
    desc: "Receive instant alerts on ticket updates, booking confirmations, and maintenance status changes.",
    tag: "Comms",
    color: "#1e40af",
    bg: "#eff6ff",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Role-Based Access",
    desc: "Granular admin, technician, and user views ensure the right people see and act on what matters.",
    tag: "Security",
    color: "#6d28d9",
    bg: "#f5f3ff",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Facility Catalogue",
    desc: "Browse all campus assets with live availability status, capacity details, and booking history.",
    tag: "Resources",
    color: "#be185d",
    bg: "#fdf2f8",
  },
];

const CATEGORIES = [
  { icon: <Monitor className="w-4 h-4" />, label: "Hardware" },
  { icon: <Wifi className="w-4 h-4" />, label: "Network" },
  { icon: <Zap className="w-4 h-4" />, label: "Electrical" },
  { icon: <Hammer className="w-4 h-4" />, label: "Facility" },
];

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedin, userData } = useContext(AppContent);

  useEffect(() => {
    if (userData?.role === "ROLE_ADMIN") navigate("/admin", { replace: true });
    else if (userData?.role === "ROLE_TECHNICIAN")
      navigate("/technician", { replace: true });
  }, [userData]);

  const isRegularUser =
    !userData ||
    (userData.role !== "ROLE_ADMIN" && userData.role !== "ROLE_TECHNICIAN");

  return (
    <div
      className="min-h-screen w-full font-sans overflow-x-hidden"
      style={{ backgroundColor: "#f9fafb", color: "#1e293b" }}
    >
      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <Header />

      {/* ── Hero — split layout ────────────────────────────────────────────── */}
      <section
        className="pt-16 min-h-screen flex flex-col lg:flex-row"
        style={{ backgroundColor: "#064e3b" }}
      >
        {/* Left panel */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-8"
              style={{
                backgroundColor: "rgba(209,250,229,0.15)",
                color: "#6ee7b7",
                border: "1px solid rgba(110,231,183,0.3)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Integrated Resource Management
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white mb-6">
              One platform
              <br />
              for every
              <br />
              <span style={{ color: "#34d399" }}>campus need.</span>
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed mb-10"
              style={{ color: "#a7f3d0", maxWidth: "480px" }}
            >
              Report issues, book resources, and track maintenance — all from a
              single, intelligent dashboard built for university operations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {isRegularUser && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/tickets/new")}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all"
                  style={{ backgroundColor: "#34d399", color: "#064e3b" }}
                >
                  <Ticket className="w-4 h-4" />
                  Report an Issue
                </motion.button>
              )}

              {isRegularUser && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/tickets/my")}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <ClipboardList className="w-4 h-4" />
                  My Tickets
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/resources")}
                className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <BookOpen className="w-4 h-4" />
                Campus Resources
              </motion.button>

              {isLoggedin ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    navigate(
                      userData?.role === "ROLE_ADMIN"
                        ? "/bookings/admin"
                        : "/bookings",
                    )
                  }
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <ClipboardList className="w-4 h-4" />
                  Resource Booking
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <ClipboardList className="w-4 h-4" />
                  Resource Booking
                </motion.button>
              )}

              {!isLoggedin && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all"
                  style={{ backgroundColor: "#34d399", color: "#064e3b" }}
                >
                  Get Started <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right panel — Stats stacked vertically */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:w-80 xl:w-96 flex flex-row lg:flex-col justify-center gap-4 px-8 md:px-16 lg:px-10 pb-16 lg:py-20"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex-1 lg:flex-none rounded-xl p-5 lg:p-6"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-2xl lg:text-3xl font-extrabold text-white">
                {s.value}
              </div>
              <div
                className="text-xs mt-1 font-medium"
                style={{ color: "#6ee7b7" }}
              >
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Quick Report Strip ─────────────────────────────────────────────── */}
      <section
        className="py-6 px-6"
        style={{
          backgroundColor: "#f1f5f9",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#ecfdf5" }}
            >
              <Zap className="w-4 h-4" style={{ color: "#059669" }} />
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#94a3b8" }}
              >
                Quick Report
              </p>
              <p className="text-sm font-semibold" style={{ color: "#1e293b" }}>
                What kind of issue?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                onClick={() => navigate("/tickets/new")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "white",
                  color: "#1e293b",
                  border: "1px solid #e2e8f0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#064e3b";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "#064e3b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "#1e293b";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                {c.icon}
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — alternating list style ─────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#059669" }}
            >
              Platform Capabilities
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
              style={{ color: "#064e3b" }}
            >
              Everything you need,
              <br />
              nothing you don't.
            </h2>
          </div>
          <p
            className="text-sm max-w-xs"
            style={{ color: "#64748b", lineHeight: "1.7" }}
          >
            One enterprise dashboard to manage every aspect of your campus
            infrastructure — built for scale.
          </p>
        </div>

        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{
            backgroundColor: "#e2e8f0",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="p-7 group transition-all"
              style={{ backgroundColor: "white" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: f.bg, color: f.color }}
              >
                {f.icon}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className="font-bold text-base"
                  style={{ color: "#1e293b" }}
                >
                  {f.title}
                </h3>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: f.bg, color: f.color }}
                >
                  {f.tag}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner — horizontal split ─────────────────────────────────── */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden flex flex-col md:flex-row"
            style={{ border: "1px solid #e2e8f0" }}
          >
            {/* Left: text */}
            <div
              className="flex-1 p-10 md:p-12"
              style={{ backgroundColor: "#ecfdf5" }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "#059669" }}
              >
                Get Help Fast
              </p>
              <h2
                className="text-2xl md:text-3xl font-extrabold mb-3"
                style={{ color: "#064e3b" }}
              >
                Something broken
                <br />
                on campus?
              </h2>
              <p className="text-sm" style={{ color: "#047857" }}>
                Submit a ticket in under a minute. Our facilities team is
                notified instantly.
              </p>
            </div>

            {/* Right: action buttons */}
            <div
              className="flex flex-col justify-center gap-3 p-10 md:p-12"
              style={{ backgroundColor: "#064e3b", minWidth: "280px" }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/tickets/new")}
                className="flex items-center justify-between gap-2 w-full px-5 py-3.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: "#34d399", color: "#064e3b" }}
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  Report an Issue
                </span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/resources")}
                className="flex items-center justify-between gap-2 w-full px-5 py-3.5 rounded-xl text-sm font-bold"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Browse Resources
                </span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

import React, { useContext } from "react";
import { AppContent } from "../context/AppContext";
import ResourceCatalogue from "./ResourceCatalogue";
import AuditLogs from "./AuditLogs";
import {
  ClipboardList,
  FileText,
  Building2,
  Activity,
  FlaskConical,
  BookOpen,
  GraduationCap,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import AddResourceForm from "./AddResourceForm";

function CampusResources() {
  const { userData } = useContext(AppContent);
  const isAdmin = userData?.role === "ROLE_ADMIN";

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "#f9fafb", color: "#1e293b" }}
    >
      {/* ── Hero Header ── */}
      <div style={{ backgroundColor: "#064e3b" }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{
                  backgroundColor: "rgba(209,250,229,0.15)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(110,231,183,0.3)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Campus Resources
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
                Campus Resources Hub
              </h1>
              <p className="text-sm" style={{ color: "#a7f3d0" }}>
                Browse, filter, and audit all campus resources in one place.
              </p>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6"
          >
            {[
              {
                label: "Resources",
                value: "120+",
                dot: "#10b981",
                iconBg: "#ecfdf5",
                iconColor: "#064e3b",
                icon: <Building2 className="w-5 h-5" />,
              },
              {
                label: "Active",
                value: "85%",
                dot: "#34d399",
                iconBg: "#d1fae5",
                iconColor: "#065f46",
                icon: <Activity className="w-5 h-5" />,
              },
              {
                label: "Labs",
                value: "15",
                dot: "#f59e0b",
                iconBg: "#fffbeb",
                iconColor: "#92400e",
                icon: <FlaskConical className="w-5 h-5" />,
              },
              {
                label: "Lecture Halls",
                value: "30+",
                dot: "#818cf8",
                iconBg: "#eef2ff",
                iconColor: "#3730a3",
                icon: <BookOpen className="w-5 h-5" />,
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl p-5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: s.iconBg, color: s.iconColor }}
                  >
                    {s.icon}
                  </div>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.dot }}
                  />
                </div>
                <div className="text-2xl font-extrabold text-white mb-0.5">
                  {s.value}
                </div>
                <div
                  className="text-xs font-medium"
                  style={{ color: "#6ee7b7" }}
                >
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Tab strip bottom edge ── */}
          <div className="flex gap-1 mt-6">
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold"
              style={{ backgroundColor: "#f9fafb", color: "#064e3b" }}
            >
              <ClipboardList className="w-4 h-4" />
              Resource Catalogue
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Add Resource Form (Admins only) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
          >
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                backgroundColor: "#f0fdf4",
                borderBottom: "1px solid #bbf7d0",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#bbf7d0" }}
              >
                <Building2
                  className="w-3.5 h-3.5"
                  style={{ color: "#065f46" }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: "#064e3b" }}>
                Add New Resource
              </span>
            </div>
            <div className="p-6">
              <AddResourceForm
                onResourceAdded={() => window.location.reload()}
              />
            </div>
          </motion.div>
        )}

        {/* Resource Catalogue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
        >
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#ecfdf5" }}
            >
              <ClipboardList
                className="w-3.5 h-3.5"
                style={{ color: "#059669" }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color: "#064e3b" }}>
              Resource Catalogue
            </span>
          </div>
          <div className="p-6">
            <ResourceCatalogue />
          </div>
        </motion.div>

        {/* Audit Logs (Admins only) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
          >
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                <FileText
                  className="w-3.5 h-3.5"
                  style={{ color: "#059669" }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: "#064e3b" }}>
                Audit Logs
              </span>
            </div>
            <div className="p-6">
              <AuditLogs />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CampusResources;

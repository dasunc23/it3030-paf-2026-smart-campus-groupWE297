import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ChevronRight,
  Hash,
  Filter,
  Search,
  GraduationCap,
  LogOut,
  Loader2,
  ClipboardList,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  X,
} from "lucide-react";
import { AppContent } from "../context/AppContext";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

/* ── Reusable styled primitives ──────────────────────────────────────────── */

function StatusBadge({ status }) {
  const map = {
    OPEN: {
      bg: "#fff1f2",
      color: "#9f1239",
      border: "#fda4af",
      dot: "#f43f5e",
      label: "Open",
    },
    IN_PROGRESS: {
      bg: "#fffbeb",
      color: "#92400e",
      border: "#fde68a",
      dot: "#f59e0b",
      label: "In Progress",
    },
    RESOLVED: {
      bg: "#ecfdf5",
      color: "#065f46",
      border: "#6ee7b7",
      dot: "#10b981",
      label: "Resolved",
    },
    CLOSED: {
      bg: "#f8fafc",
      color: "#475569",
      border: "#cbd5e1",
      dot: "#94a3b8",
      label: "Closed",
    },
    REJECTED: {
      bg: "#fff1f2",
      color: "#9f1239",
      border: "#fda4af",
      dot: "#f43f5e",
      label: "Rejected",
    },
  };
  const s = map[status?.toUpperCase()] || map.OPEN;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: s.dot }}
      />
      {s.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    LOW: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", dot: "#22c55e" },
    MEDIUM: {
      bg: "#fffbeb",
      color: "#92400e",
      border: "#fde68a",
      dot: "#f59e0b",
    },
    HIGH: {
      bg: "#fff1f2",
      color: "#9f1239",
      border: "#fda4af",
      dot: "#f43f5e",
    },
    CRITICAL: {
      bg: "#fff1f2",
      color: "#7f1d1d",
      border: "#fca5a5",
      dot: "#ef4444",
    },
  };
  const s = map[priority?.toUpperCase()] || map.LOW;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: s.dot }}
      />
      {priority}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export function TicketList() {
  const navigate = useNavigate();
  const { isLoggedin, userData, logout } = useContext(AppContent);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isLoggedin) {
      navigate("/login");
      return;
    }
    fetchTickets();
  }, [isLoggedin]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/tickets`, {
        credentials: "include",
      });
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load tickets");
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.priority?.toLowerCase().includes(q)
    );
  });

  const metrics = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter(
      (t) => t.status === "RESOLVED" || t.status === "CLOSED",
    ).length,
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "#f9fafb", color: "#1e293b" }}
    >
      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 inset-x-0 z-50"
        style={{ backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4"           onClick={() => navigate("/")}
>
          <div className="flex items-center gap-2.5 flex-shrink-0">
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
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoggedin && userData?.name && (
              <div
                className="hidden md:flex items-center gap-2 pl-3 pr-1 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                }}
              >
                <span>{userData.name}</span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: "#064e3b" }}
                >
                  {userData.name?.[0]?.toUpperCase()}
                </div>
              </div>
            )}
            {logout && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{
                  color: "#dc2626",
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecaca",
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Emerald Hero Header ── */}
      <div className="pt-16" style={{ backgroundColor: "#064e3b" }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
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
                Ticket Portal
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
                Incidents &amp; Maintenance
              </h1>
              <p className="text-sm" style={{ color: "#a7f3d0" }}>
                Manage, track, and resolve campus service requests.
              </p>
            </div>
            <div className="pb-1">
              <Link
                to="/tickets/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ backgroundColor: "#34d399", color: "#064e3b" }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report New Incident
              </Link>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {[
              {
                label: "All Tickets",
                value: metrics.total,
                dot: "#94a3b8",
                iconBg: "#ecfdf5",
                iconColor: "#064e3b",
                icon: <ClipboardList className="w-5 h-5" />,
              },
              {
                label: "Open",
                value: metrics.open,
                dot: "#f43f5e",
                iconBg: "#fff1f2",
                iconColor: "#9f1239",
                icon: <AlertCircle className="w-5 h-5" />,
              },
              {
                label: "In Progress",
                value: metrics.inProgress,
                dot: "#f59e0b",
                iconBg: "#fffbeb",
                iconColor: "#92400e",
                icon: <Clock className="w-5 h-5" />,
              },
              {
                label: "Resolved / Closed",
                value: metrics.resolved,
                dot: "#10b981",
                iconBg: "#d1fae5",
                iconColor: "#065f46",
                icon: <CheckCircle2 className="w-5 h-5" />,
              },
            ].map((s) => (
              <div
                key={s.label}
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
              </div>
            ))}
          </div>

          {/* ── Tab strip ── */}
          <div className="flex gap-1 mt-6">
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold"
              style={{ backgroundColor: "#f9fafb", color: "#064e3b" }}
            >
              <ClipboardList className="w-4 h-4" />
              Ticket Queue
              {metrics.open > 0 && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "#ecfdf5", color: "#064e3b" }}
                >
                  {metrics.open}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Error alert ── */}
        {error && (
          <div
            className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "#fff1f2",
              color: "#9f1239",
              border: "1px solid #fda4af",
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* ── Search bar ── */}
        <div
          className="mb-5 rounded-2xl overflow-hidden"
          style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
        >
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#ecfdf5" }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: "#059669" }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "#064e3b" }}>
              Search Tickets
            </span>
          </div>
          <div className="p-4 flex gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#94a3b8" }}
              />
              <input
                type="text"
                placeholder="Search by title, category or priority…"
                className="w-full pl-9 pr-4 rounded-xl py-2.5 text-sm outline-none transition-all"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#1e293b",
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "#059669";
                  e.target.style.backgroundColor = "white";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.backgroundColor = "#f8fafc";
                }}
              />
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: "white",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                }}
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Tickets table card ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
        >
          {/* Section header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              borderBottom: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            <div className="flex items-center gap-3">
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
                Ticket Queue
                {filtered.length > 0 && (
                  <span
                    className="ml-1.5 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
                  >
                    {filtered.length}
                  </span>
                )}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2
                className="w-6 h-6 animate-spin"
                style={{ color: "#059669" }}
              />
              <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                Loading tickets…
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    {[
                      "Incident",
                      "Category",
                      "Status",
                      "Priority",
                      "Created",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-xs font-bold uppercase tracking-widest"
                        style={{ color: "#94a3b8" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div
                          className="flex flex-col items-center justify-center py-16 gap-3 mx-5 my-5 rounded-2xl"
                          style={{
                            backgroundColor: "#f8fafc",
                            border: "2px dashed #e2e8f0",
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: "#ecfdf5" }}
                          >
                            <ClipboardList
                              className="w-5 h-5"
                              style={{ color: "#059669" }}
                            />
                          </div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "#64748b" }}
                          >
                            {search
                              ? "No matching incidents found."
                              : "No incidents found."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((ticket, idx) => (
                      <tr
                        key={ticket.id}
                        className="group cursor-pointer transition-all"
                        style={{
                          borderBottom:
                            idx < filtered.length - 1
                              ? "1px solid #f1f5f9"
                              : "none",
                        }}
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0fdf4";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {/* Incident */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                              style={{
                                backgroundColor: "#ecfdf5",
                                color: "#064e3b",
                              }}
                            >
                              #{ticket.id}
                            </div>
                            <div>
                              <p
                                className="text-sm font-bold transition-colors"
                                style={{ color: "#1e293b" }}
                              >
                                {ticket.title}
                              </p>
                              <p
                                className="text-xs mt-0.5 truncate max-w-xs"
                                style={{ color: "#94a3b8" }}
                              >
                                {ticket.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-semibold"
                            style={{ color: "#475569" }}
                          >
                            {ticket.category?.replace(/_/g, " ") || "–"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>

                        {/* Created */}
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-medium"
                            style={{ color: "#64748b" }}
                          >
                            {ticket.createdAt
                              ? new Date(ticket.createdAt).toLocaleDateString()
                              : "–"}
                          </span>
                        </td>

                        {/* Arrow */}
                        <td className="px-6 py-4 text-right">
                          <ChevronRight
                            className="w-4 h-4 inline-block transition-colors"
                            style={{ color: "#cbd5e1" }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

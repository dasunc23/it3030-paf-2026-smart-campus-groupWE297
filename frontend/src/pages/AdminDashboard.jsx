import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import ResourceAdminView from "./ResourceAdminView";
import {
  Building2,
  ShieldAlert,
  Loader2,
  AlertCircle,
  RefreshCw,
  Ticket,
  Users,
  CheckCircle2,
  Activity,
  Clock,
  Settings,
  LogOut,
  User as UserIcon,
  AlertTriangle,
  Trash2,
  XCircle,
  Search,
  MoreVertical,
  Eye,
  UserCheck,
  CheckCheck,
  X,
  Wrench,
  UserPlus,
  Calendar,
  GraduationCap,
} from "lucide-react";

const API =
  (import.meta.env.VITE_BACKEND_URL || "http://localhost:8080") + "/api";

const STATUS_STYLES = {
  OPEN: {
    label: "Open",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    dot: "#3b82f6",
  },
  ASSIGNED: {
    label: "Assigned",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    dot: "#8b5cf6",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fde68a",
    dot: "#f59e0b",
  },
  RESOLVED: {
    label: "Resolved",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#6ee7b7",
    dot: "#10b981",
  },
  CLOSED: {
    label: "Closed",
    color: "#475569",
    bg: "#f8fafc",
    border: "#cbd5e1",
    dot: "#94a3b8",
  },
  REJECTED: {
    label: "Rejected",
    color: "#9f1239",
    bg: "#fff1f2",
    border: "#fda4af",
    dot: "#f43f5e",
  },
};

const FILTERS = [
  "ALL",
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.OPEN;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
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

function TicketActionsMenu({ ticket, updating, onView, onStatus, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const nextStatuses = [];
  if (ticket.status === "OPEN")
    nextStatuses.push("IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED");
  else if (ticket.status === "IN_PROGRESS")
    nextStatuses.push("RESOLVED", "CLOSED");
  else if (ticket.status === "RESOLVED") nextStatuses.push("CLOSED");

  const canDelete = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={updating}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
        style={{
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          color: "#64748b",
          opacity: updating ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f1f5f9";
          e.currentTarget.style.borderColor = "#cbd5e1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "white";
          e.currentTarget.style.borderColor = "#e2e8f0";
        }}
      >
        {updating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreVertical className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-10 z-50 w-52 rounded-xl py-1 overflow-hidden"
            style={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            }}
          >
            <button
              onClick={() => {
                onView();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
              style={{ color: "#1e293b" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0fdf4";
                e.currentTarget.style.color = "#064e3b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#1e293b";
              }}
            >
              <Eye className="w-4 h-4" /> View Details
            </button>

            {nextStatuses.length > 0 && (
              <>
                <div
                  className="mx-3 my-1"
                  style={{ borderTop: "1px solid #f1f5f9" }}
                />
                <p
                  className="text-xs font-bold uppercase tracking-widest px-4 pt-1.5 pb-1"
                  style={{ color: "#94a3b8" }}
                >
                  Change Status
                </p>
                {nextStatuses.map((next) => (
                  <button
                    key={next}
                    onClick={() => {
                      onStatus(next);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{
                      color:
                        next === "RESOLVED"
                          ? "#065f46"
                          : next === "REJECTED"
                            ? "#9f1239"
                            : "#475569",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        next === "RESOLVED"
                          ? "#ecfdf5"
                          : next === "REJECTED"
                            ? "#fff1f2"
                            : "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {next === "RESOLVED" ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Mark as {next.replace("_", " ")}
                  </button>
                ))}
              </>
            )}

            {canDelete && (
              <>
                <div
                  className="mx-3 my-1"
                  style={{ borderTop: "1px solid #f1f5f9" }}
                />
                <button
                  onClick={() => {
                    onDelete();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "#be123c" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff1f2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Trash2 className="w-4 h-4" /> Delete Ticket
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isLoggedin, userData, logout } = useContext(AppContent);

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState("TICKETS");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [techEmail, setTechEmail] = useState("");
  const [techSpec, setTechSpec] = useState("HARDWARE");
  const [techLoading, setTechLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [ticketRes, techRes] = await Promise.all([
        axios.get(`${API}/tickets`, { withCredentials: true }),
        axios.get(`${API}/technicians`, { withCredentials: true }),
      ]);
      setTickets(ticketRes.data);
      setTechnicians(techRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Session expired. Please login again."
          : "Failed to load data. Ensure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const silentRefresh = async () => {
    try {
      setSyncing(true);
      const [ticketRes, techRes] = await Promise.all([
        axios.get(`${API}/tickets`, { withCredentials: true }),
        axios.get(`${API}/technicians`, { withCredentials: true }),
      ]);
      setTickets(ticketRes.data);
      setTechnicians(techRes.data);
      setLastUpdated(new Date());
    } catch {
      // silent
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (userData === undefined) return;
    if (!isLoggedin) {
      const t = setTimeout(() => {
        if (!isLoggedin) navigate("/login");
      }, 500);
      return () => clearTimeout(t);
    }
    fetchData();
  }, [isLoggedin, userData, navigate]);

  useEffect(() => {
    if (!isLoggedin) return;
    const INTERVAL = 30_000;
    let intervalId = null;
    const startPolling = () => {
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") silentRefresh();
      }, INTERVAL);
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") silentRefresh();
    };
    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isLoggedin]);

  useEffect(() => {
    const fmt = () => {
      if (!lastUpdated) return;
      const secs = Math.round((Date.now() - lastUpdated.getTime()) / 1000);
      if (secs < 10) setLastUpdatedLabel("just now");
      else if (secs < 60) setLastUpdatedLabel(`${secs}s ago`);
      else setLastUpdatedLabel(`${Math.round(secs / 60)}m ago`);
    };
    fmt();
    const id = setInterval(fmt, 15_000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);
      const { data } = await axios.patch(
        `${API}/tickets/${id}/status`,
        { status },
        { withCredentials: true },
      );
      setTickets((prev) => prev.map((t) => (t.id === id ? data : t)));
      toast.success(
        `Ticket marked as ${status.replace("_", " ").toLowerCase()}`,
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  const deleteTicket = async (id) => {
    try {
      setUpdating(id);
      await axios.delete(`${API}/tickets/${id}`, { withCredentials: true });
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirm(null);
      toast.success("Ticket deleted");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Only RESOLVED or CLOSED tickets can be deleted.",
      );
    } finally {
      setUpdating(null);
    }
  };

  const promoteTechnician = async () => {
    if (!techEmail.trim()) return toast.error("Enter an email address");
    setTechLoading(true);
    try {
      await axios.post(
        `${API}/technicians`,
        { userId: techEmail, specialization: techSpec },
        { withCredentials: true },
      );
      toast.success("User promoted to Technician");
      setTechEmail("");
      silentRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to promote user");
    } finally {
      setTechLoading(false);
    }
  };

  const filtered = tickets
    .filter((t) => filter === "ALL" || t.status === filter)
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    });

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
  };

  const STAT_CARDS = [
    {
      label: "Total Tickets",
      value: counts.total,
      icon: <Ticket className="w-5 h-5" />,
      iconColor: "#064e3b",
      iconBg: "#ecfdf5",
      dot: "#059669",
    },
    {
      label: "Open",
      value: counts.open,
      icon: <Clock className="w-5 h-5" />,
      iconColor: "#1d4ed8",
      iconBg: "#eff6ff",
      dot: "#3b82f6",
    },
    {
      label: "In Progress",
      value: counts.inProgress,
      icon: <Activity className="w-5 h-5" />,
      iconColor: "#92400e",
      iconBg: "#fffbeb",
      dot: "#f59e0b",
    },
    {
      label: "Resolved",
      value: counts.resolved,
      icon: <CheckCircle2 className="w-5 h-5" />,
      iconColor: "#065f46",
      iconBg: "#d1fae5",
      dot: "#10b981",
    },
  ];

  const NAV = [
    {
      key: "TICKETS",
      label: "Tickets",
      icon: <Ticket className="w-4 h-4" />,
      badge: counts.open,
    },
    {
      key: "RESOURCES",
      label: "Resources",
      icon: <Building2 className="w-4 h-4" />,
      badge: null,
    },
    {
      key: "BOOKINGS",
      label: "Bookings",
      icon: <Calendar className="w-4 h-4" />,
      badge: null,
      route: "/bookings/admin",
    },
  ];

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
        <div className="max-w-[1700px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
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
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: "#fff1f2",
                color: "#be123c",
                border: "1px solid #fda4af",
              }}
            >
              <ShieldAlert className="w-3 h-3" /> Admin
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoggedin && (
              <div
                className="hidden md:flex items-center gap-2 pl-3 pr-1 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                }}
              >
                <span>{userData?.name}</span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: "#064e3b" }}
                >
                  {userData?.name?.[0]?.toUpperCase()}
                </div>
              </div>
            )}
            <button
              onClick={silentRefresh}
              disabled={syncing || loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                opacity: syncing || loading ? 0.6 : 1,
              }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {syncing
                  ? "Syncing…"
                  : lastUpdatedLabel
                    ? `Updated ${lastUpdatedLabel}`
                    : "Refresh"}
              </span>
            </button>
            {isLoggedin && (
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

      {/* ── Hero header ── */}
      <div className="pt-16" style={{ backgroundColor: "#064e3b" }}>
        <div className="max-w-[1700px] mx-auto px-6 py-8">
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
                Administrator Panel
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
                Campus Operations Dashboard
              </h1>
              <p className="text-sm" style={{ color: "#a7f3d0" }}>
                {counts.total} total tickets · {counts.open} open ·{" "}
                {counts.inProgress} in progress
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {STAT_CARDS.map((s, i) => (
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
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 mt-6 pb-0">
            {NAV.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.route) navigate(item.route);
                  else setActiveTab(item.key);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all"
                style={
                  activeTab === item.key
                    ? { backgroundColor: "#f9fafb", color: "#064e3b" }
                    : {
                        backgroundColor: "rgba(255,255,255,0.08)",
                        color: "#a7f3d0",
                      }
                }
              >
                {item.icon}
                {item.label}
                {item.badge > 0 && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={
                      activeTab === item.key
                        ? { backgroundColor: "#ecfdf5", color: "#064e3b" }
                        : {
                            backgroundColor: "rgba(52,211,153,0.2)",
                            color: "#34d399",
                          }
                    }
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-[1700px] mx-auto px-6 py-8">
        {/* TICKETS */}
        {activeTab === "TICKETS" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#94a3b8" }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets by title or category…"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    color: "#1e293b",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#059669";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#94a3b8" }}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                {FILTERS.map((f) => {
                  const c =
                    f === "ALL"
                      ? tickets.length
                      : tickets.filter((t) => t.status === f).length;
                  const isActive = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={
                        isActive
                          ? {
                              backgroundColor: "#064e3b",
                              color: "white",
                              border: "1px solid #064e3b",
                            }
                          : {
                              backgroundColor: "white",
                              color: "#64748b",
                              border: "1px solid #e2e8f0",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#bbf7d0";
                          e.currentTarget.style.color = "#064e3b";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.color = "#64748b";
                        }
                      }}
                    >
                      {f === "IN_PROGRESS"
                        ? "In Progress"
                        : f === "ALL"
                          ? "All"
                          : f.charAt(0) + f.slice(1).toLowerCase()}
                      <span className="ml-1.5 opacity-60">{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div
                className="flex flex-col items-center justify-center py-24 rounded-2xl gap-3"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Loader2
                  className="w-7 h-7 animate-spin"
                  style={{ color: "#059669" }}
                />
                <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                  Loading tickets…
                </p>
              </div>
            ) : error ? (
              <div
                className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold"
                style={{
                  backgroundColor: "#fff1f2",
                  color: "#9f1239",
                  border: "1px solid #fda4af",
                }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-24 rounded-2xl gap-3"
                style={{
                  backgroundColor: "white",
                  border: "2px dashed #e2e8f0",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#ecfdf5" }}
                >
                  <Ticket className="w-5 h-5" style={{ color: "#059669" }} />
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#64748b" }}
                >
                  {search ? "No matching tickets" : "No tickets here"}
                </p>
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilter("ALL");
                    }}
                    className="text-xs font-bold"
                    style={{ color: "#059669" }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                }}
              >
                {/* Table header */}
                <div
                  className="grid gap-3 px-5 py-3"
                  style={{
                    gridTemplateColumns: "1fr 110px 95px 130px 44px",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {["Ticket", "Category", "Priority", "Status", ""].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: "#94a3b8" }}
                      >
                        {h}
                      </div>
                    ),
                  )}
                </div>

                <div>
                  {filtered.map((ticket, i) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="grid gap-3 px-5 py-4 items-center transition-colors"
                      style={{
                        gridTemplateColumns: "1fr 110px 95px 130px 44px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0fdf4";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="min-w-0">
                        <button
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          className="text-sm font-semibold truncate block text-left transition-colors"
                          style={{ color: "#1e293b" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#064e3b";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#1e293b";
                          }}
                        >
                          {ticket.title}
                        </button>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#94a3b8" }}
                        >
                          Reporter: {ticket.createdByUserId}
                          {ticket.assignedToUserId && (
                            <span className="ml-2" style={{ color: "#8b5cf6" }}>
                              · <Wrench className="w-2.5 h-2.5 inline" />{" "}
                              assigned
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="text-xs font-semibold uppercase tracking-wide truncate"
                        style={{ color: "#64748b" }}
                      >
                        {ticket.category}
                      </div>

                      <div>
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={
                            ticket.priority === "HIGH" ||
                            ticket.priority === "CRITICAL"
                              ? {
                                  backgroundColor: "#fff1f2",
                                  color: "#be123c",
                                  border: "1px solid #fda4af",
                                }
                              : ticket.priority === "MEDIUM"
                                ? {
                                    backgroundColor: "#fffbeb",
                                    color: "#92400e",
                                    border: "1px solid #fde68a",
                                  }
                                : {
                                    backgroundColor: "#ecfdf5",
                                    color: "#065f46",
                                    border: "1px solid #bbf7d0",
                                  }
                          }
                        >
                          {ticket.priority}
                        </span>
                      </div>

                      <StatusBadge status={ticket.status} />

                      <div className="flex justify-end">
                        <TicketActionsMenu
                          ticket={ticket}
                          updating={updating === ticket.id}
                          onView={() => navigate(`/tickets/${ticket.id}`)}
                          onStatus={(s) => updateStatus(ticket.id, s)}
                          onDelete={() =>
                            setDeleteConfirm({
                              id: ticket.id,
                              title: ticket.title,
                            })
                          }
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div
                  className="flex items-center justify-between px-5 py-3 rounded-b-2xl"
                  style={{
                    backgroundColor: "#f8fafc",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "#94a3b8" }}
                  >
                    {filtered.length} of {tickets.length} tickets shown
                  </p>
                  {(filter !== "ALL" || search) && (
                    <button
                      onClick={() => {
                        setFilter("ALL");
                        setSearch("");
                      }}
                      className="text-xs font-bold transition-colors"
                      style={{ color: "#059669" }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* USERS */}
        {activeTab === "USERS" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold" style={{ color: "#064e3b" }}>
                User Management
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
                Promote users to privileged roles
              </p>
            </div>

            <div className="max-w-lg space-y-4">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid #e2e8f0",
                  backgroundColor: "white",
                }}
              >
                <div
                  className="px-6 py-5"
                  style={{
                    backgroundColor: "#f0fdf4",
                    borderBottom: "1px solid #bbf7d0",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "#bbf7d0" }}
                    >
                      <Wrench
                        className="w-4 h-4"
                        style={{ color: "#065f46" }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-base"
                        style={{ color: "#064e3b" }}
                      >
                        Promote to Technician
                      </h3>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#6b7280" }}
                      >
                        Grant technician access with a specialization
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: "#94a3b8" }}
                    >
                      User Email
                    </label>
                    <input
                      value={techEmail}
                      onChange={(e) => setTechEmail(e.target.value)}
                      placeholder="technician@campus.edu"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#1e293b",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#059669";
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: "#94a3b8" }}
                    >
                      Specialization
                    </label>
                    <select
                      value={techSpec}
                      onChange={(e) => setTechSpec(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#1e293b",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#059669";
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                    >
                      <option value="HARDWARE">
                        Hardware — Computers, Projectors
                      </option>
                      <option value="NETWORK">Network — Wi-Fi, Routers</option>
                      <option value="FACILITY">
                        Facility — Furniture, AC, Plumbing
                      </option>
                      <option value="ELECTRICAL">
                        Electrical — Lighting, Power
                      </option>
                      <option value="SOFTWARE">
                        Software — Applications, Systems
                      </option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <button
                    onClick={promoteTechnician}
                    disabled={techLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all"
                    style={{
                      backgroundColor: techLoading ? "#94a3b8" : "#064e3b",
                      color: "white",
                      cursor: techLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {techLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    Create Technician Profile
                  </button>
                </div>
              </div>

              {technicians.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: "1px solid #e2e8f0",
                    backgroundColor: "white",
                  }}
                >
                  <div
                    className="px-6 py-4"
                    style={{ borderBottom: "1px solid #e2e8f0" }}
                  >
                    <h3
                      className="font-bold text-base"
                      style={{ color: "#1e293b" }}
                    >
                      Current Technicians
                      <span
                        className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
                      >
                        {technicians.length}
                      </span>
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-2">
                    {technicians.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl transition-all"
                        style={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0fdf4";
                          e.currentTarget.style.borderColor = "#bbf7d0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                        }}
                      >
                        <div>
                          <div
                            className="text-sm font-bold"
                            style={{ color: "#1e293b" }}
                          >
                            {t.name || `User #${t.userId}`}
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: "#64748b" }}
                          >
                            {t.specialization} · {t.availabilityStatus}
                          </div>
                        </div>
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{
                            backgroundColor: "#ecfdf5",
                            color: "#065f46",
                          }}
                        >
                          {t.assignedCount} assigned
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* RESOURCES */}
        {activeTab === "RESOURCES" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ResourceAdminView />
          </motion.div>
        )}

        {/* SETTINGS */}
        {activeTab === "SETTINGS" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold" style={{ color: "#064e3b" }}>
                System Settings
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
                Configure campus and notification preferences
              </p>
            </div>
            <div
              className="flex flex-col items-center justify-center py-24 rounded-2xl gap-3"
              style={{ backgroundColor: "white", border: "2px dashed #e2e8f0" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#f0fdf4" }}
              >
                <Settings className="w-5 h-5" style={{ color: "#059669" }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: "#64748b" }}>
                Settings Module
              </p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Coming soon
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(6,78,59,0.6)" }}
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden"
              style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
            >
              {/* Modal header */}
              <div
                className="px-6 py-5"
                style={{
                  backgroundColor: "#fff1f2",
                  borderBottom: "1px solid #fda4af",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#fda4af" }}
                  >
                    <Trash2 className="w-5 h-5" style={{ color: "#9f1239" }} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-bold text-base"
                      style={{ color: "#9f1239" }}
                    >
                      Delete Ticket
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "#be123c" }}>
                      This action cannot be undone
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="transition-colors"
                    style={{ color: "#94a3b8" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#64748b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5">
                <div
                  className="rounded-xl px-4 py-3 mb-5"
                  style={{
                    backgroundColor: "#fff1f2",
                    border: "1px solid #fda4af",
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#be123c" }}
                  >
                    You are about to permanently delete:
                  </p>
                  <p
                    className="text-sm font-bold mt-1 truncate"
                    style={{ color: "#9f1239" }}
                  >
                    "{deleteConfirm.title}"
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: "#f8fafc",
                      color: "#475569",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteTicket(deleteConfirm.id)}
                    disabled={updating === deleteConfirm.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: "#be123c",
                      color: "white",
                      opacity: updating === deleteConfirm.id ? 0.6 : 1,
                    }}
                  >
                    {updating === deleteConfirm.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete Permanently
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import {
  RefreshCw,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  User,
  Building2,
  Users,
  AlertCircle,
  ClipboardList,
  BookOpen,
  Filter,
  GraduationCap,
  LogOut,
  ShieldAlert,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

/* ── Reusable styled primitives ──────────────────────────────────────────── */

function StatusBadge({ status }) {
  const map = {
    PENDING: {
      bg: "#fffbeb",
      color: "#92400e",
      border: "#fde68a",
      dot: "#f59e0b",
      label: "Pending",
    },
    APPROVED: {
      bg: "#ecfdf5",
      color: "#065f46",
      border: "#6ee7b7",
      dot: "#10b981",
      label: "Approved",
    },
    REJECTED: {
      bg: "#fff1f2",
      color: "#9f1239",
      border: "#fda4af",
      dot: "#f43f5e",
      label: "Rejected",
    },
    CANCELLED: {
      bg: "#f8fafc",
      color: "#475569",
      border: "#cbd5e1",
      dot: "#94a3b8",
      label: "Cancelled",
    },
  };
  const s = map[status] || map.PENDING;
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

function FieldLabel({ children }) {
  return (
    <label
      className="block text-xs font-bold uppercase tracking-widest mb-1.5"
      style={{ color: "#94a3b8" }}
    >
      {children}
    </label>
  );
}

function FInput({ ...props }) {
  return (
    <input
      {...props}
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
  );
}

function FSelect({ children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all appearance-none pr-8"
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
        {children}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4"
        style={{ color: "#94a3b8" }}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export default function AdminBookings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedin, userData, logout } = useContext(AppContent);

  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Number(searchParams.get("page") || 1)),
  );
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    resourceId: searchParams.get("resourceId") || "",
    bookingDate: searchParams.get("bookingDate") || "",
    requestedByUserId: searchParams.get("requestedByUserId") || "",
  });

  const [reviewState, setReviewState] = useState({
    open: false,
    id: "",
    approved: true,
    reason: "",
  });

  const metrics = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      approved: bookings.filter((b) => b.status === "APPROVED").length,
      rejected: bookings.filter((b) => b.status === "REJECTED").length,
    }),
    [bookings],
  );

  const resourcesById = useMemo(() => {
    const map = new Map();
    resources.forEach((r) => map.set(r.id, r));
    return map;
  }, [resources]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(bookings.length / pageSize));
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return bookings.slice(start, start + pageSize);
  }, [bookings, currentPage]);

  function updateFilter(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function fetchAllBookings() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.resourceId.trim())
        params.set("resourceId", filters.resourceId.trim());
      if (filters.bookingDate) params.set("bookingDate", filters.bookingDate);
      if (filters.requestedByUserId.trim())
        params.set("requestedByUserId", filters.requestedByUserId.trim());

      const res = await fetch(`${API_BASE}/api/bookings?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (res.status === 403) {
        navigate("/bookings");
        return;
      }
      if (!res.ok)
        throw new Error(data?.error || "Failed to load booking queue");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load booking queue");
    } finally {
      setLoading(false);
    }
  }

  async function fetchResources() {
    try {
      const res = await fetch(`${API_BASE}/api/resources`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch {
      setResources([]);
    }
  }

  useEffect(() => {
    if (!isLoggedin) return;
    if (userData?.role !== "ROLE_ADMIN") return;
    fetchAllBookings();
    fetchResources();
  }, [isLoggedin, userData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    bookings.length,
    filters.status,
    filters.resourceId,
    filters.bookingDate,
    filters.requestedByUserId,
  ]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(currentPage));
    if (filters.status) next.set("status", filters.status);
    else next.delete("status");
    if (filters.resourceId.trim())
      next.set("resourceId", filters.resourceId.trim());
    else next.delete("resourceId");
    if (filters.bookingDate) next.set("bookingDate", filters.bookingDate);
    else next.delete("bookingDate");
    if (filters.requestedByUserId.trim())
      next.set("requestedByUserId", filters.requestedByUserId.trim());
    else next.delete("requestedByUserId");
    setSearchParams(next, { replace: true });
  }, [currentPage, filters, searchParams, setSearchParams]);

  useEffect(() => {
    if (userData === undefined) return;
    if (!isLoggedin) {
      const t = setTimeout(() => navigate("/login"), 300);
      return () => clearTimeout(t);
    }
    if (userData && userData.role !== "ROLE_ADMIN") navigate("/bookings");
  }, [isLoggedin, userData, navigate]);

  async function submitReview() {
    try {
      if (!reviewState.approved && !reviewState.reason.trim()) {
        setError("A reason is required for rejection.");
        return;
      }
      const res = await fetch(
        `${API_BASE}/api/bookings/${reviewState.id}/review`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approved: reviewState.approved,
            reason: reviewState.reason.trim() || null,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not complete review");
      setReviewState({ open: false, id: "", approved: true, reason: "" });
      setNotice(
        reviewState.approved ? "Booking approved." : "Booking rejected.",
      );
      await fetchAllBookings();
    } catch (err) {
      setError(err.message || "Review failed");
    }
  }

  function renderPageNumbers() {
    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages = [];
    for (let p = start; p <= end; p++) {
      pages.push(
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
          style={{
            backgroundColor: p === currentPage ? "#064e3b" : "white",
            color: p === currentPage ? "white" : "#475569",
            border: `1px solid ${p === currentPage ? "#064e3b" : "#e2e8f0"}`,
          }}
        >
          {p}
        </button>,
      );
    }
    return pages;
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
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
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
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
                Admin Panel
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
                Booking Review Queue
              </h1>
              <p className="text-sm" style={{ color: "#a7f3d0" }}>
                Review pending requests, apply filters, and enforce booking
                policy decisions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pb-1">
              <Link
                to="/bookings"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                User Booking View
              </Link>
              <button
                onClick={fetchAllBookings}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ backgroundColor: "#34d399", color: "#064e3b" }}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {[
              {
                label: "Total Bookings",
                value: metrics.total,
                dot: "#94a3b8",
                iconBg: "#ecfdf5",
                iconColor: "#064e3b",
                icon: <ClipboardList className="w-5 h-5" />,
              },
              {
                label: "Pending Review",
                value: metrics.pending,
                dot: "#f59e0b",
                iconBg: "#fffbeb",
                iconColor: "#92400e",
                icon: <Clock className="w-5 h-5" />,
              },
              {
                label: "Approved",
                value: metrics.approved,
                dot: "#10b981",
                iconBg: "#d1fae5",
                iconColor: "#065f46",
                icon: <CheckCircle2 className="w-5 h-5" />,
              },
              {
                label: "Rejected",
                value: metrics.rejected,
                dot: "#f43f5e",
                iconBg: "#fff1f2",
                iconColor: "#9f1239",
                icon: <XCircle className="w-5 h-5" />,
              },
            ].map((s, i) => (
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
              Booking Queue
              {metrics.pending > 0 && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "#ecfdf5", color: "#064e3b" }}
                >
                  {metrics.pending}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Alerts ── */}
        {notice && (
          <div
            className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #6ee7b7",
            }}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {notice}
          </div>
        )}
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

        {/* ── Filter Panel ── */}
        <div
          className="mb-5 rounded-2xl overflow-hidden"
          style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
        >
          {/* Filter header */}
          <div
            className="px-6 py-4 flex items-center justify-between cursor-pointer"
            style={{
              borderBottom: showFilters ? "1px solid #e2e8f0" : "none",
              backgroundColor: "#f8fafc",
            }}
            onClick={() => setShowFilters((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                <Filter className="w-3.5 h-3.5" style={{ color: "#059669" }} />
              </div>
              <span className="text-sm font-bold" style={{ color: "#064e3b" }}>
                Filters
              </span>
              {activeFilterCount > 0 && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "#ecfdf5",
                    color: "#065f46",
                    border: "1px solid #6ee7b7",
                  }}
                >
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters({
                      status: "",
                      resourceId: "",
                      bookingDate: "",
                      requestedByUserId: "",
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: "white",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchAllBookings();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ backgroundColor: "#064e3b", color: "white" }}
              >
                <SlidersHorizontal className="w-3 h-3" /> Apply
              </button>
              <ChevronRight
                className="w-4 h-4 transition-transform"
                style={{
                  color: "#94a3b8",
                  transform: showFilters ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </div>
          </div>

          {showFilters && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <FieldLabel>Resource ID</FieldLabel>
                <FInput
                  name="resourceId"
                  placeholder="Filter by resource ID"
                  value={filters.resourceId}
                  onChange={updateFilter}
                />
              </div>
              <div>
                <FieldLabel>Status</FieldLabel>
                <FSelect
                  name="status"
                  value={filters.status}
                  onChange={updateFilter}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </FSelect>
              </div>
              <div>
                <FieldLabel>Booking Date</FieldLabel>
                <FInput
                  name="bookingDate"
                  type="date"
                  value={filters.bookingDate}
                  onChange={updateFilter}
                />
              </div>
              <div>
                <FieldLabel>Requester ID</FieldLabel>
                <FInput
                  name="requestedByUserId"
                  placeholder="Filter by user ID"
                  value={filters.requestedByUserId}
                  onChange={updateFilter}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Booking Queue ── */}
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
                Booking Queue{" "}
                {bookings.length > 0 && (
                  <span
                    className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
                  >
                    ({bookings.length})
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2
                  className="w-6 h-6 animate-spin"
                  style={{ color: "#059669" }}
                />
                <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                  Loading booking queue…
                </p>
              </div>
            ) : bookings.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 rounded-2xl gap-3"
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
                  No bookings match these filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedBookings.map((booking) => {
                  const resource = resourcesById.get(booking.resourceId);
                  return (
                    <article
                      key={booking.id}
                      className="rounded-2xl p-5 transition-all"
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
                      {/* Card top row */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                        <div>
                          <p
                            className="text-xs font-bold uppercase tracking-widest mb-0.5"
                            style={{ color: "#94a3b8" }}
                          >
                            Booking ID
                          </p>
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#064e3b" }}
                          >
                            {booking.id}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      {/* Detail grid */}
                      <div
                        className="grid gap-3 mb-3 p-4 rounded-xl"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(180px, 1fr))",
                        }}
                      >
                        {[
                          {
                            icon: <Building2 className="w-3.5 h-3.5" />,
                            label: "Resource",
                            value: resource
                              ? `${resource.name} (${resource.location})`
                              : booking.resourceId,
                          },
                          {
                            icon: <User className="w-3.5 h-3.5" />,
                            label: "Requester",
                            value: booking.requestedByUserId,
                          },
                          {
                            icon: <CalendarDays className="w-3.5 h-3.5" />,
                            label: "Date",
                            value: booking.bookingDate,
                          },
                          {
                            icon: <Clock className="w-3.5 h-3.5" />,
                            label: "Time",
                            value: `${booking.startTime} – ${booking.endTime}`,
                          },
                          {
                            icon: <Users className="w-3.5 h-3.5" />,
                            label: "Attendees",
                            value: booking.expectedAttendees || "–",
                          },
                          {
                            icon: <CalendarDays className="w-3.5 h-3.5" />,
                            label: "Created",
                            value: new Date(
                              booking.requestedAt,
                            ).toLocaleString(),
                          },
                        ].map(({ icon, label, value }) => (
                          <div key={label} className="flex items-start gap-2">
                            <span
                              style={{ color: "#059669", marginTop: "1px" }}
                            >
                              {icon}
                            </span>
                            <div>
                              <p
                                className="font-bold uppercase tracking-widest mb-0.5"
                                style={{ color: "#94a3b8", fontSize: "10px" }}
                              >
                                {label}
                              </p>
                              <p
                                className="text-xs font-semibold"
                                style={{ color: "#1e293b" }}
                              >
                                {value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Purpose */}
                      <div
                        className="px-4 py-3 rounded-xl mb-3"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          className="font-bold uppercase tracking-widest mb-1"
                          style={{ color: "#94a3b8", fontSize: "10px" }}
                        >
                          Purpose
                        </p>
                        <p
                          className="text-xs font-medium"
                          style={{ color: "#1e293b" }}
                        >
                          {booking.purpose}
                        </p>
                      </div>

                      {/* Review note */}
                      {booking.reviewReason && (
                        <div
                          className="px-4 py-3 rounded-xl mb-3"
                          style={{
                            backgroundColor: "#fffbeb",
                            border: "1px solid #fde68a",
                          }}
                        >
                          <p
                            className="font-bold uppercase tracking-widest mb-1"
                            style={{ color: "#b45309", fontSize: "10px" }}
                          >
                            Review Note
                          </p>
                          <p
                            className="text-xs font-medium"
                            style={{ color: "#92400e" }}
                          >
                            {booking.reviewReason}
                          </p>
                        </div>
                      )}

                      {/* Approve / Reject */}
                      {booking.status === "PENDING" && (
                        <div
                          className="flex justify-end gap-2 mt-1 pt-3"
                          style={{ borderTop: "1px solid #e2e8f0" }}
                        >
                          <button
                            onClick={() =>
                              setReviewState({
                                open: true,
                                id: booking.id,
                                approved: false,
                                reason: "",
                              })
                            }
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                              backgroundColor: "#fff1f2",
                              color: "#9f1239",
                              border: "1px solid #fda4af",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#ffe4e6";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff1f2";
                            }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() =>
                              setReviewState({
                                open: true,
                                id: booking.id,
                                approved: true,
                                reason: "",
                              })
                            }
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                              backgroundColor: "#064e3b",
                              color: "white",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#065f46";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#064e3b";
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}

                {/* Pagination */}
                {bookings.length > pageSize && (
                  <div
                    className="flex items-center justify-between mt-4 px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "#64748b" }}
                    >
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          color: "#475569",
                          opacity: currentPage === 1 ? 0.4 : 1,
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {renderPageNumbers()}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          color: "#475569",
                          opacity: currentPage === totalPages ? 0.4 : 1,
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Review Modal ── */}
      {reviewState.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(6,78,59,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            {/* Modal header */}
            <div
              className="px-6 py-5 flex items-center gap-3"
              style={{
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: reviewState.approved ? "#f0fdf4" : "#fff1f2",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: reviewState.approved ? "#bbf7d0" : "#fda4af",
                }}
              >
                {reviewState.approved ? (
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: "#065f46" }}
                  />
                ) : (
                  <XCircle className="w-4 h-4" style={{ color: "#9f1239" }} />
                )}
              </div>
              <div>
                <p
                  className="text-sm font-bold"
                  style={{
                    color: reviewState.approved ? "#065f46" : "#9f1239",
                  }}
                >
                  {reviewState.approved ? "Approve Booking" : "Reject Booking"}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{
                    color: reviewState.approved ? "#059669" : "#be123c",
                  }}
                >
                  {reviewState.approved
                    ? "Optionally add a note while approving."
                    : "A rejection reason is required."}
                </p>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5">
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "#94a3b8" }}
              >
                {reviewState.approved
                  ? "Note (optional)"
                  : "Rejection Reason *"}
              </label>
              <textarea
                rows={4}
                value={reviewState.reason}
                onChange={(e) =>
                  setReviewState((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                placeholder={
                  reviewState.approved
                    ? "Optional note for the requester"
                    : "Required — visible to the requester"
                }
                className="w-full rounded-xl text-sm outline-none transition-all resize-none px-3 py-2.5"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#1e293b",
                }}
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

            {/* Modal footer */}
            <div
              className="px-6 py-4 flex justify-end gap-2"
              style={{
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <button
                onClick={() =>
                  setReviewState({
                    open: false,
                    id: "",
                    approved: true,
                    reason: "",
                  })
                }
                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: "white",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: reviewState.approved ? "#064e3b" : "#be123c",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = reviewState.approved
                    ? "#065f46"
                    : "#9f1239";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = reviewState.approved
                    ? "#064e3b"
                    : "#be123c";
                }}
              >
                {reviewState.approved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Approve
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Confirm Reject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

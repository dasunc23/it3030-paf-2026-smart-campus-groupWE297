import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import {
  CalendarDays,
  Clock,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  RefreshCw,
  Download,
  Copy,
  Pencil,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  ClipboardList,
  Plus,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

function StatusBadge({ status }) {
  const styles = {
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

  const s = styles[status] || styles.PENDING;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
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

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeTypeOrName(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function isPastDateTime(date, time) {
  if (!date || !time) return false;
  const selected = new Date(`${date}T${time}:00`);
  return selected.getTime() < Date.now();
}

function formatCurrentTimeForInput() {
  const now = new Date();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function generateRecurringDates(startDate, recurrence, occurrences) {
  if (!startDate || recurrence === "NONE" || occurrences <= 1) {
    return [startDate];
  }

  const dates = [];
  const seed = new Date(`${startDate}T00:00:00`);

  for (let i = 0; i < occurrences; i += 1) {
    const next = new Date(seed);
    if (recurrence === "DAILY") {
      next.setDate(seed.getDate() + i);
    } else if (recurrence === "WEEKLY") {
      next.setDate(seed.getDate() + i * 7);
    }
    dates.push(next.toISOString().slice(0, 10));
  }

  return dates;
}

function FieldLabel({ children, required }) {
  return (
    <label
      className="mb-1.5 block text-xs font-bold uppercase tracking-widest"
      style={{ color: "#94a3b8" }}
    >
      {children}
      {required && <span style={{ color: "#f43f5e" }}> *</span>}
    </label>
  );
}

function InputBase({ className = "", style = {}, ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${className}`}
      style={{
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#1e293b",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#059669";
        e.currentTarget.style.backgroundColor = "#ffffff";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.backgroundColor = "#f8fafc";
        props.onBlur?.(e);
      }}
    />
  );
}

function SelectBase({ className = "", style = {}, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${className}`}
      style={{
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#1e293b",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#059669";
        e.currentTarget.style.backgroundColor = "#ffffff";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.backgroundColor = "#f8fafc";
      }}
    />
  );
}

export default function Bookings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedin, userData } = useContext(AppContent);

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState({
    available: null,
    message: "",
  });
  const [editingBookingId, setEditingBookingId] = useState("");
  const [viewMode, setViewMode] = useState("LIST");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "ALL",
  );
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Number(searchParams.get("page") || 1)),
  );
  const [cancelState, setCancelState] = useState({
    open: false,
    bookingId: "",
    reason: "",
  });

  const [form, setForm] = useState({
    resourceId: searchParams.get("resourceId") || "",
    bookingDate: searchParams.get("date") || getTodayIsoDate(),
    startTime: searchParams.get("start") || "09:00",
    endTime: searchParams.get("end") || "10:00",
    purpose: "",
    expectedAttendees: "",
    recurrence: "NONE",
    occurrences: 1,
  });

  const filteredBookings = useMemo(() => {
    if (statusFilter === "ALL") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const resourcesById = useMemo(() => {
    const map = new Map();
    resources.forEach((resource) => {
      map.set(resource.id, resource);
    });
    return map;
  }, [resources]);

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === form.resourceId) || null,
    [resources, form.resourceId],
  );

  const isAttendanceRequiredResource = useMemo(() => {
    if (!selectedResource) return false;
    const normalizedType = normalizeTypeOrName(
      selectedResource.type || selectedResource.rawType,
    );
    const normalizedName = normalizeTypeOrName(selectedResource.name);
    if (
      ["LECTURE_HALL", "LAB", "MEETING_ROOM", "ROOM", "AUDITORIUM"].includes(
        normalizedType,
      )
    ) {
      return true;
    }
    return (
      normalizedName.includes("LECTURE_HALL") ||
      normalizedName.includes("LAB") ||
      normalizedName.includes("MEETING_ROOM") ||
      normalizedName.includes("AUDITORIUM") ||
      normalizedName.includes("ROOM")
    );
  }, [selectedResource]);

  const selectedResourceLabel = useMemo(() => {
    if (!selectedResource) return "No resource selected";
    return `${selectedResource.name || "Unnamed"} ${selectedResource.location ? `(${selectedResource.location})` : ""}`.trim();
  }, [selectedResource]);

  const minStartTime = useMemo(() => {
    if (form.bookingDate !== getTodayIsoDate()) return undefined;
    return formatCurrentTimeForInput();
  }, [form.bookingDate]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage]);

  async function fetchResources() {
    const res = await fetch(`${API_BASE}/api/resources?activeOnly=true`);
    if (!res.ok) throw new Error("Failed to load resources");
    const data = await res.json();
    setResources(Array.isArray(data) ? data : []);
  }

  async function fetchMyBookings() {
    const res = await fetch(`${API_BASE}/api/bookings/my`, {
      credentials: "include",
    });
    if (res.status === 401) {
      navigate("/login");
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to load bookings");
    setBookings(Array.isArray(data) ? data : []);
  }

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      await Promise.all([fetchResources(), fetchMyBookings()]);
    } catch (err) {
      setError(err.message || "Could not load booking data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedin) return;
    loadData();
  }, [isLoggedin]);

  useEffect(() => {
    if (!isLoggedin) {
      const t = setTimeout(() => navigate("/login"), 300);
      return () => clearTimeout(t);
    }
  }, [isLoggedin, navigate]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("status", statusFilter);
    next.set("page", String(currentPage));
    setSearchParams(next, { replace: true });
  }, [statusFilter, currentPage, searchParams, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, bookings.length]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  useEffect(() => {
    if (isAttendanceRequiredResource) return;
    setForm((prev) => ({ ...prev, expectedAttendees: "" }));
  }, [isAttendanceRequiredResource]);

  useEffect(() => {
    if (!isLoggedin) return;
    if (
      !form.resourceId ||
      !form.bookingDate ||
      !form.startTime ||
      !form.endTime
    ) {
      setAvailability({
        available: null,
        message: "Select resource, date, and time to check availability",
      });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setCheckingAvailability(true);
        const params = new URLSearchParams({
          resourceId: form.resourceId,
          bookingDate: form.bookingDate,
          startTime: form.startTime,
          endTime: form.endTime,
        });
        if (editingBookingId) params.set("excludeBookingId", editingBookingId);
        const res = await fetch(
          `${API_BASE}/api/bookings/availability?${params.toString()}`,
          { credentials: "include" },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setAvailability({
            available: false,
            message: data?.error || "Could not verify availability",
          });
          return;
        }
        setAvailability({
          available: Boolean(data?.available),
          message:
            data?.message ||
            (data?.available
              ? "Time slot is available"
              : "Time slot is not available"),
        });
      } catch (err) {
        setAvailability({
          available: false,
          message: err.message || "Could not verify availability",
        });
      } finally {
        setCheckingAvailability(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [
    isLoggedin,
    form.resourceId,
    form.bookingDate,
    form.startTime,
    form.endTime,
    editingBookingId,
  ]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function clearForm() {
    setEditingBookingId("");
    setAvailability({ available: null, message: "" });
    setForm((prev) => ({
      ...prev,
      bookingDate: getTodayIsoDate(),
      purpose: "",
      expectedAttendees: "",
      recurrence: "NONE",
      occurrences: 1,
    }));
  }

  async function submitBooking(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      if (isPastDateTime(form.bookingDate, form.startTime))
        throw new Error("You cannot create a booking in the past");
      if (isAttendanceRequiredResource && !form.expectedAttendees)
        throw new Error(
          "Expected attendees is required for this resource type",
        );
      if (availability.available === false)
        throw new Error(
          availability.message || "Selected slot is not available",
        );
      const payload = {
        resourceId: form.resourceId,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        expectedAttendees: form.expectedAttendees
          ? Number(form.expectedAttendees)
          : null,
      };
      if (editingBookingId) {
        const res = await fetch(
          `${API_BASE}/api/bookings/${editingBookingId}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, bookingDate: form.bookingDate }),
          },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Booking update failed");
        setMessage("Booking updated successfully.");
      } else {
        const datesToCreate = generateRecurringDates(
          form.bookingDate,
          form.recurrence,
          Number(form.occurrences) || 1,
        );
        let successCount = 0;
        for (const bookingDate of datesToCreate) {
          const res = await fetch(`${API_BASE}/api/bookings`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, bookingDate }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok)
            throw new Error(
              data?.error || `Booking request failed for ${bookingDate}`,
            );
          successCount += 1;
        }
        setMessage(
          successCount > 1
            ? `${successCount} booking requests submitted successfully.`
            : "Booking request submitted and is pending review.",
        );
      }
      clearForm();
      await fetchMyBookings();
    } catch (err) {
      setError(err.message || "Booking request failed");
    } finally {
      setSaving(false);
    }
  }

  function startEditBooking(booking) {
    setEditingBookingId(booking.id);
    setForm((prev) => ({
      ...prev,
      resourceId: booking.resourceId || "",
      bookingDate: toInputDate(booking.bookingDate),
      startTime: String(booking.startTime || "").slice(0, 5),
      endTime: String(booking.endTime || "").slice(0, 5),
      purpose: booking.purpose || "",
      expectedAttendees: booking.expectedAttendees
        ? String(booking.expectedAttendees)
        : "",
      recurrence: "NONE",
      occurrences: 1,
    }));
    setMessage("Editing pending booking. Update fields and submit.");
    setError("");
  }

  function duplicateBooking(booking) {
    setEditingBookingId("");
    const bookingDate = toInputDate(booking.bookingDate);
    setForm((prev) => ({
      ...prev,
      resourceId: booking.resourceId || "",
      bookingDate:
        bookingDate >= getTodayIsoDate() ? bookingDate : getTodayIsoDate(),
      startTime: String(booking.startTime || "").slice(0, 5),
      endTime: String(booking.endTime || "").slice(0, 5),
      purpose: booking.purpose || "",
      expectedAttendees: booking.expectedAttendees
        ? String(booking.expectedAttendees)
        : "",
      recurrence: "NONE",
      occurrences: 1,
    }));
    setMessage("Booking details copied. Adjust and submit as a new request.");
    setError("");
  }

  function exportBookingsCsv() {
    const rows = filteredBookings.map((booking) => {
      const resource = resourcesById.get(booking.resourceId);
      return {
        BookingId: booking.id,
        Status: booking.status,
        Resource: resource
          ? `${resource.name || ""} ${resource.location ? `(${resource.location})` : ""}`.trim()
          : booking.resourceId,
        Date: toInputDate(booking.bookingDate),
        StartTime: booking.startTime,
        EndTime: booking.endTime,
        Purpose: booking.purpose || "",
        ExpectedAttendees: booking.expectedAttendees ?? "",
        RequestedAt: booking.requestedAt || "",
      };
    });
    const headers = [
      "BookingId",
      "Status",
      "Resource",
      "Date",
      "StartTime",
      "EndTime",
      "Purpose",
      "ExpectedAttendees",
      "RequestedAt",
    ];
    const csvBody = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvBody], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my-bookings-${getTodayIsoDate()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leading = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const bookingsByDate = new Map();
    filteredBookings.forEach((booking) => {
      const key = toInputDate(booking.bookingDate);
      const current = bookingsByDate.get(key) || [];
      current.push(booking);
      bookingsByDate.set(key, current);
    });
    const cells = [];
    for (let i = 0; i < leading; i += 1)
      cells.push({ key: `empty-${i}`, type: "empty" });
    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(year, month, day);
      const key = date.toISOString().slice(0, 10);
      cells.push({
        key,
        type: "day",
        day,
        dateKey: key,
        bookings: bookingsByDate.get(key) || [],
      });
    }
    return cells;
  }, [calendarMonth, filteredBookings]);

  async function confirmCancellation() {
    if (!cancelState.bookingId) return;
    try {
      const params = new URLSearchParams();
      if (cancelState.reason.trim())
        params.set("reason", cancelState.reason.trim());
      const res = await fetch(
        `${API_BASE}/api/bookings/${cancelState.bookingId}/cancel?${params.toString()}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not cancel booking");
      setCancelState({ open: false, bookingId: "", reason: "" });
      setMessage("Booking has been cancelled.");
      await fetchMyBookings();
    } catch (err) {
      setError(err.message || "Could not cancel booking");
    }
  }

  function renderPageNumbers() {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages = [];
    for (let p = start; p <= end; p += 1) {
      pages.push(
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className="rounded-lg w-8 h-8 text-xs font-bold transition-all"
          style={
            p === currentPage
              ? { backgroundColor: "#064e3b", color: "white" }
              : {
                  backgroundColor: "white",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                }
          }
        >
          {p}
        </button>,
      );
    }
    return pages;
  }

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: bookings.length,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };
    bookings.forEach((b) => {
      if (counts[b.status] !== undefined) counts[b.status]++;
    });
    return counts;
  }, [bookings]);

  const availabilityState = checkingAvailability
    ? {
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        bg: "#f8fafc",
        color: "#475569",
        border: "#e2e8f0",
        text: "Checking availability…",
      }
    : availability.available === true
      ? {
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          bg: "#ecfdf5",
          color: "#065f46",
          border: "#6ee7b7",
          text: availability.message,
        }
      : availability.available === false
        ? {
            icon: <XCircle className="w-3.5 h-3.5" />,
            bg: "#fff1f2",
            color: "#9f1239",
            border: "#fda4af",
            text: availability.message,
          }
        : {
            icon: <AlertCircle className="w-3.5 h-3.5" />,
            bg: "#f8fafc",
            color: "#64748b",
            border: "#e2e8f0",
            text:
              availability.message || "Select details to check availability",
          };

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "#f9fafb" }}
    >
      {/* ── Page Header ── */}
      <div style={{ backgroundColor: "#064e3b" }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  backgroundColor: "rgba(209,250,229,0.15)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(110,231,183,0.3)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Resource Management
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                My Bookings
              </h1>
              <p className="text-sm" style={{ color: "#a7f3d0" }}>
                Request resources, track approval status, and manage your
                reservations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              <Link
                to="/resources"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <BookOpen className="w-4 h-4" />
                Browse Resources
              </Link>
              {userData?.role === "ROLE_ADMIN" && (
                <Link
                  to="/bookings/admin"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ backgroundColor: "#34d399", color: "#064e3b" }}
                >
                  <ClipboardList className="w-4 h-4" />
                  Admin Review
                </Link>
              )}
              <button
                onClick={exportBookingsCsv}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: "Total", value: statusCounts.ALL, dot: "#94a3b8" },
              { label: "Pending", value: statusCounts.PENDING, dot: "#f59e0b" },
              {
                label: "Approved",
                value: statusCounts.APPROVED,
                dot: "#10b981",
              },
              {
                label: "Rejected",
                value: statusCounts.REJECTED,
                dot: "#f43f5e",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.dot }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#6ee7b7" }}
                  >
                    {s.label}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toast Messages ── */}
      <div className="max-w-7xl mx-auto px-6">
        {message && (
          <div
            className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
            style={{
              backgroundColor: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #6ee7b7",
            }}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div
            className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
            style={{
              backgroundColor: "#fff1f2",
              color: "#9f1239",
              border: "1px solid #fda4af",
            }}
          >
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* ── Booking Form Panel ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid #e2e8f0", backgroundColor: "white" }}
          >
            {/* Form header */}
            <div
              className="px-6 py-5"
              style={{
                backgroundColor: editingBookingId ? "#fffbeb" : "#f0fdf4",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: editingBookingId ? "#fde68a" : "#bbf7d0",
                  }}
                >
                  {editingBookingId ? (
                    <Pencil className="w-4 h-4" style={{ color: "#92400e" }} />
                  ) : (
                    <Plus className="w-4 h-4" style={{ color: "#065f46" }} />
                  )}
                </div>
                <div>
                  <h2
                    className="text-base font-bold"
                    style={{ color: "#064e3b" }}
                  >
                    {editingBookingId
                      ? "Edit Pending Booking"
                      : "New Booking Request"}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                    {editingBookingId
                      ? "You are editing an existing pending booking."
                      : "Requests start as PENDING until an admin approves."}
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <form className="px-6 py-5 space-y-4" onSubmit={submitBooking}>
              {/* Resource */}
              <div>
                <FieldLabel>Resource</FieldLabel>
                <SelectBase
                  name="resourceId"
                  value={form.resourceId}
                  onChange={updateForm}
                  required
                >
                  <option value="">Select a resource…</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.location}
                    </option>
                  ))}
                </SelectBase>
                {selectedResource && (
                  <div
                    className="mt-2 rounded-lg px-3 py-2 text-xs"
                    style={{
                      backgroundColor: "#ecfdf5",
                      color: "#065f46",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <span className="font-semibold">
                      {selectedResourceLabel}
                    </span>
                    {selectedResource.capacity && (
                      <span className="ml-2 opacity-75">
                        · Capacity: {selectedResource.capacity}
                      </span>
                    )}
                    {selectedResource.availability && (
                      <span className="ml-2 opacity-75">
                        · {selectedResource.availability}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Date + Attendees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Date</FieldLabel>
                  <InputBase
                    name="bookingDate"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.bookingDate}
                    onChange={updateForm}
                    required
                  />
                </div>
                <div>
                  <FieldLabel required={isAttendanceRequiredResource}>
                    Attendees
                  </FieldLabel>
                  <InputBase
                    name="expectedAttendees"
                    type="number"
                    min="1"
                    value={form.expectedAttendees}
                    onChange={updateForm}
                    required={isAttendanceRequiredResource}
                    placeholder={
                      isAttendanceRequiredResource ? "Required" : "Optional"
                    }
                  />
                </div>
              </div>

              {/* Start + End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Start Time</FieldLabel>
                  <InputBase
                    name="startTime"
                    type="time"
                    min={minStartTime}
                    value={form.startTime}
                    onChange={updateForm}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>End Time</FieldLabel>
                  <InputBase
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={updateForm}
                    required
                  />
                </div>
              </div>

              {/* Recurrence + Occurrences */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Repeat</FieldLabel>
                  <SelectBase
                    name="recurrence"
                    value={form.recurrence}
                    onChange={updateForm}
                    disabled={Boolean(editingBookingId)}
                    style={
                      Boolean(editingBookingId)
                        ? { opacity: 0.5, cursor: "not-allowed" }
                        : {}
                    }
                  >
                    <option value="NONE">No repeat</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                  </SelectBase>
                </div>
                <div>
                  <FieldLabel>Occurrences</FieldLabel>
                  <InputBase
                    name="occurrences"
                    type="number"
                    min="1"
                    max="12"
                    value={form.occurrences}
                    onChange={updateForm}
                    disabled={
                      form.recurrence === "NONE" || Boolean(editingBookingId)
                    }
                    style={
                      form.recurrence === "NONE" || Boolean(editingBookingId)
                        ? { opacity: 0.5, cursor: "not-allowed" }
                        : {}
                    }
                  />
                </div>
              </div>

              {/* Availability indicator */}
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold"
                style={{
                  backgroundColor: availabilityState.bg,
                  color: availabilityState.color,
                  border: `1px solid ${availabilityState.border}`,
                }}
              >
                {availabilityState.icon}
                {availabilityState.text}
              </div>

              {/* Purpose */}
              <div>
                <FieldLabel required>Purpose</FieldLabel>
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={updateForm}
                  required
                  rows={3}
                  placeholder="Describe the activity and any special setup needed…"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#1e293b",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#059669";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all"
                style={{
                  backgroundColor: saving ? "#94a3b8" : "#064e3b",
                  color: "white",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                  </>
                ) : editingBookingId ? (
                  <>
                    <RefreshCw className="w-4 h-4" /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Submit Booking Request
                  </>
                )}
              </button>

              {editingBookingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="w-full rounded-xl py-3 text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: "#f8fafc",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </div>

          {/* ── Booking History Panel ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid #e2e8f0", backgroundColor: "white" }}
          >
            {/* Panel header */}
            <div
              className="px-6 py-5"
              style={{ borderBottom: "1px solid #e2e8f0" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  className="text-base font-bold"
                  style={{ color: "#1e293b" }}
                >
                  Booking History
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {/* View toggle */}
                  <div
                    className="flex items-center rounded-xl p-1"
                    style={{
                      backgroundColor: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {[
                      {
                        mode: "LIST",
                        icon: <List className="w-3.5 h-3.5" />,
                        label: "List",
                      },
                      {
                        mode: "CALENDAR",
                        icon: <LayoutGrid className="w-3.5 h-3.5" />,
                        label: "Calendar",
                      },
                    ].map(({ mode, icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={
                          viewMode === mode
                            ? {
                                backgroundColor: "white",
                                color: "#064e3b",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                              }
                            : { color: "#64748b" }
                        }
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Status filter */}
                  <SelectBase
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      width: "auto",
                      paddingTop: "6px",
                      paddingBottom: "6px",
                      fontSize: "12px",
                    }}
                  >
                    {[
                      "ALL",
                      "PENDING",
                      "APPROVED",
                      "REJECTED",
                      "CANCELLED",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s === "ALL"
                          ? `All (${statusCounts.ALL})`
                          : `${s} (${statusCounts[s]})`}
                      </option>
                    ))}
                  </SelectBase>
                </div>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2
                    className="w-6 h-6 animate-spin"
                    style={{ color: "#059669" }}
                  />
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Loading bookings…
                  </p>
                </div>
              ) : filteredBookings.length === 0 ? (
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
                    <CalendarDays
                      className="w-5 h-5"
                      style={{ color: "#059669" }}
                    />
                  </div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#64748b" }}
                  >
                    No bookings found
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    Try a different status filter
                  </p>
                </div>
              ) : viewMode === "LIST" ? (
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
                          e.currentTarget.style.borderColor = "#bbf7d0";
                          e.currentTarget.style.backgroundColor = "#f0fdf4";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                          <div>
                            <p
                              className="text-xs font-bold uppercase tracking-widest mb-0.5"
                              style={{ color: "#94a3b8" }}
                            >
                              Booking ID
                            </p>
                            <p
                              className="text-sm font-bold"
                              style={{ color: "#1e293b" }}
                            >
                              {booking.id}
                            </p>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>

                        {/* Resource name */}
                        <div className="flex items-center gap-2 mb-3">
                          <Building2
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: "#059669" }}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#1e293b" }}
                          >
                            {resource
                              ? `${resource.name} (${resource.location})`
                              : booking.resourceId}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                          {[
                            {
                              icon: <CalendarDays className="w-3.5 h-3.5" />,
                              label: "Date",
                              value: formatDate(booking.bookingDate),
                            },
                            {
                              icon: <Clock className="w-3.5 h-3.5" />,
                              label: "Time",
                              value: `${booking.startTime} – ${booking.endTime}`,
                            },
                            {
                              icon: <Users className="w-3.5 h-3.5" />,
                              label: "Attendees",
                              value: booking.expectedAttendees ?? "–",
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center gap-2 rounded-lg px-3 py-2"
                              style={{
                                backgroundColor: "white",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <span style={{ color: "#64748b" }}>
                                {item.icon}
                              </span>
                              <div>
                                <p
                                  className="text-xs"
                                  style={{ color: "#94a3b8" }}
                                >
                                  {item.label}
                                </p>
                                <p
                                  className="text-xs font-semibold"
                                  style={{ color: "#1e293b" }}
                                >
                                  {item.value}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <p
                          className="text-xs mb-3"
                          style={{ color: "#475569" }}
                        >
                          <span
                            className="font-semibold"
                            style={{ color: "#1e293b" }}
                          >
                            Purpose:{" "}
                          </span>
                          {booking.purpose}
                        </p>

                        {booking.reviewReason && (
                          <div
                            className="rounded-xl px-3 py-2.5 text-xs mb-3"
                            style={{
                              backgroundColor: "#fffbeb",
                              color: "#92400e",
                              border: "1px solid #fde68a",
                            }}
                          >
                            <span className="font-bold">Admin Note: </span>
                            {booking.reviewReason}
                          </div>
                        )}

                        <div
                          className="flex flex-wrap justify-end gap-2 pt-2"
                          style={{ borderTop: "1px solid #e2e8f0" }}
                        >
                          {booking.status === "PENDING" && (
                            <button
                              onClick={() => startEditBooking(booking)}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                              style={{
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#dbeafe";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#eff6ff";
                              }}
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                          )}
                          <button
                            onClick={() => duplicateBooking(booking)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
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
                            <Copy className="w-3 h-3" /> Duplicate
                          </button>
                          {booking.status === "APPROVED" && (
                            <button
                              onClick={() =>
                                setCancelState({
                                  open: true,
                                  bookingId: booking.id,
                                  reason: "",
                                })
                              }
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                              style={{
                                backgroundColor: "#fff1f2",
                                color: "#be123c",
                                border: "1px solid #fda4af",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#ffe4e6";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#fff1f2";
                              }}
                            >
                              <XCircle className="w-3 h-3" /> Cancel
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}

                  {filteredBookings.length > pageSize && (
                    <div
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{
                        backgroundColor: "#f8fafc",
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
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            color: "#64748b",
                            opacity: currentPage === 1 ? 0.4 : 1,
                          }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {renderPageNumbers()}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            color: "#64748b",
                            opacity: currentPage === totalPages ? 0.4 : 1,
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Calendar nav */}
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <button
                      onClick={() =>
                        setCalendarMonth(
                          (prev) =>
                            new Date(
                              prev.getFullYear(),
                              prev.getMonth() - 1,
                              1,
                            ),
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        color: "#475569",
                      }}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#064e3b" }}
                    >
                      {calendarMonth.toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <button
                      onClick={() =>
                        setCalendarMonth(
                          (prev) =>
                            new Date(
                              prev.getFullYear(),
                              prev.getMonth() + 1,
                              1,
                            ),
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        color: "#475569",
                      }}
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day labels */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-xs font-bold uppercase tracking-wide py-1"
                          style={{ color: "#94a3b8" }}
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarCells.map((cell) => {
                      if (cell.type === "empty") {
                        return <div key={cell.key} className="min-h-20" />;
                      }
                      const isToday = cell.dateKey === getTodayIsoDate();
                      const hasbookings = cell.bookings.length > 0;
                      return (
                        <div
                          key={cell.key}
                          className="min-h-20 rounded-xl p-2 transition-all"
                          style={{
                            backgroundColor: hasbookings ? "#f0fdf4" : "white",
                            border: isToday
                              ? "2px solid #059669"
                              : "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            className="text-xs font-bold mb-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={
                              isToday
                                ? { backgroundColor: "#064e3b", color: "white" }
                                : { color: "#1e293b" }
                            }
                          >
                            {cell.day}
                          </div>
                          {cell.bookings.length === 0 ? null : (
                            <div className="space-y-0.5">
                              {cell.bookings.slice(0, 2).map((booking) => {
                                const dotColor =
                                  {
                                    PENDING: "#f59e0b",
                                    APPROVED: "#10b981",
                                    REJECTED: "#f43f5e",
                                    CANCELLED: "#94a3b8",
                                  }[booking.status] || "#94a3b8";
                                return (
                                  <div
                                    key={booking.id}
                                    className="flex items-center gap-1 rounded-md px-1.5 py-0.5"
                                    style={{
                                      backgroundColor: "white",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: dotColor }}
                                    />
                                    <span
                                      className="text-xs truncate"
                                      style={{
                                        color: "#475569",
                                        fontSize: "10px",
                                      }}
                                    >
                                      {String(booking.startTime).slice(0, 5)}
                                    </span>
                                  </div>
                                );
                              })}
                              {cell.bookings.length > 2 && (
                                <p
                                  className="text-center font-semibold"
                                  style={{ color: "#059669", fontSize: "10px" }}
                                >
                                  +{cell.bookings.length - 2}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Cancel Modal ── */}
      {cancelState.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(6,78,59,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
          >
            <div
              className="px-6 py-5"
              style={{
                backgroundColor: "#fff1f2",
                borderBottom: "1px solid #fda4af",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#fda4af" }}
                >
                  <XCircle className="w-4 h-4" style={{ color: "#9f1239" }} />
                </div>
                <div>
                  <h3
                    className="text-base font-bold"
                    style={{ color: "#9f1239" }}
                  >
                    Cancel Approved Booking
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "#be123c" }}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm mb-3" style={{ color: "#475569" }}>
                You can provide a cancellation reason for audit records.
              </p>
              <textarea
                rows={3}
                value={cancelState.reason}
                onChange={(e) =>
                  setCancelState((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#1e293b",
                }}
                placeholder="Optional cancellation reason…"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f43f5e";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
              />
              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() =>
                    setCancelState({ open: false, bookingId: "", reason: "" })
                  }
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: "#f8fafc",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  Go Back
                </button>
                <button
                  onClick={confirmCancellation}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ backgroundColor: "#be123c", color: "white" }}
                >
                  <XCircle className="w-4 h-4" />
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  MessageSquare,
  Send,
  ArrowLeft,
  Shield,
  Clock,
  Hash,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  GraduationCap,
  LogOut,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { AppContent } from "../context/AppContext";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

/* ── Reusable styled primitives ──────────────────────────────────────────── */

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
    LOW: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
    MEDIUM: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
    HIGH: { bg: "#fff1f2", color: "#9f1239", border: "#fda4af" },
    CRITICAL: { bg: "#fff1f2", color: "#7f1d1d", border: "#fca5a5" },
  };
  const s = map[priority?.toUpperCase()] || map.LOW;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {priority}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedin, userData, logout } = useContext(AppContent);

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [technicianUserId, setTechnicianUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingStatus, setPendingStatus] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");

  const [userCache, setUserCache] = useState({});

  const isAdminOrTech =
    userData?.role === "ROLE_ADMIN" || userData?.role === "ROLE_TECHNICIAN";
  const isAdmin = userData?.role === "ROLE_ADMIN";

  useEffect(() => {
    if (!isLoggedin) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [id, isLoggedin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketRes, commentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/tickets/${id}`, { credentials: "include" }),
        fetch(`${API_BASE}/api/tickets/${id}/comments`, {
          credentials: "include",
        }),
      ]);

      if (ticketRes.status === 401) {
        navigate("/login");
        return;
      }
      if (ticketRes.status === 403) {
        navigate("/tickets");
        return;
      }
      if (!ticketRes.ok) throw new Error("Ticket not found");

      const ticketData = await ticketRes.json();
      const commentsData = commentsRes.ok ? await commentsRes.json() : [];

      setTicket(ticketData);
      setComments(Array.isArray(commentsData) ? commentsData : []);
      setTechnicianUserId(
        ticketData.assignedToUserId ? String(ticketData.assignedToUserId) : "",
      );
    } catch (err) {
      setActionError(err.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, reason = null) => {
    if (newStatus === "REJECTED" && !reason) {
      setPendingStatus("REJECTED");
      return;
    }
    setActionError("");
    try {
      const body = { status: newStatus };
      if (reason) body.rejectionReason = reason;

      const res = await fetch(`${API_BASE}/api/tickets/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update status");
      setTicket(data);
      setPendingStatus(null);
      setRejectionReason("");
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleAssign = async () => {
    if (!technicianUserId.trim()) {
      setActionError("Enter a technician user ID");
      return;
    }
    setActionError("");
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}/assign`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technicianUserId: Number(technicianUserId) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error || "Failed to assign technician");
      setTicket(data);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleResolution = async () => {
    if (!resolutionNotes.trim()) {
      setActionError("Enter resolution notes");
      return;
    }
    setActionError("");
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}/resolution`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionNotes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error || "Failed to save resolution notes");
      setTicket(data);
      setResolutionNotes("");
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setActionError("");
    try {
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: Number(id), message: newComment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to add comment");
      setComments((prev) => [...prev, data]);
      setNewComment("");
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingMessage.trim()) return;
    setActionError("");
    try {
      const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editingMessage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to edit comment");
      setComments((prev) => prev.map((c) => (c.id === commentId ? data : c)));
      setEditingCommentId(null);
      setEditingMessage("");
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    setActionError("");
    try {
      const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 403) {
        setActionError("You can only delete your own comments");
        return;
      }
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete comment");
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const getAllowedStatuses = () => {
    if (!ticket) return [];
    const s = ticket.status;
    if (isAdmin) {
      if (s === "OPEN") return ["IN_PROGRESS", "REJECTED"];
      if (s === "IN_PROGRESS") return ["RESOLVED", "REJECTED"];
      if (s === "RESOLVED") return ["CLOSED", "REJECTED"];
      return [];
    }
    if (userData?.role === "ROLE_TECHNICIAN") {
      if (s === "OPEN") return ["IN_PROGRESS"];
      if (s === "IN_PROGRESS") return ["RESOLVED"];
      return [];
    }
    return [];
  };

  const statusLabel = (s) => s?.replace(/_/g, " ");

  const canEditOrDelete = (comment) => {
    if (!userData) return false;
    if (isAdmin) return true;
    return comment.userId === userData.id;
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="w-6 h-6 animate-spin"
            style={{ color: "#059669" }}
          />
          <p className="text-sm font-medium" style={{ color: "#64748b" }}>
            Loading ticket…
          </p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!ticket) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div
          className="max-w-md w-full mx-4 rounded-2xl p-10 text-center"
          style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#ecfdf5" }}
          >
            <FileText className="w-6 h-6" style={{ color: "#059669" }} />
          </div>
          <h2
            className="text-lg font-extrabold mb-2"
            style={{ color: "#1e293b" }}
          >
            Ticket not found
          </h2>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            The incident you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/tickets")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold mx-auto transition-all"
            style={{ backgroundColor: "#064e3b", color: "white" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allowedStatuses = getAllowedStatuses();

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
              onClick={() => navigate("/tickets")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{
                  backgroundColor: "rgba(209,250,229,0.15)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(110,231,183,0.3)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Ticket #{ticket.id}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1 max-w-2xl">
                {ticket.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                {ticket.category && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.12)",
                      color: "#a7f3d0",
                      border: "1px solid rgba(167,243,208,0.3)",
                    }}
                  >
                    {ticket.category?.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Error alert ── */}
        {actionError && (
          <div
            className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "#fff1f2",
              color: "#9f1239",
              border: "1px solid #fda4af",
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {actionError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Ticket detail card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
            >
              {/* Card header */}
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
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
                <span
                  className="text-sm font-bold"
                  style={{ color: "#064e3b" }}
                >
                  Ticket Details
                </span>
              </div>

              <div className="p-6 space-y-5">
                {/* Meta row */}
                <div
                  className="grid gap-3 p-4 rounded-xl"
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                  }}
                >
                  {[
                    {
                      icon: <Calendar className="w-3.5 h-3.5" />,
                      label: "Reported",
                      value: ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleDateString()
                        : "–",
                    },
                    {
                      icon: <Shield className="w-3.5 h-3.5" />,
                      label: "Category",
                      value: ticket.category?.replace(/_/g, " ") || "–",
                    },
                    ticket.preferredContact && {
                      icon: <User className="w-3.5 h-3.5" />,
                      label: "Contact",
                      value: ticket.preferredContact,
                    },
                    ticket.assignedToUserId && {
                      icon: <User className="w-3.5 h-3.5" />,
                      label: "Assigned To",
                      value: `User #${ticket.assignedToUserId}`,
                    },
                  ]
                    .filter(Boolean)
                    .map(({ icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2">
                        <span style={{ color: "#059669", marginTop: "1px" }}>
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

                {/* Description */}
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <div
                    className="px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      color: "#374151",
                    }}
                  >
                    {ticket.description}
                  </div>
                </div>

                {/* Rejection reason */}
                {ticket.rejectionReason && (
                  <div
                    className="px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: "#fff1f2",
                      border: "1px solid #fda4af",
                    }}
                  >
                    <p
                      className="font-bold uppercase tracking-widest mb-1"
                      style={{ color: "#be123c", fontSize: "10px" }}
                    >
                      Rejection Reason
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "#9f1239" }}
                    >
                      {ticket.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Resolution notes */}
                {ticket.resolutionNotes && (
                  <div
                    className="px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: "#ecfdf5",
                      border: "1px solid #6ee7b7",
                    }}
                  >
                    <p
                      className="font-bold uppercase tracking-widest mb-1"
                      style={{ color: "#059669", fontSize: "10px" }}
                    >
                      Resolution Notes
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "#065f46" }}
                    >
                      {ticket.resolutionNotes}
                    </p>
                  </div>
                )}

                {/* Image attachments */}
                {(ticket.image1 || ticket.image2 || ticket.image3) && (
                  <div>
                    <FieldLabel>Attachments</FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[ticket.image1, ticket.image2, ticket.image3]
                        .filter(Boolean)
                        .map((src, i) => (
                          <a
                            key={i}
                            href={`${API_BASE}${src}`}
                            target="_blank"
                            rel="noreferrer"
                            className="aspect-[4/3] rounded-xl overflow-hidden block group cursor-zoom-in"
                            style={{ border: "1px solid #e2e8f0" }}
                          >
                            <img
                              src={`${API_BASE}${src}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              alt={`evidence-${i + 1}`}
                            />
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Comments card ── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#ecfdf5" }}
                >
                  <MessageSquare
                    className="w-3.5 h-3.5"
                    style={{ color: "#059669" }}
                  />
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: "#064e3b" }}
                >
                  Discussion
                  {comments.length > 0 && (
                    <span
                      className="ml-1.5 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
                    >
                      {comments.length}
                    </span>
                  )}
                </span>
              </div>

              {/* Comments list */}
              <div
                className="p-5 space-y-3 max-h-[500px] overflow-y-auto"
                style={{ backgroundColor: "#f8fafc" }}
              >
                {comments.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-12 rounded-2xl gap-2"
                    style={{ border: "2px dashed #e2e8f0" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "#ecfdf5" }}
                    >
                      <MessageSquare
                        className="w-4 h-4"
                        style={{ color: "#059669" }}
                      />
                    </div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#64748b" }}
                    >
                      No comments yet. Start the conversation.
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => {
                    const isOwn = userData?.id === comment.userId;
                    const isEditing = editingCommentId === comment.id;

                    return (
                      <article
                        key={comment.id}
                        className="rounded-xl p-4 group"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div
                            className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold uppercase"
                            style={{
                              backgroundColor: isOwn ? "#064e3b" : "#475569",
                            }}
                          >
                            {isOwn
                              ? userData?.name?.[0]?.toUpperCase() || "M"
                              : "U"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className="text-xs font-bold"
                                style={{ color: "#1e293b" }}
                              >
                                {isOwn
                                  ? userData?.name || "You"
                                  : `User #${comment.userId}`}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: "#94a3b8" }}
                                >
                                  {comment.createdAt
                                    ? new Date(
                                        comment.createdAt,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                  {comment.updatedAt &&
                                    comment.updatedAt !== comment.createdAt && (
                                      <span
                                        className="ml-1"
                                        style={{ color: "#cbd5e1" }}
                                      >
                                        (edited)
                                      </span>
                                    )}
                                </span>
                                {canEditOrDelete(comment) && !isEditing && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditingMessage(comment.message);
                                      }}
                                      className="p-1 rounded-lg transition-all"
                                      style={{ color: "#94a3b8" }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "#ecfdf5";
                                        e.currentTarget.style.color = "#059669";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "transparent";
                                        e.currentTarget.style.color = "#94a3b8";
                                      }}
                                      title="Edit"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                      className="p-1 rounded-lg transition-all"
                                      style={{ color: "#94a3b8" }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "#fff1f2";
                                        e.currentTarget.style.color = "#f43f5e";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "transparent";
                                        e.currentTarget.style.color = "#94a3b8";
                                      }}
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="flex gap-2">
                                <input
                                  value={editingMessage}
                                  onChange={(e) =>
                                    setEditingMessage(e.target.value)
                                  }
                                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none transition-all"
                                  style={{
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #059669",
                                    color: "#1e293b",
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleEditComment(comment.id);
                                    if (e.key === "Escape") {
                                      setEditingCommentId(null);
                                      setEditingMessage("");
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleEditComment(comment.id)}
                                  className="p-2 rounded-xl text-white transition-all"
                                  style={{ backgroundColor: "#064e3b" }}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingMessage("");
                                  }}
                                  className="p-2 rounded-xl transition-all"
                                  style={{
                                    backgroundColor: "#f1f5f9",
                                    color: "#475569",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: "#374151" }}
                              >
                                {comment.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              {/* Comment input */}
              <form
                onSubmit={handleAddComment}
                className="p-5"
                style={{ borderTop: "1px solid #e2e8f0" }}
              >
                <FieldLabel>Add a comment</FieldLabel>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question or provide an update…"
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      color: "#1e293b",
                    }}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#059669";
                      e.target.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.backgroundColor = "#f8fafc";
                    }}
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                    style={{ backgroundColor: "#064e3b", color: "white" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#065f46";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#064e3b";
                    }}
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <aside className="space-y-5 sticky top-24">
            {/* Status management */}
            {isAdminOrTech && allowedStatuses.length > 0 && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  className="px-5 py-4 flex items-center gap-3"
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#ecfdf5" }}
                  >
                    <Clock
                      className="w-3.5 h-3.5"
                      style={{ color: "#059669" }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "#064e3b" }}
                  >
                    Status Management
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {allowedStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={
                        s === "REJECTED"
                          ? {
                              backgroundColor: "#fff1f2",
                              color: "#9f1239",
                              border: "1px solid #fda4af",
                            }
                          : {
                              backgroundColor: "#f8fafc",
                              color: "#064e3b",
                              border: "1px solid #e2e8f0",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (s === "REJECTED") {
                          e.currentTarget.style.backgroundColor = "#ffe4e6";
                        } else {
                          e.currentTarget.style.backgroundColor = "#ecfdf5";
                          e.currentTarget.style.borderColor = "#6ee7b7";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (s === "REJECTED") {
                          e.currentTarget.style.backgroundColor = "#fff1f2";
                        } else {
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                        }
                      }}
                    >
                      {statusLabel(s)}
                    </button>
                  ))}

                  {/* Rejection reason prompt */}
                  {pendingStatus === "REJECTED" && (
                    <div
                      className="mt-2 p-3 rounded-xl space-y-2"
                      style={{
                        backgroundColor: "#fff1f2",
                        border: "1px solid #fda4af",
                      }}
                    >
                      <div
                        className="flex items-center gap-1.5 text-xs font-bold"
                        style={{ color: "#be123c" }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Rejection
                        reason required
                      </div>
                      <textarea
                        rows={2}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this ticket is rejected…"
                        className="w-full px-3 py-2 text-xs rounded-xl outline-none resize-none transition-all"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #fda4af",
                          color: "#1e293b",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#f43f5e";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#fda4af";
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange("REJECTED", rejectionReason)
                          }
                          disabled={!rejectionReason.trim()}
                          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            backgroundColor: "#be123c",
                            color: "white",
                            opacity: rejectionReason.trim() ? 1 : 0.4,
                          }}
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => {
                            setPendingStatus(null);
                            setRejectionReason("");
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            backgroundColor: "white",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resolution notes */}
            {isAdminOrTech &&
              (ticket.status === "IN_PROGRESS" ||
                ticket.status === "RESOLVED") && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    className="px-5 py-4 flex items-center gap-3"
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#ecfdf5" }}
                    >
                      <CheckCircle2
                        className="w-3.5 h-3.5"
                        style={{ color: "#059669" }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#064e3b" }}
                    >
                      Resolution Notes
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <textarea
                      rows={3}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe how the issue was resolved…"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
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
                    <button
                      onClick={handleResolution}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ backgroundColor: "#064e3b", color: "white" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#065f46";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#064e3b";
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Save Notes
                    </button>
                  </div>
                </div>
              )}

            {/* Assign technician */}
            {isAdmin &&
              ticket.status !== "CLOSED" &&
              ticket.status !== "REJECTED" && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    className="px-5 py-4 flex items-center gap-3"
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#ecfdf5" }}
                    >
                      <Shield
                        className="w-3.5 h-3.5"
                        style={{ color: "#059669" }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#064e3b" }}
                    >
                      Assign Technician
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <FieldLabel>Technician User ID</FieldLabel>
                      <input
                        type="number"
                        value={technicianUserId}
                        onChange={(e) => setTechnicianUserId(e.target.value)}
                        placeholder="Enter technician ID"
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
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
                    <button
                      onClick={handleAssign}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ backgroundColor: "#1e293b", color: "white" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#0f172a";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#1e293b";
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                      Assignment
                    </button>
                  </div>
                </div>
              )}

            {/* Metadata card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
            >
              <div
                className="px-5 py-4 flex items-center gap-3"
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#ecfdf5" }}
                >
                  <Hash className="w-3.5 h-3.5" style={{ color: "#059669" }} />
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#064e3b" }}
                >
                  Ticket Info
                </span>
              </div>
              <div className="p-4 space-y-2">
                {[
                  ["Ticket ID", `#${ticket.id}`],
                  [
                    "Created",
                    ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString()
                      : "–",
                  ],
                  ["Reporter ID", `#${ticket.createdByUserId}`],
                  ticket.assignedToUserId
                    ? ["Assigned To", `User #${ticket.assignedToUserId}`]
                    : null,
                ]
                  .filter(Boolean)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center px-3 py-2 rounded-lg"
                      style={{ backgroundColor: "#f8fafc" }}
                    >
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: "#94a3b8", fontSize: "10px" }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#1e293b" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

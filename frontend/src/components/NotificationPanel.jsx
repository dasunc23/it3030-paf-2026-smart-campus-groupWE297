import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, CheckCheck, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

/**
 * Reusable notification bell + panel.
 *
 * Drop this component wherever you need the bell icon (Home.jsx header,
 * Layout.jsx header, AdminDashboard, etc.).  It manages its own state and
 * polls the backend every 30 s while mounted.
 *
 * Usage:
 *   import { NotificationPanel } from "../components/NotificationPanel";
 *   ...
 *   <NotificationPanel />
 */
export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  // ── helpers ────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        credentials: "include", // JWT lives in an HttpOnly cookie
      });
      if (!res.ok) return; // not logged in / server error — silently skip
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {
      // network error — silently skip
    }
  }, []);

  // Poll every 30 s so users get near-real-time updates without WebSockets
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ── actions ────────────────────────────────────────────────────────────────

  const markOne = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const markAll = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // ── icon colour helpers ────────────────────────────────────────────────────

  const typeColor = (type) => {
    if (type?.includes("APPROVED")) return "#16a34a";
    if (type?.includes("REJECTED") || type?.includes("CANCELLED"))
      return "#dc2626";
    if (type?.includes("COMMENT")) return "#2563eb";
    return "#6366f1";
  };

  const typeLabel = (type) => {
    const map = {
      BOOKING_APPROVED: "Booking Approved",
      BOOKING_REJECTED: "Booking Rejected",
      BOOKING_CANCELLED: "Booking Cancelled",
      TICKET_STATUS_CHANGED: "Ticket Updated",
      TICKET_COMMENT_ADDED: "New Comment",
    };
    return map[type] || type;
  };

  const timeAgo = (iso) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "relative",
          padding: "8px",
          borderRadius: "50%",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              minWidth: "17px",
              height: "17px",
              borderRadius: "9px",
              background: "#ef4444",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
              lineHeight: 1,
              padding: "0 3px",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "360px",
            maxHeight: "480px",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px 12px",
              borderBottom: "1px solid #f1f5f9",
              flexShrink: 0,
            }}
          >
            <span
              style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: "8px",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "9px",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "1px 6px",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAll}
                  disabled={loading}
                  title="Mark all as read"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#2563eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 6px",
                    borderRadius: "6px",
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    <Loader2
                      size={13}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <CheckCheck size={13} />
                  )}
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                  borderRadius: "6px",
                  display: "flex",
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                <Bell
                  size={32}
                  style={{ marginBottom: "10px", opacity: 0.3 }}
                />
                <p style={{ margin: 0 }}>You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markOne(n.id)}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px 16px",
                    cursor: n.read ? "default" : "pointer",
                    background: n.read ? "transparent" : "#eff6ff",
                    borderBottom: "1px solid #f8fafc",
                    transition: "background 0.15s",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    if (!n.read) e.currentTarget.style.background = "#dbeafe";
                  }}
                  onMouseLeave={(e) => {
                    if (!n.read) e.currentTarget.style.background = "#eff6ff";
                  }}
                >
                  {/* Colour dot */}
                  <div
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: n.read ? "#cbd5e1" : typeColor(n.type),
                      marginTop: "5px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: typeColor(n.type),
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "2px",
                      }}
                    >
                      {typeLabel(n.type)}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#334155",
                        lineHeight: 1.45,
                        wordBreak: "break-word",
                      }}
                    >
                      {n.message}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        marginTop: "4px",
                      }}
                    >
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  {!n.read && (
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#2563eb",
                        flexShrink: 0,
                        marginTop: "6px",
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Inline keyframe for the loader spinner */}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

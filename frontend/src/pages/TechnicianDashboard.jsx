import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import {
  LogOut,
  Wrench,
  Loader2,
  CheckCircle2,
  Navigation,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const { isLoggedin, userData, logout, backendUrl } = useContext(AppContent);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedin) {
      navigate("/login");
    } else if (userData && userData.role !== "ROLE_TECHNICIAN") {
      navigate("/");
    } else if (userData) {
      fetchTasks();
    }
  }, [isLoggedin, userData, navigate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      // GET /api/tickets — backend returns only tickets assigned to this technician
      const { data } = await axios.get(`${API_BASE}/api/tickets`, {
        withCredentials: true,
      });
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Failed to load tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // PATCH /api/tickets/{id}/status — correct endpoint
  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);
      const { data } = await axios.patch(
        `${API_BASE}/api/tickets/${id}/status`,
        { status },
        { withCredentials: true },
      );
      // Update local state
      setTasks((prev) =>
        prev
          .map((t) => (t.id === id ? data : t))
          .filter((t) => t.status !== "CLOSED"),
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  if (!isLoggedin || (userData && userData.role !== "ROLE_TECHNICIAN"))
    return null;

  // Show all non-closed tickets assigned to this technician
  const activeTasks = tasks.filter(
    (t) => t.status !== "CLOSED" && t.status !== "RESOLVED",
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative z-0">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 mix-blend-multiply"></div>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">
              Technician Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              {userData?.name}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1 p-8 max-w-[1600px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            My Assigned Tasks
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and resolve tickets assigned to you
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
            <p className="text-slate-500 mt-1">
              You have no active tasks assigned to you right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {task.category?.replace(/_/g, " ")}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-3">
                      {task.title}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      task.priority === "HIGH" || task.priority === "CRITICAL"
                        ? "bg-red-50 text-red-700"
                        : task.priority === "MEDIUM"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {task.description}
                </p>
                {task.resourceId && (
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <Navigation className="w-4 h-4 text-emerald-600" />
                    Resource #{task.resourceId}
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => navigate(`/tickets/${task.id}`)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    View
                  </button>
                  {task.status === "OPEN" && (
                    <button
                      onClick={() => updateStatus(task.id, "IN_PROGRESS")}
                      disabled={updating === task.id}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {updating === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}{" "}
                      Start Work
                    </button>
                  )}
                  {task.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => updateStatus(task.id, "RESOLVED")}
                      disabled={updating === task.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {updating === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}{" "}
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, X, ArrowLeft, Upload } from "lucide-react";
import { AppContent } from "../context/AppContext";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export function CreateTicket() {
  const navigate = useNavigate();
  const { isLoggedin } = useContext(AppContent);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "FACILITY",
    preferredContact: "",
  });

  // Fix: store actual File objects and their preview URLs instead of fake picsum URLs
  const [imageFiles, setImageFiles] = useState([]); // Array of { file: File, preview: string }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedin) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Fix: use FormData for multipart/form-data upload (real file bytes)
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("priority", formData.priority);
      fd.append("category", formData.category);
      if (formData.preferredContact)
        fd.append("preferredContact", formData.preferredContact);

      // Attach real image files
      imageFiles.forEach((item, idx) => {
        fd.append(`image${idx + 1}`, item.file);
      });

      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: "POST",
        credentials: "include",
        // Do NOT set Content-Type header — browser sets it automatically with the boundary
        body: fd,
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit ticket");
      }

      navigate("/tickets/my");
    } catch (err) {
      setError(err.message || "Failed to report issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fix: open a real file picker, validate type and count
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - imageFiles.length;
    const toAdd = files.slice(0, remaining);

    const newItems = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageFiles((prev) => [...prev, ...newItems]);

    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImageFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview); // free memory
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/tickets")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to list
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              Report an Incident
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Your request will be prioritized based on the category and
              urgency.
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-8 mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Incident Title *
              </label>
              <input
                type="text"
                placeholder="What happened? (e.g., HVAC failure in Hall A)"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Priority Level *
              </label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                required
              >
                <option value="LOW">Low — Not Urgent</option>
                <option value="MEDIUM">Medium — Routine</option>
                <option value="HIGH">High — Important</option>
                <option value="CRITICAL">Critical — Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Category *
              </label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="FACILITY">Facilities &amp; Assets</option>
                <option value="IT_SUPPORT">Technical / IT Support</option>
                <option value="SECURITY">Security / Safety</option>
                <option value="LAB_EQUIPMENT">Laboratory Equipment</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="FURNITURE">Furniture</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Detailed Description *
              </label>
              <textarea
                rows="5"
                placeholder="Explain the situation in detail..."
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Preferred Contact (Optional)
              </label>
              <input
                type="text"
                placeholder="Phone number or email for follow-up"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                value={formData.preferredContact}
                onChange={(e) =>
                  setFormData({ ...formData, preferredContact: e.target.value })
                }
              />
            </div>

            {/* Fix: real file upload — hidden input triggered by the styled button */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                Evidence Images (Max 3)
              </label>

              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Preview cards for chosen images */}
                {imageFiles.map((item, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50"
                  >
                    <img
                      src={item.preview}
                      alt={`evidence-${i + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm shadow-sm text-slate-600 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Add image button — disabled once 3 images selected */}
                {imageFiles.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 transition-all group"
                  >
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 group-hover:rotate-12 transition-all">
                      <Upload size={24} />
                    </div>
                    <span className="text-[10px] sm:text-xs mt-3 font-black uppercase tracking-widest">
                      Upload Photo
                    </span>
                    <span className="text-[9px] text-slate-300 mt-1">
                      {3 - imageFiles.length} remaining
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/tickets")}
              className="px-8 py-3.5 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 tracking-wide"
            >
              <Send size={18} />
              {loading ? "Reporting…" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import AddResourceForm from "./AddResourceForm";
import AuditLogs from "./AuditLogs";

const RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "EQUIPMENT", "MEETING_ROOM", "PROJECTOR", "CAMERA"];
const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];
const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const typeIcons = {
  LECTURE_HALL: "🏛️",
  LAB: "🔬",
  EQUIPMENT: "⚙️",
  MEETING_ROOM: "🤝",
  PROJECTOR: "📽",
  CAMERA: "📹"
};

function calculateAvailabilityWidth(availability) {
  if (!availability || !availability.includes("-")) return "0%";
  const [startH, startM] = availability.split("-")[0].split(":").map(Number);
  const [endH, endM] = availability.split("-")[1].split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const percentage = Math.max(0, ((endMinutes - startMinutes) / 1440) * 100);
  return `${percentage}%`;
}

function formatType(value) {
  if (!value) return "";
  return value.toString().replaceAll("_", " ");
}

export default function ResourceAdminView() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingResource, setEditingResource] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingResource, setViewingResource] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResources, setSelectedResources] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const [filters, setFilters] = useState({
    type: "", minCapacity: "", location: "", status: "", tag: ""
  });

  const statistics = useMemo(() => {
    if (!resources.length) return null;
    const totalResources = resources.length;
    const activeResources = resources.filter(r => r.status === "ACTIVE").length;
    const totalCapacity = resources.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const activePercentage = totalResources > 0 ? ((activeResources / totalResources) * 100).toFixed(1) : "0.0";
    return { totalResources, activeResources, totalCapacity, activePercentage };
  }, [resources]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.minCapacity) params.set("minCapacity", filters.minCapacity);
    if (filters.location) params.set("location", filters.location);
    if (filters.status) params.set("status", filters.status);
    if (filters.tag) params.set("tag", filters.tag);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    fetchResources();
  }, [queryString]);

  async function fetchResources() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/resources${queryString ? `?${queryString}` : ""}`);
      if (!res.ok) throw new Error(`Failed to load resources (${res.status})`);
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load resources");
    } finally {
      setLoading(false);
    }
  }

  function onFilterChange(event) {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  function toggleResourceSelection(id) {
    setSelectedResources(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  }

  function toggleAllResourcesSelection() {
    if (selectedResources.length === resources.length) {
      setSelectedResources([]);
    } else {
      setSelectedResources(resources.map(r => r.id));
    }
  }

  async function updateResource(id, updatedData) {
    try {
      const res = await fetch(`${API_BASE}/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error(`Failed to update resource`);
      fetchResources();
      setShowEditModal(false);
    } catch (err) {
      alert("Failed to update resource. Please try again.");
    }
  }

  async function deleteResource(id) {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/resources/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete resource`);
      fetchResources();
    } catch (err) {
      alert("Failed to delete resource.");
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/api/resources/${id}/status?status=${status}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(`Failed to update status`);
      fetchResources();
    } catch (err) {
      alert("Failed to update status.");
    }
  }

  async function bulkUpdateStatus(status) {
    try {
      const res = await fetch(`${API_BASE}/api/resources/status/bulk?status=${status}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedResources)
      });
      if (!res.ok) throw new Error(`Failed to bulk update status`);
      fetchResources();
      setSelectedResources([]);
      setShowBulkActions(false);
      alert(`Bulk update completed: ${selectedResources.length} resources marked as ${status}`);
    } catch (err) {
      alert("Failed to update resources.");
    }
  }

  function startEdit(resource) {
    setEditingResource(resource);
    setShowEditModal(true);
  }

  function clearFilters() {
    setFilters({ type: "", minCapacity: "", location: "", status: "", tag: "" });
  }

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Resource Administration</h2>
          <p className="text-sm text-slate-500">Manage all catalog entries and facility assets</p>
        </div>
        <button 
          onClick={() => setShowStats(!showStats)} 
          className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors"
        >
          {showStats ? "Hide" : "Show"} Statistics
        </button>
      </div>

      <AddResourceForm onResourceAdded={fetchResources} />

      {/* Stats Panel */}
      {showStats && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-indigo-700">{statistics.totalResources}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Total Resources</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-emerald-700">{statistics.activeResources}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Active Resources</div>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-amber-700">{statistics.activePercentage}%</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Active Rate</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-700">{statistics.totalCapacity}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Total Capacity</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select name="type" value={filters.type} onChange={onFilterChange} className="border border-slate-200 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Types</option>
            {RESOURCE_TYPES.map(type => <option key={type} value={type}>{formatType(type)}</option>)}
          </select>
          <input name="minCapacity" type="number" value={filters.minCapacity} onChange={onFilterChange} className="border border-slate-200 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Min Capacity" />
          <input name="location" value={filters.location} onChange={onFilterChange} className="border border-slate-200 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Location" />
          <select name="status" value={filters.status} onChange={onFilterChange} className="border border-slate-200 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Statuses</option>
            {RESOURCE_STATUSES.map(s => <option key={s} value={s}>{formatType(s)}</option>)}
          </select>
          <input name="tag" value={filters.tag} onChange={onFilterChange} className="border border-slate-200 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tags (e.g. WiFi)" />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={clearFilters} className="text-xs font-bold text-slate-500 hover:text-slate-700">Clear Filters</button>
        </div>
      </div>

      {/* Bulk Actions Menu */}
      {selectedResources.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
          <div className="text-sm font-bold text-blue-800">{selectedResources.length} Resources Selected</div>
          <div className="flex gap-2">
            <button onClick={() => bulkUpdateStatus("ACTIVE")} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition">Mark ACTIVE</button>
            <button onClick={() => bulkUpdateStatus("OUT_OF_SERVICE")} className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-red-700 transition">Mark OUT OF SERVICE</button>
          </div>
        </div>
      )}

      {/* Resource Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" checked={selectedResources.length === resources.length && resources.length > 0} onChange={toggleAllResourcesSelection} className="rounded border-slate-300" />
                </th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm border-t border-slate-100 divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-500 text-sm">Loading resources...</td></tr>
              ) : resources.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-500 text-sm">No resources found</td></tr>
              ) : (
                resources.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selectedResources.includes(r.id)} onChange={() => toggleResourceSelection(r.id)} className="rounded border-slate-300" />
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700 flex items-center gap-2">
                      <span>{typeIcons[r.type]}</span> {formatType(r.type)}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">{r.name || r.id}</td>
                    <td className="px-5 py-4 text-slate-600">{["EQUIPMENT", "PROJECTOR", "CAMERA"].includes(r.type) ? "N/A" : r.capacity}</td>
                    <td className="px-5 py-4 text-slate-600">{r.location}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${r.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {formatType(r.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(r)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition">Edit</button>
                        <button onClick={() => updateStatus(r.id, r.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE")} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Toggle</button>
                        <button onClick={() => deleteResource(r.id)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition">Del</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <AuditLogs />
      </div>

      {/* Edit Modal */}
      {showEditModal && editingResource && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden p-6 mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Resource</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateResource(editingResource.id, editingResource);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Name</label>
                  <input type="text" value={editingResource.name || ""} onChange={e => setEditingResource({...editingResource, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Type</label>
                  <select value={editingResource.type || ""} onChange={e => setEditingResource({...editingResource, type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    {RESOURCE_TYPES.map(type => <option key={type} value={type}>{formatType(type)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Location</label>
                  <input type="text" value={editingResource.location || ""} onChange={e => setEditingResource({...editingResource, location: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Capacity</label>
                  <input type="number" disabled={["EQUIPMENT", "PROJECTOR", "CAMERA"].includes(editingResource.type)} value={editingResource.capacity || ""} onChange={e => setEditingResource({...editingResource, capacity: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Availability</label>
                  <input type="text" value={editingResource.availability || ""} onChange={e => setEditingResource({...editingResource, availability: e.target.value})} placeholder="09:00-17:00" className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Status</label>
                  <select value={editingResource.status || ""} onChange={e => setEditingResource({...editingResource, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    {RESOURCE_STATUSES.map(status => <option key={status} value={status}>{formatType(status)}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Tags (Comma separated)</label>
                  <input type="text" value={editingResource.tags?.join(", ") || ""} onChange={e => setEditingResource({...editingResource, tags: e.target.value.split(", ").filter(t => t.trim())})} placeholder="WiFi, A/C" className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-end pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

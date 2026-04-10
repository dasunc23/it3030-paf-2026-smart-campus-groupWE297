import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

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

export default function ResourceCatalogue() {
  const navigate = useNavigate();
  const { userData } = useContext(AppContent);

  const realRole = userData?.role === "ROLE_ADMIN"
    ? "admin"
    : userData?.role === "ROLE_LECTURER"
      ? "lecturer"
      : "student";

  const [testRole, setTestRole] = useState(realRole === "admin" ? "lecturer" : realRole);

  useEffect(() => {
    if (realRole !== "admin") setTestRole(realRole);
  }, [realRole]);

  const isLecturer = testRole === "lecturer";
  const isStudent = testRole === "student";
  const canViewDetails = isLecturer || isStudent;

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewingResource, setViewingResource] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    minCapacity: "",
    location: "",
    status: "",
    tag: "",
    availableAt: "",
    bookingDate: "",
    bookingStartTime: "",
    bookingEndTime: ""
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.minCapacity) params.set("minCapacity", filters.minCapacity);
    if (filters.location) params.set("location", filters.location);
    if (filters.status) params.set("status", filters.status);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.availableAt) params.set("availableAt", filters.availableAt);
    if (filters.bookingDate && filters.bookingStartTime && filters.bookingEndTime) {
      params.set("bookingDate", filters.bookingDate);
      params.set("bookingStartTime", filters.bookingStartTime);
      params.set("bookingEndTime", filters.bookingEndTime);
    }
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

  function handleBooking(resource) {
    const params = new URLSearchParams();
    params.set("resourceId", resource.id);
    params.set("date", filters.bookingDate || new Date().toISOString().split("T")[0]);
    params.set("start", filters.bookingStartTime || "09:00");
    params.set("end", filters.bookingEndTime || "10:00");
    navigate(`/bookings?${params.toString()}`);
  }

  function viewResource(resource) {
    setViewingResource(resource);
    setShowViewModal(true);
  }

  function closeView() {
    setShowViewModal(false);
    setViewingResource(null);
  }

  function clearFilters() {
    setFilters({
      type: "",
      minCapacity: "",
      location: "",
      status: "",
      tag: "",
      availableAt: "",
      bookingDate: "",
      bookingStartTime: "",
      bookingEndTime: ""
    });
  }

  return (
    <div className="min-h-screen w-full font-sans overflow-x-hidden" style={{ backgroundColor: "#f9fafb", color: "#1e293b" }}>

      {/* ── Header ── */}
      <Header />

      {/* ── Page content (pt-16 to clear fixed navbar) ── */}
      <div className="pt-16">
        <div className="p-6 max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 leading-tight">Resource Catalogue</h2>
              <p className="text-gray-600">Browse and book campus amenities and facilities effortlessly</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/bookings")}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                My Bookings
              </button>
              {userData?.role === "ROLE_ADMIN" && (
                <button
                  onClick={() => navigate("/bookings/admin")}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Booking Review
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Resource Type</label>
                <select name="type" value={filters.type} onChange={onFilterChange} className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="">All Types</option>
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {typeIcons[type]} {formatType(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Min Capacity</label>
                <input
                  name="minCapacity"
                  type="number"
                  min="0"
                  value={filters.minCapacity}
                  onChange={onFilterChange}
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Location</label>
                <input
                  name="location"
                  value={filters.location}
                  onChange={onFilterChange}
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Building A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                <select name="status" value={filters.status} onChange={onFilterChange} className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="">All Statuses</option>
                  {RESOURCE_STATUSES.map((status) => (
                    <option key={status} value={status}>{formatType(status)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tags</label>
                <input
                  name="tag"
                  value={filters.tag}
                  onChange={onFilterChange}
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., WiFi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Available At</label>
                <input
                  name="availableAt"
                  type="time"
                  value={filters.availableAt}
                  onChange={onFilterChange}
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button onClick={clearFilters} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mt-4 transition-colors">
              Clear All Filters
            </button>
          </div>

          {/* Check Availability for Booking */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl mb-6 shadow-sm">
            <h4 className="text-lg font-semibold mb-4 text-blue-800">Check Availability for Booking</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Booking Date</label>
                <input
                  name="bookingDate"
                  type="date"
                  value={filters.bookingDate}
                  onChange={onFilterChange}
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Start Time</label>
                <input
                  name="bookingStartTime"
                  type="time"
                  value={filters.bookingStartTime}
                  onChange={onFilterChange}
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">End Time</label>
                <input
                  name="bookingEndTime"
                  type="time"
                  value={filters.bookingEndTime}
                  onChange={onFilterChange}
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-left">
                    <th className="px-6 py-3 font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Capacity</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Availability</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading catalog...</td></tr>
                  ) : error ? (
                    <tr><td colSpan="7" className="text-center py-8 text-red-500">{error}</td></tr>
                  ) : resources.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">No resources found</td></tr>
                  ) : (
                    resources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{typeIcons[resource.type] || "🏢"}</span>
                            <span className="font-medium text-gray-700">{formatType(resource.type)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">{resource.name || `${formatType(resource.type)} - ${resource.location}`}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="bg-gray-100 px-3 py-1 rounded-full text-center inline-block">
                            <span className="font-bold text-gray-700">
                              {["EQUIPMENT", "PROJECTOR", "CAMERA"].includes(resource.type) ? "N/A" : resource.capacity}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">📍</span>
                            <span className="text-gray-700">{resource.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1.5 w-32">
                            <div className="text-xs text-gray-600 font-medium">{resource.availability}</div>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300" style={{ width: calculateAvailabilityWidth(resource.availability) }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            resource.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              resource.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                            }`} />
                            {formatType(resource.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            {canViewDetails && (
                              <>
                                <button onClick={() => viewResource(resource)} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold">👁 View</button>
                                <button onClick={() => handleBooking(resource)} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors text-xs font-bold">Book</button>
                              </>
                            )}
                            {!canViewDetails && <span className="text-gray-400 text-xs italic">View only</span>}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <Footer />

      {/* View Details Modal */}
      {showViewModal && viewingResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{typeIcons[viewingResource.type]}</span>
                  <span className="font-medium text-blue-100">{formatType(viewingResource.type)}</span>
                </div>
                <h3 className="text-2xl font-bold">{viewingResource.name || `${formatType(viewingResource.type)} - ${viewingResource.location}`}</h3>
              </div>
              <button onClick={closeView} className="text-white/70 hover:text-white p-1 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">Location</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1">📍 {viewingResource.location}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">Capacity</span>
                <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                  {["EQUIPMENT", "PROJECTOR", "CAMERA"].includes(viewingResource.type) ? "N/A" : viewingResource.capacity}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">Availability</span>
                <span className="font-semibold text-gray-800">{viewingResource.availability}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">Status</span>
                <span className={`px-2 py-0.5 rounded text-sm font-semibold ${viewingResource.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {formatType(viewingResource.status)}
                </span>
              </div>

              <div>
                <span className="block text-gray-500 font-medium mb-2">Capabilities / Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingResource.tags?.length ? viewingResource.tags.map((tag) => (
                    <span key={tag} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                      {tag}
                    </span>
                  )) : (
                    <span className="text-gray-400 text-sm italic">No special capabilities listed.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={closeView} className="px-5 py-2 font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                Close
              </button>
              <button onClick={() => { closeView(); handleBooking(viewingResource); }} className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-200">
                Book Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
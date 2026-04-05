import React, { useEffect, useState } from "react";

function AuditLogs() {
    const apiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({
        action: "",
        performedBy: "",
        dateFrom: "",
        dateTo: ""
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${apiBase}/api/audit`);
            if (!res.ok) throw new Error(`Failed to load audit logs (${res.status})`);
            const data = await res.json();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Could not load audit logs");
        } finally {
            setLoading(false);
        }
    }

    function handleFilterChange(event) {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    }

    function getActionColor(action) {
        switch (action) {
            case "ADD_RESOURCE": return "bg-green-100 text-green-800";
            case "UPDATE_RESOURCE": return "bg-blue-100 text-blue-800";
            case "DELETE_RESOURCE": return "bg-red-100 text-red-800";
            case "UPDATE_STATUS": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    }

    function formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    const filteredLogs = logs.filter(log => {
        if (filters.action && !log.action.toLowerCase().includes(filters.action.toLowerCase())) return false;
        if (filters.performedBy && !log.performedBy?.toLowerCase().includes(filters.performedBy.toLowerCase())) return false;
        if (filters.dateFrom && new Date(log.timestamp) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && new Date(log.timestamp) > new Date(filters.dateTo)) return false;
        return true;
    });

    return (
        <div className="p-6" style={{ counterReset: 'none', listStyle: 'none' }}>
            <div className="bg-white rounded-xl shadow-md p-6">
                {/* Filters */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Action Filter</label>
                            <input
                                name="action"
                                value={filters.action}
                                onChange={handleFilterChange}
                                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                placeholder="e.g., CREATE, UPDATE"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">User Filter</label>
                            <input
                                name="performedBy"
                                value={filters.performedBy}
                                onChange={handleFilterChange}
                                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                placeholder="e.g., admin, john.doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">From Date</label>
                            <input
                                name="dateFrom"
                                type="date"
                                value={filters.dateFrom}
                                onChange={handleFilterChange}
                                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">To Date</label>
                            <input
                                name="dateTo"
                                type="date"
                                value={filters.dateTo}
                                onChange={handleFilterChange}
                                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                            />
                        </div>
                    </div>
                    
                    {/* Active Filters */}
                    <div className="flex flex-wrap gap-2 mt-4" style={{ listStyle: 'none', counterReset: 'none' }}>
                        {Object.entries(filters).filter(([key, value]) => value).map(([key, value]) => (
                            <span key={key} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                                {formatType(key)}: {value}
                                <button onClick={() => setFilters(prev => ({ ...prev, [key]: "" }))} className="ml-2 text-blue-600 hover:text-blue-800 font-bold">
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="table-auto border-collapse border border-gray-200 w-full" style={{ listStyle: 'none', counterReset: 'none' }}>
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-left">
                                <th className="border px-4 py-3 font-semibold text-gray-700">Timestamp</th>
                                <th className="border px-4 py-3 font-semibold text-gray-700">Action</th>
                                <th className="border px-4 py-3 font-semibold text-gray-700">Resource Name</th>
                                <th className="border px-4 py-3 font-semibold text-gray-700">Details</th>
                                <th className="border px-4 py-3 font-semibold text-gray-700">Performed By</th>
                            </tr>
                        </thead>
                        <tbody style={{ listStyle: 'none', counterReset: 'none' }}>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-6 text-gray-500">Loading audit logs...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="5" className="text-center py-6 text-red-500">{error}</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-6 text-gray-500">No audit logs found</td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2 text-sm">{formatTimestamp(log.timestamp)}</td>
                                        <td className="border px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-sm ${getActionColor(log.action)}`}>
                                                {log.action?.replaceAll("_", " ")}
                                            </span>
                                        </td>
                                        <td className="border px-4 py-2 text-sm">{log.resourceName || log.resourceId}</td>
                                        <td className="border px-4 py-2 text-sm">{log.details}</td>
                                        <td className="border px-4 py-2 text-sm">{log.performedBy}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AuditLogs;

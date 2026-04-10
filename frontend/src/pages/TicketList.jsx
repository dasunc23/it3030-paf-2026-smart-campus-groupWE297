import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle2, ChevronRight, User, Hash, Filter, Search } from 'lucide-react';
import api from '../api';

export function TicketList() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'OPEN': return 'bg-red-50 text-red-600 border-red-100';
            case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'CLOSED': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Incidents & Maintenance</h1>
                    <p className="text-slate-500 mt-1">Manage, track, and resolve campus service requests.</p>
                </div>
                <Link to="/report" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                    <AlertCircle size={20} />
                    Report New Incident
                </Link>
            </div>

            {/* Stats and Filter */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'All Tickets', val: tickets.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Active (Open)', val: tickets.filter(t => t.status === 'OPEN').length, color: 'text-red-600', bg: 'bg-red-50' },
                        { label: 'In Progress', val: tickets.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Recently Resolved', val: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    ].map((stat, i) => (
                        <div key={i} className={`p-4 rounded-2xl ${stat.bg} border border-white flex flex-col`}>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                            <span className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.val}</span>
                        </div>
                    ))}
                </div>

                <div className="w-full lg:w-96 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search incidents..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Tickets Table/List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Incident</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned To</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Created</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400 italic">
                                        <div className="flex flex-col items-center">
                                            <Hash size={48} className="text-slate-100 mb-4" />
                                            No incidents matching your criteria
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="group hover:bg-slate-50 transition-all cursor-pointer" onClick={() => (window.location.href = `/ticket/${ticket.id}`)}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                    #{ticket.id}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{ticket.title}</div>
                                                    <div className="text-xs text-slate-500 truncate mt-0.5 lg:max-w-xs">{ticket.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusStyle(ticket.status)}`}>
                                                {ticket.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 font-semibold text-sm">
                                                <div className={`w-2 h-2 rounded-full ${ticket.priority?.startsWith('HIGH') || ticket.priority?.startsWith('URGENT') ? 'bg-red-500' : ticket.priority?.startsWith('MEDIUM') ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                                {ticket.priority?.split(' ')[0]}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                                                    <User size={12} />
                                                </div>
                                                {ticket.assignedTo || <span className="text-slate-400 italic">Unassigned</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-500">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <ChevronRight className="inline-block text-slate-300 group-hover:text-blue-400 transition-colors" />
                                        </td>
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

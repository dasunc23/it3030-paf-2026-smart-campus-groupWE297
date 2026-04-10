import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, MessageSquare, Send, ArrowLeft, Shield, Clock, Hash, CheckCircle2 } from 'lucide-react';
import api from '../api';

export function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [technician, setTechnician] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [ticketRes, commentsRes] = await Promise.all([
                api.get(`/tickets/${id}`),
                api.get(`/tickets/${id}/comments`)
            ]);
            setTicket(ticketRes.data);
            setComments(commentsRes.data);
            setTechnician(ticketRes.data.assignedTo || '');
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await api.put(`/tickets/${id}`, { ...ticket, status: newStatus });
            setTicket(response.data);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAssign = async () => {
        try {
            const response = await api.put(`/tickets/${id}/assign?technician=${technician}`);
            setTicket(response.data);
            alert('Technician assigned successfully!');
        } catch (error) {
            console.error('Error assigning technician:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const response = await api.post('/comments', {
                ticketId: id,
                userId: 1, // Mock user ID
                message: newComment
            });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'OPEN': return 'text-red-600 bg-red-50 ring-red-100';
            case 'IN_PROGRESS': return 'text-amber-600 bg-amber-50 ring-amber-100';
            case 'RESOLVED': return 'text-emerald-600 bg-emerald-50 ring-emerald-100';
            case 'CLOSED': return 'text-slate-600 bg-slate-100 ring-slate-200';
            default: return 'text-slate-500 bg-slate-50 ring-slate-100';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
    if (!ticket) return (
        <div className="max-w-xl mx-auto text-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <Hash size={48} className="mx-auto text-slate-100 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Ticket not found</h2>
            <p className="text-slate-500 mt-2">The incident you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate('/')} className="mt-8 text-blue-600 font-bold hover:underline">Back to Dashboard</button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
                    <ArrowLeft size={18} />
                    Back to list
                </button>
                <div className="flex gap-2">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">ID: #{ticket.id}</span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">{ticket.priority?.split(' ')[0]} PRIORITY</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-8 space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-4xl font-black text-slate-900 leading-tight flex-1">{ticket.title}</h1>
                                <span className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-black ring-1 ring-inset uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                                    {ticket.status?.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500 pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Reported {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User size={16} />
                                    <span>By Campus Member</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} />
                                    <span>Category: Facility</span>
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">{ticket.description}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                                {ticket.image1 && <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-inner group cursor-zoom-in"><img src={ticket.image1} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="evidence" /></div>}
                                {ticket.image2 && <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-inner group cursor-zoom-in"><img src={ticket.image2} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="evidence" /></div>}
                                {ticket.image3 && <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-inner group cursor-zoom-in"><img src={ticket.image3} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="evidence" /></div>}
                            </div>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <MessageSquare className="text-blue-600" />
                                Discussion ({comments.length})
                            </h2>
                        </div>

                        <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto bg-slate-50/30">
                            {comments.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 italic">No comments yet. Start the conversation.</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 group">
                                        <div className="w-10 h-10 shrink-0 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold uppercase ring-4 ring-white shadow-sm">
                                            U{comment.userId}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-900">User {comment.userId}</span>
                                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-300 group-hover:text-slate-400 transition-colors">
                                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm text-slate-600 text-sm leading-relaxed">
                                                {comment.message}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="p-8 bg-slate-50 border-t border-slate-100">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ask a question or provide update..."
                                    className="w-full pl-6 pr-16 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-sm shadow-sm"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <aside className="space-y-6 sticky top-24">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Clock size={14} />
                                Status Management
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className={`text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${ticket.status === s
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                                            }`}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Shield size={14} />
                                Assignment
                            </h3>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={technician}
                                    onChange={(e) => setTechnician(e.target.value)}
                                    placeholder="Enter Technician ID"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                                <button
                                    onClick={handleAssign}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-black tracking-widest uppercase hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 active:scale-95"
                                >
                                    <CheckCircle2 size={16} />
                                    Confirm Assignment
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <div className="bg-blue-50/50 p-4 rounded-2xl space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Created:</span>
                                    <span className="text-xs font-bold text-slate-900">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority:</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${ticket.priority?.startsWith('HIGH') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {ticket.priority?.split(' ')[0]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

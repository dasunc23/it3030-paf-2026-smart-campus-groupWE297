import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, X, ArrowLeft, Info, ImageIcon } from 'lucide-react';
import api from '../api';

export function CreateTicket() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'OPEN'
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const ticketData = {
                ...formData,
                image1: images[0] || null,
                image2: images[1] || null,
                image3: images[2] || null,
            };
            await api.post('/tickets', ticketData);
            navigate('/');
        } catch (error) {
            console.error('Error reporting issue:', error);
            alert('Failed to report issue. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageAdd = () => {
        if (images.length >= 3) return;
        const mockUrl = `https://picsum.photos/seed/${Math.random() * 1000}/800/600`;
        setImages([...images, mockUrl]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
                    <ArrowLeft size={18} />
                    Back to list
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight">Report an Incident</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Your request will be prioritized based on the category and urgency.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Incident Title</label>
                            <input
                                type="text"
                                placeholder="What happened? (e.g., HVAC failure in Hall A)"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Priority Level</label>
                            <select
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="LOW">Low - Not Urgent</option>
                                <option value="MEDIUM">Medium - Routine</option>
                                <option value="HIGH">High - Important</option>
                                <option value="URGENT">Urgent - Emergency</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Category</label>
                            <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer">
                                <option>Facilities & Assets</option>
                                <option>Technical/IT Support</option>
                                <option>Security/Safety</option>
                                <option>Laboratory Equipment</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Detailed Description</label>
                            <textarea
                                rows="5"
                                placeholder="Explain the situation in detail..."
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Evidence Images (Max 3)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {images.map((img, i) => (
                                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                                        <img src={img} alt="upload" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm shadow-sm text-slate-600 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={handleImageAdd}
                                        className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 transition-all group"
                                    >
                                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 group-hover:rotate-12 transition-all">
                                            <ImageIcon size={24} />
                                        </div>
                                        <span className="text-[10px] sm:text-xs mt-3 font-black uppercase tracking-widest">Attach Proof</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium italic">
                            <Info size={14} />
                            Images are simulated for this demonstration
                        </div>
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 sm:flex-none px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 tracking-wide"
                            >
                                <Send size={18} />
                                {loading ? 'Reporting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

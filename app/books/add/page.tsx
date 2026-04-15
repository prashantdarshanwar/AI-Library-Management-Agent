"use client";
import React, { useState } from 'react';
import { 
  Save, 
  Loader2, 
  CheckCircle2, 
  BookOpen, 
  MapPin, 
  User, 
  Tag, 
  X, 
  Layers,
  Plus,
  Minus,
  Archive
} from 'lucide-react';

export default function FormPage() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSavedBook, setLastSavedBook] = useState("");

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Technology',
    rack: '',
    shelf: '',
    totalQuantity: 1 // Modern numeric tracking
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalData = {
      title: formData.title,
      author: formData.author,
      category: formData.category,
      totalQuantity: formData.totalQuantity,
      location: `${formData.rack} | ${formData.shelf}`
    };

    try {
      const response = await fetch('http://localhost:8080/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        setLastSavedBook(formData.title);
        setShowSuccess(true);
        setFormData({
          title: '',
          author: '',
          category: 'Technology',
          rack: '',
          shelf: '',
          totalQuantity: 1
        });
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Error: Backend server is unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl border border-blue-50 text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
            <button onClick={() => setShowSuccess(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200/50">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">Book Archived!</h2>
            <p className="text-sm text-gray-500 font-medium mb-8 uppercase tracking-wide">
              <span className="text-blue-600 font-bold">"{lastSavedBook}"</span> has been added to inventory.
            </p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              Add Another Book
            </button>
          </div>
        </div>
      )}

      {/* HEADER AREA */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
          <BookOpen size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Master Book Registry</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic flex items-center gap-2">
            <Archive size={12} /> Inventory Control & Tracking
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <Layers size={14} /> Cataloging Details
            </h2>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Book Title</label>
              <input 
                type="text" required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-gray-700" 
                placeholder="e.g. Introduction to Algorithms" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Author */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Author / Writer</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" required
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-gray-700" 
                    placeholder="Author name..." 
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Genre Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-700 focus:border-blue-500"
                >
                  <option>Technology</option>
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>Business</option>
                  <option>History</option>
                  <option>Fiction</option>
                </select>
              </div>
            </div>

            {/* Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MapPin size={12} /> Storage Rack
                </label>
                <select 
                  required
                  value={formData.rack}
                  onChange={(e) => setFormData({...formData, rack: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-700 focus:border-blue-500 transition-all"
                >
                  <option value="" disabled>Select Rack Area</option>
                  <optgroup label="Section A: Core Engineering">
                    <option value="Rack A1">Rack A1 (Software)</option>
                    <option value="Rack A2">Rack A2 (Hardware)</option>
                  </optgroup>
                  <optgroup label="Section B: Natural Sciences">
                    <option value="Rack B1">Rack B1 (Physics)</option>
                    <option value="Rack B2">Rack B2 (Biology)</option>
                  </optgroup>
                  <optgroup label="Section R: Reference">
                    <option value="Rack R1">Rack R1 (Thesis)</option>
                    <option value="Rack R2">Rack R2 (Archive)</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Tag size={12} /> Shelf / Slot
                </label>
                <input 
                  type="text" required
                  value={formData.shelf}
                  onChange={(e) => setFormData({...formData, shelf: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-gray-700" 
                  placeholder="e.g. Shelf 04 / B" 
                />
              </div>
            </div>

            {/* MODERN QUANTITY SELECTOR */}
            <div className="p-6 bg-blue-50/50 rounded-[28px] border border-blue-100 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Stock Inventory</p>
                <p className="text-sm font-bold text-gray-600">Total copies to register</p>
              </div>
              
              <div className="flex items-center gap-5 bg-white p-2 rounded-2xl shadow-sm border border-blue-100">
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, totalQuantity: Math.max(1, prev.totalQuantity - 1)}))}
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-black text-xl text-gray-800">{formData.totalQuantity}</span>
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, totalQuantity: prev.totalQuantity + 1}))}
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 transition-all active:scale-90"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:bg-blue-300"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? "Registering..." : "Complete Book Entry"}
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({ title:'', author:'', category:'Technology', rack:'', shelf:'', totalQuantity: 1 })}
              className="px-10 py-5 bg-white border border-gray-200 text-gray-400 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="hidden lg:col-span-4 lg:block space-y-6">
          <div className="bg-[#1e293b] p-8 rounded-[40px] text-white relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Database Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-gray-400">Inventory Sync</span>
                <span className="text-green-400 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-gray-400">Mode</span>
                <span className="font-bold">Multi-Quantity</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed pt-4 font-bold uppercase tracking-tight">
                * Quantities are initialized automatically. Total copies will equal current shelf stock upon entry.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
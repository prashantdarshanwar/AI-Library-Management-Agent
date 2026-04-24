"use client";
import React from 'react';
import { Plus, Search, Edit, Trash2, Layers, MapPin, BookOpen } from 'lucide-react';

export default function RackManagement() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Manage Master</p>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Rack Management</h1>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <Plus size={18} /> ADD NEW RACK
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Racks</p>
            <h3 className="text-xl font-black text-gray-800">24</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Storage Rows</p>
            <h3 className="text-xl font-black text-gray-800">08</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Books Hosted</p>
            <h3 className="text-xl font-black text-gray-800">1,420</h3>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by Rack Name or Row..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all" 
            />
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Showing 24 Locations
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100 bg-gray-50/50">
              <th className="px-8 py-5">Rack Name</th>
              <th className="px-8 py-5">Location / Row</th>
              <th className="px-8 py-5">Capacity</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { id: 'R-101', name: 'Main Computer Science', row: 'Row A - Shelf 1', cap: '150 Books', status: 'Full' },
              { id: 'R-102', name: 'Fiction & Novels', row: 'Row B - Shelf 3', cap: '200 Books', status: 'Available' },
              { id: 'R-103', name: 'Reference Section', row: 'Row C - Shelf 1', cap: '100 Books', status: 'Available' },
              { id: 'R-104', name: 'Architecture Journals', row: 'Row A - Shelf 4', cap: '80 Books', status: 'Full' },
            ].map((rack, i) => (
              <tr key={i} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-8 py-5">
                  <div className="font-black text-gray-800 text-sm tracking-tight">{rack.name}</div>
                  <div className="text-[10px] text-blue-500 font-mono font-bold uppercase">{rack.id}</div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <MapPin size={12} className="text-gray-300" />
                    {rack.row}
                  </div>
                </td>
                <td className="px-8 py-5 text-xs font-bold text-gray-600">
                  {rack.cap}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    rack.status === 'Full' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                  }`}>
                    {rack.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm transition-all">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-center">
           <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline">
              Load More Racks
           </button>
        </div>
      </div>
    </div>
  );
}
"use client";
import React from 'react';
import { Search, Plus, Edit, Trash2, FileText } from 'lucide-react';

export default function ListPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Data Records</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <Plus size={18} /> ADD NEW RECORD
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search records..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Title / Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-mono font-bold text-blue-500">#00{i}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">Sample Record {i}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-600 rounded text-[10px] font-bold uppercase">Active</span></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-blue-500"><Edit size={16} /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
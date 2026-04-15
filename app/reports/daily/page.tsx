"use client";
import React from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Today Records', val: '42', color: 'text-blue-600' },
          { label: 'Weekly Growth', val: '+12%', color: 'text-green-600' },
          { label: 'Pending Fines', val: '₹1,250', color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.val}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex flex-col items-center justify-center text-gray-300 border-dashed border-2">
        <BarChart3 size={48} className="mb-4 opacity-20" />
        <p className="font-bold text-sm uppercase tracking-widest">Chart Visualization Area</p>
        <button className="mt-4 text-blue-500 font-bold text-xs flex items-center gap-2 hover:underline">
          <Download size={14} /> GENERATE PDF REPORT
        </button>
      </div>
    </div>
  );
}
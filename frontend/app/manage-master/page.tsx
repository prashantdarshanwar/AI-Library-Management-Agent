"use client";
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, FolderTree, UserPen, Building2 } from 'lucide-react';

type MasterTab = 'categories' | 'authors' | 'publishers';

export default function ManageMaster() {
  const [activeTab, setActiveTab] = useState<MasterTab>('categories');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase italic">Manage Master</h1>
          <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Configure Library Foundations</p>
        </div>
        
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">
          <Plus size={18} />
          ADD NEW {activeTab.toUpperCase().slice(0, -1)}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl border border-gray-100 w-fit shadow-sm">
        <TabButton 
          active={activeTab === 'categories'} 
          onClick={() => setActiveTab('categories')} 
          icon={<FolderTree size={16} />} 
          label="Categories" 
        />
        <TabButton 
          active={activeTab === 'authors'} 
          onClick={() => setActiveTab('authors')} 
          icon={<UserPen size={16} />} 
          label="Authors" 
        />
        <TabButton 
          active={activeTab === 'publishers'} 
          onClick={() => setActiveTab('publishers')} 
          icon={<Building2 size={16} />} 
          label="Publishers" 
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 flex gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <select className="bg-gray-50 border border-gray-100 rounded-lg px-4 text-sm font-medium text-gray-600 outline-none">
          <option>Sort by Name</option>
          <option>Sort by Date</option>
          <option>Most Used</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Books</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Sample Data mapping based on active tab */}
            {[1, 2, 3, 4, 5].map((item) => (
              <tr key={item} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 text-sm font-mono text-gray-400">#00{item}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">
                  {activeTab === 'categories' ? 'Computer Science' : activeTab === 'authors' ? 'Robert C. Martin' : 'O\'Reilly Media'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">142 Books</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Active</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
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

// Sub-component for Tabs
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
        active 
          ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
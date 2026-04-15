"use client";
import React, { useEffect, useState } from 'react';
import { LogOut, User, Bell, Search } from 'lucide-react';

// Define the "Shape" of the props
interface TopNavProps {
  onLogout: () => void; // This tells TS that TopNav expects a function called onLogout
}

export default function TopNav({ onLogout }: TopNavProps) {
  const [collegeName, setCollegeName] = useState("LibraryPro");

  useEffect(() => {
    const savedName = localStorage.getItem('collegeName');
    if (savedName) setCollegeName(savedName);
  }, []);

  return (
    <nav className="bg-[#3498db] h-16 flex items-center justify-between px-6 shadow-md sticky top-0 z-50">
      
      {/* Left Side: Logo Branding */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 items-center">
          <div className="w-2 h-5 bg-red-500 rounded-sm"></div>
          <div className="w-2 h-5 bg-yellow-400 rounded-sm"></div>
          <div className="w-2 h-5 bg-green-400 rounded-sm"></div>
          <div className="w-2 h-5 bg-indigo-500 rounded-sm"></div>
        </div>
        <span className="text-2xl font-black text-white tracking-tighter">
          {collegeName}
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-white border-l border-blue-400 pl-6 h-8">
          <span className="text-sm font-medium opacity-90">Welcome :</span>
          <span className="text-sm font-black uppercase tracking-wide">Admin</span>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center ml-1">
            <User size={16} />
          </div>
        </div>

        {/* Use the onLogout prop here */}
        <button 
          onClick={onLogout}
          className="bg-[#2980b9] hover:bg-[#1c5982] text-white text-xs font-bold px-5 py-2 rounded shadow-inner transition-all flex items-center gap-2 border border-blue-400/30 active:scale-95"
        >
          <LogOut size={14} />
          LOG OUT
        </button>
      </div>
    </nav>
  );
}
"use client";
import React, { useEffect, useState } from 'react';
import { 
  Home, BookOpen, Users, Building2, Wallet, UserCheck, 
  GraduationCap, ArrowUpCircle, ArrowDownCircle, Plus, BookMarked, RotateCcw,
  QrCode 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/* --- TYPES & INTERFACES --- */

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface IssueRowProps {
  id: string;
  title: string;
  member: string;
  date: string;
  status: 'Issued' | 'Overdue';
}

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  color: string;
}

/* --- MAIN DASHBOARD COMPONENT --- */

export default function Dashboard() {
  const [collegeName, setCollegeName] = useState<string>("LibraryPro");
  
  // Update this to your Victus laptop's IP so students can connect
  const chatUrl = "http://192.168.1.39:3000/issue-return/chatbot";

  useEffect(() => {
    const savedName = localStorage.getItem('collegeName');
    if (savedName) setCollegeName(savedName);
  }, []);

  return (
    <div className="bg-[#f4f7f9] min-h-screen font-sans text-gray-700 pb-10">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
        
        {/* TOP HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">{collegeName} Dashboard</h1>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Home size={16} className="text-orange-500" />
            <span>Home</span>
            <span className="text-gray-300">/</span>
            <span className="text-blue-500">Dashboard</span>
          </div>
        </div>

        {/* ROW 1: TOP STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Titles" value="3,854" icon={<BookOpen size={20}/>} color="bg-blue-400" />
          <StatCard label="Total Authors" value="2,907" icon={<Users size={20}/>} color="bg-green-400" />
          <StatCard label="Total Publishers" value="1,021" icon={<Building2 size={20}/>} color="bg-cyan-400" />
          <StatCard label="Total Book Value" value="₹875,973" icon={<Wallet size={20}/>} color="bg-purple-400" />
          <StatCard label="Total Staffs" value="12" icon={<UserCheck size={20}/>} color="bg-orange-400" />
        </div>

        {/* ROW 2: VISUALIZER, TABLE & QR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Library Visualizer */}
          <div className="lg:col-span-4 bg-[#1e293b] rounded-2xl overflow-hidden p-6 min-h-[380px] flex flex-col justify-between shadow-sm">
             <div className="flex items-end gap-2 h-40 mb-2">
                {[40, 70, 50, 90, 60, 45, 80, 55, 95, 65].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-sm ${['bg-red-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400'][i % 5]}`} />
                ))}
             </div>
             <div className="h-1.5 w-full bg-yellow-600 rounded-full mb-4" />
             <div className="flex items-end gap-2 h-24">
                {[60, 40, 85, 30, 75, 50, 90, 40, 60, 70].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-sm ${['bg-orange-400', 'bg-cyan-400', 'bg-pink-400', 'bg-indigo-400', 'bg-emerald-400'][i % 5]}`} />
                ))}
             </div>
             <div className="mt-4 text-white font-semibold flex items-center gap-2">
               <span className="text-red-500">📍</span> Main Hall — Bhusawal
             </div>
          </div>

          {/* Recent Issues Table */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
            <h3 className="font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">Recent Book Issues</h3>
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
                  <th className="pb-3 text-left">Title</th>
                  <th className="pb-3 text-left">Member</th>
                  <th className="pb-3 text-left">Date</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <IssueRow id="004" title="Atomic Habits" member="Sneha Joshi" date="Apr 15" status="Issued" />
                <IssueRow id="005" title="1984" member="Vikram Desai" date="Apr 18" status="Issued" />
                <IssueRow id="006" title="Rich Dad Poor Dad" member="Nisha More" date="Apr 08" status="Overdue" />
              </tbody>
            </table>
          </div>

          {/* QR ACCESS CARD */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-4">
               <QrCode size={18} className="text-blue-500" />
               <h3 className="font-bold text-gray-800">Student AI Access</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
               <QRCodeSVG value={chatUrl} size={150} />
            </div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
              Scan to Ask AI Assistant
            </p>
          </div>
        </div>

        {/* ROW 3: SQUARE STATS & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <SquareCard label="Total Books" value="6,637" icon={<BookOpen />} color="bg-[#00aeef]" />
            <SquareCard label="Total Students" value="524" icon={<GraduationCap />} color="bg-[#4d4d4d]" />
            <SquareCard label="Total Issued" value="196" icon={<ArrowUpCircle />} color="bg-[#f15a24]" />
            <SquareCard label="Total Received" value="46" icon={<ArrowDownCircle />} color="bg-[#fbb03b]" />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
              <h3 className="font-bold text-gray-800 mb-6 border-l-4 border-green-500 pl-3">Monthly Borrowing — 2026</h3>
              <div className="flex items-end justify-between h-40 gap-1 px-2">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                  <div key={m} className="flex flex-col items-center flex-1 gap-1">
                    <div className="flex items-end gap-1 w-full h-32">
                      <div className="bg-blue-400 w-full rounded-t-sm" style={{ height: `${Math.random() * 80 + 10}%` }} />
                      <div className="bg-green-400 w-full rounded-t-sm" style={{ height: `${Math.random() * 80 + 10}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ActionButton label="Add Book" icon={<Plus size={18}/>} color="bg-[#2196f3]" />
              <ActionButton label="Issue Book" icon={<BookMarked size={18}/>} color="bg-[#2ecc71]" />
              <ActionButton label="Return" icon={<RotateCcw size={18}/>} color="bg-[#e67e22]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- REFACTORED SUB-COMPONENTS WITH STRICT TYPES --- */

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} text-white p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden`}>
      <div className="z-10">
        <p className="text-[10px] font-bold uppercase opacity-80 mb-1">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
      <div className="bg-white/20 p-2.5 rounded-xl z-10">{icon}</div>
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
    </div>
  );
}

function SquareCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} text-white p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group`}>
      <div className="bg-white/20 p-4 rounded-full mb-4 z-10">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 32 } as any) : icon}
      </div>
      <p className="text-xs font-bold uppercase opacity-80 mb-1 z-10">{label}</p>
      <p className="text-4xl font-black z-10 tracking-tight">{value}</p>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
    </div>
  );
}

function IssueRow({ title, member, date, status }: IssueRowProps) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
      <td className="py-4 font-bold text-gray-700">{title}</td>
      <td className="py-4 text-gray-500">{member}</td>
      <td className="py-4 text-gray-400 text-xs">{date}</td>
      <td className="py-4 text-center">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
          status === 'Overdue' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
        }`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function ActionButton({ label, icon, color }: ActionButtonProps) {
  return (
    <button className={`${color} text-white flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm shadow-md hover:brightness-95 transition-all active:scale-95 w-full`}>
      {icon} {label}
    </button>
  );
}
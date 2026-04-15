"use client";
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Shield, School } from 'lucide-react';

export default function SignupPage({ onSignupSuccess, onBackToLogin }: { 
  onSignupSuccess: () => void, 
  onBackToLogin: () => void 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Separate college name so it's not sent to the backend
  const [collegeName, setCollegeName] = useState("");
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'ADMIN' 
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Sends only email, password, role
      });

      if (response.ok) {
        // ✅ STORE COLLEGE NAME IN LOCAL STORAGE ONLY
        if (collegeName.trim()) {
          localStorage.setItem('collegeName', collegeName);
        } else {
          localStorage.setItem('collegeName', 'Examot Institution'); // Default fallback
        }

        onSignupSuccess(); 
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Registration failed. Email might already exist.");
      }
    } catch (err) {
      setError("Connection refused. Please ensure your Spring Boot API is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2c3e50] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        
        <div className="bg-[#2ecc71] p-10 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-white/20 p-1.5 rounded-full">
            <Shield size={16} title="Admin Account Only" />
          </div>
          <h2 className="text-4xl font-black tracking-tighter italic uppercase">JOIN US</h2>
          <p className="text-green-100 mt-2 text-[10px] uppercase tracking-widest opacity-80 font-bold">
            Create Admin Account
          </p>
        </div>

        <form className="p-8 space-y-5" onSubmit={handleSignup}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-xs font-medium border border-red-100">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* NEW: College Name Input (Frontend Only) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">College / School Name</label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required 
                type="text" 
                placeholder="Ex: Oxford University" 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-700 transition-all" 
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required 
                type="email" 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-700 transition-all" 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required 
                type="password" 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-700 transition-all" 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "CREATE ADMIN ACCOUNT"}
          </button>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={onBackToLogin}
              className="text-xs text-blue-500 font-bold hover:underline"
            >
              Already an Admin? Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
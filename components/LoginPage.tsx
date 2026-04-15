"use client";
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoToSignup: () => void;
}

export default function LoginPage({ onLoginSuccess, onGoToSignup }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // READ AS TEXT because your backend returns a plain String
      const message = await response.text();

      if (response.ok && message.includes("Login Successful")) {
        // 1. Set simple auth flag in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('adminEmail', formData.email);
        
        // 2. Trigger navigation to Dashboard
        onLoginSuccess();
      } else {
        // Show the error string returned from Spring Boot ("Invalid password ❌", etc.)
        setError(message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Backend unreachable. Check if Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2c3e50] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#3498db] p-10 text-center text-white">
          <h2 className="text-4xl font-black tracking-tighter italic uppercase">EXAMOT</h2>
          <p className="text-blue-100 mt-2 text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">LMS Administration</p>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-xs font-semibold border border-red-100 animate-in fade-in duration-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required type="email" value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="admin@examot.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required type="password" value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#3498db] hover:bg-[#2980b9] text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "SIGN IN"}
          </button>

          <div className="text-center pt-2">
            <button type="button" onClick={onGoToSignup} className="text-[11px] text-[#3498db] font-bold hover:underline">
              Create Admin Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
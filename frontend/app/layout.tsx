"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav'; 
import LoginPage from '@/components/LoginPage';
import SignupPage from '@/components/SignupPage';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [mounted, setMounted] = useState(false);

  // Handle Hydration and Auth Persistence
  useEffect(() => {
    setMounted(true);
    const authStatus = localStorage.getItem('isLoggedIn');
    if (authStatus === 'true') setIsLoggedIn(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  // 1. CRITICAL: Wait for mounting to avoid hydration mismatch
  if (!mounted) {
    return (
      <html lang="en">
        <body className="bg-[#1e293b]" />
      </html>
    );
  }

  // 2. AUTHENTICATION VIEW (Wrapped in html/body)
  if (!isLoggedIn) {
    return (
      <html lang="en">
        <body className="bg-[#1e293b] antialiased">
          {view === 'login' ? (
            <LoginPage 
              onLoginSuccess={handleLoginSuccess} 
              onGoToSignup={() => setView('signup')} 
            />
          ) : (
            <SignupPage 
              onSignupSuccess={handleLoginSuccess} 
              onBackToLogin={() => setView('login')} 
            />
          )}
        </body>
      </html>
    );
  }

  // 3. DASHBOARD VIEW (Wrapped in html/body)
  return (
    <html lang="en">
      <body className="flex h-screen bg-[#f4f7f9] overflow-hidden font-sans text-gray-700 antialiased">
        
        {/* Fixed Sidebar */}
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Navigation */}
          <TopNav onLogout={handleLogout} />
          
          {/* Scrollable Main Area */}
          <main className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
            <div className="p-4 lg:p-6 flex-1">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
              </div>
            </div>
            
            {/* Professional Footer */}
            <footer className="bg-white border-t border-gray-100 py-3 px-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex justify-between shrink-0">
              <span>© 2026 LibraryPro Management</span>
              <span>v1.0.4-Stable</span>
            </footer>
          </main>
        </div>

      </body>
    </html>
  );
}
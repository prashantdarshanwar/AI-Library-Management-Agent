"use client";
import React, { useState, useRef } from 'react';
import { Save, UserPlus, Camera, Fingerprint, IdCard, Info, Loader2, CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function RegisterStudent() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ libraryId: string; fullName: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: 'Computer Science',
    membershipPlan: 'Basic (2 Books / 14 Days)'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null); // Clear error when typing
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit");
        return;
      }

      const reader = new FileReader();
      reader.onloadstart = () => setLoading(true);
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo) {
      setError("Please upload a student photo.");
      return;
    }

    setLoading(true);
    setError(null);

    // Explicitly construct the payload to ensure 'photo' is present
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      department: formData.department,
      membershipPlan: formData.membershipPlan,
      photo: photo // This is the Base64 string
    };

    try {
      const response = await fetch('http://localhost:8080/api/students/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessData({ libraryId: data.libraryId, fullName: payload.fullName });
        // Reset form
        setFormData({ fullName: '', email: '', phoneNumber: '', department: 'Computer Science', membershipPlan: 'Basic (2 Books / 14 Days)' });
        setPhoto(null);
      } else {
        setError(data.message || "Registration failed. Email might already be registered.");
      }
    } catch (err) {
      setError("Connection refused. Please ensure your Spring Boot server is running on port 8080.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      {/* SUCCESS OVERLAY */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-blue-50 text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <button onClick={() => setSuccessData(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200/50"><CheckCircle2 size={40} strokeWidth={2.5} /></div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">Success!</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">Member added to database.</p>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Library ID</div>
              <div className="text-2xl font-mono font-bold text-blue-600 tracking-wider">{successData.libraryId}</div>
              <div className="h-px bg-slate-200 my-3 w-12 mx-auto" />
              <div className="text-sm font-bold text-gray-700">{successData.fullName}</div>
            </div>
            <button onClick={() => setSuccessData(null)} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">Done</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20"><UserPlus size={28} /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Student Registration</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">New Library Member</p>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 animate-pulse">
            <AlertCircle size={18} />
            <span className="text-[10px] font-black uppercase">{error}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className={`w-40 h-40 bg-gray-50 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${photo ? 'border-blue-500' : 'border-gray-200 group-hover:border-blue-400'}`}>
                {photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={32} className="mb-2 text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">Upload Photo</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-3xl text-white">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2"><IdCard size={14} /> System ID</h3>
            <div className="h-10 w-full bg-white/5 rounded-lg border border-white/10 flex items-center px-4 font-mono text-xs text-gray-400 italic">Auto-generated upon save</div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6">Personal Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-700 focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-700 focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-700 focus:border-blue-500 transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6">Academic & Membership</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</label>
                <select name="department" value={formData.department} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-700">
                  <option>Computer Science</option>
                  <option>Architecture</option>
                  <option>Business Management</option>
                  <option>Mechanical Engineering</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Membership Plan</label>
                <select name="membershipPlan" value={formData.membershipPlan} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-700">
                  <option>Basic (2 Books / 14 Days)</option>
                  <option>Premium (5 Books / 30 Days)</option>
                  <option>Elite (10 Books / 60 Days)</option>
                </select>
              </div>
              <div className="col-span-2 pt-4">
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {loading ? "Processing..." : "Complete Registration"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
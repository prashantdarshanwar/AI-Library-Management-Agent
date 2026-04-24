"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, User, Book as BookIcon, ArrowRightCircle, 
  CheckCircle2, Loader2, MapPin, Package, X, ShieldCheck, AlertCircle, Lock 
} from 'lucide-react';

interface Student {
  id: number;
  full_name: string;
  library_id: string;
  department: string;
  membership_plan: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  location: string;
  currentStock: number;
  totalQuantity: number;
}

export default function IssueBookPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isValidatingStudent, setIsValidatingStudent] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [studentId, setStudentId] = useState(""); 
  const [bookSearch, setBookSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ 
    type: null, message: "" 
  });

  const CURRENT_LIBRARIAN_ID = "LIB-2026-04"; 

  // ✅ 1. Updated fetch URL to match IssueController: /api/issue/verify/
  useEffect(() => {
    const validateStudent = async () => {
      if (studentId.trim().length >= 5) {
        setIsValidatingStudent(true);
        setStudentData(null);
        setStatus({ type: null, message: "" });

        try {
          // Changed to /api/issue/verify/ to match your IssueController mapping
          const res = await fetch(`http://localhost:8080/api/issue/verify/${studentId.trim()}`);
          
          if (res.ok) {
            const data: Student = await res.json();
            setStudentData(data);
            setStep(2); 
          } else {
            setStudentData(null);
            setStatus({ type: 'error', message: "Library ID not found in Student records." });
          }
        } catch (err) {
          setStatus({ type: 'error', message: "Server connection failed." });
        } finally {
          setIsValidatingStudent(false);
        }
      } else {
        setStudentData(null);
      }
    };

    const debounceTimer = setTimeout(validateStudent, 700);
    return () => clearTimeout(debounceTimer);
  }, [studentId]);

  // ✅ 2. Book Search Logic
  useEffect(() => {
    const fetchBooks = async () => {
      if (bookSearch.length > 1 && !selectedBook && studentData) {
        try {
          const res = await fetch(`http://localhost:8080/api/books/search?keyword=${bookSearch}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          }
        } catch (err) { console.error("Search failed"); }
      } else { setSearchResults([]); }
    };
    const debounce = setTimeout(fetchBooks, 300);
    return () => clearTimeout(debounce);
  }, [bookSearch, selectedBook, studentData]);

  const handleConfirm = async () => {
    if (!studentData || !selectedBook) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: studentData.library_id, 
          bookId: selectedBook.id, 
          librarianId: CURRENT_LIBRARIAN_ID 
        })
      });
      if (response.ok) {
        setStatus({ type: 'success', message: `Successfully issued to ${studentData.full_name}!` });
        setTimeout(() => resetForm(), 2500);
      } else {
        const msg = await response.text();
        setStatus({ type: 'error', message: msg || "Issuance failed." });
      }
    } catch (error) { setStatus({ type: 'error', message: "Network error." }); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setStudentId("");
    setBookSearch("");
    setSelectedBook(null);
    setStudentData(null);
    setStep(1);
    setStatus({ type: null, message: "" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <ArrowRightCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Issue Transaction</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Session: <span className="text-blue-600">{CURRENT_LIBRARIAN_ID}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Student Library ID Verification */}
          <div className={`bg-white p-6 rounded-2xl border transition-all ${step === 1 ? 'border-blue-500 ring-4 ring-blue-500/5 shadow-sm' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">01</span>
                <h2 className="font-black text-gray-800 uppercase text-xs tracking-widest">Verify Library ID</h2>
              </div>
              {isValidatingStudent && <Loader2 className="animate-spin text-blue-500" size={18} />}
              {!isValidatingStudent && studentData && <CheckCircle2 className="text-green-500" size={18} />}
            </div>
            
            <input 
              type="text" 
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              placeholder="Enter ID (e.g. LIB-2026-0001)" 
              className={`w-full px-6 py-4 bg-gray-50 border rounded-xl outline-none transition-all font-bold tracking-wider ${
                studentData ? 'border-green-500 bg-green-50/20 text-green-700' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            
            {studentData && (
              <div className="mt-4 p-4 bg-green-50/50 rounded-xl border border-green-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <div>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Validated Member</p>
                  <p className="text-sm font-black text-gray-800 uppercase">{studentData.full_name}</p>
                  <p className="text-[10px] text-gray-500 font-bold">{studentData.department} • {studentData.membership_plan}</p>
                </div>
                <div className="bg-white px-3 py-1 rounded-lg border border-green-200 text-[10px] font-bold text-green-600 shadow-sm">
                  ACTIVE
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Book Selection */}
          <div className={`bg-white p-6 rounded-2xl border transition-all relative overflow-hidden ${
            !studentData ? 'opacity-60 grayscale' : (step === 2 ? 'border-blue-500 ring-4 ring-blue-500/5 shadow-sm' : 'border-gray-100')
          }`}>
            {!studentData && (
              <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                 <div className="bg-gray-900 text-white px-5 py-3 rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-2xl">
                   <Lock size={16} className="text-blue-400" /> Verify Library ID First
                 </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">02</span>
              <h2 className="font-black text-gray-800 uppercase text-xs tracking-widest">Select Book</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                value={bookSearch}
                disabled={!studentData}
                onChange={(e) => { setBookSearch(e.target.value); if(selectedBook) setSelectedBook(null); }}
                placeholder="Search Book Title..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-700"
              />
            </div>

            {/* ✅ Added Search Results UI */}
            {searchResults.length > 0 && !selectedBook && (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4 p-1">
                {searchResults.map((book) => (
                  <div 
                    key={book.id} 
                    onClick={() => { setSelectedBook(book); setBookSearch(book.title); setSearchResults([]); }}
                    className="p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-400 cursor-pointer transition-all shadow-sm flex justify-between items-center group"
                  >
                    <div>
                      <h4 className="font-black text-gray-800 text-sm group-hover:text-blue-600 uppercase truncate max-w-xs">{book.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{book.author} • {book.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-blue-600 uppercase">{book.location}</p>
                      <p className={`text-[9px] font-bold ${book.currentStock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        STOCK: {book.currentStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <button 
                onClick={handleConfirm}
                disabled={loading || !studentData || !selectedBook}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Process Issue'}
              </button>
              <button onClick={resetForm} className="px-8 border border-gray-200 rounded-2xl text-gray-400 font-bold uppercase text-[10px] hover:bg-gray-50 transition-colors">Reset</button>
            </div>
            
            {status.message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 border animate-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p className="text-xs font-black uppercase tracking-wider">{status.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Summary Sidebar */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white h-fit sticky top-6 shadow-2xl border border-white/5">
           <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Transaction Summary</h3>
           <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${studentData ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-slate-600'}`}>
                  <User size={16} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Borrower</p>
                  <p className={`font-black text-sm uppercase ${studentData ? 'text-white' : 'text-slate-700'}`}>
                    {studentData ? studentData.full_name : "---"}
                  </p>
                  <p className="text-[10px] text-blue-400 font-bold">{studentId || "Awaiting ID"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedBook ? 'bg-blue-500/20 text-blue-500' : 'bg-white/5 text-slate-600'}`}>
                  <BookIcon size={16} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Book Title</p>
                  <p className={`font-black text-sm uppercase leading-tight ${selectedBook ? 'text-white' : 'text-slate-700'}`}>
                    {selectedBook ? selectedBook.title : "---"}
                  </p>
                  {selectedBook && <p className="text-[9px] text-blue-500 font-bold mt-1 uppercase tracking-tighter">Location: {selectedBook.location}</p>}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
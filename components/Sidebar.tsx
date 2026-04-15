"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Settings, Users, Book, Repeat, 
  Calculator, MessageSquare, BarChart3, UserCircle, 
  GraduationCap, Bell, ChevronRight, PanelLeftClose, PanelLeftOpen 
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  
  { 
    icon: Settings, 
    label: 'Manage Master', 
    href: '/manage-master',
    subItems: [
      { label: 'College Setup', href: '/manage-master/college' },
      { label: 'Category Master', href: '/manage-master/categories' },
      { label: 'Publisher Master', href: '/manage-master/publishers' },
      { label: 'Author Master', href: '/manage-master/authors' },
      { label: 'Rack Management', href: '/manage-master/racks' },
      { label: 'Department Setup', href: '/manage-master/departments' },
    ]
  },

  { 
    icon: Book, 
    label: 'Books Management', 
    href: '/books',
    subItems: [
      { label: 'Add New Book', href: '/books/add' },
      { label: 'Book Inventory', href: '/books/list' },
      { label: 'Bulk Import', href: '/books/import' },
      { label: 'Damaged Books', href: '/books/damaged' },
    ]
  },

  { 
    icon: Repeat, 
    label: 'Issue / Return', 
    href: '/issue-return',
    subItems: [
      { label: 'Issue Book', href: '/issue-return/issue' },
      { label: 'Return / Renew', href: '/issue-return/return' },
      { label: 'Overdue Tracking', href: '/issue-return/overdue' },
    ]
  },

  { 
    icon: GraduationCap, 
    label: 'Students', 
    href: '/students',
    subItems: [
      { label: 'Register Student', href: '/students/add' },
      { label: 'Student Directory', href: '/students/list' },
      { label: 'Promotion Manager', href: '/students/promote' },
    ]
  },

  { 
    icon: UserCircle, 
    label: 'Staff / Faculty', 
    href: '/staff',
    subItems: [
      { label: 'Staff Directory', href: '/staff/list' },
      { label: 'Access Control', href: '/staff/access' },
    ]
  },

  { 
    icon: Calculator, 
    label: 'Accounts & Fines', 
    href: '/accounts',
    subItems: [
      { label: 'Collect Fine', href: '/accounts/collect' },
      { label: 'Fine History', href: '/accounts/history' },
      { label: 'Expense Manager', href: '/accounts/expenses' },
    ]
  },

  { 
    icon: BarChart3, 
    label: 'Reports Central', 
    href: '/reports',
    subItems: [
      { label: 'Daily Transaction', href: '/reports/daily' },
      { label: 'Stock Audit', href: '/reports/audit' },
      { label: 'Fine Report', href: '/reports/fines' },
    ]
  },

  { 
    icon: MessageSquare, 
    label: 'Communication', 
    href: '/communication',
    subItems: [
      { label: 'SMS Alerts', href: '/communication/sms' },
      { label: 'Email Notices', href: '/communication/email' },
    ]
  },

  { icon: Bell, label: 'Notifications', href: '/notifications' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string | null>(null);
  const [collegeName, setCollegeName] = useState("LibraryPro");
  const pathname = usePathname();

  useEffect(() => {
    const savedName = localStorage.getItem('collegeName');
    if (savedName) setCollegeName(savedName);
  }, []);

  // Closes submenus when collapsing sidebar
  useEffect(() => {
    if (isCollapsed) setOpenMenus(null);
  }, [isCollapsed]);

  const toggleMenu = (label: string) => {
    if (isCollapsed) return;
    setOpenMenus(prev => (prev === label ? null : label));
  };

  return (
    <aside 
      className={`bg-[#1e293b] text-gray-400 flex flex-col h-screen sticky top-0 border-r border-gray-800 shrink-0 select-none transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* --- HEADER --- */}
      <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-[#1e293b] h-16 overflow-hidden">
        {!isCollapsed && (
          <div className="flex items-center gap-2 animate-in fade-in duration-500">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
              <div className="w-1.5 h-4 bg-yellow-400 rounded-full"></div>
              <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-lg font-black text-white tracking-tighter uppercase italic truncate">{collegeName}</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {!isCollapsed && (
          <p className="px-6 text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest opacity-60">Main Menu</p>
        )}
        
        <div className="space-y-1">
          {menuItems.map((item) => {
            const hasSubItems = !!item.subItems;
            const isMenuOpen = openMenus === item.label;
            const isActive = pathname === item.href || (hasSubItems && pathname.startsWith(item.href));

            return (
              <div key={item.label} className="flex flex-col relative group">
                <div 
                  onClick={() => hasSubItems ? toggleMenu(item.label) : null}
                  className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all duration-150 border-r-4
                    ${isActive ? 'bg-blue-600/10 text-blue-400 border-blue-500' : 'hover:bg-gray-800/50 hover:text-white border-transparent'}`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <item.icon size={20} className={`${!isCollapsed ? 'mr-3' : ''} ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    {!isCollapsed && (
                      hasSubItems ? (
                        <span className="text-[13px] font-bold tracking-wide flex-1">{item.label}</span>
                      ) : (
                        <Link href={item.href} className="text-[13px] font-bold tracking-wide flex-1">{item.label}</Link>
                      )
                    )}
                  </div>
                  
                  {!isCollapsed && hasSubItems && (
                    <div className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}>
                      <ChevronRight size={14} />
                    </div>
                  )}

                  {/* Tooltip for small view */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-[11px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-gray-700">
                      {item.label}
                    </div>
                  )}
                </div>

                {/* --- SUBMENU --- */}
                {!isCollapsed && hasSubItems && isMenuOpen && (
                  <div className="bg-[#161e2d] py-1 shadow-inner animate-in slide-in-from-top-2 duration-300 border-l border-blue-500/20 ml-8 mr-2 rounded-md">
                    {item.subItems?.map((sub) => (
                      <Link key={sub.label} href={sub.href}>
                        <div className={`pl-6 pr-4 py-2 text-[12px] font-semibold transition-colors flex items-center gap-2
                          ${pathname === sub.href ? 'text-blue-400 bg-blue-400/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                          <div className={`w-1 h-1 rounded-full ${pathname === sub.href ? 'bg-blue-400' : 'bg-gray-700'}`} />
                          {sub.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* --- BOTTOM SETTINGS --- */}
      <div className="mt-auto border-t border-gray-800">
        <Link href="/settings">
          <div className={`flex items-center px-6 py-4 cursor-pointer hover:bg-gray-800 text-blue-500 transition-colors group ${isCollapsed ? 'justify-center' : ''}`}>
            <Settings size={20} className={`${!isCollapsed ? 'mr-3' : ''} group-hover:rotate-45 transition-transform`} />
            {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Settings</span>}
          </div>
        </Link>
      </div>
    </aside>
  );
}
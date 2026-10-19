import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  ChevronRight,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  ShieldAlert,
  LogOut,
  Sliders,
  Check
} from 'lucide-react';
import { useFDR } from '../../context/FDRContext';

export default function TopNavbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    fdrs,
    institutions,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    currentUser,
    globalSearch,
    setGlobalSearch
  } = useFDR();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Dynamic breadcrumb
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbMap = {
    '': 'Dashboard',
    'repository': 'FDR Repository',
    'register': 'Register New FDR',
    'institutions': 'Institutions',
    'maturity-tracker': 'Maturity Tracker',
    'renewals': 'Renewal Management',
    'release-requests': 'Release / Refund Requests',
    'reports': 'Reports & Analytics',
    'audit-trail': 'Audit Trail',
    'settings': 'Settings'
  };

  // Search results
  const searchResults = globalSearch.trim().length > 1
    ? {
        fdrs: fdrs.filter(f =>
          f.fdrNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
          f.institutionName.toLowerCase().includes(globalSearch.toLowerCase()) ||
          f.bank.toLowerCase().includes(globalSearch.toLowerCase())
        ).slice(0, 4),
        institutions: institutions.filter(i =>
          i.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
          i.aicteId.toLowerCase().includes(globalSearch.toLowerCase()) ||
          i.region.toLowerCase().includes(globalSearch.toLowerCase())
        ).slice(0, 3)
      }
    : null;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg border border-[#E2E8F0] text-[#172B4D] hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="flex items-center gap-1.5 text-xs text-[#6B7A90]">
            <Link to="/" className="hover:text-[#142B4A] font-medium">
              AICTE Portal
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#142B4A]">
              {breadcrumbMap[pathnames[0] || ''] || 'Dashboard'}
            </span>
          </nav>
        </div>

        {/* Center: Global Search Input */}
        <div className="relative flex-1 max-w-md hidden sm:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A90]" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search by Institution, FDR Ref, or Bank..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F4F7FB] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#142B4A]/20 focus:border-[#142B4A] transition-all text-[#172B4D] placeholder-[#6B7A90]"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Search Dropdown Preview */}
          {searchFocused && searchResults && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden z-50 text-xs">
              <div className="p-2 border-b border-slate-100 bg-[#F4F7FB] text-[11px] font-bold text-[#6B7A90] uppercase tracking-wider">
                Matching Records
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {searchResults.fdrs.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      setGlobalSearch('');
                      setSearchFocused(false);
                      navigate('/repository');
                    }}
                    className="p-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-[#142B4A] block">{f.institutionName}</span>
                      <span className="text-[11px] text-[#6B7A90] font-mono">{f.fdrNumber} • {f.bank}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#244B75]">₹{Number(f.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}

                {searchResults.institutions.map((inst) => (
                  <div
                    key={inst.id}
                    onClick={() => {
                      setGlobalSearch('');
                      setSearchFocused(false);
                      navigate('/institutions');
                    }}
                    className="p-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-[#172B4D] block">{inst.name}</span>
                      <span className="text-[11px] text-[#6B7A90]">ID: {inst.aicteId} • {inst.region}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">Institution</span>
                  </div>
                ))}

                {searchResults.fdrs.length === 0 && searchResults.institutions.length === 0 && (
                  <div className="p-4 text-center text-[#6B7A90]">
                    No matching FDR or Institution found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Date, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Current Date Display */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#6B7A90] bg-[#F4F7FB] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0]">
            <Calendar className="w-3.5 h-3.5 text-[#244B75]" />
            <span className="font-medium text-[#172B4D]">{todayFormatted}</span>
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F4F7FB] text-[#172B4D] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#172B4D]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C84444] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 bg-[#142B4A] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Administrative Alerts</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold">{unreadCount} New</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        markNotificationRead(item.id);
                        if (item.link) navigate(item.link);
                        setNotifOpen(false);
                      }}
                      className={`p-3 text-xs hover:bg-[#F4F7FB] cursor-pointer transition-colors ${
                        !item.read ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {item.type === 'danger' ? (
                            <ShieldAlert className="w-4 h-4 text-[#C84444]" />
                          ) : item.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4 text-[#D99119]" />
                          ) : (
                            <Info className="w-4 h-4 text-[#244B75]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-[#172B4D] truncate">{item.title}</span>
                            <span className="text-[10px] text-[#6B7A90] shrink-0">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-[#6B7A90] mt-0.5 line-clamp-2">{item.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-[#E2E8F0] bg-[#F4F7FB] text-center">
                  <Link
                    to="/audit-trail"
                    onClick={() => setNotifOpen(false)}
                    className="text-[11px] font-semibold text-[#244B75] hover:underline"
                  >
                    View System Audit Logs →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F4F7FB] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#142B4A] text-white flex items-center justify-center text-xs font-bold">
                {currentUser.avatar || 'RS'}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <span className="text-xs font-semibold text-[#172B4D] block leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#6B7A90] leading-none mt-0.5 block">
                  AICTE HQs
                </span>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden z-50 text-xs">
                <div className="p-3 bg-[#F4F7FB] border-b border-[#E2E8F0]">
                  <p className="font-bold text-[#142B4A]">{currentUser.name}</p>
                  <p className="text-[11px] text-[#6B7A90]">{currentUser.role}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
                </div>

                <div className="p-1">
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#F4F7FB] text-[#172B4D]"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#6B7A90]" />
                    Portal Settings & Thresholds
                  </Link>
                  <Link
                    to="/institutions"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#F4F7FB] text-[#172B4D]"
                  >
                    <User className="w-3.5 h-3.5 text-[#6B7A90]" />
                    AICTE Institutional Registry
                  </Link>
                </div>

                <div className="p-2 border-t border-[#E2E8F0] bg-slate-50">
                  <div className="text-[10px] text-slate-500 leading-tight">
                    Authorized AICTE Official Portal Session. Role: <strong>Bureau Director</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

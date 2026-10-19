import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderArchive,
  Building,
  Clock,
  RefreshCw,
  HandCoins,
  BarChart3,
  History,
  Settings,
  Shield,
  X,
  ExternalLink
} from 'lucide-react';
import { useFDR } from '../../context/FDRContext';

export default function Sidebar({ isOpen, onClose }) {
  const { metrics, currentUser } = useFDR();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'FDR Repository', path: '/repository', icon: FolderArchive, badge: metrics.totalFDRs },
    { name: 'Institutions', path: '/institutions', icon: Building },
    { name: 'Maturity Tracker', path: '/maturity-tracker', icon: Clock, badge: metrics.expiring30FDRs > 0 ? metrics.expiring30FDRs : null, badgeVariant: 'warning' },
    { name: 'Renewal Management', path: '/renewals', icon: RefreshCw, badge: metrics.pendingRenewalsCount > 0 ? metrics.pendingRenewalsCount : null, badgeVariant: 'blue' },
    { name: 'Release / Refund Requests', path: '/release-requests', icon: HandCoins, badge: metrics.pendingReleaseCount > 0 ? metrics.pendingReleaseCount : null, badgeVariant: 'rose' },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Audit Trail', path: '/audit-trail', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#142B4A] text-white flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#244B75] shadow-xl md:shadow-none`}
      >
        {/* Emblem & Branding Header */}
        <div className="p-5 border-b border-[#244B75]/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Government Emblem Symbol */}
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1.5 border border-white/20 shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400 fill-current">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="none" />
                <circle cx="50" cy="50" r="14" fill="currentColor" />
                <path d="M50 8 L50 24 M50 76 L50 92 M8 50 L24 50 M76 50 L92 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <path d="M20 20 L32 32 M68 68 L80 80 M20 80 L32 68 M68 32 L80 20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-wider text-white">AICTE</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-500/30">GOVT</span>
              </div>
              <p className="text-[11px] font-medium text-slate-300 tracking-tight leading-tight">
                Security Deposit Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768 && onClose) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#244B75] text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100" />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.badgeVariant === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : item.badgeVariant === 'rose'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.badgeVariant === 'blue'
                        ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* AICTE Policy Badge / Compliance Notice */}
        <div className="mx-3 my-2 p-3 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>AICTE Approval Norms</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Joint FDRs under Regulation 2024-27. Mandatory pledge to Member Secretary AICTE.
          </p>
        </div>

        {/* Signed-in User Section at Bottom */}
        <div className="p-3 border-t border-[#244B75]/70 bg-black/15">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-xs font-bold text-white shadow">
              {currentUser.avatar || 'RS'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { Info, ShieldAlert } from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Header */}
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Prototype Environment Notice Banner */}
        <div className="bg-[#142B4A]/90 text-white text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-[#244B75]">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-amber-400 text-[#142B4A] font-extrabold text-[10px] px-1.5 py-0.2 rounded uppercase tracking-wider">
              Prototype Mode
            </span>
            <span className="text-slate-200">
              AICTE Regulatory Demonstration — Simulated administrative state with local persistence.
            </span>
          </div>
          <span className="hidden sm:inline text-slate-300 text-[10px] tracking-wide">
            Approval Bureau • Joint FDR Regulations
          </span>
        </div>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Government Footer */}
        <footer className="mt-auto border-t border-[#E2E8F0] bg-white py-4 px-6 text-xs text-[#6B7A90] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>All India Council for Technical Education (AICTE)</strong> — Statutory Body under Ministry of Education, Govt. of India.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Nelson Mandela Marg, Vasant Kunj, New Delhi-110070</span>
            <span>•</span>
            <span className="font-mono">Security Deposit & FDR System v2.4</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

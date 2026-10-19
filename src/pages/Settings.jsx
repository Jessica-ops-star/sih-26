import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Bell,
  Clock,
  RotateCcw,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  Lock,
  Mail,
  Smartphone
} from 'lucide-react';
import { useFDR } from '../context/FDRContext';

export default function Settings() {
  const { settings, setSettings, currentUser, setCurrentUser, resetToMockData } = useFDR();

  const [savedToast, setSavedToast] = useState('');
  const [localSettings, setLocalSettings] = useState(settings);

  // Available demonstration roles
  const demoRoles = [
    {
      name: 'Dr. Rajeev Sharma',
      role: 'Director (Approval Bureau)',
      office: 'AICTE Headquarters, New Delhi',
      email: 'director.ab@aicte-india.org',
      avatar: 'RS',
      permissions: ['Full Verification Authority', 'Approval / Release Signatory', 'Regulatory Ledger Access']
    },
    {
      name: 'Smt. Meenakshi Sundaram',
      role: 'Regional Officer (Southern Region)',
      office: 'AICTE Regional Office, Chennai',
      email: 'ro.chennai@aicte-india.org',
      avatar: 'MS',
      permissions: ['Regional FDR Scrutiny', 'Notice Dispatch', 'Renewal Verification']
    },
    {
      name: 'Shri Amit Verma',
      role: 'Finance & Deposit Review Officer',
      office: 'Finance Bureau, AICTE New Delhi',
      email: 'finance.officer@aicte-india.org',
      avatar: 'AV',
      permissions: ['Deposit Reconciliation', 'Bank Lien Scrutiny', 'Audit Export']
    }
  ];

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    setSavedToast(`Active user switched to ${user.name} (${user.role})`);
    setTimeout(() => setSavedToast(''), 3000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettings(localSettings);
    setSavedToast('Portal preferences and maturity thresholds saved successfully.');
    setTimeout(() => setSavedToast(''), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all prototype records back to initial AICTE demonstration state? All newly created FDRs and changes will be cleared.')) {
      resetToMockData();
      setSavedToast('Prototype state restored to clean initial mock dataset.');
      setTimeout(() => setSavedToast(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-5">
        <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight">
          Portal Settings & Administrative Preferences
        </h1>
        <p className="text-xs text-[#6B7A90] mt-1">
          Configure demonstration thresholds, notification dispatch rules, and test active reviewer role identities.
        </p>
      </div>

      {savedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16845B] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Role & Permissions Switcher */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 text-sm font-bold text-[#142B4A]">
          <User className="w-4 h-4 text-[#244B75]" />
          Authorized Official Identity & Role Switcher
        </div>

        <p className="text-xs text-[#6B7A90]">
          Switch active user persona to simulate differing levels of regional and headquarters approval authority.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {demoRoles.map((roleUser) => {
            const isSelected = currentUser.email === roleUser.email;
            return (
              <div
                key={roleUser.email}
                onClick={() => handleSwitchUser(roleUser)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#142B4A] bg-[#142B4A]/5 ring-1 ring-[#142B4A]'
                    : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#142B4A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {roleUser.avatar}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-[#142B4A] block truncate">{roleUser.name}</span>
                    <span className="text-[11px] text-[#244B75] font-medium block truncate">{roleUser.role}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] space-y-1 text-[#6B7A90]">
                  <p className="truncate font-mono">{roleUser.office}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {roleUser.permissions.map(p => (
                      <span key={p} className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] text-[#172B4D]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thresholds and Notifications Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Maturity reminder intervals */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 text-sm font-bold text-[#142B4A]">
            <Clock className="w-4 h-4 text-[#244B75]" />
            Configurable Maturity Alert Thresholds
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D99119] mt-0.5" />
            <span>
              <strong>Regulatory Notice:</strong> These reminder horizons represent configurable prototype parameters and do not supersede statutory deadlines prescribed in the AICTE Approval Process Handbook.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Stage 1 Notice</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={localSettings.reminderThresholds[0]}
                  onChange={(e) => {
                    const arr = [...localSettings.reminderThresholds];
                    arr[0] = Number(e.target.value);
                    setLocalSettings({ ...localSettings, reminderThresholds: arr });
                  }}
                  className="w-20 p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] font-semibold text-center"
                />
                <span className="text-[#6B7A90]">Days Before</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Stage 2 Notice</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={localSettings.reminderThresholds[1]}
                  onChange={(e) => {
                    const arr = [...localSettings.reminderThresholds];
                    arr[1] = Number(e.target.value);
                    setLocalSettings({ ...localSettings, reminderThresholds: arr });
                  }}
                  className="w-20 p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] font-semibold text-center"
                />
                <span className="text-[#6B7A90]">Days Before</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Urgent Alert</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={localSettings.reminderThresholds[2]}
                  onChange={(e) => {
                    const arr = [...localSettings.reminderThresholds];
                    arr[2] = Number(e.target.value);
                    setLocalSettings({ ...localSettings, reminderThresholds: arr });
                  }}
                  className="w-20 p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] font-semibold text-center"
                />
                <span className="text-[#6B7A90]">Days Before</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Final Show-Cause</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={localSettings.reminderThresholds[3] || 7}
                  onChange={(e) => {
                    const arr = [...localSettings.reminderThresholds];
                    arr[3] = Number(e.target.value);
                    setLocalSettings({ ...localSettings, reminderThresholds: arr });
                  }}
                  className="w-20 p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] font-semibold text-center"
                />
                <span className="text-[#6B7A90]">Days Before</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch Preferences */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 text-sm font-bold text-[#142B4A]">
            <Bell className="w-4 h-4 text-[#244B75]" />
            Simulated Notification & Escalation Channels
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F4F7FB] cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#244B75]" />
                <div>
                  <span className="font-semibold text-[#172B4D] block">Automated Email Dispatch</span>
                  <span className="text-[11px] text-[#6B7A90]">Send pre-expiry notices directly to registered Trust Registrar email</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.emailAlerts}
                onChange={(e) => setLocalSettings({ ...localSettings, emailAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[#142B4A]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F4F7FB] cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#244B75]" />
                <div>
                  <span className="font-semibold text-[#172B4D] block">SMS Alert Gateway</span>
                  <span className="text-[11px] text-[#6B7A90]">Push urgent SMS alerts for FDRs maturing within 7 days</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.smsAlerts}
                onChange={(e) => setLocalSettings({ ...localSettings, smsAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[#142B4A]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F4F7FB] cursor-pointer">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                <div>
                  <span className="font-semibold text-[#172B4D] block">Auto-Escalate Overdue FDRs</span>
                  <span className="text-[11px] text-[#6B7A90]">Flag expired deposits without renewal directly to AICTE Regional Officer scrutiny dashboard</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.autoEscalateOverdue}
                onChange={(e) => setLocalSettings({ ...localSettings, autoEscalateOverdue: e.target.checked })}
                className="w-4 h-4 rounded text-[#142B4A]"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#244B75] shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>

      {/* Demo Reset Card */}
      <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-[#C84444] block">Prototype Data Management</span>
          <span className="text-[#6B7A90]">Reset local browser storage and return all records to standard demonstration state.</span>
        </div>
        <button
          onClick={handleResetData}
          className="px-3.5 py-2 rounded-lg border border-rose-300 bg-white text-[#C84444] text-xs font-semibold hover:bg-rose-50 flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>
    </div>
  );
}

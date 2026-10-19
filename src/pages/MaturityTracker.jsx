import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Send,
  CheckCircle,
  Eye,
  RefreshCw,
  Landmark,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useFDR } from '../context/FDRContext';
import StatusBadge from '../components/common/StatusBadge';
import FDRDetailsModal from '../components/common/FDRDetailsModal';
import { formatINR, formatDate, getDaysRemaining, getComputedStatus } from '../utils/helpers';
import { AICTE_REGIONS } from '../data/mockData';

export default function MaturityTracker() {
  const navigate = useNavigate();
  const { fdrs, addAuditLog } = useFDR();

  const [activeBucket, setActiveBucket] = useState('all'); // 'all' | 'matured' | '7days' | '30days' | '60days' | '90days'
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [selectedFDR, setSelectedFDR] = useState(null);
  const [reminderToast, setReminderToast] = useState('');

  // Enhanced FDRs with days remaining
  const classifiedFDRs = useMemo(() => {
    return fdrs.map(f => {
      const days = getDaysRemaining(f.maturityDate);
      let bucket = 'long_term';
      if (days < 0) bucket = 'matured';
      else if (days <= 7) bucket = '7days';
      else if (days <= 30) bucket = '30days';
      else if (days <= 60) bucket = '60days';
      else if (days <= 90) bucket = '90days';

      return {
        ...f,
        daysRemaining: days,
        bucket,
        computedStatus: getComputedStatus(f)
      };
    }).filter(f => f.status !== 'Released');
  }, [fdrs]);

  // Bucket Counts
  const bucketCounts = {
    matured: classifiedFDRs.filter(f => f.bucket === 'matured').length,
    '7days': classifiedFDRs.filter(f => f.bucket === '7days').length,
    '30days': classifiedFDRs.filter(f => f.bucket === '30days').length,
    '60days': classifiedFDRs.filter(f => f.bucket === '60days').length,
    '90days': classifiedFDRs.filter(f => f.bucket === '90days').length
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return classifiedFDRs.filter(f => {
      const matchBucket =
        activeBucket === 'all'
          ? true
          : f.bucket === activeBucket;

      const matchInst =
        f.institutionName.toLowerCase().includes(institutionFilter.toLowerCase()) ||
        f.fdrNumber.toLowerCase().includes(institutionFilter.toLowerCase()) ||
        f.bank.toLowerCase().includes(institutionFilter.toLowerCase());

      const matchRegion =
        regionFilter === 'All' ? true : f.region.includes(regionFilter);

      return matchBucket && matchInst && matchRegion;
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [classifiedFDRs, activeBucket, institutionFilter, regionFilter]);

  const handleSendUrgentReminder = (fdr) => {
    addAuditLog({
      action: 'Simulated Maturity Notice Sent',
      institution: fdr.institutionName,
      fdrReference: fdr.fdrNumber,
      previousStatus: fdr.status,
      newStatus: fdr.status,
      details: `Official pre-expiry alert letter emailed to Registrar/Principal for FDR maturing in ${fdr.daysRemaining} days.`
    });
    setReminderToast(`Formal compliance notice dispatched to ${fdr.institutionName}`);
    setTimeout(() => setReminderToast(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-5">
        <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight">
          FDR Maturity Tracker & Timeline
        </h1>
        <p className="text-xs text-[#6B7A90] mt-1">
          Proactive timeline surveillance of fixed deposit maturities to prevent lapse of joint AICTE security pledges.
        </p>
      </div>

      {/* Reminder Notification Toast */}
      {reminderToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16845B] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{reminderToast}</span>
          </div>
        </div>
      )}

      {/* Legal & Regulatory Disclaimer Notice */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 text-[#D99119] mt-0.5" />
        <div className="leading-relaxed">
          <strong>Official AICTE Verification Disclaimer:</strong> Maturity tracking alerts displayed below are computed automatically from recorded issue and maturity dates on file. They do not constitute real-time commercial bank confirmation or auto-debit release. Physical bank confirmation is required.
        </div>
      </div>

      {/* Timeline Bucket Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveBucket('all')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeBucket === 'all'
              ? 'bg-[#142B4A] text-white border-[#142B4A] shadow-md'
              : 'bg-white text-[#172B4D] border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase block ${activeBucket === 'all' ? 'text-slate-300' : 'text-[#6B7A90]'}`}>
            All Horizons
          </span>
          <span className="text-xl font-bold mt-1 block">
            {classifiedFDRs.length}
          </span>
          <span className="text-[10px] opacity-75">Full register</span>
        </button>

        <button
          onClick={() => setActiveBucket('matured')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeBucket === 'matured'
              ? 'bg-[#C84444] text-white border-[#C84444] shadow-md'
              : 'bg-white text-[#172B4D] border-rose-200 hover:bg-rose-50/40'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase block ${activeBucket === 'matured' ? 'text-rose-100' : 'text-[#C84444]'}`}>
            Already Matured
          </span>
          <span className="text-xl font-bold mt-1 block">
            {bucketCounts.matured}
          </span>
          <span className="text-[10px] opacity-75">Overdue action</span>
        </button>

        <button
          onClick={() => setActiveBucket('7days')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeBucket === '7days'
              ? 'bg-[#D99119] text-white border-[#D99119] shadow-md'
              : 'bg-white text-[#172B4D] border-amber-200 hover:bg-amber-50/40'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase block ${activeBucket === '7days' ? 'text-amber-100' : 'text-[#D99119]'}`}>
            Next 7 Days
          </span>
          <span className="text-xl font-bold mt-1 block">
            {bucketCounts['7days']}
          </span>
          <span className="text-[10px] opacity-75">Immediate critical</span>
        </button>

        <button
          onClick={() => setActiveBucket('30days')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeBucket === '30days'
              ? 'bg-[#244B75] text-white border-[#244B75] shadow-md'
              : 'bg-white text-[#172B4D] border-blue-200 hover:bg-blue-50/40'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase block ${activeBucket === '30days' ? 'text-blue-100' : 'text-[#244B75]'}`}>
            Next 30 Days
          </span>
          <span className="text-xl font-bold mt-1 block">
            {bucketCounts['30days']}
          </span>
          <span className="text-[10px] opacity-75">Notice period</span>
        </button>

        <button
          onClick={() => setActiveBucket('60days')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeBucket === '60days'
              ? 'bg-slate-700 text-white border-slate-700 shadow-md'
              : 'bg-white text-[#172B4D] border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase block ${activeBucket === '60days' ? 'text-slate-300' : 'text-[#6B7A90]'}`}>
            Next 60 Days
          </span>
          <span className="text-xl font-bold mt-1 block">
            {bucketCounts['60days']}
          </span>
          <span className="text-[10px] opacity-75">Upcoming schedule</span>
        </button>

        <button
          onClick={() => setActiveBucket('90days')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeBucket === '90days'
              ? 'bg-slate-800 text-white border-slate-800 shadow-md'
              : 'bg-white text-[#172B4D] border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase block ${activeBucket === '90days' ? 'text-slate-300' : 'text-[#6B7A90]'}`}>
            Next 90 Days
          </span>
          <span className="text-xl font-bold mt-1 block">
            {bucketCounts['90days']}
          </span>
          <span className="text-[10px] opacity-75">Planning horizon</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-[#6B7A90] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Institution, FDR ref, or Bank..."
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D]"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D]"
          >
            {AICTE_REGIONS.map(r => (
              <option key={r} value={r === 'All Regions' ? 'All' : r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Cards Grid */}
      <div className="space-y-3">
        {filteredList.length > 0 ? (
          filteredList.map((fdr) => {
            const isMatured = fdr.daysRemaining < 0;
            const isCritical = fdr.daysRemaining >= 0 && fdr.daysRemaining <= 15;
            const isNotice = fdr.daysRemaining > 15 && fdr.daysRemaining <= 30;

            let cardBorder = 'border-[#E2E8F0]';
            let urgencyBadge = null;

            if (isMatured) {
              cardBorder = 'border-rose-300 bg-rose-50/20';
              urgencyBadge = (
                <span className="bg-rose-100 text-[#C84444] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Matured ({Math.abs(fdr.daysRemaining)} days ago)
                </span>
              );
            } else if (isCritical) {
              cardBorder = 'border-amber-300 bg-amber-50/20';
              urgencyBadge = (
                <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Expiring in {fdr.daysRemaining} days!
                </span>
              );
            } else if (isNotice) {
              cardBorder = 'border-blue-200 bg-blue-50/15';
              urgencyBadge = (
                <span className="bg-blue-100 text-[#244B75] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                  {fdr.daysRemaining} days remaining
                </span>
              );
            } else {
              urgencyBadge = (
                <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                  {fdr.daysRemaining} days remaining
                </span>
              );
            }

            return (
              <div
                key={fdr.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all ${cardBorder} flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-[#142B4A] truncate">
                      {fdr.institutionName}
                    </h3>
                    {urgencyBadge}
                    <StatusBadge status={fdr.computedStatus} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7A90]">
                    <span className="font-mono text-[#172B4D]">Ref: {fdr.fdrNumber}</span>
                    <span>•</span>
                    <span>Bank: <strong className="text-[#172B4D]">{fdr.bank}</strong></span>
                    <span>•</span>
                    <span>Region: {fdr.region}</span>
                  </div>

                  <p className="text-[11px] text-[#6B7A90] italic">
                    Purpose: {fdr.purpose}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-[#6B7A90] block">Maturity Date</span>
                    <span className="text-sm font-bold text-[#172B4D] block">{formatDate(fdr.maturityDate)}</span>
                    <span className="text-xs font-extrabold text-[#142B4A]">{formatINR(fdr.amount)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFDR(fdr)}
                      className="px-3 py-1.5 bg-[#F4F7FB] border border-[#E2E8F0] hover:bg-[#142B4A] hover:text-white text-[#244B75] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>

                    <button
                      onClick={() => handleSendUrgentReminder(fdr)}
                      className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#172B4D] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5 text-[#6B7A90]" /> Send Notice
                    </button>

                    <button
                      onClick={() => navigate('/renewals')}
                      className="px-3 py-1.5 bg-[#142B4A] hover:bg-[#244B75] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Renewal
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center text-[#6B7A90]">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#172B4D]">No FDRs Found in this Horizon</p>
            <p className="text-xs text-[#6B7A90] mt-1">
              There are no deposits matching your current timeline filter ({activeBucket}).
            </p>
          </div>
        )}
      </div>

      {/* Details modal */}
      <FDRDetailsModal
        fdr={selectedFDR}
        isOpen={!!selectedFDR}
        onClose={() => setSelectedFDR(null)}
        onOpenRenewal={() => navigate('/renewals')}
      />
    </div>
  );
}

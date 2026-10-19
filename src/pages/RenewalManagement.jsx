import React, { useState } from 'react';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Eye,
  X,
  History,
  FileText,
  Landmark,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useFDR } from '../context/FDRContext';
import StatusBadge from '../components/common/StatusBadge';
import { formatINR, formatDate } from '../utils/helpers';

export default function RenewalManagement() {
  const { renewals, updateRenewal, currentUser } = useFDR();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRenewal, setSelectedRenewal] = useState(null);

  // Modal update state
  const [replacementRef, setReplacementRef] = useState('');
  const [newStatus, setNewStatus] = useState('Approved & Replaced');
  const [actionNotes, setActionNotes] = useState('');
  const [uploadedMockFile, setUploadedMockFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const filteredRenewals = renewals.filter(r =>
    r.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.existingFdrRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.assignedOfficial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenActionModal = (renewal) => {
    setSelectedRenewal(renewal);
    setReplacementRef(renewal.replacementFdrRef !== 'Pending Submission' ? renewal.replacementFdrRef : `FDR/SBI/2026/REN-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewStatus('Approved & Replaced');
    setActionNotes('');
    setUploadedMockFile(null);
  };

  const handleSaveRenewalUpdate = (e) => {
    e.preventDefault();
    if (!selectedRenewal) return;

    setIsUpdating(true);
    setTimeout(() => {
      updateRenewal(
        selectedRenewal.id,
        newStatus,
        replacementRef,
        actionNotes || `Administrative decision: Marked ${newStatus} by ${currentUser.name}`
      );

      setIsUpdating(false);
      setToastMessage(`Renewal updated for ${selectedRenewal.institution} (${newStatus})`);
      setSelectedRenewal(null);
      setTimeout(() => setToastMessage(''), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight">
            FDR Renewal Management
          </h1>
          <span className="text-[10px] bg-blue-100 text-[#244B75] font-bold px-2 py-0.5 rounded-full border border-blue-200">
            Lifecycle Workflow
          </span>
        </div>
        <p className="text-xs text-[#6B7A90] mt-1">
          Review, scrutinize replacement joint FDR receipts and maintain continuity of AICTE institutional deposits.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16845B] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#6B7A90]">Active Renewal Cases</span>
          <p className="text-2xl font-bold text-[#142B4A] mt-1">
            {renewals.filter(r => r.renewalStatus !== 'Approved & Replaced').length} Pending
          </p>
          <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">Notice period active</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#6B7A90]">Under AICTE Review</span>
          <p className="text-2xl font-bold text-[#244B75] mt-1">
            {renewals.filter(r => r.renewalStatus === 'Under AICTE Review').length} Documents
          </p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Awaiting bank endorsement check</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#6B7A90]">Successfully Replaced</span>
          <p className="text-2xl font-bold text-[#16845B] mt-1">
            {renewals.filter(r => r.renewalStatus === 'Approved & Replaced').length} Approved
          </p>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">5-year extension logged</span>
        </div>
      </div>

      {/* Table & Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#6B7A90] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search renewal records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D]"
            />
          </div>

          <span className="text-xs text-[#6B7A90]">
            Showing <strong>{filteredRenewals.length}</strong> renewal files
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider text-[#6B7A90] font-semibold">
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-3">Existing FDR Ref</th>
                <th className="py-3 px-3">Maturity Date</th>
                <th className="py-3 px-3">Renewal Status</th>
                <th className="py-3 px-3">Replacement FDR Ref</th>
                <th className="py-3 px-3">Last Action</th>
                <th className="py-3 px-3">Assigned Official</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredRenewals.map((r) => (
                <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#142B4A] block">
                      {r.institution}
                    </span>
                    <span className="text-[10px] text-[#6B7A90] font-mono">
                      Amount: {formatINR(r.amount)}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-medium text-[#172B4D]">
                    {r.existingFdrRef}
                  </td>

                  <td className="py-3.5 px-3 text-[#172B4D]">
                    {formatDate(r.maturityDate)}
                  </td>

                  <td className="py-3.5 px-3">
                    <StatusBadge status={r.renewalStatus} size="sm" />
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[#244B75]">
                    {r.replacementFdrRef || 'Pending'}
                  </td>

                  <td className="py-3.5 px-3 text-[#6B7A90] max-w-xs truncate" title={r.lastAction}>
                    {r.lastAction}
                  </td>

                  <td className="py-3.5 px-3 text-[#172B4D]">
                    {r.assignedOfficial}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleOpenActionModal(r)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-[#142B4A] text-white hover:bg-[#244B75] transition-colors"
                    >
                      Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action & Upload Modal */}
      {selectedRenewal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#142B4A] text-white p-5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Process FDR Renewal / Replacement</h3>
              </div>
              <button
                onClick={() => setSelectedRenewal(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRenewalUpdate} className="p-6 space-y-4 text-xs">
              <div className="bg-[#F4F7FB] p-3.5 rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#6B7A90]">Institution:</span>
                  <span className="font-bold text-[#142B4A]">{selectedRenewal.institution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7A90]">Existing FDR Ref:</span>
                  <span className="font-mono font-semibold text-[#172B4D]">{selectedRenewal.existingFdrRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7A90]">Principal Amount:</span>
                  <span className="font-bold text-[#142B4A]">{formatINR(selectedRenewal.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7A90]">Maturity Date:</span>
                  <span className="font-medium text-[#172B4D]">{formatDate(selectedRenewal.maturityDate)}</span>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#172B4D]">Update Administrative Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-[#172B4D]"
                >
                  <option value="Under AICTE Review">Under AICTE Review (Replacement Submitted)</option>
                  <option value="Approved & Replaced">Approved & Replaced (5-Year Extension)</option>
                  <option value="Renewal Required">Renewal Required (Overdue Notice)</option>
                  <option value="Renewal In-Progress">Renewal In-Progress (Bank Processing)</option>
                </select>
              </div>

              {/* Replacement FDR Reference */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#172B4D]">Replacement FDR Reference Number</label>
                <input
                  type="text"
                  value={replacementRef}
                  onChange={(e) => setReplacementRef(e.target.value)}
                  placeholder="e.g. FDR/SBI/2026/REN-8910"
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white font-mono text-[#172B4D]"
                />
              </div>

              {/* Mock Upload of Replacement Certificate */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#172B4D]">Upload Replacement Bank Certificate</label>
                <div className="border border-dashed border-[#CBD5E1] p-4 rounded-xl text-center bg-slate-50">
                  <UploadCloud className="w-6 h-6 text-[#244B75] mx-auto mb-1" />
                  <p className="text-xs text-[#172B4D]">
                    {uploadedMockFile ? uploadedMockFile : 'Click to attach verified replacement deposit slip'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setUploadedMockFile(`Renewed_Deposit_Deed_${selectedRenewal.existingFdrRef.replace(/\//g, '_')}.pdf`)}
                    className="mt-2 text-[11px] font-semibold text-[#244B75] bg-white border border-[#E2E8F0] px-3 py-1 rounded"
                  >
                    Simulate Attach Document
                  </button>
                </div>
              </div>

              {/* Action Notes */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#172B4D]">Official Scrutiny Remarks</label>
                <textarea
                  rows={2}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Record verification notes, branch endorsement confirmation..."
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-[#172B4D]"
                />
              </div>

              {/* Renewal History Timeline */}
              {selectedRenewal.renewalHistory && (
                <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#6B7A90] block">Preserved Audit History</span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {selectedRenewal.renewalHistory.map((h, i) => (
                      <div key={i} className="text-[11px] text-[#6B7A90] flex items-center justify-between">
                        <span>{h.action}</span>
                        <span className="font-mono text-[10px]">{h.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSelectedRenewal(null)}
                  className="px-4 py-2 border rounded-lg bg-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#244B75] disabled:opacity-50"
                >
                  {isUpdating ? 'Saving Decision...' : 'Save & Update FDR Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

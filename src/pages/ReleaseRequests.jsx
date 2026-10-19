import React, { useState } from 'react';
import {
  HandCoins,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  FileCheck,
  ShieldCheck,
  Clock,
  Plus,
  Eye,
  X,
  AlertTriangle,
  Download,
  Building
} from 'lucide-react';
import { useFDR } from '../context/FDRContext';
import StatusBadge from '../components/common/StatusBadge';
import { formatINR, formatDate } from '../utils/helpers';

export default function ReleaseRequests() {
  const { releaseRequests, updateReleaseStatus, addReleaseRequest, fdrs, currentUser } = useFDR();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Confirmation dialog state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: '', // 'Approved' | 'Rejected' | 'Additional Information Required' | 'Released'
    remarks: ''
  });

  // New Request Form Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRequestData, setNewRequestData] = useState({
    institution: '',
    aicteId: '',
    fdrRef: '',
    depositAmount: 1000000,
    requestReason: 'Successful completion of mandatory 10-year lock-in period with continuous autonomous accreditation'
  });

  const filteredRequests = releaseRequests.filter(r => {
    const matchSearch =
      r.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.fdrRef.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenConfirm = (action) => {
    setConfirmModal({
      isOpen: true,
      action,
      remarks: action === 'Approved' ? 'All mandatory compliance clearances and vigilance reports verified.' : ''
    });
  };

  const handleExecuteDecision = () => {
    if (!selectedRequest) return;
    updateReleaseStatus(selectedRequest.id, confirmModal.action, confirmModal.remarks);
    setConfirmModal({ isOpen: false, action: '', remarks: '' });
    setSelectedRequest(null);
  };

  const handleCreateNewRequest = (e) => {
    e.preventDefault();
    if (!newRequestData.institution || !newRequestData.fdrRef) {
      alert('Please fill institution and FDR reference.');
      return;
    }
    const created = addReleaseRequest({
      institution: newRequestData.institution,
      aicteId: newRequestData.aicteId || '1-452891901',
      fdrRef: newRequestData.fdrRef,
      depositAmount: Number(newRequestData.depositAmount),
      requestReason: newRequestData.requestReason,
      supportingDocuments: [
        { name: 'AICTE_Approval_Letter.pdf', size: '2.1 MB' },
        { name: 'Bank_Lien_Release_Undertaking.pdf', size: '1.4 MB' }
      ],
      reviewerRemarks: 'Newly registered release petition pending initial administrative scrutiny.'
    });
    setShowNewModal(false);
    setSelectedRequest(created);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight">
              Security Deposit Release & Refund Requests
            </h1>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
              Workflow
            </span>
          </div>
          <p className="text-xs text-[#6B7A90] mt-1">
            Formal administrative adjudication process for the surrender, refund, or release of joint AICTE security deposits.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#244B75] shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Submit Release Request
        </button>
      </div>

      {/* Simulated Notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 text-[#D99119] mt-0.5" />
        <div className="leading-relaxed">
          <strong>Simulated Decision Disclaimer:</strong> Recording an approval or refund release in this prototype represents an internal administrative decision only. In compliance with RBI and banking directives, actual release of funds requires formal NOC issuance to the commercial bank.
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#6B7A90] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Request ID, Institution, or FDR Ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D]"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Additional Information Required">Additional Info Required</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Released">Released</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider text-[#6B7A90] font-semibold">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-3">Institution Name</th>
                <th className="py-3 px-3">FDR Reference</th>
                <th className="py-3 px-3 text-right">Deposit Amount</th>
                <th className="py-3 px-3">Request Date</th>
                <th className="py-3 px-3">Review Status</th>
                <th className="py-3 px-3">Assigned Reviewer</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#142B4A]">
                    {req.id}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-[#172B4D] block truncate max-w-[200px]">
                      {req.institution}
                    </span>
                    <span className="text-[10px] text-[#6B7A90]">
                      AICTE: {req.aicteId}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[#244B75]">
                    {req.fdrRef}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-[#142B4A]">
                    {formatINR(req.depositAmount)}
                  </td>

                  <td className="py-3.5 px-3 text-[#172B4D]">
                    {formatDate(req.requestDate)}
                  </td>

                  <td className="py-3.5 px-3">
                    <StatusBadge status={req.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-3 text-[#6B7A90] truncate max-w-[150px]">
                    {req.assignedReviewer}
                  </td>

                  <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-[#F4F7FB] border border-[#E2E8F0] text-[#244B75] hover:bg-[#142B4A] hover:text-white transition-colors"
                    >
                      Scrutinize
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Review Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="bg-[#142B4A] text-white p-5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold">Release Petition — {selectedRequest.id}</h3>
                  <span className="text-xs text-slate-300 font-mono">Ref: {selectedRequest.fdrRef}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-[#6B7A90] uppercase font-bold">Applicant Institution</span>
                  <p className="text-sm font-bold text-[#142B4A]">{selectedRequest.institution}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6B7A90] uppercase font-bold">Current Adjudication</span>
                  <div>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                </div>
              </div>

              {/* Deposit Snapshot */}
              <div className="bg-[#F4F7FB] p-4 rounded-xl border border-[#E2E8F0] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#6B7A90] text-[10px] uppercase">Pledged Deposit Value</span>
                  <p className="text-lg font-bold text-[#142B4A]">{formatINR(selectedRequest.depositAmount)}</p>
                </div>
                <div>
                  <span className="text-[#6B7A90] text-[10px] uppercase">Date of Request</span>
                  <p className="text-sm font-medium text-[#172B4D]">{formatDate(selectedRequest.requestDate)}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <span className="font-semibold text-[#142B4A] uppercase text-[10px] tracking-wider block">
                  Grounds for Deposit Release / Surrender
                </span>
                <p className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#172B4D] leading-relaxed">
                  {selectedRequest.requestReason}
                </p>
              </div>

              {/* Supporting Documents */}
              <div className="space-y-2">
                <span className="font-semibold text-[#142B4A] uppercase text-[10px] tracking-wider block">
                  Mandatory Supporting Documents On Record ({selectedRequest.supportingDocuments ? selectedRequest.supportingDocuments.length : 0})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRequest.supportingDocuments && selectedRequest.supportingDocuments.map((doc, idx) => (
                    <div key={idx} className="p-2.5 border border-[#E2E8F0] rounded-lg bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-[#16845B] shrink-0" />
                        <span className="truncate font-medium text-[#172B4D]">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-[#6B7A90] shrink-0">{doc.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              {selectedRequest.reviewerRemarks && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-[#244B75] block">Scrutiny Officer Remarks:</span>
                  <p className="text-slate-700">{selectedRequest.reviewerRemarks}</p>
                </div>
              )}
            </div>

            {/* Action Buttons for Authorized Reviewer */}
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border rounded-lg bg-white text-xs font-semibold text-[#172B4D]"
              >
                Close View
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenConfirm('Additional Information Required')}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100"
                >
                  Request Info
                </button>

                <button
                  onClick={() => handleOpenConfirm('Rejected')}
                  className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-[#C84444] text-xs font-semibold hover:bg-rose-100"
                >
                  Reject
                </button>

                <button
                  onClick={() => handleOpenConfirm('Approved')}
                  className="px-3 py-1.5 rounded-lg bg-[#16845B] text-white text-xs font-semibold hover:bg-[#126b4a]"
                >
                  Approve Release
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#142B4A]">
                  Confirm Administrative Decision
                </h3>
                <p className="text-xs text-[#6B7A90]">Action: Record as <strong>{confirmModal.action}</strong></p>
              </div>
            </div>

            <p className="text-xs text-[#172B4D] leading-relaxed">
              Are you sure you want to mark this release petition as <strong>{confirmModal.action}</strong>? This decision will be logged in the permanent AICTE audit trail.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#172B4D]">Decision Remarks / File Reference</label>
              <textarea
                rows={2}
                value={confirmModal.remarks}
                onChange={(e) => setConfirmModal({ ...confirmModal, remarks: e.target.value })}
                placeholder="Enter remarks..."
                className="w-full p-2 border border-[#E2E8F0] rounded-lg text-xs bg-[#F4F7FB]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: '', remarks: '' })}
                className="px-4 py-2 border rounded-lg bg-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDecision}
                className="px-4 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#244B75]"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#142B4A]">Submit Security Deposit Release Petition</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Institute of Technology"
                  value={newRequestData.institution}
                  onChange={(e) => setNewRequestData({ ...newRequestData, institution: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">FDR Reference Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FDR/SBI/2026/89412"
                  value={newRequestData.fdrRef}
                  onChange={(e) => setNewRequestData({ ...newRequestData, fdrRef: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Deposit Amount (INR) *</label>
                <input
                  type="number"
                  required
                  value={newRequestData.depositAmount}
                  onChange={(e) => setNewRequestData({ ...newRequestData, depositAmount: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Reason for Release *</label>
                <textarea
                  rows={3}
                  required
                  value={newRequestData.requestReason}
                  onChange={(e) => setNewRequestData({ ...newRequestData, requestReason: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border rounded-lg bg-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold"
                >
                  Submit Petition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

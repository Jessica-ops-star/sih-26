import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  Download,
  Printer,
  ExternalLink,
  Clock,
  Landmark,
  AlertTriangle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatINR, formatDate, getDaysRemaining, getComputedStatus } from '../../utils/helpers';
import { useFDR } from '../../context/FDRContext';

export default function FDRDetailsModal({ fdr, isOpen, onClose, onOpenRenewal, onOpenRelease }) {
  if (!isOpen || !fdr) return null;

  const { updateFDR } = useFDR();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'document' | 'audit'
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const daysRemaining = getDaysRemaining(fdr.maturityDate);
  const computedStatus = getComputedStatus(fdr);

  const handleSimulateVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      updateFDR(fdr.id, {
        verificationStatus: 'Verified',
        status: computedStatus === 'Under Verification' ? 'Active' : fdr.status,
        verifiedBy: 'Dr. Rajeev Sharma (Director, AICTE)',
        verifiedDate: new Date().toISOString().slice(0, 10),
        remarks: 'Joint lien verified with issuing bank branch records.'
      });
      setIsVerifying(false);
      setSuccessMsg('Simulated bank lien verification confirmed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-[#E2E8F0] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#142B4A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Landmark className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-300 font-medium">Fixed Deposit Receipt Details</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/15 text-white font-mono">{fdr.fdrNumber}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {fdr.institutionName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Success Toast */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-sm text-[#16845B]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Subheader Tabs */}
        <div className="px-6 pt-3 border-b border-[#E2E8F0] bg-[#F4F7FB] flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'details'
                  ? 'bg-white text-[#142B4A] border-[#142B4A]'
                  : 'text-[#6B7A90] hover:text-[#172B4D] border-transparent'
              }`}
            >
              FDR Specifications
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'document'
                  ? 'bg-white text-[#142B4A] border-[#142B4A]'
                  : 'text-[#6B7A90] hover:text-[#172B4D] border-transparent'
              }`}
            >
              Attached Certificate Preview
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'compliance'
                  ? 'bg-white text-[#142B4A] border-[#142B4A]'
                  : 'text-[#6B7A90] hover:text-[#172B4D] border-transparent'
              }`}
            >
              Lien & Verification Log
            </button>
          </div>

          <div className="pb-2">
            <StatusBadge status={fdr.status} />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Financial Highlight Banner */}
              <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] font-medium uppercase text-[#6B7A90]">Deposit Amount</span>
                  <p className="text-xl font-bold text-[#142B4A]">{formatINR(fdr.amount)}</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase text-[#6B7A90]">Interest Rate</span>
                  <p className="text-lg font-semibold text-[#172B4D]">{fdr.interestRate ? `${fdr.interestRate}% p.a.` : 'Cumulative'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase text-[#6B7A90]">Maturity Date</span>
                  <p className="text-sm font-semibold text-[#172B4D]">{formatDate(fdr.maturityDate)}</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase text-[#6B7A90]">Maturity Status</span>
                  <p className={`text-sm font-semibold ${daysRemaining < 0 ? 'text-[#C84444]' : daysRemaining <= 30 ? 'text-[#D99119]' : 'text-[#16845B]'}`}>
                    {daysRemaining < 0 ? `Matured (${Math.abs(daysRemaining)}d ago)` : `${daysRemaining} days remaining`}
                  </p>
                </div>
              </div>

              {/* Institution Details */}
              <div className="border border-[#E2E8F0] rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A] uppercase tracking-wide">
                  <Building2 className="w-4 h-4 text-[#244B75]" />
                  Institution Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#6B7A90]">AICTE Permanent ID:</span>
                    <span className="font-mono font-semibold text-[#172B4D] ml-2">{fdr.aicteId}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7A90]">Region:</span>
                    <span className="font-medium text-[#172B4D] ml-2">{fdr.region}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#6B7A90]">Purpose of Deposit:</span>
                    <span className="font-medium text-[#172B4D] ml-2">{fdr.purpose || 'Statutory AICTE Approval Security Deposit'}</span>
                  </div>
                </div>
              </div>

              {/* Bank & Deposit Details */}
              <div className="border border-[#E2E8F0] rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A] uppercase tracking-wide">
                  <CreditCard className="w-4 h-4 text-[#244B75]" />
                  Banking & Joint Lien Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#6B7A90]">Issuing Bank:</span>
                    <span className="font-semibold text-[#172B4D] ml-2">{fdr.bank}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7A90]">Branch / IFSC:</span>
                    <span className="font-medium text-[#172B4D] ml-2">{fdr.branch || 'Branch records verified'}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7A90]">Account / FDR No:</span>
                    <span className="font-mono font-medium text-[#172B4D] ml-2">{fdr.accountNumber || fdr.fdrNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7A90]">Issue Date:</span>
                    <span className="font-medium text-[#172B4D] ml-2">{formatDate(fdr.issueDate)}</span>
                  </div>
                  <div className="sm:col-span-2 bg-[#F4F7FB] p-2.5 rounded-lg border border-[#E2E8F0]">
                    <span className="text-[11px] font-semibold text-[#142B4A] block mb-0.5">Mandatory Joint Holder Clause:</span>
                    <p className="text-xs text-[#244B75] italic">
                      "{fdr.jointHolder || 'Jointly held with Regional Officer, AICTE. Deposit pledged under lien to Member Secretary, All India Council for Technical Education.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Administrative Remarks */}
              {fdr.remarks && (
                <div className="border border-[#E2E8F0] rounded-xl p-4 bg-white space-y-2">
                  <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wide block">
                    Administrative Notes & Lien Verification
                  </span>
                  <p className="text-xs text-[#172B4D] leading-relaxed">
                    {fdr.remarks}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'document' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center">
                {/* Government style certificate placeholder */}
                <div className="bg-white border-4 border-double border-[#142B4A] p-6 max-w-lg w-full rounded shadow-sm text-left relative space-y-3">
                  <div className="absolute top-4 right-4 opacity-15">
                    <Landmark className="w-24 h-24 text-[#142B4A]" />
                  </div>
                  <div className="text-center border-b pb-2 border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">Bank Fixed Deposit Receipt</span>
                    <h3 className="text-base font-extrabold text-[#142B4A]">{fdr.bank.toUpperCase()}</h3>
                    <p className="text-[11px] text-slate-600 font-mono">{fdr.branch || 'Designated Commercial Branch'}</p>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Receipt No:</span>
                      <span className="font-mono font-bold text-slate-800">{fdr.fdrNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Joint Depositors:</span>
                      <span className="font-semibold text-slate-800 text-right">{fdr.institutionName} <br/><span className="text-[11px] text-[#244B75]">& Regional Officer, AICTE</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Principal Deposit:</span>
                      <span className="font-bold text-[#142B4A] text-sm">{formatINR(fdr.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Effective Maturity:</span>
                      <span className="font-bold text-slate-800">{formatDate(fdr.maturityDate)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
                    <div>
                      <span className="block font-semibold text-emerald-800">LIEN PLEDGED TO AICTE</span>
                      <span>Subject to AICTE Approval Regulations</span>
                    </div>
                    <div className="text-right">
                      <span className="border-t border-slate-400 pt-1 block font-mono text-[9px]">Authorised Bank Signatory</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs text-[#6B7A90]">
                    File: <strong className="text-[#172B4D]">{fdr.fileName || `${fdr.fdrNumber}.pdf`}</strong> ({fdr.fileSize || '2.1 MB'})
                  </span>
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Simulated download: ${fdr.fileName || 'FDR_Certificate.pdf'}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#244B75] hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Mock PDF
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="border border-[#E2E8F0] rounded-xl p-4 bg-white space-y-3">
                <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wide">
                  AICTE Regional Verification Record
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#6B7A90]">Verification Status:</span>
                    <span className="font-semibold text-[#172B4D]">{fdr.verificationStatus || 'Verified'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#6B7A90]">Verified Officer:</span>
                    <span className="font-medium text-[#172B4D]">{fdr.verifiedBy || 'Dr. Rajeev Sharma (Director, AICTE)'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[#6B7A90]">Verification Date:</span>
                    <span className="font-medium text-[#172B4D]">{formatDate(fdr.verifiedDate || fdr.issueDate)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#6B7A90]">Bank Branch Communication:</span>
                    <span className="font-semibold text-emerald-700">Confirmation Letter On File</span>
                  </div>
                </div>

                {fdr.verificationStatus === 'Under Verification' && (
                  <div className="pt-2">
                    <button
                      onClick={handleSimulateVerification}
                      disabled={isVerifying}
                      className="w-full py-2 px-3 bg-[#16845B] hover:bg-[#13714e] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isVerifying ? 'Confirming Lien...' : 'Simulate Official AICTE Verification Approval'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#F4F7FB] px-6 py-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#172B4D] hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#6B7A90]" />
              Print Receipt
            </button>
            <button
              onClick={() => {
                alert(`Downloaded simulated FDR ledger slip for ${fdr.fdrNumber}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#172B4D] hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#6B7A90]" />
              Export Record
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRenewal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRenewal(fdr);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#244B75] text-white text-xs font-semibold hover:bg-[#1b395a] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Manage Renewal
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

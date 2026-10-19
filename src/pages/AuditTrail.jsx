import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Eye,
  X,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useFDR } from '../context/FDRContext';
import StatusBadge from '../components/common/StatusBadge';
import { exportToCSV } from '../utils/helpers';

export default function AuditTrail() {
  const { auditLogs } = useFDR();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.fdrReference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = roleFilter === 'All' ? true : log.role.includes(roleFilter);

    return matchSearch && matchRole;
  });

  const handleExportAuditCSV = () => {
    const data = filteredLogs.map(l => ({
      'Log ID': l.id,
      'Timestamp': l.timestamp,
      'Official User': l.user,
      'Administrative Role': l.role,
      'Action Taken': l.action,
      'Related Institution': l.institution,
      'FDR Reference': l.fdrReference,
      'Previous Status': l.previousStatus,
      'New Status': l.newStatus,
      'Details': l.details || ''
    }));
    exportToCSV(data, `AICTE_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight">
              Audit Trail & Regulatory Activity Log
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-300">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-[#6B7A90] mt-1">
            Chronological, non-repudiable audit records of all FDR registrations, endorsements, and status modifications.
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#172B4D] hover:bg-slate-50 shadow-xs"
        >
          <Download className="w-4 h-4 text-[#6B7A90]" />
          Export Audit Log CSV
        </button>
      </div>

      {/* Demonstration Banner */}
      <div className="p-3 bg-[#F4F7FB] border border-[#E2E8F0] rounded-xl text-xs text-[#6B7A90] flex items-center gap-2">
        <Shield className="w-4 h-4 text-[#244B75] shrink-0" />
        <span>
          <strong>Audit Engine Notice:</strong> Initial records represent synthetic demonstration events. New actions taken during this session (registering FDRs, approving renewals, release decisions) are dynamically logged here with real-time timestamps.
        </span>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#6B7A90] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit events by action, user, or FDR ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D]"
          >
            <option value="All">All User Roles</option>
            <option value="Director">Director</option>
            <option value="Regional Officer">Regional Officer</option>
            <option value="Finance Officer">Finance Officer</option>
            <option value="Compliance Engine">Automated Engine</option>
          </select>

          <span className="text-[#6B7A90]">
            Total events: <strong>{filteredLogs.length}</strong>
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider text-[#6B7A90] font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Official User & Role</th>
                <th className="py-3 px-3">Action Description</th>
                <th className="py-3 px-3">Related Institution</th>
                <th className="py-3 px-3">FDR Ref</th>
                <th className="py-3 px-3">State Transition</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono text-[#6B7A90] whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-[#142B4A] block">
                      {log.user}
                    </span>
                    <span className="text-[10px] text-[#6B7A90]">
                      {log.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-[#172B4D]">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-3 text-[#172B4D] max-w-[180px] truncate">
                    {log.institution}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[#244B75]">
                    {log.fdrReference}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">{log.previousStatus}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold text-[#142B4A]">{log.newStatus}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1 rounded hover:bg-[#142B4A] hover:text-white text-[#244B75] border border-[#E2E8F0]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#244B75]" />
                <h3 className="text-base font-bold text-[#142B4A]">Audit Event Record — {selectedLog.id}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-1 border-slate-100">
                <span className="text-[#6B7A90]">Timestamp:</span>
                <span className="font-mono font-medium text-[#172B4D]">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-slate-100">
                <span className="text-[#6B7A90]">Action Name:</span>
                <span className="font-bold text-[#142B4A]">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-slate-100">
                <span className="text-[#6B7A90]">Executed By:</span>
                <span className="font-semibold text-[#172B4D]">{selectedLog.user} ({selectedLog.role})</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-slate-100">
                <span className="text-[#6B7A90]">Institution:</span>
                <span className="font-semibold text-[#172B4D] text-right">{selectedLog.institution}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-slate-100">
                <span className="text-[#6B7A90]">FDR Reference:</span>
                <span className="font-mono text-[#244B75]">{selectedLog.fdrReference}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-slate-100">
                <span className="text-[#6B7A90]">Status Changed:</span>
                <span className="font-medium">{selectedLog.previousStatus} ➔ <strong>{selectedLog.newStatus}</strong></span>
              </div>

              <div className="pt-2">
                <span className="font-semibold text-[#142B4A] block mb-1">Administrative Details:</span>
                <p className="p-3 bg-[#F4F7FB] border border-[#E2E8F0] rounded-lg text-[#172B4D] leading-relaxed">
                  {selectedLog.details || 'Standard verification log.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-[#142B4A] text-white text-xs font-semibold"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

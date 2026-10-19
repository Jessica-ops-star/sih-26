import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit2,
  FileDown,
  Trash2,
  Calendar,
  Building,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  CheckCircle2
} from 'lucide-react';
import { useFDR } from '../context/FDRContext';
import StatusBadge from '../components/common/StatusBadge';
import FDRDetailsModal from '../components/common/FDRDetailsModal';
import { formatINR, formatDate, getDaysRemaining, getComputedStatus, exportToCSV } from '../utils/helpers';
import { AICTE_REGIONS, BANK_LIST } from '../data/mockData';

export default function FDRRepository() {
  const navigate = useNavigate();
  const { fdrs, deleteFDR } = useFDR();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [bankFilter, setBankFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [maturityRangeFilter, setMaturityRangeFilter] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected FDR for details modal
  const [selectedFDR, setSelectedFDR] = useState(null);

  // Edit FDR simple modal
  const [editingFDR, setEditingFDR] = useState(null);

  // Filtered dataset
  const filteredFDRs = useMemo(() => {
    return fdrs
      .map(f => ({
        ...f,
        computedStatus: getComputedStatus(f),
        daysRemaining: getDaysRemaining(f.maturityDate)
      }))
      .filter(f => {
        // Search filter
        const matchSearch =
          f.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.fdrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.aicteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.bank.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchStatus =
          statusFilter === 'All' ? true : f.computedStatus === statusFilter || f.status === statusFilter;

        // Bank filter
        const matchBank = bankFilter === 'All' ? true : f.bank === bankFilter;

        // Region filter
        const matchRegion = regionFilter === 'All' ? true : f.region.includes(regionFilter) || regionFilter.includes(f.region);

        // Maturity Range filter
        let matchMaturity = true;
        if (maturityRangeFilter === '30days') {
          matchMaturity = f.daysRemaining >= 0 && f.daysRemaining <= 30;
        } else if (maturityRangeFilter === '90days') {
          matchMaturity = f.daysRemaining >= 0 && f.daysRemaining <= 90;
        } else if (maturityRangeFilter === 'matured') {
          matchMaturity = f.daysRemaining < 0;
        } else if (maturityRangeFilter === 'active_future') {
          matchMaturity = f.daysRemaining > 90;
        }

        return matchSearch && matchStatus && matchBank && matchRegion && matchMaturity;
      });
  }, [fdrs, searchTerm, statusFilter, bankFilter, regionFilter, maturityRangeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredFDRs.length / itemsPerPage) || 1;
  const paginatedFDRs = filteredFDRs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export full table to CSV
  const handleExportCSV = () => {
    const dataToExport = filteredFDRs.map(f => ({
      'FDR Number': f.fdrNumber,
      'Institution': f.institutionName,
      'AICTE Permanent ID': f.aicteId,
      'Region': f.region,
      'Bank': f.bank,
      'Branch': f.branch,
      'Amount (INR)': f.amount,
      'Issue Date': f.issueDate,
      'Maturity Date': f.maturityDate,
      'Days Remaining': f.daysRemaining,
      'Status': f.computedStatus,
      'Joint Holder Clause': f.jointHolder
    }));
    exportToCSV(dataToExport, `AICTE_FDR_Repository_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleDownloadMockDoc = (e, fdr) => {
    e.stopPropagation();
    alert(`Downloading verified security deposit certificate for ${fdr.fdrNumber} (${fdr.fileName || 'FDR_Certificate.pdf'})`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setBankFilter('All');
    setRegionFilter('All');
    setMaturityRangeFilter('All');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight">
            FDR Repository
          </h1>
          <p className="text-xs text-[#6B7A90] mt-1">
            Master register of all joint security fixed deposit receipts held under AICTE approval regulations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-[#6B7A90]" />
            Export CSV
          </button>

          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#244B75] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Register New FDR
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#6B7A90] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Institution, FDR No, or AICTE ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] focus:outline-none focus:ring-1 focus:ring-[#142B4A] text-[#172B4D]"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Matured">Matured</option>
              <option value="Renewal Pending">Renewal Pending</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Released">Released</option>
            </select>
          </div>

          {/* Bank Filter */}
          <div className="md:col-span-2">
            <select
              value={bankFilter}
              onChange={(e) => {
                setBankFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
            >
              <option value="All">All Banks</option>
              {BANK_LIST.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div className="md:col-span-2">
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
            >
              {AICTE_REGIONS.map((r) => (
                <option key={r} value={r === 'All Regions' ? 'All' : r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Maturity Horizon Filter */}
          <div className="md:col-span-2">
            <select
              value={maturityRangeFilter}
              onChange={(e) => {
                setMaturityRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
            >
              <option value="All">All Horizons</option>
              <option value="30days">Expiring ≤ 30 Days</option>
              <option value="90days">Expiring ≤ 90 Days</option>
              <option value="matured">Already Matured</option>
              <option value="active_future">Active Long Term</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Tags & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="text-[#6B7A90]">
            Showing <strong className="text-[#172B4D]">{filteredFDRs.length}</strong> matching FDR records in repository
          </div>
          {(searchTerm || statusFilter !== 'All' || bankFilter !== 'All' || regionFilter !== 'All' || maturityRangeFilter !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#244B75] font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider text-[#6B7A90] font-semibold">
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-3">FDR Reference</th>
                <th className="py-3 px-3">Issuing Bank & Branch</th>
                <th className="py-3 px-3 text-right">Deposit Amount</th>
                <th className="py-3 px-3">Issue Date</th>
                <th className="py-3 px-3">Maturity Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginatedFDRs.length > 0 ? (
                paginatedFDRs.map((fdr) => (
                  <tr
                    key={fdr.id}
                    className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                    onClick={() => setSelectedFDR(fdr)}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#142B4A] block truncate max-w-[210px]">
                        {fdr.institutionName}
                      </span>
                      <span className="text-[10px] text-[#6B7A90] font-mono">
                        {fdr.aicteId} • {fdr.region ? fdr.region.split('(')[0] : 'All'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono font-medium text-[#172B4D] block truncate max-w-[150px]">
                        {fdr.fdrNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {fdr.tenureYears || 10}-Year Deposit
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-[#172B4D] block">
                        {fdr.bank}
                      </span>
                      <span className="text-[10px] text-[#6B7A90] truncate max-w-[170px] block">
                        {fdr.branch || 'Commercial Branch'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-[#142B4A] whitespace-nowrap">
                      {formatINR(fdr.amount)}
                    </td>

                    <td className="py-3.5 px-3 text-[#6B7A90] whitespace-nowrap">
                      {formatDate(fdr.issueDate)}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-[#172B4D] block">
                        {formatDate(fdr.maturityDate)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          fdr.daysRemaining < 0
                            ? 'text-[#C84444]'
                            : fdr.daysRemaining <= 30
                            ? 'text-[#D99119]'
                            : 'text-[#16845B]'
                        }`}
                      >
                        {fdr.daysRemaining < 0
                          ? `Overdue by ${Math.abs(fdr.daysRemaining)}d`
                          : `${fdr.daysRemaining}d left`}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={fdr.computedStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="View Complete FDR Metadata"
                          onClick={() => setSelectedFDR(fdr)}
                          className="p-1.5 rounded hover:bg-[#142B4A] hover:text-white text-[#244B75] border border-[#E2E8F0] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          title="Download Attached Document"
                          onClick={(e) => handleDownloadMockDoc(e, fdr)}
                          className="p-1.5 rounded hover:bg-[#142B4A] hover:text-white text-[#244B75] border border-[#E2E8F0] transition-colors"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          title="Renewal / Replacement"
                          onClick={() => navigate('/renewals')}
                          className="p-1.5 rounded hover:bg-[#142B4A] hover:text-white text-[#244B75] border border-[#E2E8F0] transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#172B4D]">No Fixed Deposit Receipts Found</p>
                    <p className="text-xs text-[#6B7A90] mt-1 max-w-sm mx-auto">
                      There are no FDR records matching your current filter criteria. Try adjusting the search term or resetting your filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold bg-[#142B4A] text-white rounded-lg hover:bg-[#244B75]"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7A90]">
          <div>
            Showing {filteredFDRs.length ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredFDRs.length)} of {filteredFDRs.length} total FDRs
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-[#172B4D]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Deep-Dive FDR Details Modal */}
      <FDRDetailsModal
        fdr={selectedFDR}
        isOpen={!!selectedFDR}
        onClose={() => setSelectedFDR(null)}
        onOpenRenewal={(fdr) => navigate('/renewals')}
      />
    </div>
  );
}

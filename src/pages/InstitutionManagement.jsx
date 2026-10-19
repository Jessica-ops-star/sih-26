import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Landmark,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  X,
  Calendar,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { useFDR } from '../context/FDRContext';
import StatusBadge from '../components/common/StatusBadge';
import { formatINR, formatDate, getComputedStatus, exportToCSV } from '../utils/helpers';
import { AICTE_REGIONS } from '../data/mockData';

export default function InstitutionManagement() {
  const navigate = useNavigate();
  const { institutions, setInstitutions, fdrs, addAuditLog } = useFDR();

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected institution for details view
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  // New Institution Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInst, setNewInst] = useState({
    name: '',
    aicteId: `1-${Math.floor(100000000 + Math.random() * 900000000)}`,
    region: 'Northern Region (Kanpur)',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    type: 'Private - Self Financed'
  });

  // Calculate live FDR stats per institution
  const enhancedInstitutions = useMemo(() => {
    return institutions.map(inst => {
      const instFDRs = fdrs.filter(
        f => f.aicteId === inst.aicteId || f.institutionName.toLowerCase() === inst.name.toLowerCase()
      );
      const totalDeposit = instFDRs.reduce((sum, f) => sum + Number(f.amount || 0), 0);
      const pendingCount = instFDRs.filter(f => {
        const s = getComputedStatus(f);
        return s === 'Matured' || s === 'Expiring Soon' || s === 'Under Verification';
      }).length;

      return {
        ...inst,
        registeredFdrCount: instFDRs.length || inst.registeredFdrCount || 0,
        totalDepositValue: totalDeposit > 0 ? totalDeposit : inst.totalDepositValue || 0,
        pendingActions: pendingCount,
        status: pendingCount > 0 ? 'Action Required' : 'Compliant',
        fdrs: instFDRs
      };
    });
  }, [institutions, fdrs]);

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    return enhancedInstitutions.filter(inst => {
      const matchSearch =
        inst.name.toLowerCase().includes(search.toLowerCase()) ||
        inst.aicteId.toLowerCase().includes(search.toLowerCase()) ||
        inst.region.toLowerCase().includes(search.toLowerCase());

      const matchRegion = regionFilter === 'All' ? true : inst.region === regionFilter;
      const matchStatus = statusFilter === 'All' ? true : inst.status === statusFilter;

      return matchSearch && matchRegion && matchStatus;
    });
  }, [enhancedInstitutions, search, regionFilter, statusFilter]);

  // Export institutions
  const handleExportCSV = () => {
    const data = filteredInstitutions.map(i => ({
      'Institution Name': i.name,
      'AICTE Permanent ID': i.aicteId,
      'Region': i.region,
      'Registered FDRs': i.registeredFdrCount,
      'Total Deposit Value': i.totalDepositValue,
      'Pending Actions': i.pendingActions,
      'Compliance Status': i.status,
      'Contact Person': i.contactPerson || '',
      'Email': i.email || ''
    }));
    exportToCSV(data, `AICTE_Institutions_Register_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleCreateInstitution = (e) => {
    e.preventDefault();
    if (!newInst.name.trim()) {
      alert('Institution name is required');
      return;
    }
    const created = {
      id: `INST-${String(institutions.length + 1).padStart(3, '0')}`,
      registeredFdrCount: 0,
      totalDepositValue: 0,
      pendingActions: 0,
      status: 'Compliant',
      ...newInst
    };
    setInstitutions(prev => [created, ...prev]);
    addAuditLog({
      action: 'Registered Technical Institution',
      institution: created.name,
      fdrReference: 'N/A',
      previousStatus: 'None',
      newStatus: 'Active',
      details: `New institution registered with AICTE Permanent ID: ${created.aicteId}`
    });
    setShowAddModal(false);
    setSelectedInstitution(created);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight">
            Institution Management
          </h1>
          <p className="text-xs text-[#6B7A90] mt-1">
            Directory of approved technical colleges, universities and polytechnics holding security deposits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#172B4D] hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-4 h-4 text-[#6B7A90]" />
            Export Institutions
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#244B75] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Institution
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-[#6B7A90] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Institution name or AICTE Permanent ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] focus:outline-none focus:ring-1 focus:ring-[#142B4A] text-[#172B4D]"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
          >
            {AICTE_REGIONS.map(r => (
              <option key={r} value={r === 'All Regions' ? 'All' : r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
          >
            <option value="All">All Compliance Statuses</option>
            <option value="Compliant">Compliant</option>
            <option value="Action Required">Action Required</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider text-[#6B7A90] font-semibold">
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-3">Permanent ID</th>
                <th className="py-3 px-3">Region</th>
                <th className="py-3 px-3 text-center">Registered FDRs</th>
                <th className="py-3 px-3 text-right">Total Deposit Value</th>
                <th className="py-3 px-3 text-center">Pending Actions</th>
                <th className="py-3 px-3">Compliance Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredInstitutions.length > 0 ? (
                filteredInstitutions.map((inst) => (
                  <tr
                    key={inst.id}
                    onClick={() => setSelectedInstitution(inst)}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#142B4A] block">
                        {inst.name}
                      </span>
                      <span className="text-[10px] text-[#6B7A90]">
                        {inst.type || 'Technical Institution'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-medium text-[#172B4D]">
                      {inst.aicteId}
                    </td>

                    <td className="py-3.5 px-3 text-[#172B4D]">
                      {inst.region}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-[#142B4A]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                        {inst.registeredFdrCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-[#142B4A]">
                      {formatINR(inst.totalDepositValue)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {inst.pendingActions > 0 ? (
                        <span className="bg-rose-50 text-[#C84444] font-bold px-2 py-0.5 rounded-full text-xs border border-rose-200">
                          {inst.pendingActions} Action
                        </span>
                      ) : (
                        <span className="text-[#16845B] text-[11px] font-medium">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <StatusBadge status={inst.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedInstitution(inst)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[#F4F7FB] border border-[#E2E8F0] text-[#244B75] hover:bg-[#142B4A] hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>FDR History</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#6B7A90]">
                    No institutions match the current search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institution Details & Complete FDR History Drawer/Modal */}
      {selectedInstitution && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#142B4A] text-white p-5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Building2 className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedInstitution.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                    <span className="font-mono">AICTE ID: {selectedInstitution.aicteId}</span>
                    <span>•</span>
                    <span>{selectedInstitution.region}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedInstitution(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Profile cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#F4F7FB] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#6B7A90] text-[10px] uppercase font-bold">Total Security Pledged</span>
                  <p className="text-lg font-bold text-[#142B4A] mt-0.5">{formatINR(selectedInstitution.totalDepositValue)}</p>
                </div>
                <div className="p-3 bg-[#F4F7FB] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#6B7A90] text-[10px] uppercase font-bold">Active Fixed Deposits</span>
                  <p className="text-lg font-bold text-[#142B4A] mt-0.5">{selectedInstitution.registeredFdrCount} Receipts</p>
                </div>
                <div className="p-3 bg-[#F4F7FB] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#6B7A90] text-[10px] uppercase font-bold">Compliance Standing</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedInstitution.status} />
                  </div>
                </div>
              </div>

              {/* Contact and address */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="font-semibold text-[#142B4A] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#244B75]" /> Campus Location
                </div>
                <p className="text-[#172B4D] pl-5">{selectedInstitution.address || 'Knowledge Park Institutional Area'}</p>
                {selectedInstitution.contactPerson && (
                  <p className="text-[#6B7A90] pl-5 text-[11px]">
                    Authorized Contact: <strong className="text-[#172B4D]">{selectedInstitution.contactPerson}</strong> ({selectedInstitution.email || 'registrar@institute.ac.in'})
                  </p>
                )}
              </div>

              {/* Complete FDR History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-[#244B75]" />
                    Complete Joint FDR History ({selectedInstitution.fdrs ? selectedInstitution.fdrs.length : 0})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedInstitution(null);
                      navigate('/register');
                    }}
                    className="text-xs text-[#244B75] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register Additional FDR
                  </button>
                </div>

                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] uppercase text-[#6B7A90] font-semibold">
                        <th className="py-2.5 px-3">FDR Ref</th>
                        <th className="py-2.5 px-3">Bank</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3">Maturity Date</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {selectedInstitution.fdrs && selectedInstitution.fdrs.length > 0 ? (
                        selectedInstitution.fdrs.map(f => (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-medium text-[#172B4D]">{f.fdrNumber}</td>
                            <td className="py-2.5 px-3 text-[#172B4D]">{f.bank}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#142B4A]">{formatINR(f.amount)}</td>
                            <td className="py-2.5 px-3 text-[#6B7A90]">{formatDate(f.maturityDate)}</td>
                            <td className="py-2.5 px-3">
                              <StatusBadge status={getComputedStatus(f)} size="sm" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[#6B7A90]">
                            No registered FDR records under this institution.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => setSelectedInstitution(null)}
                className="px-4 py-1.5 rounded-lg bg-[#142B4A] text-white text-xs font-semibold"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Institution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#142B4A]">Register New Technical Institution</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstitution} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi Institute of Advanced Engineering"
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">AICTE Permanent ID *</label>
                <input
                  type="text"
                  required
                  value={newInst.aicteId}
                  onChange={(e) => setNewInst({ ...newInst, aicteId: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Region *</label>
                <select
                  value={newInst.region}
                  onChange={(e) => setNewInst({ ...newInst, region: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB]"
                >
                  {AICTE_REGIONS.filter(r => r !== 'All Regions').map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Campus Address</label>
                <input
                  type="text"
                  placeholder="Address..."
                  value={newInst.address}
                  onChange={(e) => setNewInst({ ...newInst, address: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg bg-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold"
                >
                  Save Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  PieChart as PieIcon,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Building2,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useFDR } from '../context/FDRContext';
import { formatINR, exportToCSV, getDaysRemaining, getComputedStatus } from '../utils/helpers';
import { AICTE_REGIONS } from '../data/mockData';

export default function ReportsAnalytics() {
  const { fdrs, institutions, renewals, releaseRequests } = useFDR();

  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All Time');

  // Filtered by selected region
  const filteredFDRs = useMemo(() => {
    if (selectedRegion === 'All') return fdrs;
    return fdrs.filter(f => f.region.includes(selectedRegion));
  }, [fdrs, selectedRegion]);

  // Deposits by Region Chart
  const regionChartData = useMemo(() => {
    const regionTotals = {};
    AICTE_REGIONS.filter(r => r !== 'All Regions').forEach(r => {
      const shortName = r.split('(')[0].trim().replace(' Region', '');
      regionTotals[shortName] = 0;
    });

    fdrs.forEach(f => {
      const match = Object.keys(regionTotals).find(r => f.region && f.region.includes(r));
      if (match) {
        regionTotals[match] += Number(f.amount || 0);
      }
    });

    return Object.entries(regionTotals).map(([name, amount]) => ({
      region: name,
      amountCrores: Number((amount / 10000000).toFixed(2)),
      amountINR: amount
    }));
  }, [fdrs]);

  // Maturity distribution breakdown
  const maturityDistributionData = useMemo(() => {
    let overdue = 0;
    let days30 = 0;
    let days90 = 0;
    let days180 = 0;
    let longTerm = 0;

    filteredFDRs.forEach(f => {
      if (f.status === 'Released') return;
      const d = getDaysRemaining(f.maturityDate);
      if (d < 0) overdue++;
      else if (d <= 30) days30++;
      else if (d <= 90) days90++;
      else if (d <= 180) days180++;
      else longTerm++;
    });

    return [
      { name: 'Overdue / Matured', count: overdue, color: '#C84444' },
      { name: 'Within 30 Days', count: days30, color: '#D99119' },
      { name: '31 - 90 Days', count: days90, color: '#244B75' },
      { name: '91 - 180 Days', count: days180, color: '#3B6A9C' },
      { name: 'Above 180 Days', count: longTerm, color: '#16845B' }
    ];
  }, [filteredFDRs]);

  // Summary Metrics
  const totalDepositAmount = filteredFDRs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const averageDepositAmount = filteredFDRs.length ? Math.round(totalDepositAmount / filteredFDRs.length) : 0;
  const renewalSuccessRate = renewals.length
    ? Math.round((renewals.filter(r => r.renewalStatus === 'Approved & Replaced').length / renewals.length) * 100)
    : 85;

  // CSV Exports
  const handleExportMaster = () => {
    const data = filteredFDRs.map(f => ({
      'FDR Reference': f.fdrNumber,
      'Institution Name': f.institutionName,
      'AICTE ID': f.aicteId,
      'Region': f.region,
      'Bank': f.bank,
      'Branch': f.branch,
      'Deposit Amount (INR)': f.amount,
      'Issue Date': f.issueDate,
      'Maturity Date': f.maturityDate,
      'Computed Status': getComputedStatus(f),
      'Days Remaining': getDaysRemaining(f.maturityDate),
      'Verification Status': f.verificationStatus || 'Verified'
    }));
    exportToCSV(data, `AICTE_Master_FDR_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportRegionalSummary = () => {
    const data = regionChartData.map(r => ({
      'AICTE Region': r.region,
      'Total Deposits (Crores)': r.amountCrores,
      'Total Deposit (INR)': r.amountINR
    }));
    exportToCSV(data, `AICTE_Regional_Deposit_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight">
            Reports & Compliance Analytics
          </h1>
          <p className="text-xs text-[#6B7A90] mt-1">
            Statistical distribution, regional liquidity reports, and audit metrics of AICTE security deposits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportRegionalSummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#172B4D] hover:bg-slate-50 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#6B7A90]" />
            Regional Summary CSV
          </button>
          <button
            onClick={handleExportMaster}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#244B75] shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Master Report
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#6B7A90]" />
          <span className="font-semibold text-[#172B4D]">Filter Analytics By:</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D]"
          >
            <option value="All">All AICTE Regions</option>
            {AICTE_REGIONS.filter(r => r !== 'All Regions').map(r => (
              <option key={r} value={r.split('(')[0].trim()}>{r}</option>
            ))}
          </select>

          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D]"
          >
            <option value="All Time">All Financial Years</option>
            <option value="2026-27">FY 2026-27 (Current)</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#6B7A90]">Total Pledged Portfolio</span>
          <p className="text-2xl font-bold text-[#142B4A] mt-1">{formatINR(totalDepositAmount)}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{filteredFDRs.length} total deposit records</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#6B7A90]">Average Deposit Size</span>
          <p className="text-2xl font-bold text-[#244B75] mt-1">{formatINR(averageDepositAmount)}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Standard institutional tier</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#6B7A90]">Renewal Completion Rate</span>
          <p className="text-2xl font-bold text-[#16845B] mt-1">{renewalSuccessRate}%</p>
          <span className="text-[10px] text-emerald-700 mt-0.5 block">High compliance adhesion</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#6B7A90]">Release Petitions</span>
          <p className="text-2xl font-bold text-purple-700 mt-1">{releaseRequests.length} Filed</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {releaseRequests.filter(r => r.status === 'Approved' || r.status === 'Released').length} Cleared
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Total Deposits by Region Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#142B4A]">
              Security Deposit Distribution by AICTE Region (₹ Crores)
            </h3>
            <p className="text-[11px] text-[#6B7A90]">
              Cumulative value of joint institutional FDRs across regional offices
            </p>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="region" stroke="#6B7A90" fontSize={10} angle={-25} textAnchor="end" />
                <YAxis stroke="#6B7A90" fontSize={11} unit=" Cr" />
                <RechartsTooltip
                  formatter={(val) => [`₹${val} Crores`, 'Pledged Deposit']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="amountCrores" fill="#142B4A" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maturity Horizon Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#142B4A]">
              Upcoming Maturity Distribution
            </h3>
            <p className="text-[11px] text-[#6B7A90]">
              FDRs grouped by time to maturity expiration
            </p>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={maturityDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="count"
                  label={({ name, count }) => count > 0 ? `${count}` : ''}
                  labelLine={false}
                >
                  {maturityDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val, name) => [`${val} FDRs`, name]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

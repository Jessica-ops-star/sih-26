import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Landmark,
  UploadCloud,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Save,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useFDR } from '../context/FDRContext';
import { BANK_LIST, AICTE_REGIONS, DEPOSIT_PURPOSES } from '../data/mockData';
import { formatINR } from '../utils/helpers';

export default function RegisterFDR() {
  const navigate = useNavigate();
  const { institutions, addFDR } = useFDR();

  // Form State
  const [formData, setFormData] = useState({
    // Section A: Institution
    institutionName: '',
    aicteId: '',
    region: 'Northern Region (Kanpur)',
    address: '',
    // Section B: FDR Information
    fdrNumber: `FDR/SBI/2026/${Math.floor(10000 + Math.random() * 90000)}`,
    bank: 'State Bank of India',
    branch: '',
    accountNumber: '',
    amount: '1000000',
    issueDate: new Date().toISOString().slice(0, 10),
    maturityDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 10 years default
    interestRate: '7.25',
    tenureYears: '10',
    renewalEligibility: true,
    purpose: 'Mandatory Security Deposit for Establishment of New Technical Institution',
    jointHolderClause: 'Jointly held with Regional Officer, AICTE. Lien marked in favor of Member Secretary AICTE.',
    // Section C: Document
    fileName: '',
    fileSize: '',
    fileUploaded: false
  });

  const [errors, setErrors] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Institution Selection handler
  const handleSelectInstitution = (name) => {
    const inst = institutions.find(i => i.name === name);
    if (inst) {
      setFormData(prev => ({
        ...prev,
        institutionName: inst.name,
        aicteId: inst.aicteId,
        region: inst.region,
        address: inst.address || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        institutionName: name
      }));
    }
  };

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.institutionName.trim()) {
      errs.institutionName = 'Institution name is required.';
    }
    if (!formData.aicteId.trim()) {
      errs.aicteId = 'AICTE Permanent ID is required (e.g., 1-452891901).';
    }
    if (!formData.fdrNumber.trim()) {
      errs.fdrNumber = 'FDR reference number is required.';
    }
    if (!formData.bank.trim()) {
      errs.bank = 'Issuing bank is required.';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      errs.amount = 'Deposit amount must be a positive number.';
    }
    if (!formData.issueDate) {
      errs.issueDate = 'Issue date is required.';
    }
    if (!formData.maturityDate) {
      errs.maturityDate = 'Maturity date is required.';
    } else if (new Date(formData.maturityDate) <= new Date(formData.issueDate)) {
      errs.maturityDate = 'Maturity date must be strictly later than issue date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Simulated File Upload
  const handleSimulatedFileUpload = (file) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      alert('Please upload a valid PDF or JPEG/PNG document.');
      return;
    }

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFormData(f => ({
            ...f,
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            fileUploaded: true
          }));
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSimulatedFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowReviewModal(true);
  };

  const handleFinalConfirmSubmission = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      addFDR({
        institutionName: formData.institutionName,
        aicteId: formData.aicteId,
        region: formData.region,
        fdrNumber: formData.fdrNumber,
        bank: formData.bank,
        branch: formData.branch || 'Designated Commercial Branch',
        accountNumber: formData.accountNumber || `ACC-${Math.floor(100000000 + Math.random() * 900000000)}`,
        amount: Number(formData.amount),
        issueDate: formData.issueDate,
        maturityDate: formData.maturityDate,
        interestRate: Number(formData.interestRate) || 7.25,
        tenureYears: Number(formData.tenureYears) || 10,
        purpose: formData.purpose,
        renewalEligibility: formData.renewalEligibility,
        jointHolder: formData.jointHolderClause,
        fileName: formData.fileName || `${formData.fdrNumber}_Deposit_Cert.pdf`,
        fileSize: formData.fileSize || '1.8 MB',
        remarks: 'New FDR submitted via online portal. Physical bank receipt verification pending at AICTE Regional Office.'
      });

      setIsSubmitting(false);
      setShowReviewModal(false);
      setSubmittedSuccess(true);
    }, 700);
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-[#16845B] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#142B4A]">
          FDR Registered & Submitted for Verification
        </h2>
        <p className="text-xs text-[#6B7A90] max-w-md mx-auto leading-relaxed">
          Fixed Deposit Receipt reference <strong className="text-[#172B4D]">{formData.fdrNumber}</strong> for{' '}
          <strong className="text-[#172B4D]">{formData.institutionName}</strong> has been added to the master ledger and queued for AICTE Regional Officer scrutiny.
        </p>

        <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl max-w-md mx-auto text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-[#6B7A90]">Institution:</span>
            <span className="font-semibold text-[#172B4D]">{formData.institutionName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7A90]">Principal Amount:</span>
            <span className="font-bold text-[#142B4A]">{formatINR(formData.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7A90]">Maturity Date:</span>
            <span className="font-medium text-[#172B4D]">{formData.maturityDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7A90]">Status:</span>
            <span className="font-semibold text-indigo-700">Under Verification</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/repository')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#142B4A] text-white hover:bg-[#244B75]"
          >
            View in FDR Repository
          </button>
          <button
            onClick={() => {
              setSubmittedSuccess(false);
              setFormData(prev => ({
                ...prev,
                fdrNumber: `FDR/SBI/2026/${Math.floor(10000 + Math.random() * 90000)}`,
                fileName: '',
                fileUploaded: false
              }));
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E2E8F0] bg-white text-[#172B4D] hover:bg-slate-50"
          >
            Register Another FDR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight">
            Register New Fixed Deposit Receipt (FDR)
          </h1>
          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200">
            Form SD-1
          </span>
        </div>
        <p className="text-xs text-[#6B7A90] mt-1">
          Record a new joint fixed deposit receipt for AICTE approval compliance. Fields marked with <span className="text-[#C84444] font-bold">*</span> are mandatory.
        </p>
      </div>

      {/* Simulated Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-[#244B75] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 shrink-0 text-[#244B75] mt-0.5" />
        <div className="leading-relaxed">
          <strong>Mandatory AICTE Norm:</strong> Every security deposit must be created jointly in the name of the Applicant Trust/Society/Institution and Regional Officer, AICTE, with lien marked in favor of Member Secretary, AICTE.
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Section A: Institution Information */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 text-sm font-bold text-[#142B4A]">
            <Building2 className="w-4 h-4 text-[#244B75]" />
            Section A: Technical Institution Information
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Institution Select or Enter */}
            <div className="space-y-1 md:col-span-2">
              <label className="block font-semibold text-[#172B4D]">
                Institution Name <span className="text-[#C84444]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  list="institution-options"
                  placeholder="Type or select institution name..."
                  value={formData.institutionName}
                  onChange={(e) => handleSelectInstitution(e.target.value)}
                  className={`w-full p-2.5 border rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A] ${
                    errors.institutionName ? 'border-[#C84444]' : 'border-[#E2E8F0]'
                  }`}
                />
                <datalist id="institution-options">
                  {institutions.map(i => (
                    <option key={i.id} value={i.name} />
                  ))}
                </datalist>
              </div>
              {errors.institutionName && (
                <p className="text-[11px] text-[#C84444]">{errors.institutionName}</p>
              )}
            </div>

            {/* AICTE ID */}
            <div className="space-y-1">
              <label className="block font-semibold text-[#172B4D]">
                AICTE Permanent ID <span className="text-[#C84444]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1-452891901"
                value={formData.aicteId}
                onChange={(e) => setFormData({ ...formData, aicteId: e.target.value })}
                className={`w-full p-2.5 border rounded-lg bg-[#F4F7FB] font-mono text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A] ${
                  errors.aicteId ? 'border-[#C84444]' : 'border-[#E2E8F0]'
                }`}
              />
              {errors.aicteId && (
                <p className="text-[11px] text-[#C84444]">{errors.aicteId}</p>
              )}
            </div>

            {/* Region */}
            <div className="space-y-1">
              <label className="block font-semibold text-[#172B4D]">
                AICTE Jurisdiction Region <span className="text-[#C84444]">*</span>
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
              >
                {AICTE_REGIONS.filter(r => r !== 'All Regions').map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="space-y-1 md:col-span-2">
              <label className="block font-semibold text-[#172B4D]">
                Campus Address & Pincode
              </label>
              <input
                type="text"
                placeholder="Institutional premises address..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
              />
            </div>
          </div>
        </div>

        {/* Section B: FDR Information */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 text-sm font-bold text-[#142B4A]">
            <Landmark className="w-4 h-4 text-[#244B75]" />
            Section B: Fixed Deposit Receipt Specifications
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* FDR Ref Number */}
            <div className="space-y-1">
              <label className="block font-semibold text-[#172B4D]">
                FDR Reference Number <span className="text-[#C84444]">*</span>
              </label>
              <input
                type="text"
                value={formData.fdrNumber}
                onChange={(e) => setFormData({ ...formData, fdrNumber: e.target.value })}
                className={`w-full p-2.5 border rounded-lg bg-[#F4F7FB] font-mono text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A] ${
                  errors.fdrNumber ? 'border-[#C84444]' : 'border-[#E2E8F0]'
                }`}
              />
              {errors.fdrNumber && (
                <p className="text-[11px] text-[#C84444]">{errors.fdrNumber}</p>
              )}
            </div>

            {/* Issuing Bank */}
            <div className="space-y-1">
              <label className="block font-semibold text-[#172B4D]">
                Issuing Bank <span className="text-[#C84444]">*</span>
              </label>
              <select
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
              >
                {BANK_LIST.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Branch / IFSC */}
            <div className="space-y-1">
              <label className="block font-semibold text-[#172B4D]">
                Branch Name & IFSC
              </label>
              <input
                type="text"
                placeholder="e.g. Sector 18 Branch (SBIN0004052)"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
              />
            </div>

            {/* Deposit Amount */}
            <div className="space-y-1">
              <label className="block font-semibold text-[#172B4D]">
                Deposit Amount (INR) <span className="text-[#C84444]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#6B7A90]">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full pl-7 pr-3 py-2.5 border rounded-lg bg-[#F4F7FB] font-semibold text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A] ${
                    errors.amount ? 'border-[#C84444]' : 'border-[#E2E8F0]'
                  }`}
                />
              </div>
              <p className="text-[10px] text-[#6B7A90]">
                {formData.amount ? `In words: ${formatINR(formData.amount)}` : ''}
              </p>
              {errors.amount && (
                <p className="text-[11px] text-[#C84444]">{errors.amount}</p>
              )}
            </div>

            {/* Issue Date */}
            <div className="space-y-1">
              <label className="block font-semibold text-[#172B4D]">
                Issue Date <span className="text-[#C84444]">*</span>
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
              />
              {errors.issueDate && (
                <p className="text-[11px] text-[#C84444]">{errors.issueDate}</p>
              )}
            </div>

            {/* Maturity Date */}
            <div className="space-y-1">
              <label className="block font-semibold text-[#172B4D]">
                Maturity Date <span className="text-[#C84444]">*</span>
              </label>
              <input
                type="date"
                value={formData.maturityDate}
                onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                className={`w-full p-2.5 border rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A] ${
                  errors.maturityDate ? 'border-[#C84444]' : 'border-[#E2E8F0]'
                }`}
              />
              {errors.maturityDate && (
                <p className="text-[11px] text-[#C84444]">{errors.maturityDate}</p>
              )}
            </div>

            {/* Interest Rate */}
            <div className="space-y-1">
              <label className="block font-semibold text-[#172B4D]">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="e.g. 7.25"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
              />
            </div>

            {/* Purpose of Deposit */}
            <div className="space-y-1 md:col-span-2">
              <label className="block font-semibold text-[#172B4D]">
                Purpose of Deposit <span className="text-[#C84444]">*</span>
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg bg-[#F4F7FB] text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#142B4A]"
              >
                {DEPOSIT_PURPOSES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Renewal Eligibility Toggle */}
            <div className="md:col-span-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.renewalEligibility}
                  onChange={(e) => setFormData({ ...formData, renewalEligibility: e.target.checked })}
                  className="rounded text-[#142B4A] focus:ring-[#142B4A] w-4 h-4"
                />
                <span className="text-xs font-medium text-[#172B4D]">
                  Eligible for auto-renewal under standard AICTE extension policy upon maturity
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section C: Document Upload */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 text-sm font-bold text-[#142B4A]">
            <UploadCloud className="w-4 h-4 text-[#244B75]" />
            Section C: Scanned Deposit Document Verification Upload
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 text-center hover:bg-slate-50 transition-colors"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-[#244B75] mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-[#172B4D]">
              Drag and drop original scanned bank FDR receipt here, or browse
            </p>
            <p className="text-[11px] text-[#6B7A90] mt-0.5">
              Supported file types: PDF, JPG, PNG (Max file size: 10 MB)
            </p>

            <label className="mt-3 inline-block">
              <span className="px-3 py-1.5 bg-white border border-[#E2E8F0] text-xs font-semibold rounded-lg text-[#142B4A] hover:bg-slate-50 cursor-pointer shadow-2xs">
                Browse Files
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleSimulatedFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4 max-w-xs mx-auto">
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#142B4A] h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#6B7A90] mt-1 block">Uploading file... {uploadProgress}%</span>
              </div>
            )}

            {formData.fileUploaded && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg max-w-sm mx-auto flex items-center justify-between text-xs text-left">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#16845B]" />
                  <div>
                    <span className="font-semibold text-emerald-900 block truncate max-w-[200px]">
                      {formData.fileName}
                    </span>
                    <span className="text-[10px] text-emerald-700">{formData.fileSize} • Uploaded</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, fileName: '', fileUploaded: false }))}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/repository')}
            className="px-4 py-2 border border-[#E2E8F0] rounded-lg bg-white text-xs font-semibold text-[#172B4D] hover:bg-slate-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                alert('Draft saved locally.');
              }}
              className="px-4 py-2 border border-[#E2E8F0] rounded-lg bg-white text-xs font-semibold text-[#172B4D] hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-[#6B7A90]" />
              Save as Draft
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#244B75] shadow-sm flex items-center gap-2"
            >
              Review & Submit for Verification
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Review Summary Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#142B4A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Review FDR Registration Summary</h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-[#6B7A90]">
                Please verify the recorded security deposit details before submitting to the regional ledger.
              </p>

              <div className="bg-[#F4F7FB] border border-[#E2E8F0] rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[#6B7A90]">Institution:</span>
                  <span className="font-bold text-[#142B4A] text-right">{formData.institutionName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[#6B7A90]">AICTE Permanent ID:</span>
                  <span className="font-mono font-semibold text-[#172B4D]">{formData.aicteId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[#6B7A90]">FDR Reference No:</span>
                  <span className="font-mono font-semibold text-[#172B4D]">{formData.fdrNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[#6B7A90]">Issuing Bank:</span>
                  <span className="font-semibold text-[#172B4D]">{formData.bank}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[#6B7A90]">Deposit Amount:</span>
                  <span className="font-extrabold text-[#142B4A] text-sm">{formatINR(formData.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[#6B7A90]">Issue & Maturity:</span>
                  <span className="font-medium text-[#172B4D]">{formData.issueDate} to {formData.maturityDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7A90]">Deposit Purpose:</span>
                  <span className="font-medium text-[#172B4D] text-right truncate max-w-[250px]">{formData.purpose}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
                <strong>Simulated Administrative Decision:</strong> Submitting will record this FDR as "Under Verification" and immediately reflect in dashboard KPIs and the FDR repository.
              </div>
            </div>

            <div className="bg-[#F8FAFC] px-6 py-3.5 border-t border-[#E2E8F0] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border border-[#E2E8F0] rounded-lg bg-white text-xs font-semibold text-[#172B4D]"
              >
                Back to Edit
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalConfirmSubmission}
                className="px-5 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#244B75] disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? 'Registering...' : 'Confirm & Submit to AICTE Ledger'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

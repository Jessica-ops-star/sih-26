import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').trim();

  let styles = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400'
  };

  switch (normalized) {
    case 'Active':
    case 'Compliant':
    case 'Approved':
      styles = {
        bg: 'bg-emerald-50',
        text: 'text-[#16845B]',
        border: 'border-emerald-200',
        dot: 'bg-[#16845B]'
      };
      break;

    case 'Expiring Soon':
    case 'Expiring':
    case 'Under Review':
    case 'Renewal In-Progress':
    case 'Action Required':
    case 'Additional Information Required':
      styles = {
        bg: 'bg-amber-50',
        text: 'text-[#B45309]',
        border: 'border-amber-200',
        dot: 'bg-[#D99119]'
      };
      break;

    case 'Matured':
    case 'Rejected':
    case 'Non-Compliant':
      styles = {
        bg: 'bg-rose-50',
        text: 'text-[#C84444]',
        border: 'border-rose-200',
        dot: 'bg-[#C84444]'
      };
      break;

    case 'Renewal Pending':
    case 'Renewal Required':
    case 'Under AICTE Review':
      styles = {
        bg: 'bg-blue-50',
        text: 'text-[#244B75]',
        border: 'border-blue-200',
        dot: 'bg-[#244B75]'
      };
      break;

    case 'Released':
      styles = {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-600'
      };
      break;

    case 'Under Verification':
    case 'Submitted':
      styles = {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-600'
      };
      break;

    default:
      styles = {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-500'
      };
      break;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {normalized || 'Unknown'}
    </span>
  );
}

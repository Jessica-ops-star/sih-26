// Date and currency helpers for AICTE Security Deposit Portal

/**
 * Format currency to Indian Rupees format (e.g., ₹10,00,000)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format date to standard Indian enterprise format (e.g., 15 Aug 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Calculate days remaining between current date and target maturity date
 */
export function getDaysRemaining(maturityDate) {
  if (!maturityDate) return 0;
  const target = new Date(maturityDate);
  const now = new Date();
  // Strip time for clean day diff
  const utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utc2 = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.ceil((utc2 - utc1) / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Compute the live status based on recorded status and days remaining
 */
export function getComputedStatus(fdr) {
  if (fdr.status === 'Released') return 'Released';
  if (fdr.status === 'Renewal Pending') return 'Renewal Pending';
  if (fdr.status === 'Under Verification') return 'Under Verification';

  const days = getDaysRemaining(fdr.maturityDate);
  if (days < 0) return 'Matured';
  if (days <= 30) return 'Expiring Soon';
  return 'Active';
}

/**
 * CSV Export utility
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(field => {
        let val = row[field];
        if (val === null || val === undefined) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

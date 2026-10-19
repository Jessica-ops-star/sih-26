import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FDRProvider } from './context/FDRContext';
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import FDRRepository from './pages/FDRRepository';
import RegisterFDR from './pages/RegisterFDR';
import InstitutionManagement from './pages/InstitutionManagement';
import MaturityTracker from './pages/MaturityTracker';
import RenewalManagement from './pages/RenewalManagement';
import ReleaseRequests from './pages/ReleaseRequests';
import ReportsAnalytics from './pages/ReportsAnalytics';
import AuditTrail from './pages/AuditTrail';
import Settings from './pages/Settings';

export default function App() {
  return (
    <FDRProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="repository" element={<FDRRepository />} />
            <Route path="register" element={<RegisterFDR />} />
            <Route path="institutions" element={<InstitutionManagement />} />
            <Route path="maturity-tracker" element={<MaturityTracker />} />
            <Route path="renewals" element={<RenewalManagement />} />
            <Route path="release-requests" element={<ReleaseRequests />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="audit-trail" element={<AuditTrail />} />
            <Route path="settings" element={<Settings />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FDRProvider>
  );
}

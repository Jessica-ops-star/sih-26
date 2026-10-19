import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_FDRS,
  INITIAL_RENEWALS,
  INITIAL_RELEASE_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_SETTINGS,
  CURRENT_USER
} from '../data/mockData';
import { getComputedStatus, getDaysRemaining } from '../utils/helpers';

const FDRContext = createContext(null);

const STORAGE_KEYS = {
  INSTITUTIONS: 'aicte_fdr_institutions',
  FDRS: 'aicte_fdr_records',
  RENEWALS: 'aicte_fdr_renewals',
  RELEASES: 'aicte_fdr_releases',
  AUDIT: 'aicte_fdr_audit_logs',
  NOTIFICATIONS: 'aicte_fdr_notifications',
  SETTINGS: 'aicte_fdr_settings',
  USER: 'aicte_fdr_current_user'
};

export function FDRProvider({ children }) {
  // Load from localStorage or initial mock data
  const [institutions, setInstitutions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTIONS;
  });

  const [fdrs, setFdrs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FDRS);
    return saved ? JSON.parse(saved) : INITIAL_FDRS;
  });

  const [renewals, setRenewals] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RENEWALS);
    return saved ? JSON.parse(saved) : INITIAL_RENEWALS;
  });

  const [releaseRequests, setReleaseRequests] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RELEASES);
    return saved ? JSON.parse(saved) : INITIAL_RELEASE_REQUESTS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  // Global search query
  const [globalSearch, setGlobalSearch] = useState('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
  }, [institutions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FDRS, JSON.stringify(fdrs));
  }, [fdrs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RENEWALS, JSON.stringify(renewals));
  }, [renewals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RELEASES, JSON.stringify(releaseRequests));
  }, [releaseRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Log an audit trail entry
  const addAuditLog = (entry) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp,
      user: currentUser.name,
      role: currentUser.role,
      ...entry
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add FDR
  const addFDR = (newFdrData) => {
    const newId = `FDR-2026-${String(fdrs.length + 1).padStart(3, '0')}`;
    const newFDR = {
      id: newId,
      status: 'Under Verification',
      verificationStatus: 'Under Verification',
      verifiedBy: 'Pending AICTE Verification',
      verifiedDate: null,
      ...newFdrData
    };

    setFdrs(prev => [newFDR, ...prev]);

    // Update institution deposit amount and count
    setInstitutions(prev => prev.map(inst => {
      if (inst.name.toLowerCase() === newFDR.institutionName.toLowerCase() || inst.aicteId === newFDR.aicteId) {
        return {
          ...inst,
          registeredFdrCount: inst.registeredFdrCount + 1,
          totalDepositValue: inst.totalDepositValue + Number(newFDR.amount || 0)
        };
      }
      return inst;
    }));

    // Add notification
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: 'info',
      title: 'New FDR Registered',
      message: `${newFDR.fdrNumber} for ${newFDR.institutionName} (₹${Number(newFDR.amount).toLocaleString('en-IN')}) submitted for verification.`,
      time: 'Just now',
      read: false,
      link: '/repository'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Add audit log
    addAuditLog({
      action: 'Registered New FDR',
      institution: newFDR.institutionName,
      fdrReference: newFDR.fdrNumber,
      previousStatus: 'None',
      newStatus: 'Under Verification',
      details: `New FDR registered with deposit value ₹${Number(newFDR.amount).toLocaleString('en-IN')}, Bank: ${newFDR.bank}`
    });

    return newFDR;
  };

  // Update FDR
  const updateFDR = (id, updatedFields) => {
    setFdrs(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updatedFields };
        addAuditLog({
          action: 'FDR Record Updated',
          institution: updated.institutionName,
          fdrReference: updated.fdrNumber,
          previousStatus: item.status,
          newStatus: updated.status,
          details: `Updated fields for FDR reference ${updated.fdrNumber}`
        });
        return updated;
      }
      return item;
    }));
  };

  // Delete/Archive FDR
  const deleteFDR = (id) => {
    const target = fdrs.find(f => f.id === id);
    if (target) {
      setFdrs(prev => prev.filter(f => f.id !== id));
      addAuditLog({
        action: 'FDR Record Archived/Removed',
        institution: target.institutionName,
        fdrReference: target.fdrNumber,
        previousStatus: target.status,
        newStatus: 'Archived',
        details: `FDR ${target.fdrNumber} was removed from the active register.`
      });
    }
  };

  // Add or Update Renewal
  const updateRenewal = (id, newStatus, replacementRef = '', notes = '') => {
    setRenewals(prev => prev.map(ren => {
      if (ren.id === id) {
        const updated = {
          ...ren,
          renewalStatus: newStatus,
          replacementFdrRef: replacementRef || ren.replacementFdrRef,
          lastAction: notes || `Status updated to ${newStatus}`,
          renewalHistory: [
            ...ren.renewalHistory,
            { date: new Date().toISOString().slice(0, 10), action: `${newStatus}: ${notes || 'Updated by official'}` }
          ]
        };

        // If replacement approved, update original FDR or register replacement
        if (newStatus === 'Approved & Replaced') {
          setFdrs(fdrList => fdrList.map(f => {
            if (f.id === ren.fdrId) {
              return {
                ...f,
                status: 'Active',
                remarks: `Renewed under replacement ref ${replacementRef || ren.replacementFdrRef}`,
                maturityDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
              };
            }
            return f;
          }));
        }

        addAuditLog({
          action: 'Renewal Status Updated',
          institution: ren.institution,
          fdrReference: ren.existingFdrRef,
          previousStatus: ren.renewalStatus,
          newStatus: newStatus,
          details: notes || `Renewal record updated to ${newStatus}`
        });

        return updated;
      }
      return ren;
    }));
  };

  // Create Release Request
  const addReleaseRequest = (requestData) => {
    const newId = `REL-2026-${String(releaseRequests.length + 1).padStart(3, '0')}`;
    const newReq = {
      id: newId,
      requestDate: new Date().toISOString().slice(0, 10),
      status: 'Submitted',
      assignedReviewer: currentUser.name,
      decisionDate: null,
      ...requestData
    };

    setReleaseRequests(prev => [newReq, ...prev]);

    addAuditLog({
      action: 'Release Request Filed',
      institution: newReq.institution,
      fdrReference: newReq.fdrRef,
      previousStatus: 'None',
      newStatus: 'Submitted',
      details: `Refund/Release request submitted. Reason: ${newReq.requestReason}`
    });

    return newReq;
  };

  // Update Release Request Status
  const updateReleaseStatus = (id, newStatus, remarks = '') => {
    setReleaseRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updated = {
          ...req,
          status: newStatus,
          reviewerRemarks: remarks || req.reviewerRemarks,
          decisionDate: ['Approved', 'Rejected', 'Released'].includes(newStatus) ? new Date().toISOString().slice(0, 10) : req.decisionDate
        };

        // If released, update FDR status to 'Released'
        if (newStatus === 'Released' || newStatus === 'Approved') {
          setFdrs(fdrList => fdrList.map(f => {
            if (f.fdrNumber === req.fdrRef || f.institutionName === req.institution) {
              return {
                ...f,
                status: newStatus === 'Released' ? 'Released' : f.status,
                remarks: `Simulated Administrative Decision: ${newStatus}. ${remarks}`
              };
            }
            return f;
          }));
        }

        addAuditLog({
          action: `Release Request ${newStatus}`,
          institution: req.institution,
          fdrReference: req.fdrRef,
          previousStatus: req.status,
          newStatus: newStatus,
          details: remarks || `Simulated administrative decision recorded: ${newStatus}`
        });

        return updated;
      }
      return req;
    }));
  };

  // Notifications
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Reset to initial mock dataset
  const resetToMockData = () => {
    setInstitutions(INITIAL_INSTITUTIONS);
    setFdrs(INITIAL_FDRS);
    setRenewals(INITIAL_RENEWALS);
    setReleaseRequests(INITIAL_RELEASE_REQUESTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(DEFAULT_SETTINGS);
    setCurrentUser(CURRENT_USER);
    localStorage.clear();
  };

  // Computed live metrics
  const activeFDRs = fdrs.filter(f => getComputedStatus(f) === 'Active');
  const expiring30FDRs = fdrs.filter(f => {
    const days = getDaysRemaining(f.maturityDate);
    return days >= 0 && days <= 30 && f.status !== 'Released';
  });
  const maturedFDRs = fdrs.filter(f => {
    const days = getDaysRemaining(f.maturityDate);
    return days < 0 && f.status !== 'Released';
  });
  const pendingRenewalsCount = renewals.filter(r => r.renewalStatus !== 'Approved & Replaced').length;
  const pendingReleaseCount = releaseRequests.filter(r => ['Submitted', 'Under Review', 'Additional Information Required'].includes(r.status)).length;
  const totalDepositAmount = fdrs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <FDRContext.Provider
      value={{
        institutions,
        setInstitutions,
        fdrs,
        setFdrs,
        renewals,
        releaseRequests,
        auditLogs,
        notifications,
        settings,
        setSettings,
        currentUser,
        setCurrentUser,
        globalSearch,
        setGlobalSearch,
        // Methods
        addFDR,
        updateFDR,
        deleteFDR,
        updateRenewal,
        addReleaseRequest,
        updateReleaseStatus,
        addAuditLog,
        markNotificationRead,
        markAllNotificationsRead,
        resetToMockData,
        // Computed metrics
        metrics: {
          totalFDRs: fdrs.length,
          activeFDRs: activeFDRs.length,
          expiring30FDRs: expiring30FDRs.length,
          maturedFDRs: maturedFDRs.length,
          pendingRenewalsCount,
          pendingReleaseCount,
          totalDepositAmount
        }
      }}
    >
      {children}
    </FDRContext.Provider>
  );
}

export function useFDR() {
  const context = useContext(FDRContext);
  if (!context) {
    throw new Error('useFDR must be used within an FDRProvider');
  }
  return context;
}

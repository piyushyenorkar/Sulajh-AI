import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceTopBar } from '../components/workspace/WorkspaceTopBar';
import { AdminWorkspace } from '../components/workspace/AdminWorkspace';

export default function Admin() {
  const navigate = useNavigate();
  const [activeScopeTab, setActiveScopeTab] = useState<'all' | 'queue' | 'case' | 'incidents' | 'admin_policy' | 'admin_audit'>('admin_policy');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleChange = (role: 'ops_agent' | 'ops_manager' | 'admin') => {
    if (role === 'admin') {
      setActiveScopeTab('admin_policy');
    } else {
      navigate(`/ops?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] text-[#12141A] font-['DM_Sans',sans-serif] antialiased flex flex-col selection:bg-[#F2531D]/20">
      
      {/* ─── TOP BAR FLUSH AT TOP (0 MARGIN, 0 RADIUS) ─── */}
      <WorkspaceTopBar
        currentRole="admin"
        onRoleChange={handleRoleChange}
        activeScopeTab={activeScopeTab}
        onScopeTabChange={(tab) => {
          if (tab === 'queue' || tab === 'case' || tab === 'all') {
            navigate('/ops');
          } else {
            setActiveScopeTab(tab);
          }
        }}
        openCaseId="SYS-GOV"
        openCaseMerchant="Policy Engine v2.4"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        notificationCount={2}
      />

      {/* ─── WORKING AREA (FULL WIDTH, CLEAN CONTAINER) ─── */}
      <main className="flex-1 w-full max-w-[1680px] mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto">
        <AdminWorkspace onBackToQueue={() => navigate('/ops')} />
      </main>

    </div>
  );
}

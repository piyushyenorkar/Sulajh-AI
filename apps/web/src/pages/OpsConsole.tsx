import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  CheckCircle2, 
  X,
  AlertOctagon
} from 'lucide-react';
import { api } from '../lib/api';
import { OPS_TICKETS, OpsTicket } from '../data/opsConsoleData';
import { WorkspaceTopBar } from '../components/workspace/WorkspaceTopBar';
import { QueueHome } from '../components/workspace/QueueHome';
import { CaseWorkspaceHero } from '../components/workspace/CaseWorkspaceHero';
import { ManagerWorkspace } from '../components/workspace/ManagerWorkspace';
import { AdminWorkspace } from '../components/workspace/AdminWorkspace';

export default function OpsConsole() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Staff Role: 'ops_agent' | 'ops_manager' | 'admin'
  const roleParam = searchParams.get('role');
  const [currentRole, setCurrentRole] = useState<'ops_agent' | 'ops_manager' | 'admin'>(
    roleParam === 'ops_manager' ? 'ops_manager' : roleParam === 'admin' ? 'admin' : 'ops_agent'
  );

  // Active Workspace Scope Tab
  const [activeScopeTab, setActiveScopeTab] = useState<'all' | 'queue' | 'case' | 'incidents' | 'admin_policy' | 'admin_audit'>('queue');

  // Currently opened case (default to first ticket: Ramesh Kirana)
  const [selectedTicket, setSelectedTicket] = useState<OpsTicket>(OPS_TICKETS[0]);

  // Global Search input in Top Bar
  const [searchQuery, setSearchQuery] = useState('');

  // Floating Toast Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    api.ensureOpsSession();
  }, []);

  // Sync role changes
  const handleRoleChange = (newRole: 'ops_agent' | 'ops_manager' | 'admin') => {
    setCurrentRole(newRole);
    setSearchParams({ role: newRole });
    if (newRole === 'admin') {
      setActiveScopeTab('admin_policy');
    } else if (newRole === 'ops_manager') {
      setActiveScopeTab('all');
    } else {
      setActiveScopeTab('queue');
    }
    showToast(`Switched persona to ${newRole === 'ops_agent' ? 'L1 Frontline Agent' : newRole === 'ops_manager' ? 'Ops Manager (L2)' : 'Risk Admin'}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Open a case tab
  const handleSelectTicket = (ticket: OpsTicket) => {
    setSelectedTicket(ticket);
    setActiveScopeTab('case');
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] text-[#12141A] font-['DM_Sans',sans-serif] antialiased flex flex-col selection:bg-[#F2531D]/20">
      
      {/* ─── TOP BAR FLUSH AT TOP (0 MARGIN, 0 RADIUS, ATTACHED TO BROWSER EDGES) ─── */}
      <WorkspaceTopBar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeScopeTab={activeScopeTab}
        onScopeTabChange={(tab) => setActiveScopeTab(tab)}
        openCaseId={selectedTicket?.ticketNumber || 'TKT-9921'}
        openCaseMerchant={selectedTicket?.merchantName || 'Ramesh Kirana'}
        onCloseCaseTab={() => setActiveScopeTab(currentRole === 'ops_manager' ? 'all' : 'queue')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        notificationCount={3}
      />

      {/* ─── FLOATING TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#12141A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-medium border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── WORKING AREA (FULL WIDTH, CLEAN CONTAINER, ZERO AWKWARD MARGINS) ─── */}
      <main className="flex-1 w-full max-w-[1680px] mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto">
        
        {/* VIEW ROUTING BASED ON ROLE & TAB */}
        {activeScopeTab === 'case' ? (
          /* L1-2 / M-2: Hero Case Workspace (EquipFlow 3-Column Layout) */
          <CaseWorkspaceHero
            ticket={selectedTicket}
            currentRole={currentRole}
            onBackToQueue={() => setActiveScopeTab(currentRole === 'ops_manager' ? 'all' : 'queue')}
            onApproveSuccess={(msg) => showToast(msg)}
            onEscalate={(tkt) => {
              tkt.status = 'escalated';
              showToast(`Ticket ${tkt.ticketNumber} escalated to Ops Manager desk (&gt; ₹25,000 threshold).`);
              setActiveScopeTab('all');
            }}
          />
        ) : currentRole === 'admin' ? (
          /* Admin Console Workspace */
          <AdminWorkspace
            onBackToQueue={() => setActiveScopeTab('queue')}
          />
        ) : currentRole === 'ops_manager' ? (
          /* Ops Manager Console Workspace */
          <ManagerWorkspace
            onSelectTicket={handleSelectTicket}
            onOpenBulkRetry={() => showToast('Opening HDFC bulk retry console...')}
          />
        ) : (
          /* L1 Ops Agent Queue Workspace */
          <QueueHome
            onSelectTicket={handleSelectTicket}
            onOpenNextCase={() => handleSelectTicket(OPS_TICKETS[0])}
          />
        )}

      </main>

    </div>
  );
}

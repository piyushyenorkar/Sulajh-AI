import React from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  Bell, 
  X, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  Layers
} from 'lucide-react';

export interface WorkspaceTopBarProps {
  currentRole: 'ops_agent' | 'ops_manager' | 'admin';
  onRoleChange: (role: 'ops_agent' | 'ops_manager' | 'admin') => void;
  activeScopeTab: 'all' | 'queue' | 'case' | 'incidents' | 'admin_policy' | 'admin_audit';
  onScopeTabChange: (tab: 'all' | 'queue' | 'case' | 'incidents' | 'admin_policy' | 'admin_audit') => void;
  openCaseId?: string;
  openCaseMerchant?: string;
  onCloseCaseTab?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  notificationCount?: number;
}

export const WorkspaceTopBar: React.FC<WorkspaceTopBarProps> = ({
  currentRole,
  onRoleChange,
  activeScopeTab,
  onScopeTabChange,
  openCaseId = 'CASE-1042',
  openCaseMerchant = 'Ramesh Kirana',
  onCloseCaseTab,
  searchQuery,
  onSearchChange,
  notificationCount = 3,
}) => {
  return (
    <header className="h-[72px] px-4 sm:px-6 md:px-8 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
      
      {/* ─── LEFT: BRAND + BACK + WORKSPACE TABS ─── */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2">
        
        {/* Brand Logo Mark */}
        <div className="flex items-center gap-2.5 shrink-0 pr-1">
          <div className="w-8 h-8 rounded-xl bg-[#12141A] flex items-center justify-center text-white shadow-xs">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2531D]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="font-['Outfit',sans-serif] font-bold text-base text-slate-900 tracking-tight hidden md:inline">
            Sulajh<span className="text-[#F2531D]">.AI</span>
          </span>
        </div>

        {/* Round Back Button */}
        <button
          type="button"
          onClick={() => onScopeTabChange('queue')}
          title="Back to queue"
          className="w-9 h-9 rounded-full border border-slate-200/90 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition shrink-0 cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Workspace Pill Tabs */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1 rounded-full border border-slate-200/60">
          
          {/* Tab 1: All Cases */}
          <button
            type="button"
            onClick={() => onScopeTabChange('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeScopeTab === 'all'
                ? 'bg-[#12141A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span>All cases</span>
          </button>

          {/* Tab 2: My Queue */}
          <button
            type="button"
            onClick={() => onScopeTabChange('queue')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeScopeTab === 'queue'
                ? 'bg-[#12141A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span>My queue</span>
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
              activeScopeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              12
            </span>
          </button>

          {/* Tab 3: Active Closable Case Tab (The Signature EquipFlow Active Tab) */}
          <div
            className={`pl-3.5 pr-2 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
              activeScopeTab === 'case'
                ? 'bg-[#12141A] text-white'
                : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => onScopeTabChange('case')}
          >
            <span className="font-mono text-[11px] tracking-tight">{openCaseId}</span>
            <span className="text-slate-400">•</span>
            <span className="truncate max-w-[110px]">{openCaseMerchant}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCloseCaseTab) onCloseCaseTab();
                else onScopeTabChange('queue');
              }}
              className={`w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer ${
                activeScopeTab === 'case' ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>

          {/* Round "+" Button */}
          <button
            type="button"
            onClick={() => onScopeTabChange('queue')}
            title="Open new case"
            className="w-7 h-7 rounded-full bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-900 transition shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>

      </div>

      {/* ─── RIGHT: SEARCH + BELL + ROLE SWITCHER & AVATAR ─── */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Pill Search Field with keyboard hint */}
        <div className="relative hidden lg:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cases or IDs..."
            className="w-48 xl:w-56 pl-9 pr-10 py-1.5 rounded-full bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-transparent focus:border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Bell Button with count dot */}
        <button
          type="button"
          className="w-9 h-9 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[2]" />
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F2531D] ring-2 ring-white" />
          )}
        </button>

        {/* Persona Role Switcher Pills (Judges Instant Testing) */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/80">
          <button
            type="button"
            onClick={() => onRoleChange('ops_agent')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
              currentRole === 'ops_agent'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3 h-3 text-blue-600" />
            <span>L1 Agent</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('ops_manager')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
              currentRole === 'ops_manager'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-violet-600" />
            <span>Manager</span>
            <Lock className="w-2.5 h-2.5 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('admin')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
              currentRole === 'admin'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3 h-3 text-slate-700" />
            <span>Admin</span>
            <Lock className="w-2.5 h-2.5 text-slate-400" />
          </button>
        </div>

        {/* User Avatar Circle */}
        <div
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:ring-2 hover:ring-[#F2531D]/40 transition"
          title={currentRole === 'ops_agent' ? 'Vikram Singh (L1 Agent)' : currentRole === 'ops_manager' ? 'Neha Gupta (Ops Manager)' : 'Piyush Admin'}
        >
          {currentRole === 'ops_agent' ? 'VS' : currentRole === 'ops_manager' ? 'NG' : 'PA'}
        </div>

      </div>

    </header>
  );
};


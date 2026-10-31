import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  Bell, 
  X, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  Layers,
  LogOut,
  ChevronDown
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
  openCaseId = 'TKT-9921',
  openCaseMerchant = 'Ramesh Kirana Store',
  onCloseCaseTab,
  searchQuery,
  onSearchChange,
  notificationCount = 3,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[72px] px-4 sm:px-6 md:px-8 border-b border-slate-200/90 bg-white flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
      
      {/* ─── LEFT: BRAND + BACK BUTTON + WORKSPACE TABS (EQUIPFLOW STYLE) ─── */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-1">
        
        {/* Brand Logo Mark */}
        <div className="flex items-center gap-2.5 shrink-0 pr-1">
          <div className="w-8 h-8 rounded-xl bg-[#12141A] flex items-center justify-center text-white shadow-xs">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2531D]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="font-['Outfit',sans-serif] font-bold text-lg text-slate-900 tracking-tight hidden sm:inline">
            Sulajh<span className="text-[#F2531D]">.AI</span>
          </span>
        </div>

        {/* Round Back Button */}
        <button
          type="button"
          onClick={() => onScopeTabChange('queue')}
          title="Back to queue"
          className="w-8 h-8 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shrink-0 cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Scope Pills & Active Workspace Tab (Mirrors All Sites, Riverside, TR-0411 ✕, +) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Tab 1: All Cases Pill */}
          <button
            type="button"
            onClick={() => onScopeTabChange('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeScopeTab === 'all'
                ? 'bg-[#12141A] text-white shadow-xs'
                : 'bg-[#ECEEF2] hover:bg-slate-200 text-slate-800'
            }`}
          >
            <span>All cases</span>
          </button>

          {/* Tab 2: My Queue Pill with Count */}
          <button
            type="button"
            onClick={() => onScopeTabChange('queue')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeScopeTab === 'queue'
                ? 'bg-[#12141A] text-white shadow-xs'
                : 'bg-[#ECEEF2] hover:bg-slate-200 text-slate-800'
            }`}
          >
            <span>My queue</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeScopeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-800'
            }`}>
              12
            </span>
          </button>

          {/* Tab 3: Active Workspace Tab (1:1 EquipFlow TR-0411 · EX-0157 ✕) */}
          <div
            className={`h-9 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeScopeTab === 'case'
                ? 'bg-[#F4F5F7] text-slate-900 border-slate-300/80 shadow-2xs font-semibold'
                : 'bg-[#ECEEF2] text-slate-600 border-transparent hover:border-slate-300'
            }`}
            onClick={() => onScopeTabChange('case')}
          >
            <span className="font-mono text-xs font-bold text-slate-900">{openCaseId}</span>
            <span className="text-slate-400 font-normal">·</span>
            <span className="truncate max-w-[150px] font-medium text-slate-700">{openCaseMerchant}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCloseCaseTab) onCloseCaseTab();
                else onScopeTabChange('queue');
              }}
              title="Close case tab"
              className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer ml-1"
            >
              <X className="w-3 h-3 stroke-[2.2]" />
            </button>
          </div>

          {/* Round "+" Button (Right beside the open tab in EquipFlow reference) */}
          <button
            type="button"
            onClick={() => onScopeTabChange('queue')}
            title="Open new case"
            className="w-8 h-8 rounded-full bg-white border border-slate-300/80 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>

      </div>

      {/* ─── RIGHT: SEARCH FIELD + NOTIFICATION BELL + USER AVATAR & ROLE MENU ─── */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Pill Search Field with keyboard hint */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search assets or IDs..."
            className="w-48 lg:w-56 pl-10 pr-12 py-2 rounded-full bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-transparent focus:border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Bell Button with count dot */}
        <button
          type="button"
          className="w-10 h-10 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[2]" />
          {notificationCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#F2531D] ring-2 ring-white" />
          )}
        </button>

        {/* User Avatar with role switcher dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentRole === 'ops_agent' ? 'VS' : currentRole === 'ops_manager' ? 'NG' : 'PA'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-900 leading-none">
                {currentRole === 'ops_agent' ? 'Vikram Singh' : currentRole === 'ops_manager' ? 'Neha Gupta' : 'Piyush (Admin)'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">
                {currentRole === 'ops_agent' ? 'L1 Ops Agent' : currentRole === 'ops_manager' ? 'Ops Manager (L2)' : 'Risk Admin'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile & Persona Switcher Popover */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 text-xs animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">
                  {currentRole === 'ops_agent' ? 'Vikram Singh' : currentRole === 'ops_manager' ? 'Neha Gupta' : 'Piyush (Admin)'}
                </p>
                <p className="text-slate-400 text-[11px]">Paytm Autonomous Operations Desk</p>
              </div>

              <div className="py-2">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Console Role
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRoleChange('ops_agent');
                    setShowProfileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-semibold transition cursor-pointer ${
                    currentRole === 'ops_agent' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>L1 Ops Agent</span>
                  </div>
                  {currentRole === 'ops_agent' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRoleChange('ops_manager');
                    setShowProfileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-semibold transition cursor-pointer ${
                    currentRole === 'ops_manager' ? 'bg-purple-50 text-purple-700' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Ops Manager (L2)</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRoleChange('admin');
                    setShowProfileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-semibold transition cursor-pointer ${
                    currentRole === 'admin' ? 'bg-orange-50 text-orange-700' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-600" />
                    <span>Risk Admin</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href="/login"
                  className="w-full text-left px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </a>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

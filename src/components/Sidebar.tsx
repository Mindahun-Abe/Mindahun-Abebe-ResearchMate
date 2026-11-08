import React from 'react';
import {
  LayoutDashboard,
  Settings2,
  CheckSquare,
  BookMarked,
  Copy,
  Eye,
  FileText,
  ShieldAlert,
  TableProperties,
  GitBranch,
  Sparkles,
  FileEdit,
  Download,
  Award,
  Menu,
  X,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'project_wizard'
  | 'criteria_manager'
  | 'library'
  | 'duplicate_resolver'
  | 'screening_workbench'
  | 'pdf_workbench'
  | 'quality_appraisal'
  | 'evidence_extraction'
  | 'prisma_diagram'
  | 'included_results'
  | 'notebook_briefing'
  | 'proposal_generator'
  | 'export_backup';

export interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  color?: string;
  highlight?: boolean;
}

export interface NavSection {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  platformMode: 'windows' | 'android';
  pendingDuplicateCount: number;
  unscreenedCount: number;
  includedCount: number;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  platformMode,
  pendingDuplicateCount,
  unscreenedCount,
  includedCount,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const navSections: NavSection[] = [
    {
      group: 'OVERVIEW & PROTOCOL',
      items: [
        { id: 'dashboard' as NavTab, label: 'Research Dashboard', icon: LayoutDashboard },
        { id: 'project_wizard' as NavTab, label: 'Protocol & Framework', icon: Settings2 },
        { id: 'criteria_manager' as NavTab, label: 'Eligibility Criteria', icon: CheckSquare },
      ],
    },
    {
      group: 'LITERATURE WORKBENCH',
      items: [
        {
          id: 'library' as NavTab,
          label: 'Article Library',
          icon: BookMarked,
        },
        {
          id: 'duplicate_resolver' as NavTab,
          label: 'Duplicate Detection',
          icon: Copy,
          badge: pendingDuplicateCount > 0 ? `${pendingDuplicateCount}` : undefined,
          badgeColor: 'bg-amber-500 text-slate-900',
        },
        {
          id: 'screening_workbench' as NavTab,
          label: 'Title & Abstract Screening',
          icon: Eye,
          badge: unscreenedCount > 0 ? `${unscreenedCount}` : undefined,
          badgeColor: 'bg-blue-600 text-white',
        },
        {
          id: 'pdf_workbench' as NavTab,
          label: 'PDF Reader & Evidence',
          icon: FileText,
        },
      ],
    },
    {
      group: 'SYNTHESIS & APPRAISAL',
      items: [
        { id: 'quality_appraisal' as NavTab, label: 'Quality & Risk of Bias', icon: ShieldAlert },
        { id: 'evidence_extraction' as NavTab, label: 'Evidence Extraction', icon: TableProperties },
        { id: 'prisma_diagram' as NavTab, label: 'PRISMA 2020 Flow', icon: GitBranch },
        {
          id: 'included_results' as NavTab,
          label: 'Results for Included Studies',
          icon: Award,
          badge: `${includedCount}`,
          badgeColor: 'bg-emerald-600 text-white',
          highlight: true,
        },
        {
          id: 'notebook_briefing' as NavTab,
          label: 'NotebookLM Briefing',
          icon: Sparkles,
          color: 'text-amber-400',
        },
      ],
    },
    {
      group: 'WRITING & PUBLICATION',
      items: [
        { id: 'proposal_generator' as NavTab, label: 'Proposal & Manuscript AI', icon: FileEdit },
        { id: 'export_backup' as NavTab, label: 'Export & Backup Hub', icon: Download },
      ],
    },
  ];

  // Android Mobile Drawer Overlay
  const mobileDrawer = (
    <div
      className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm transition-opacity ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => onToggleMobileMenu(false)}
    >
      <div
        className={`w-72 max-w-[85%] h-full bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto transition-transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <span className="font-bold text-sm text-slate-100">ResearchMate Menu</span>
          <button
            onClick={() => onToggleMobileMenu(false)}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {navSections.map((sec, idx) => (
          <div key={idx} className="mb-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
              {sec.group}
            </h4>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onToggleMobileMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color || 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // If in Android Mode, show bottom navigation bar + mobile drawer
  if (platformMode === 'android') {
    const bottomTabs = [
      { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
      { id: 'library' as NavTab, label: 'Library', icon: BookMarked },
      { id: 'screening_workbench' as NavTab, label: 'Screen', icon: Eye, badge: unscreenedCount },
      { id: 'pdf_workbench' as NavTab, label: 'PDFs', icon: FileText },
      { id: 'included_results' as NavTab, label: 'Results', icon: Award },
    ];

    return (
      <>
        {mobileDrawer}
        {/* Floating Android Menu Button */}
        <button
          onClick={() => onToggleMobileMenu(true)}
          className="fixed bottom-16 right-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-transform active:scale-95 flex items-center justify-center"
          title="Open Full Research Modules"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Android Bottom Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 h-14 flex items-center justify-around px-1 select-none">
          {bottomTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </>
    );
  }

  // Windows Desktop Left Sidebar
  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 select-none overflow-y-auto">
      <div className="p-3 space-y-5">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx}>
            <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {sec.group}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : item.highlight
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-900/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-white' : item.color || (item.highlight ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200')
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto p-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Local SQLite / IndexedDB</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Database Active"></span>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Windows 11 Workstation Engine</div>
      </div>
    </aside>
  );
};

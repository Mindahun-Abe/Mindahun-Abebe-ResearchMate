import React from 'react';
import {
  BookOpen,
  Monitor,
  Smartphone,
  PlusCircle,
  Database,
  Search,
  UploadCloud,
  Copy,
  Wifi,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ResearchProject } from '../types/research';

interface HeaderProps {
  projects: ResearchProject[];
  activeProject: ResearchProject;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  platformMode: 'windows' | 'android';
  onTogglePlatformMode: (mode: 'windows' | 'android') => void;
  onOpenImport: () => void;
  onOpenOnlineSearch: () => void;
  onOpenBackup: () => void;
  onResetSampleData: () => void;
  pendingDuplicateCount: number;
  onOpenDuplicateResolver: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onNewProject,
  platformMode,
  onTogglePlatformMode,
  onOpenImport,
  onOpenOnlineSearch,
  onOpenBackup,
  onResetSampleData,
  pendingDuplicateCount,
  onOpenDuplicateResolver,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Left Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-900/30">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">ResearchMate AI</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded">
                v2.0 Universal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] md:max-w-[280px]">
              Systematic Review & Synthesis Platform
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center gap-2 flex-1 max-w-xl mx-2">
          <div className="relative flex-1 min-w-[140px]">
            <select
              value={activeProject.id}
              onChange={(e) => onSelectProject(e.target.value)}
              className="w-full bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-md px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
              title={activeProject.title}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title.length > 55 ? p.title.substring(0, 55) + '...' : p.title} ({p.reviewType})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onNewProject}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
            title="Create New Research Project"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">New Project</span>
          </button>
        </div>

        {/* Action Tools & View Mode Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Online Search Button */}
          <button
            onClick={onOpenOnlineSearch}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 hover:border-blue-500/40 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Search Crossref and PubMed databases online"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">Online DB Search</span>
          </button>

          {/* Import Button */}
          <button
            onClick={onOpenImport}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Import RIS, BibTeX, CSV, DOIs, PDFs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Duplicate Alert Pill */}
          {pendingDuplicateCount > 0 && (
            <button
              onClick={onOpenDuplicateResolver}
              className="px-2 py-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors animate-pulse"
              title={`${pendingDuplicateCount} duplicate articles detected for resolution`}
            >
              <Copy className="w-3 h-3 text-amber-400" />
              <span>{pendingDuplicateCount} Dup</span>
            </button>
          )}

          {/* Platform Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onTogglePlatformMode('windows')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                platformMode === 'windows'
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Windows 11 Workstation Desktop Layout"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Desktop</span>
            </button>
            <button
              onClick={() => onTogglePlatformMode('android')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                platformMode === 'android'
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Android Mobile Touch Layout"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Android</span>
            </button>
          </div>

          {/* Backup & Sync Button */}
          <button
            onClick={onOpenBackup}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md transition-colors"
            title="Database Backup, Restore, and Local Sync"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Reset sample data */}
          <button
            onClick={onResetSampleData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 rounded-md transition-colors"
            title="Reload Synthetic Sample Project (Clinical AI ICU)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

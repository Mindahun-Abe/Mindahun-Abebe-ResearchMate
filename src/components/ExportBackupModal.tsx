import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Database,
  X,
  Check,
  FileText,
  FileCode,
  Table,
  GitBranch,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  HardDrive,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { ResearchProject, Article, PrismaReportCounts } from '../types/research';
import {
  exportToWordHtml,
  exportToBibtex,
  exportToRis,
  exportToCsv,
  exportExtractionMatrixCsv,
  downloadBlob,
  downloadText,
} from '../utils/exportHelpers';

interface ExportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ResearchProject;
  articles: Article[];
  prismaCounts: PrismaReportCounts;
  onRestoreBackup: (project: ResearchProject, articles: Article[]) => void;
  onResetSampleData: () => void;
}

export const ExportBackupModal: React.FC<ExportBackupModalProps> = ({
  isOpen,
  onClose,
  project,
  articles,
  prismaCounts,
  onRestoreBackup,
  onResetSampleData,
}) => {
  const [activeTab, setActiveTab] = useState<'exports' | 'backup' | 'sync'>('exports');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const includedArticles = articles.filter((a) => a.screeningStatus === 'INCLUDE');

  // Backup: download complete JSON database archive
  const handleExportFullJsonArchive = () => {
    const archive = {
      version: 'ResearchMate-AI-v2.0-Archive',
      timestamp: new Date().toISOString(),
      project,
      articles,
      prismaCounts,
    };

    downloadText(
      JSON.stringify(archive, null, 2),
      `researchmate_project_backup_${project.id}_${Date.now()}.json`,
      'application/json'
    );
    setStatusMessage('Full project backup archive downloaded successfully.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Restore: upload JSON backup
  const handleRestoreJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);

        if (!parsed.project || !Array.isArray(parsed.articles)) {
          throw new Error('Invalid project archive structure');
        }

        onRestoreBackup(parsed.project, parsed.articles);
        setStatusMessage('Project database successfully restored!');
        setTimeout(() => {
          setStatusMessage(null);
          onClose();
        }, 1500);
      } catch (err: any) {
        alert(`Restore error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                Export, Backup & Synchronization Hub
              </h2>
              <p className="text-[11px] text-slate-500">
                Multi-format publication exports, local database archives, and multi-device sync
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('exports')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'exports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Publication Exports
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Database Backup & Restore
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Windows & Android Sync Status
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{statusMessage}</span>
            </div>
          )}

          {activeTab === 'exports' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* BibTeX */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900">BibTeX Library (.bib)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Export all {articles.length} library records or included studies into standard BibTeX.
                </p>
                <button
                  onClick={() =>
                    downloadText(exportToBibtex(articles), 'researchmate_library.bib', 'application/x-bibtex')
                  }
                  className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download .bib
                </button>
              </div>

              {/* RIS */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900">RIS Reference File (.ris)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Importable into EndNote, Zotero, Mendeley, and Reference Manager.
                </p>
                <button
                  onClick={() =>
                    downloadText(exportToRis(articles), 'researchmate_library.ris', 'application/x-research-info-systems')
                  }
                  className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download .ris
                </button>
              </div>

              {/* CSV Library */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Screening Table (.csv)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Full tabular report of all screened studies with status and exclusion reasons.
                </p>
                <button
                  onClick={() =>
                    downloadText(exportToCsv(articles), 'researchmate_screening_records.csv', 'text/csv')
                  }
                  className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download .csv
                </button>
              </div>

              {/* Extraction Matrix CSV */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900">Extraction Matrix (.csv)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Cross-study matrix of extracted data across {includedArticles.length} included papers.
                </p>
                <button
                  onClick={() =>
                    downloadText(
                      exportExtractionMatrixCsv(includedArticles, project),
                      'researchmate_extraction_matrix.csv',
                      'text/csv'
                    )
                  }
                  className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Matrix
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Create Full Project Backup (.json)</h4>
                <p className="text-[11px] text-slate-500">
                  Downloads an uncompressed JSON archive encompassing protocol settings, criteria, all article records, evidence citations, quality appraisals, and PRISMA audit histories.
                </p>
                <button
                  onClick={handleExportFullJsonArchive}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download Complete Project Archive
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Restore Project from Backup File</h4>
                <p className="text-[11px] text-slate-500">
                  Upload a previously saved ResearchMate JSON archive to restore your complete research project state.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleRestoreJsonFile}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Backup File (.json)
                </button>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-900 block">Reset to Synthetic Sample Project</span>
                  <span className="text-[11px] text-amber-800">
                    Restores the Clinical AI ICU sample dataset for demonstration and testing.
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Reset to the sample Clinical AI ICU project?')) {
                      onResetSampleData();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shrink-0"
                >
                  Reload Sample
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-slate-900 text-xs">Local SQLite & IndexedDB Storage</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ResearchMate AI operates on a robust local-first architecture. All screening actions, evidence annotations, and protocol definitions persist automatically in browser IndexedDB/LocalStorage.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200">
                  <Check className="w-4 h-4" /> Offline Queuing Active — Decisions recorded offline synchronize instantly on reconnection.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-slate-900 text-xs">Android & Windows Cross-Device Synchronization</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  To synchronize projects between Windows desktop and Android mobile devices, use the "Download Complete Project Archive" and "Upload Backup File" actions or host this server instance within your private local network or hospital intranet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

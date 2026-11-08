import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  GitBranch,
  Award,
  Search,
  UploadCloud,
  Copy,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { ResearchProject, Article, PrismaReportCounts } from '../types/research';
import { NavTab } from './Sidebar';

interface DashboardProps {
  project: ResearchProject;
  articles: Article[];
  prismaCounts: PrismaReportCounts;
  pendingDuplicateCount: number;
  onNavigate: (tab: NavTab) => void;
  onOpenOnlineSearch: () => void;
  onOpenImport: () => void;
  onSelectArticle: (article: Article) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  project,
  articles,
  prismaCounts,
  pendingDuplicateCount,
  onNavigate,
  onOpenOnlineSearch,
  onOpenImport,
  onSelectArticle,
}) => {
  const totalArticles = articles.length;
  const includedCount = articles.filter((a) => a.screeningStatus === 'INCLUDE').length;
  const excludedCount = articles.filter((a) => a.screeningStatus === 'EXCLUDE').length;
  const uncertainCount = articles.filter((a) => a.screeningStatus === 'UNCERTAIN').length;
  const unscreenedCount = articles.filter((a) => a.screeningStatus === 'UNSCREENED').length;

  const screeningProgress =
    totalArticles > 0
      ? Math.round(((totalArticles - unscreenedCount) / totalArticles) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Project Context & Protocol */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {project.reviewType}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Protocol {project.protocolVersion} ({project.protocolDate})
              </span>
              <span className="text-xs bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                Framework: {project.framework.type}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {project.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
              {project.aim}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <button
              onClick={() => onNavigate('included_results')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-emerald-900/40"
            >
              <Award className="w-4 h-4" />
              <span>Generate Results for Included</span>
            </button>
            <button
              onClick={() => onNavigate('project_wizard')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Edit Protocol & PICOC</span>
            </button>
          </div>
        </div>

        {/* Screening Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="font-medium">Screening Lifecycle Progress</span>
            <span className="font-semibold text-blue-300">{screeningProgress}% Screened</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${totalArticles ? (includedCount / totalArticles) * 100 : 0}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Included: ${includedCount}`}
            />
            <div
              style={{ width: `${totalArticles ? (excludedCount / totalArticles) * 100 : 0}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Excluded: ${excludedCount}`}
            />
            <div
              style={{ width: `${totalArticles ? (uncertainCount / totalArticles) * 100 : 0}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Uncertain: ${uncertainCount}`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {includedCount} Included
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {excludedCount} Excluded
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {uncertainCount} Uncertain
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              {unscreenedCount} Unscreened
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Articles */}
        <div
          onClick={() => onNavigate('library')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Library Records</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalArticles}</div>
          <p className="text-[11px] text-slate-500 mt-1">Identified from all sources</p>
        </div>

        {/* Included */}
        <div
          onClick={() => onNavigate('included_results')}
          className="bg-white border border-emerald-100 rounded-xl p-4 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Included Studies</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{includedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Meets all criteria</p>
        </div>

        {/* Excluded */}
        <div
          onClick={() => onNavigate('library')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Excluded</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{excludedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Documented reason codes</p>
        </div>

        {/* Uncertain */}
        <div
          onClick={() => onNavigate('screening_workbench')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Uncertain</span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{uncertainCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pending full-text or consensus</p>
        </div>

        {/* Duplicates */}
        <div
          onClick={() => onNavigate('duplicate_resolver')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Duplicates</span>
            <Copy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingDuplicateCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {pendingDuplicateCount > 0 ? 'Pending resolution' : 'All resolved'}
          </p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fast Title/Abstract Screening */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Title & Abstract Screening</h3>
            <p className="text-xs text-slate-500 mt-1">
              Screen unreviewed studies with keyboard shortcuts (1=Include, 2=Exclude, 3=Uncertain).
            </p>
          </div>
          <button
            onClick={() => onNavigate('screening_workbench')}
            className="mt-4 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md flex items-center justify-between transition-colors"
          >
            <span>Start Screening ({unscreenedCount} Left)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Online DB Search & Batch Import */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Online Database Search</h3>
            <p className="text-xs text-slate-500 mt-1">
              Query Crossref and Europe PMC / PubMed live and import directly into your library.
            </p>
          </div>
          <button
            onClick={onOpenOnlineSearch}
            className="mt-4 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md flex items-center justify-between transition-colors"
          >
            <span>Search Literature Online</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* NotebookLM Research Briefing */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">NotebookLM Research Briefing</h3>
            <p className="text-xs text-slate-500 mt-1">
              Interactive evidence-grounded Q&A and cross-study synthesis across included papers.
            </p>
          </div>
          <button
            onClick={() => onNavigate('notebook_briefing')}
            className="mt-4 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-md flex items-center justify-between transition-colors"
          >
            <span>Launch Research Briefing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PRISMA 2020 Live Summary & Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PRISMA 2020 Flow Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">PRISMA 2020 Flow Counts</h3>
            </div>
            <button
              onClick={() => onNavigate('prisma_diagram')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>View Full Diagram</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <div className="text-slate-500 text-[11px]">Identified</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {prismaCounts.totalRecordsIdentified}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <div className="text-slate-500 text-[11px]">Duplicates Rm.</div>
              <div className="text-lg font-bold text-amber-600 mt-0.5">
                {prismaCounts.duplicatesRemoved}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <div className="text-slate-500 text-[11px]">Screened</div>
              <div className="text-lg font-bold text-blue-600 mt-0.5">
                {prismaCounts.recordsScreenedTitleAbstract}
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
              <div className="text-emerald-700 text-[11px]">Included</div>
              <div className="text-lg font-bold text-emerald-700 mt-0.5">
                {prismaCounts.totalStudiesIncluded}
              </div>
            </div>
          </div>
        </div>

        {/* Framework Elements Preview (e.g. PICOC) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {project.framework.name || `${project.framework.type} Framework`}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('project_wizard')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Configure
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {project.framework.elements.map((el) => (
              <div key={el.key} className="flex items-start gap-2 bg-slate-50 p-2 rounded-md">
                <span className="font-bold text-blue-700 w-7 shrink-0 text-center bg-blue-100/70 rounded py-0.5 text-[11px]">
                  {el.key}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800">{el.label}: </span>
                  <span className="text-slate-600 truncate block">{el.value || 'Not defined'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Recent Studies in Library</h3>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <span>Open Library ({totalArticles})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Title & Authors</th>
                <th className="py-2.5 px-3">Year / Venue</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Evidence Quotes</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.slice(0, 6).map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 max-w-md">
                    <div className="font-semibold text-slate-900 line-clamp-1">{art.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{art.authors}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                    <div>{art.year || 'N/A'}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{art.journal}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {art.screeningStatus === 'INCLUDE' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Included
                      </span>
                    )}
                    {art.screeningStatus === 'EXCLUDE' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                        <XCircle className="w-3 h-3" /> Excluded ({art.primaryExclusionReason || 'Reason'})
                      </span>
                    )}
                    {art.screeningStatus === 'UNCERTAIN' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                        <HelpCircle className="w-3 h-3" /> Uncertain
                      </span>
                    )}
                    {art.screeningStatus === 'UNSCREENED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        Unscreened
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {art.evidenceCitations?.length > 0 ? (
                      <span className="font-semibold text-blue-600 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {art.evidenceCitations.length} citations
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectArticle(art);
                        onNavigate('pdf_workbench');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded font-medium text-[11px] transition-colors"
                    >
                      Open PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

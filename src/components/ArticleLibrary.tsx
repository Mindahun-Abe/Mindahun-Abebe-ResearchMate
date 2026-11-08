import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  Download,
  BookOpen,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Plus,
  Copy,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Article, ScreeningDecision } from '../types/research';
import { exportToBibtex, exportToRis, exportToCsv, downloadText } from '../utils/exportHelpers';

interface ArticleLibraryProps {
  articles: Article[];
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (articleId: string) => void;
  onOpenOnlineSearch: () => void;
  onOpenImport: () => void;
  onSelectArticleForReview: (article: Article) => void;
}

export const ArticleLibrary: React.FC<ArticleLibraryProps> = ({
  articles,
  onUpdateArticle,
  onDeleteArticle,
  onOpenOnlineSearch,
  onOpenImport,
  onSelectArticleForReview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ScreeningDecision>('ALL');
  const [databaseFilter, setDatabaseFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inspectArticle, setInspectArticle] = useState<Article | null>(null);
  const [resolvingDoi, setResolvingDoi] = useState(false);
  const [doiSuccessMsg, setDoiSuccessMsg] = useState<string | null>(null);

  // Extract unique filters
  const uniqueDatabases = useMemo(() => {
    const dbs = new Set<string>();
    articles.forEach((a) => {
      if (a.database) dbs.add(a.database.split(';')[0].trim());
    });
    return Array.from(dbs);
  }, [articles]);

  const uniqueYears = useMemo(() => {
    const yrs = new Set<string>();
    articles.forEach((a) => {
      if (a.year && a.year !== 'N/A') yrs.add(a.year.trim());
    });
    return Array.from(yrs).sort().reverse();
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (statusFilter !== 'ALL' && a.screeningStatus !== statusFilter) return false;
      if (databaseFilter !== 'ALL' && !(a.database || '').includes(databaseFilter)) return false;
      if (yearFilter !== 'ALL' && (a.year || '') !== yearFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inTitle = (a.title || '').toLowerCase().includes(q);
        const inAuthors = (a.authors || '').toLowerCase().includes(q);
        const inJournal = (a.journal || '').toLowerCase().includes(q);
        const inDoi = (a.doi || '').toLowerCase().includes(q);
        const inAbstract = (a.abstract || '').toLowerCase().includes(q);
        if (!inTitle && !inAuthors && !inJournal && !inDoi && !inAbstract) return false;
      }
      return true;
    });
  }, [articles, statusFilter, databaseFilter, yearFilter, searchTerm]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredArticles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredArticles.map((a) => a.id)));
    }
  };

  // Bulk actions
  const handleBulkExport = (format: 'bib' | 'ris' | 'csv') => {
    const target = articles.filter((a) => selectedIds.has(a.id));
    if (target.length === 0) return;

    if (format === 'bib') {
      const bib = exportToBibtex(target);
      downloadText(bib, 'researchmate_export.bib', 'application/x-bibtex');
    } else if (format === 'ris') {
      const ris = exportToRis(target);
      downloadText(ris, 'researchmate_export.ris', 'application/x-research-info-systems');
    } else {
      const csv = exportToCsv(target);
      downloadText(csv, 'researchmate_export.csv', 'text/csv');
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${selectedIds.size} article(s)? This action preserves audit history.`)) {
      selectedIds.forEach((id) => onDeleteArticle(id));
      setSelectedIds(new Set());
    }
  };

  // Crossref live DOI resolution
  const handleResolveDoi = async (art: Article) => {
    if (!art.doi) return;
    setResolvingDoi(true);
    setDoiSuccessMsg(null);

    try {
      const res = await fetch(`/api/metadata/crossref?doi=${encodeURIComponent(art.doi)}`);
      if (!res.ok) {
        throw new Error('Could not resolve DOI metadata');
      }
      const data = await res.json();
      const meta = data.metadata;

      const updated: Article = {
        ...art,
        title: meta.title || art.title,
        authors: meta.authors || art.authors,
        year: meta.year || art.year,
        journal: meta.journal || art.journal,
        publisher: meta.publisher || art.publisher,
        volume: meta.volume || art.volume,
        issue: meta.issue || art.issue,
        pages: meta.pages || art.pages,
        abstract: meta.abstract || art.abstract,
        url: meta.url || art.url,
        issn: meta.issn || art.issn,
        retrievalDate: meta.retrievalDate || new Date().toISOString(),
        database: art.database ? `${art.database}; Crossref Verified` : 'Crossref Verified',
      };

      onUpdateArticle(updated);
      setInspectArticle(updated);
      setDoiSuccessMsg('Verified metadata retrieved from Crossref!');
      setTimeout(() => setDoiSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`DOI Resolution error: ${err.message}`);
    } finally {
      setResolvingDoi(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, DOI, journal, abstract..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenOnlineSearch}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Online Search</span>
            </button>
            <button
              onClick={onOpenImport}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Files</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Status filter tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['ALL', 'INCLUDE', 'EXCLUDE', 'UNCERTAIN', 'UNSCREENED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All Records' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Database filter */}
          {uniqueDatabases.length > 0 && (
            <select
              value={databaseFilter}
              onChange={(e) => setDatabaseFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
            >
              <option value="ALL">All Databases</option>
              {uniqueDatabases.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          )}

          {/* Year filter */}
          {uniqueYears.length > 0 && (
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-md bg-white text-slate-700"
            >
              <option value="ALL">All Years</option>
              {uniqueYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          )}

          <span className="text-[11px] text-slate-500 ml-auto">
            Showing {filteredArticles.length} of {articles.length} records
          </span>
        </div>

        {/* Bulk Action Bar (when records are selected) */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-xs gap-2 animate-fade-in">
            <span className="font-semibold text-blue-900">
              {selectedIds.size} paper(s) selected
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkExport('bib')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-medium flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> BibTeX
              </button>
              <button
                onClick={() => handleBulkExport('ris')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-medium flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> RIS
              </button>
              <button
                onClick={() => handleBulkExport('csv')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-medium flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Articles Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredArticles.length}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                </th>
                <th className="py-2.5 px-3">Title & Authors</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Year / Journal</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Source</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No articles match your search criteria.
                  </td>
                </tr>
              )}

              {filteredArticles.map((art) => {
                const isSelected = selectedIds.has(art.id);
                return (
                  <tr
                    key={art.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(art.id)}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                    </td>
                    <td className="py-3 px-3 max-w-md">
                      <div className="flex items-start gap-1.5">
                        <span
                          onClick={() => setInspectArticle(art)}
                          className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2"
                        >
                          {art.title}
                        </span>
                        {art.duplicateGroup && (
                          <span className="shrink-0 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                            Duplicate Flagged
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{art.authors}</div>
                      {art.doi && (
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5 truncate">
                          DOI: {art.doi}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      <div>{art.year || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{art.journal}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
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
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                        {art.database || 'Import'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectArticleForReview(art)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded font-semibold text-[11px] transition-colors"
                        >
                          Review / PDF
                        </button>
                        <button
                          onClick={() => setInspectArticle(art)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Inspect Metadata"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article Detail Inspection Modal */}
      {inspectArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Bibliographic Record Inspector</h3>
              </div>
              <button
                onClick={() => setInspectArticle(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {doiSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {doiSuccessMsg}
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Title</span>
                <h2 className="text-sm font-bold text-slate-900 mt-0.5">{inspectArticle.title}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Authors</span>
                  <div className="font-medium text-slate-800 mt-0.5">{inspectArticle.authors}</div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Journal / Year</span>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {inspectArticle.journal} ({inspectArticle.year})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">DOI</span>
                  <div className="font-mono text-blue-600 mt-0.5 flex items-center gap-2">
                    <span>{inspectArticle.doi || 'None specified'}</span>
                    {inspectArticle.doi && (
                      <button
                        onClick={() => handleResolveDoi(inspectArticle)}
                        disabled={resolvingDoi}
                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-semibold flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${resolvingDoi ? 'animate-spin' : ''}`} />
                        <span>Query Crossref</span>
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Source Database</span>
                  <div className="text-slate-800 mt-0.5">{inspectArticle.database || 'Import'}</div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Abstract</span>
                <p className="text-slate-700 leading-relaxed mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {inspectArticle.abstract || 'No abstract provided in bibliographic index.'}
                </p>
              </div>

              {inspectArticle.evidenceCitations?.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    Saved Page-Level Evidence Quotations ({inspectArticle.evidenceCitations.length})
                  </span>
                  <div className="space-y-2 mt-1">
                    {inspectArticle.evidenceCitations.map((c) => (
                      <div key={c.id} className="p-2.5 bg-yellow-50/70 border border-yellow-200 rounded text-slate-800">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-yellow-900 mb-1">
                          <span>PDF Page {c.pdfPage} {c.printedPage ? `(Print: p.${c.printedPage})` : ''}</span>
                          <span className="text-[10px] bg-yellow-100 px-1.5 py-0.2 rounded">{c.evidenceCategory}</span>
                        </div>
                        <blockquote className="italic">"{c.quote}"</blockquote>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectArticle(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

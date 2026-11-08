import React, { useState } from 'react';
import {
  Search,
  X,
  Check,
  Loader2,
  BookOpen,
  Plus,
  ExternalLink,
  Database,
  Filter,
} from 'lucide-react';
import { Article } from '../types/research';
import { generateId } from '../utils/parsers';

interface OnlineSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onImportArticles: (articles: Article[]) => void;
  existingArticles: Article[];
}

export const OnlineSearchModal: React.FC<OnlineSearchModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onImportArticles,
  existingArticles,
}) => {
  const [query, setQuery] = useState('');
  const [selectedDb, setSelectedDb] = useState<'all' | 'crossref' | 'europepmc'>('all');
  const [rows, setRows] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const existingDois = new Set(
    existingArticles.map((a) => (a.doi || '').toLowerCase().trim()).filter(Boolean)
  );

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedIds(new Set());

    try {
      const res = await fetch(
        `/api/metadata/search?query=${encodeURIComponent(query)}&database=${selectedDb}&rows=${rows}`
      );
      if (!res.ok) {
        throw new Error(`Search failed with status ${res.status}`);
      }
      const data = await res.json();
      setResults(data.results || []);
      // Pre-select non-duplicate records
      const freshIds = new Set<string>();
      (data.results || []).forEach((item: any) => {
        const cleanDoi = (item.doi || '').toLowerCase().trim();
        if (!cleanDoi || !existingDois.has(cleanDoi)) {
          freshIds.add(item.id);
        }
      });
      setSelectedIds(freshIds);
    } catch (err: any) {
      setError(err.message || 'Failed to search online databases');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map((r) => r.id)));
    }
  };

  const handleImport = () => {
    const toImport = results.filter((r) => selectedIds.has(r.id));
    const newArticles: Article[] = toImport.map((r) => ({
      id: generateId(),
      projectId,
      title: r.title,
      authors: r.authors,
      year: r.year,
      journal: r.journal,
      doi: r.doi,
      abstract: r.abstract,
      url: r.url,
      database: r.database,
      publicationType: r.publicationType || 'journal-article',
      retrievalDate: new Date().toISOString(),
      screeningStatus: 'UNSCREENED',
      screeningStage: 'Stage1_TitleAbstract',
      reviewerDecisions: [],
      evidenceCitations: [],
      extractionData: {},
    }));

    onImportArticles(newArticles);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Online Database Search & Import</h2>
              <p className="text-[11px] text-slate-500">
                Direct keyword search across Crossref and Europe PMC / PubMed repositories
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Database Checkboxes */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search literature by keywords, title, or authors (e.g. sepsis machine learning adult intensive care)..."
                className="w-full text-xs py-2 pl-9 pr-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search Online</span>
            </button>
          </form>

          {/* Database Checkboxes */}
          <div className="flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-600" /> Database Sources:
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="db"
                  checked={selectedDb === 'all'}
                  onChange={() => setSelectedDb('all')}
                  className="w-3.5 h-3.5 text-blue-600"
                />
                All Sources
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="db"
                  checked={selectedDb === 'crossref'}
                  onChange={() => setSelectedDb('crossref')}
                  className="w-3.5 h-3.5 text-blue-600"
                />
                Crossref Only
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="db"
                  checked={selectedDb === 'europepmc'}
                  onChange={() => setSelectedDb('europepmc')}
                  className="w-3.5 h-3.5 text-blue-600"
                />
                Europe PMC / PubMed Only
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Max Results:</span>
              <select
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="text-xs p-1 border border-slate-300 rounded"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {results.length > 0 && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.size === results.length}
                  onChange={handleSelectAll}
                  className="w-3.5 h-3.5 text-blue-600 rounded"
                />
                <span>
                  Select All ({selectedIds.size} of {results.length} chosen)
                </span>
              </div>
              <span>Click items to toggle selection</span>
            </div>
          )}

          {results.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">No records fetched yet. Enter academic keywords above.</p>
            </div>
          )}

          {results.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isAlreadyInLib = item.doi && existingDois.has(item.doi.toLowerCase().trim());

            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by parent div
                    className="w-4 h-4 text-blue-600 rounded mt-0.5"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs line-clamp-2">
                        {item.title}
                      </span>
                      {isAlreadyInLib && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                          Already in Library
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <span className="font-medium text-slate-800">{item.authors || 'Unknown'}</span>
                      {item.year && <span className="ml-1 text-slate-500">({item.year})</span>}
                      {item.journal && <span className="ml-2 italic text-slate-500">— {item.journal}</span>}
                    </div>

                    {item.doi && (
                      <div className="text-[10px] text-blue-600 font-mono truncate">
                        DOI: {item.doi}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 line-clamp-2 pt-0.5">
                      {item.abstract}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                        {item.database}
                      </span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          View Source <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedIds.size} paper(s) ready for library ingestion
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedIds.size === 0}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Copy,
  CheckCircle2,
  GitMerge,
  Eye,
  ShieldCheck,
  AlertTriangle,
  History,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Article, DuplicateGroup } from '../types/research';
import { mergeArticleRecords } from '../utils/duplicateDetector';

interface DuplicateResolverProps {
  duplicateGroups: DuplicateGroup[];
  articles: Article[];
  onResolveGroup: (
    groupId: string,
    action: 'Merged' | 'KeptBoth' | 'MasterSelected',
    masterArticle: Article,
    resolvedArticles: Article[]
  ) => void;
}

export const DuplicateResolver: React.FC<DuplicateResolverProps> = ({
  duplicateGroups,
  articles,
  onResolveGroup,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    duplicateGroups[0]?.id || null
  );

  const activeGroup = duplicateGroups.find((g) => g.id === selectedGroupId) || duplicateGroups[0];
  const groupArticles = activeGroup
    ? articles.filter((a) => activeGroup.articleIds.includes(a.id))
    : [];

  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(
    groupArticles[0]?.id || null
  );

  const handleMergeAction = () => {
    if (!activeGroup || groupArticles.length < 2) return;
    const master = groupArticles.find((a) => a.id === selectedMasterId) || groupArticles[0];
    const others = groupArticles.filter((a) => a.id !== master.id);

    const merged = mergeArticleRecords(master, others);
    // Mark others as duplicates of master
    const updatedOthers = others.map((o) => ({
      ...o,
      duplicateOf: master.id,
      duplicateResolved: true,
      duplicateResolutionAction: 'Merged' as const,
    }));

    onResolveGroup(activeGroup.id, 'Merged', merged, updatedOthers);
  };

  const handleKeepBoth = () => {
    if (!activeGroup || groupArticles.length === 0) return;
    const master = groupArticles[0];
    const resolved = groupArticles.map((a) => ({
      ...a,
      duplicateResolved: true,
      duplicateResolutionAction: 'KeptBoth' as const,
    }));
    onResolveGroup(activeGroup.id, 'KeptBoth', master, resolved);
  };

  const handleSelectMasterOnly = () => {
    if (!activeGroup || groupArticles.length < 2) return;
    const master = groupArticles.find((a) => a.id === selectedMasterId) || groupArticles[0];
    const others = groupArticles.filter((a) => a.id !== master.id);

    const updatedOthers = others.map((o) => ({
      ...o,
      duplicateOf: master.id,
      duplicateResolved: true,
      duplicateResolutionAction: 'MasterSelected' as const,
    }));

    onResolveGroup(activeGroup.id, 'MasterSelected', master, updatedOthers);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-slate-900">Duplicate Detection & Resolution Workbench</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify exact DOI, normalized title, and fuzzy similarity duplicates. Merge or designate master records safely.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold">
            {duplicateGroups.length} Pending Duplicate Group(s)
          </span>
        </div>
      </div>

      {duplicateGroups.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">No Pending Duplicates</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            All imported bibliographic records have been deduplicated or verified. When new records are imported, the deduplication engine will automatically flag matches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Duplicate Groups Sidebar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 lg:col-span-1">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Detected Groups ({duplicateGroups.length})
            </h3>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {duplicateGroups.map((grp) => (
                <button
                  key={grp.id}
                  onClick={() => {
                    setSelectedGroupId(grp.id);
                    setSelectedMasterId(grp.articleIds[0]);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors border ${
                    activeGroup?.id === grp.id
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      {grp.matchType}
                    </span>
                    <span>{Math.round(grp.similarityScore * 100)}% match</span>
                  </div>
                  <div className="line-clamp-2 text-xs font-medium text-slate-900">
                    {grp.normalizedTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {grp.articleIds.length} candidate records
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-side comparison & resolution actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5 lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {activeGroup?.matchType} Match (Similarity: {Math.round((activeGroup?.similarityScore || 1) * 100)}%)
                </span>
                <h2 className="text-sm font-bold text-slate-900 mt-1">
                  Comparing {groupArticles.length} Duplicate Candidate Records
                </h2>
              </div>

              {/* Resolution Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleMergeAction}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Merge best fields from all records into master record"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Merge Records</span>
                </button>

                <button
                  onClick={handleSelectMasterOnly}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Keep selected master record and archive the other"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Select Master</span>
                </button>

                <button
                  onClick={handleKeepBoth}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  title="Acknowledge similarity but keep both records independent"
                >
                  Keep Both
                </button>
              </div>
            </div>

            {/* Side-by-Side Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupArticles.map((art, idx) => {
                const isMaster = (selectedMasterId || groupArticles[0]?.id) === art.id;

                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedMasterId(art.id)}
                    className={`border-2 rounded-xl p-4 text-xs space-y-3 cursor-pointer transition-all relative ${
                      isMaster
                        ? 'border-blue-600 bg-blue-50/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 text-[11px]">Record #{idx + 1}</span>
                        {isMaster && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            Selected Master
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {art.database || 'Database Source'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Title</span>
                      <h4 className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">
                        {art.title}
                      </h4>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Authors</span>
                      <p className="text-slate-700 mt-0.5">{art.authors || 'Unknown Authors'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Year</span>
                        <div className="font-medium text-slate-800">{art.year || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Journal</span>
                        <div className="font-medium text-slate-800 truncate">{art.journal || 'N/A'}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">DOI</span>
                      <div className="font-mono text-blue-600 text-[11px] truncate">
                        {art.doi || 'No DOI available'}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Abstract</span>
                      <p className="text-slate-600 text-[11px] line-clamp-4 mt-0.5 bg-slate-50 p-2 rounded">
                        {art.abstract || 'No abstract text available.'}
                      </p>
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMasterId(art.id);
                        }}
                        className={`w-full py-1.5 rounded text-xs font-semibold transition-colors ${
                          isMaster
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isMaster ? 'Master Record Selected' : 'Designate as Master'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
              <History className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Provenance Preservation:</span>
                <span className="ml-1">
                  Merging preserves all database source badges, combines evidence citations, and records an unalterable resolution log in the project audit history. No records are deleted without explicit confirmation.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  FileText,
  Send,
  Loader2,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Quote,
} from 'lucide-react';
import { Article, ResearchProject } from '../types/research';

interface NotebookBriefingProps {
  project: ResearchProject;
  articles: Article[];
  onOpenPdfAtPage: (article: Article, page: number) => void;
}

export const NotebookBriefing: React.FC<NotebookBriefingProps> = ({
  project,
  articles,
  onOpenPdfAtPage,
}) => {
  const includedArticles = articles.filter((a) => a.screeningStatus === 'INCLUDE');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefingResult, setBriefingResult] = useState<any | null>(null);
  const [selectedSourceDoc, setSelectedSourceDoc] = useState<Article | null>(null);

  // Quick preset questions
  const presetQuestions = [
    'What is the consensus diagnostic accuracy (AUROC) and lead time of AI algorithms?',
    'What are the primary clinical mortality reductions demonstrated in adult ICU cohorts?',
    'What common methodological limitations and risks of bias were identified across the literature?',
    'What implementation barriers and alert fatigue mitigation strategies are reported?',
  ];

  const handleAskQuestion = async (customQ?: string) => {
    const activeQ = customQ || query;
    if (!activeQ.trim()) return;

    setLoading(true);
    setQuery(activeQ);

    try {
      const res = await fetch('/api/ai/notebook-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQ,
          articles: includedArticles,
          projectProtocol: project,
        }),
      });

      if (!res.ok) {
        throw new Error('Briefing request failed');
      }

      const data = await res.json();
      setBriefingResult(data);
    } catch (err: any) {
      alert(`Briefing Assistant: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-xl p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h1 className="text-lg font-bold text-white">NotebookLM-Style Research Briefing</h1>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-semibold uppercase">
                Source-Grounded AI
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              Evidence-grounded intelligence synthesizing across {includedArticles.length} included peer-reviewed studies. Never hallucinated.
            </p>
          </div>

          <div className="text-xs text-indigo-300">
            Corpus: <span className="font-bold text-white">{includedArticles.length}</span> Verified Papers
          </div>
        </div>

        {/* Search query input */}
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Ask a scientific question grounded in your included library (e.g. What is the evidence on sepsis mortality reduction?)..."
              className="w-full text-xs py-2.5 pl-9 pr-3 bg-slate-800/90 border border-indigo-700/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <button
            onClick={() => handleAskQuestion()}
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Synthesize Answer</span>
          </button>
        </div>

        {/* Preset chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-indigo-300 font-semibold mr-1">Recommended Inquiries:</span>
          {presetQuestions.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(pq)}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-indigo-800 text-slate-200 rounded-full text-[11px] transition-colors line-clamp-1"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Main Results & Source Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Synthesis Answer Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {briefingResult ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Evidence Synthesis
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Grounded in {briefingResult.sourcesUsed?.length || includedArticles.length} sources
                </span>
              </div>

              {/* Structured Key Takeaways */}
              {briefingResult.keyTakeaways && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 space-y-1.5">
                  <span className="font-bold text-xs text-blue-900 block">
                    Key Scientific Takeaways:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-blue-950 font-medium">
                    {briefingResult.keyTakeaways.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Answer text */}
              <div className="space-y-3 leading-relaxed text-slate-800 whitespace-pre-line text-xs font-normal">
                {briefingResult.answer}
              </div>

              {/* Source Chips at bottom of answer */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Clickable Source Citations (Click to inspect verified page evidence):
                </span>
                <div className="flex flex-wrap gap-2">
                  {includedArticles.map((art, idx) => (
                    <button
                      key={art.id}
                      onClick={() => setSelectedSourceDoc(art)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        selectedSourceDoc?.id === art.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Quote className="w-3 h-3 text-blue-600" />
                      <span>
                        [S{idx + 1}] {art.authors.split(';')[0]?.split(',')[0]} ({art.year})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-slate-900">Ask a Question to Begin Briefing</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Enter any query above or select one of the suggested scientific inquiries to generate an evidence-grounded briefing backed by exact citations.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Source Evidence Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Evidence Inspector</span>
              </h3>
            </div>

            {selectedSourceDoc ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Selected Study</span>
                  <h4 className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">
                    {selectedSourceDoc.title}
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {selectedSourceDoc.authors} ({selectedSourceDoc.year}) — {selectedSourceDoc.journal}
                  </p>
                </div>

                {selectedSourceDoc.doi && (
                  <div className="text-[10px] text-blue-600 font-mono truncate">
                    DOI: {selectedSourceDoc.doi}
                  </div>
                )}

                {/* Direct Saved Evidence Citations */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Page-Level Verified Evidence ({selectedSourceDoc.evidenceCitations?.length || 0})
                  </span>

                  {(!selectedSourceDoc.evidenceCitations || selectedSourceDoc.evidenceCitations.length === 0) ? (
                    <p className="text-[11px] text-slate-400 italic">
                      No direct quotations clipped yet. Open in PDF Workbench to clip page evidence.
                    </p>
                  ) : (
                    selectedSourceDoc.evidenceCitations.map((cit) => (
                      <div
                        key={cit.id}
                        className="p-2.5 bg-yellow-50/70 border border-yellow-200 rounded-lg space-y-1 text-slate-800"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-yellow-900">
                          <span>PDF Page {cit.pdfPage} {cit.printedPage ? `(Print: p.${cit.printedPage})` : ''}</span>
                          <span className="bg-yellow-100 px-1 py-0.2 rounded font-normal">
                            {cit.evidenceCategory}
                          </span>
                        </div>
                        <blockquote className="font-serif italic text-[11px]">
                          "{cit.quote}"
                        </blockquote>
                        <button
                          onClick={() => onOpenPdfAtPage(selectedSourceDoc, cit.pdfPage)}
                          className="text-[10px] text-blue-600 hover:underline font-semibold block pt-1"
                        >
                          Jump to PDF Page {cit.pdfPage} →
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenPdfAtPage(selectedSourceDoc, 1)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Open Document in PDF Workbench
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                Select any source citation on the left to inspect its verified evidence quotes and page references.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

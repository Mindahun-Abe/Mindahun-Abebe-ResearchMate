import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FileText,
  AlertTriangle,
  UserCheck,
  Check,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Article, ResearchProject, ScreeningDecision, EligibilityCriterion } from '../types/research';

interface ScreeningWorkbenchProps {
  project: ResearchProject;
  articles: Article[];
  onUpdateArticle: (article: Article) => void;
  onOpenPdfWorkbench: (article: Article) => void;
}

export const ScreeningWorkbench: React.FC<ScreeningWorkbenchProps> = ({
  project,
  articles,
  onUpdateArticle,
  onOpenPdfWorkbench,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStage, setActiveStage] = useState<'Stage1_TitleAbstract' | 'Stage2_FullText'>('Stage1_TitleAbstract');
  const [selectedReasonCode, setSelectedReasonCode] = useState<string>('');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [activeReviewer, setActiveReviewer] = useState<string>(project.reviewerInformation.reviewer1 || 'Reviewer 1');
  const [aiLoading, setAiLoading] = useState(false);
  const [adjudicationNote, setAdjudicationNote] = useState('');

  // Filter articles for current stage or unscreened priority
  const stageArticles = articles;
  const currentArticle: Article | undefined = stageArticles[currentIndex];

  useEffect(() => {
    if (currentArticle) {
      setSelectedReasonCode(currentArticle.primaryExclusionReason || '');
      setReviewerNotes(currentArticle.reviewerNotes || '');
    }
  }, [currentArticle?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === '1') handleMakeDecision('INCLUDE');
      if (e.key === '2') {
        const defaultReason = project.criteria[0]?.reasonCode || 'EXC-CRIT';
        handleMakeDecision('EXCLUDE', selectedReasonCode || defaultReason);
      }
      if (e.key === '3') handleMakeDecision('UNCERTAIN');
      if (e.key === 'ArrowRight' || e.key === 'j') handleNext();
      if (e.key === 'ArrowLeft' || e.key === 'k') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentArticle, selectedReasonCode, activeReviewer]);

  if (!currentArticle) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
        <h3 className="font-bold text-sm text-slate-800">No articles available for screening</h3>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < stageArticles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMakeDecision = (
    decision: ScreeningDecision,
    reasonCode?: string
  ) => {
    if (!currentArticle) return;
    if (decision === 'EXCLUDE' && !reasonCode && !selectedReasonCode) {
      alert('An explicit exclusion reason code is required when excluding an article.');
      return;
    }

    const finalReason = decision === 'EXCLUDE' ? (reasonCode || selectedReasonCode) : undefined;

    // Record decision in reviewer history
    const existingDecisions = [...(currentArticle.reviewerDecisions || [])];
    existingDecisions.push({
      reviewer: activeReviewer,
      stage: activeStage === 'Stage1_TitleAbstract' ? 'TitleAndAbstract' : 'FullText',
      decision: decision as 'INCLUDE' | 'EXCLUDE' | 'UNCERTAIN',
      reasonCode: finalReason,
      notes: reviewerNotes,
      timestamp: new Date().toISOString(),
    });

    // Check dual reviewer conflict
    let consensusStatus = currentArticle.consensusStatus;
    if (project.reviewerInformation.dualReviewMode) {
      const rev1Decision = existingDecisions.find((d) => d.reviewer === project.reviewerInformation.reviewer1)?.decision;
      const rev2Decision = existingDecisions.find((d) => d.reviewer === project.reviewerInformation.reviewer2)?.decision;
      if (rev1Decision && rev2Decision) {
        consensusStatus = rev1Decision === rev2Decision ? 'Agreement' : 'Conflict';
      }
    }

    const updated: Article = {
      ...currentArticle,
      screeningStatus: decision,
      screeningStage: activeStage,
      primaryExclusionReason: finalReason,
      reviewerNotes,
      reviewerDecisions: existingDecisions,
      consensusStatus,
    };

    onUpdateArticle(updated);
    // Auto-advance
    if (currentIndex < stageArticles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Run AI Screening on current article
  const handleRunAiScreening = async () => {
    if (!currentArticle) return;
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/screen-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: currentArticle,
          projectProtocol: project,
          criteria: project.criteria,
        }),
      });

      if (!res.ok) {
        throw new Error('AI screening request failed');
      }

      const aiData = await res.json();
      const updated: Article = {
        ...currentArticle,
        aiRecommendation: {
          recommendation: aiData.recommendation || 'UNCERTAIN',
          confidence: aiData.confidence || 0.8,
          suggestedReasonCode: aiData.suggestedReasonCode || '',
          rationale: aiData.rationale || '',
          missingInformation: aiData.missingInformation,
          timestamp: new Date().toISOString(),
          criterionEvaluations: aiData.criterionEvaluations,
        },
      };

      onUpdateArticle(updated);
    } catch (err: any) {
      alert(`AI Assistant notice: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiRecommendation = () => {
    if (!currentArticle.aiRecommendation) return;
    handleMakeDecision(
      currentArticle.aiRecommendation.recommendation,
      currentArticle.aiRecommendation.suggestedReasonCode
    );
  };

  // Adjudicate consensus conflict
  const handleResolveConflict = (resolution: 'INCLUDE' | 'EXCLUDE' | 'UNCERTAIN') => {
    const updated: Article = {
      ...currentArticle,
      screeningStatus: resolution,
      consensusStatus: 'Resolved',
      consensusResolution: {
        finalDecision: resolution,
        reasonCode: resolution === 'EXCLUDE' ? selectedReasonCode : undefined,
        resolvedBy: activeReviewer,
        notes: adjudicationNote || 'Resolved via consensus conference.',
        timestamp: new Date().toISOString(),
      },
    };
    onUpdateArticle(updated);
    setAdjudicationNote('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Stage Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveStage('Stage1_TitleAbstract')}
              className={`px-3 py-1.5 rounded transition-all ${
                activeStage === 'Stage1_TitleAbstract'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stage 1: Title & Abstract
            </button>
            <button
              onClick={() => setActiveStage('Stage2_FullText')}
              className={`px-3 py-1.5 rounded transition-all ${
                activeStage === 'Stage2_FullText'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stage 2: Full-Text Eligibility
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Study <span className="font-bold text-slate-800">{currentIndex + 1}</span> of{' '}
            <span className="font-bold text-slate-800">{stageArticles.length}</span>
          </div>
        </div>

        {/* Reviewer Selector & Prev/Next */}
        <div className="flex items-center gap-2">
          {project.reviewerInformation.dualReviewMode && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Reviewer:</span>
              <select
                value={activeReviewer}
                onChange={(e) => setActiveReviewer(e.target.value)}
                className="font-semibold bg-transparent border-0 text-slate-900 focus:outline-none"
              >
                <option value={project.reviewerInformation.reviewer1}>
                  {project.reviewerInformation.reviewer1}
                </option>
                <option value={project.reviewerInformation.reviewer2}>
                  {project.reviewerInformation.reviewer2}
                </option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded text-slate-700"
              title="Previous Article (Key: Left Arrow or K)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === stageArticles.length - 1}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded text-slate-700"
              title="Next Article (Key: Right Arrow or J)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Disagreement / Conflict Alert Banner */}
      {currentArticle.consensusStatus === 'Conflict' && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs space-y-2 animate-pulse">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Dual-Reviewer Disagreement Detected for Consensus Adjudication</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-800">
            {currentArticle.reviewerDecisions.map((d, i) => (
              <div key={i} className="bg-white/80 p-2 rounded border border-amber-200">
                <span className="font-semibold">{d.reviewer}: </span>
                <span className="font-bold underline">{d.decision}</span>
                {d.reasonCode && <span className="ml-1 text-[11px]">({d.reasonCode})</span>}
                {d.notes && <p className="text-[10px] text-slate-600 italic mt-0.5">"{d.notes}"</p>}
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Adjudication consensus notes..."
              value={adjudicationNote}
              onChange={(e) => setAdjudicationNote(e.target.value)}
              className="flex-1 p-1.5 bg-white border border-amber-300 rounded text-xs"
            />
            <button
              onClick={() => handleResolveConflict('INCLUDE')}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs"
            >
              Adjudicate: INCLUDE
            </button>
            <button
              onClick={() => handleResolveConflict('EXCLUDE')}
              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-semibold text-xs"
            >
              Adjudicate: EXCLUDE
            </button>
            <button
              onClick={() => handleResolveConflict('UNCERTAIN')}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-semibold text-xs"
            >
              Adjudicate: UNCERTAIN
            </button>
          </div>
        </div>
      )}

      {/* Main Screening Layout: Left Study Details + Right Criteria Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Article Details & Abstract */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {currentArticle.database || 'Database Record'}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Retrieved: {currentArticle.retrievalDate ? new Date(currentArticle.retrievalDate).toLocaleDateString() : 'N/A'}
              </span>
              {currentArticle.doi && (
                <span className="text-[10px] text-blue-600 font-mono">
                  DOI: {currentArticle.doi}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentArticle.title}
            </h2>

            <div className="text-xs text-slate-600 font-medium">
              <span>{currentArticle.authors}</span>
              {currentArticle.journal && (
                <span className="ml-2 italic text-slate-500">
                  — {currentArticle.journal} ({currentArticle.year})
                </span>
              )}
            </div>
          </div>

          {/* Abstract section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Abstract</span>
              {currentArticle.url && (
                <a
                  href={currentArticle.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 normal-case text-xs"
                >
                  Publisher Page <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-[360px] overflow-y-auto">
              {currentArticle.abstract ? (
                currentArticle.abstract
              ) : (
                <span className="text-rose-600 font-semibold">
                  No abstract available in bibliographic record. Full text or external retrieval required.
                </span>
              )}
            </div>
          </div>

          {/* PDF Viewer shortcut */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onOpenPdfWorkbench(currentArticle)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {currentArticle.pdfPages?.length ? 'Open Full-Text PDF & Evidence Workbench' : 'Attach / View PDF'}
              </span>
            </button>

            <span className="text-[11px] text-slate-400">
              Shortcuts: <kbd className="px-1 bg-slate-100 rounded border">1</kbd> Include,{' '}
              <kbd className="px-1 bg-slate-100 rounded border">2</kbd> Exclude,{' '}
              <kbd className="px-1 bg-slate-100 rounded border">3</kbd> Uncertain
            </span>
          </div>
        </div>

        {/* Right Column: Eligibility Checklist & Decision Controls */}
        <div className="space-y-4">
          {/* AI Screening Assistant Card */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-800/60 rounded-xl p-4 text-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs text-indigo-100">AI Screening Assistant</h3>
              </div>
              <button
                onClick={handleRunAiScreening}
                disabled={aiLoading}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>{currentArticle.aiRecommendation ? 'Re-Analyze' : 'Analyze Study'}</span>
              </button>
            </div>

            {currentArticle.aiRecommendation ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded border border-slate-700">
                  <span className="text-slate-300 font-medium">Recommendation:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        currentArticle.aiRecommendation.recommendation === 'INCLUDE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : currentArticle.aiRecommendation.recommendation === 'EXCLUDE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {currentArticle.aiRecommendation.recommendation}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({Math.round(currentArticle.aiRecommendation.confidence * 100)}% conf)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  {currentArticle.aiRecommendation.rationale}
                </p>

                {currentArticle.aiRecommendation.suggestedReasonCode && (
                  <div className="text-[11px] text-rose-300 font-mono">
                    Suggested Code: {currentArticle.aiRecommendation.suggestedReasonCode}
                  </div>
                )}

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleApplyAiRecommendation}
                    className="text-[11px] text-blue-300 hover:text-white underline font-semibold"
                  >
                    Accept AI Recommendation as Human Reviewer
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Click Analyze Study to evaluate this article against your protocol criteria using Gemini AI.
              </p>
            )}
          </div>

          {/* Decision Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Screening Decision
            </h3>

            {/* Current status display */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Status:</span>
              <span className="font-bold text-slate-900">{currentArticle.screeningStatus}</span>
            </div>

            {/* Exclusion reason selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Exclusion Reason Code (Required if Excluding)
              </label>
              <select
                value={selectedReasonCode}
                onChange={(e) => setSelectedReasonCode(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Select Standard Reason Code --</option>
                {project.criteria.map((c) => (
                  <option key={c.id} value={c.reasonCode}>
                    [{c.reasonCode}] {c.name} ({c.category})
                  </option>
                ))}
                <option value="EXC-UNRETRIEVED">[EXC-UNRET] Full Text Unretrievable</option>
                <option value="EXC-DUPLICATE">[EXC-DUP] Duplicate Publication</option>
                <option value="EXC-OTHER">[EXC-OTHER] Other Specified Methodological Reason</option>
              </select>
            </div>

            {/* Reviewer Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Reviewer Comments</label>
              <textarea
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Optional methodological notes or eligibility rationale..."
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Decision Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* INCLUDE */}
              <button
                onClick={() => handleMakeDecision('INCLUDE')}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>INCLUDE (1)</span>
              </button>

              {/* EXCLUDE */}
              <button
                onClick={() => handleMakeDecision('EXCLUDE')}
                className="py-2.5 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>EXCLUDE (2)</span>
              </button>

              {/* UNCERTAIN */}
              <button
                onClick={() => handleMakeDecision('UNCERTAIN')}
                className="py-2.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>UNCERTAIN (3)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

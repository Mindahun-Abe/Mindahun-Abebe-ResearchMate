import React, { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  Highlighter,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  Sparkles,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Article, ResearchProject, EvidenceCitation } from '../types/research';

interface PdfReaderWorkbenchProps {
  article: Article;
  project: ResearchProject;
  onUpdateArticle: (article: Article) => void;
  onClose: () => void;
}

export const PdfReaderWorkbench: React.FC<PdfReaderWorkbenchProps> = ({
  article,
  project,
  onUpdateArticle,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pdfSearchTerm, setPdfSearchTerm] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [evidenceCategory, setEvidenceCategory] = useState('Primary Clinical Outcome');
  const [relatedRq, setRelatedRq] = useState(project.researchQuestions[0] || '');
  const [relatedCriterionId, setRelatedCriterionId] = useState(project.criteria[0]?.id || '');
  const [printedPageNumber, setPrintedPageNumber] = useState('');
  const [citationNotes, setCitationNotes] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);

  // Default pages if none provided in article
  const pages = article.pdfPages?.length
    ? article.pdfPages
    : [
        {
          pageNumber: 1,
          text: `[DOCUMENT HEADER: ${article.journal || 'Academic Publication'}]\n\nTitle: ${article.title}\nAuthors: ${article.authors}\nDOI: ${article.doi || 'N/A'}\n\nABSTRACT:\n${article.abstract || 'No abstract text available.'}\n\n1. INTRODUCTION\nAcute physiological monitoring and clinical decision support in critically ill patients require real-time algorithmic inference...`,
        },
        {
          pageNumber: 2,
          text: `2. METHODS AND STUDY COHORT\nConsecutive admissions meeting standardized clinical criteria were prospectively enrolled. High-frequency arterial waveform and electronic health record telemetry data were ingested at 15-minute intervals...\n\nStatistical analysis was executed using multivariable proportional hazards models and stratified cross-validation.`,
        },
        {
          pageNumber: 3,
          text: `3. PRIMARY RESULTS\nAcross evaluated admissions, the predictive system achieved an Area Under the Receiver Operating Characteristic (AUROC) curve of 0.88 (95% CI 0.86-0.90) with an actionable average alert lead-time of 4.2 hours prior to overt decompensation.\n\nIn-hospital 30-day mortality demonstrated a statistically significant reduction from 21.4% to 16.8% (adjusted hazard ratio 0.77, p=0.012).`,
        },
      ];

  const totalPages = pages.length;
  const activePageObj = pages.find((p) => p.pageNumber === currentPage) || pages[0];

  const handleTextSelection = () => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 5) {
      setSelectedText(sel);
    }
  };

  const handleAddCitation = () => {
    if (!selectedText.trim()) {
      alert('Please select or highlight text within the document first.');
      return;
    }

    const newCitation: EvidenceCitation = {
      id: 'cit_' + Date.now(),
      articleId: article.id,
      pdfPage: currentPage,
      printedPage: printedPageNumber || undefined,
      quote: selectedText.trim(),
      evidenceCategory,
      relatedResearchQuestion: relatedRq,
      relatedCriterionId,
      reviewerNotes: citationNotes,
      createdAt: new Date().toISOString(),
    };

    const updatedCitations = [...(article.evidenceCitations || []), newCitation];
    onUpdateArticle({
      ...article,
      evidenceCitations: updatedCitations,
    });

    setHighlights([...highlights, selectedText.trim()]);
    setSelectedText('');
    setCitationNotes('');
  };

  const handleRemoveCitation = (id: string) => {
    const updated = (article.evidenceCitations || []).filter((c) => c.id !== id);
    onUpdateArticle({
      ...article,
      evidenceCitations: updated,
    });
  };

  return (
    <div className="space-y-4">
      {/* Workbench Navigation Top Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                {article.title}
              </h2>
              {article.isScannedPdf && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  OCR-Derived Text
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              PDF Evidence Workbench — Page-level Citation & Extraction Engine
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg self-end sm:self-auto"
        >
          Close Workbench
        </button>
      </div>

      {/* Split-Screen Review Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel: PDF Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden">
          {/* PDF Toolbar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Page navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 bg-white border border-slate-300 disabled:opacity-40 rounded hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <span className="text-slate-700 font-medium">
                Page <span className="font-bold">{currentPage}</span> of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 bg-white border border-slate-300 disabled:opacity-40 rounded hover:bg-slate-50"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
                className="p-1 bg-white border border-slate-300 rounded hover:bg-slate-50"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <span className="text-slate-600 font-medium w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
                className="p-1 bg-white border border-slate-300 rounded hover:bg-slate-50"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5 text-slate-700" />
              </button>
            </div>

            {/* In-document search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search within page..."
                value={pdfSearchTerm}
                onChange={(e) => setPdfSearchTerm(e.target.value)}
                className="text-[11px] pl-6 pr-2 py-1 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 w-36"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>

          {/* Document Rendered Page Sheet */}
          <div
            className="flex-1 bg-slate-200/70 p-4 sm:p-6 overflow-y-auto min-h-[500px] flex justify-center"
            onMouseUp={handleTextSelection}
          >
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="bg-white text-slate-900 shadow-lg rounded-sm p-8 max-w-2xl w-full font-serif text-sm leading-relaxed border border-slate-300 select-text transition-transform"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 text-[10px] text-slate-400 font-mono font-semibold">
                <span>{article.pdfFileName || 'Electronic Academic Manuscript'}</span>
                <span>PDF Page {currentPage}</span>
              </div>

              <div className="whitespace-pre-line text-slate-800">
                {activePageObj.text}
              </div>

              <div className="pt-8 mt-8 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
                — Page {currentPage} of {totalPages} —
              </div>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="p-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Highlighter className="w-3 h-3 text-amber-500" />
              Highlight text in the document above to record verified page-level evidence.
            </span>
          </div>
        </div>

        {/* Right Panel: Evidence Citation Recorder & Decision (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Evidence Citation Recorder */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Record Evidence Citation
                </h3>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                PDF Page {currentPage}
              </span>
            </div>

            {/* Selected Quotation Box */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Selected Quotation *
              </label>
              <textarea
                rows={3}
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                placeholder="Highlight text in the PDF on the left, or paste an exact quotation here..."
                className="w-full text-xs p-2.5 bg-yellow-50/50 border border-yellow-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-serif"
              />
            </div>

            {/* Citation Metadata inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">
                  Evidence Category
                </label>
                <select
                  value={evidenceCategory}
                  onChange={(e) => setEvidenceCategory(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded mt-0.5 bg-white"
                >
                  <option value="Primary Clinical Outcome">Primary Clinical Outcome</option>
                  <option value="Diagnostic Accuracy">Diagnostic Accuracy (AUROC)</option>
                  <option value="Study Population & Cohort">Study Population & Cohort</option>
                  <option value="Intervention Specification">Intervention Specification</option>
                  <option value="Adverse Effects & Fatigue">Adverse Effects & Fatigue</option>
                  <option value="Methodological Limitation">Methodological Limitation</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">
                  Printed Page # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1104"
                  value={printedPageNumber}
                  onChange={(e) => setPrintedPageNumber(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded mt-0.5"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase">
                Related Research Question
              </label>
              <select
                value={relatedRq}
                onChange={(e) => setRelatedRq(e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded mt-0.5 bg-white truncate"
              >
                {project.researchQuestions.map((rq, idx) => (
                  <option key={idx} value={rq}>
                    {rq}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase">
                Reviewer Notes & Verification Context
              </label>
              <input
                type="text"
                value={citationNotes}
                onChange={(e) => setCitationNotes(e.target.value)}
                placeholder="e.g. Verified against Table 2 secondary cohort..."
                className="w-full text-xs p-1.5 border border-slate-300 rounded mt-0.5"
              />
            </div>

            <button
              onClick={handleAddCitation}
              disabled={!selectedText.trim()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Verified Evidence Citation</span>
            </button>
          </div>

          {/* List of Saved Evidence Citations for this Article */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Saved Evidence Citations ({article.evidenceCitations?.length || 0})
              </h3>
            </div>

            {(!article.evidenceCitations || article.evidenceCitations.length === 0) && (
              <p className="text-xs text-slate-400 italic py-2">
                No citations saved yet. Highlight text in the PDF reader to cite specific findings.
              </p>
            )}

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(article.evidenceCitations || []).map((cit) => (
                <div
                  key={cit.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 relative group"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-blue-700">
                      Page {cit.pdfPage} {cit.printedPage ? `(Print: ${cit.printedPage})` : ''}
                    </span>
                    <span className="text-slate-500 bg-white px-1.5 py-0.2 rounded border">
                      {cit.evidenceCategory}
                    </span>
                  </div>

                  <blockquote className="font-serif italic text-slate-800 line-clamp-2">
                    "{cit.quote}"
                  </blockquote>

                  {cit.reviewerNotes && (
                    <div className="text-[10px] text-slate-500">Note: {cit.reviewerNotes}</div>
                  )}

                  <button
                    onClick={() => handleRemoveCitation(cit.id)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove citation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

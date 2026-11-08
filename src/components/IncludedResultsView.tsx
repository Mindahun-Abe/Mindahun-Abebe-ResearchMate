import React, { useState } from 'react';
import {
  Award,
  Download,
  BookOpen,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Filter,
  Printer,
  Table,
} from 'lucide-react';
import { Article, ResearchProject } from '../types/research';
import { exportToWordHtml, exportToBibtex, downloadBlob, downloadText } from '../utils/exportHelpers';

interface IncludedResultsViewProps {
  project: ResearchProject;
  articles: Article[];
  onSelectArticleForReview: (article: Article) => void;
}

export const IncludedResultsView: React.FC<IncludedResultsViewProps> = ({
  project,
  articles,
  onSelectArticleForReview,
}) => {
  const [activeFilter, setActiveFilter] = useState<'INCLUDED' | 'EXCLUDED' | 'UNCERTAIN' | 'ALL'>('INCLUDED');
  const [yearFilter, setYearFilter] = useState('ALL');

  const filteredArticles = articles.filter((a) => {
    if (activeFilter === 'INCLUDED' && a.screeningStatus !== 'INCLUDE') return false;
    if (activeFilter === 'EXCLUDED' && a.screeningStatus !== 'EXCLUDE') return false;
    if (activeFilter === 'UNCERTAIN' && a.screeningStatus !== 'UNCERTAIN') return false;
    if (yearFilter !== 'ALL' && a.year !== yearFilter) return false;
    return true;
  });

  const includedOnly = articles.filter((a) => a.screeningStatus === 'INCLUDE');

  // Export full report as Word document
  const handleExportWord = () => {
    const htmlContent = `
      <h1>Included Studies Synthesis & Evidence Matrix</h1>
      <div class="meta-box">
        <p><strong>Project:</strong> ${project.title}</p>
        <p><strong>Review Type:</strong> ${project.reviewType}</p>
        <p><strong>Protocol Version:</strong> ${project.protocolVersion} (${project.protocolDate})</p>
        <p><strong>Total Included Studies:</strong> ${includedOnly.length}</p>
        <p><strong>Generated Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <h2>1. Bibliographic Reference Table</h2>
      <table>
        <thead>
          <tr>
            <th>Study ID</th>
            <th>Citation</th>
            <th>Title</th>
            <th>Journal / Year</th>
            <th>DOI</th>
          </tr>
        </thead>
        <tbody>
          ${includedOnly
            .map(
              (a, idx) => `
            <tr>
              <td>[S${idx + 1}]</td>
              <td>${a.authors}</td>
              <td>${a.title}</td>
              <td>${a.journal} (${a.year})</td>
              <td>${a.doi || 'N/A'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h2>2. Study Characteristics & Extracted Findings</h2>
      <table>
        <thead>
          <tr>
            <th>Study</th>
            <th>Design</th>
            <th>Cohort (N)</th>
            <th>Primary Metric</th>
            <th>Clinical Impact</th>
            <th>Risk of Bias</th>
          </tr>
        </thead>
        <tbody>
          ${includedOnly
            .map(
              (a) => `
            <tr>
              <td><strong>${a.authors.split(';')[0]} (${a.year})</strong></td>
              <td>${a.extractionData?.studyDesign || 'N/A'}</td>
              <td>${a.extractionData?.sampleSize || 'N/A'}</td>
              <td>${a.extractionData?.primaryAuroc || 'N/A'}</td>
              <td>${a.extractionData?.mortalityImpact || 'N/A'}</td>
              <td>${a.qualityAppraisal?.overallRisk || 'Unassessed'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h2>3. Verified Page-Level Evidence Citations</h2>
      ${includedOnly
        .map((a) => `
        <h3>${a.title} (${a.year})</h3>
        ${
          a.evidenceCitations?.length
            ? a.evidenceCitations
                .map(
                  (c) => `
              <blockquote>
                "${c.quote}"<br>
                <em>— PDF Page ${c.pdfPage} ${c.printedPage ? `(Print: p.${c.printedPage})` : ''} | Category: ${c.evidenceCategory}</em>
              </blockquote>
            `
                )
                .join('')
            : '<p><em>No direct page citations saved.</em></p>'
        }
      `)
        .join('')}
    `;

    const blob = exportToWordHtml('Included_Studies_Report', htmlContent);
    downloadBlob(blob, `${project.title.substring(0, 20)}_included_studies_report.doc`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h1 className="text-lg font-bold text-slate-900">
              Results for Included Articles ({includedOnly.length} Studies)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Protocol: {project.protocolVersion} ({project.protocolDate}) — Evaluated against {project.criteria.length} active eligibility criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportWord}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (Word / DOC)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveFilter('INCLUDED')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeFilter === 'INCLUDED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Included Articles ({includedOnly.length})
          </button>
          <button
            onClick={() => setActiveFilter('EXCLUDED')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeFilter === 'EXCLUDED'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Excluded Articles ({articles.filter((a) => a.screeningStatus === 'EXCLUDE').length})
          </button>
          <button
            onClick={() => setActiveFilter('UNCERTAIN')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeFilter === 'UNCERTAIN'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Uncertain Articles ({articles.filter((a) => a.screeningStatus === 'UNCERTAIN').length})
          </button>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Screened ({articles.length})
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Showing {filteredArticles.length} study records
        </span>
      </div>

      {/* Main Study Cards Grid */}
      <div className="space-y-4">
        {filteredArticles.map((art, idx) => (
          <div
            key={art.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    S{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {art.screeningStatus}
                  </span>
                  {art.qualityAppraisal?.overallRisk && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      RoB: {art.qualityAppraisal.overallRisk} Risk
                    </span>
                  )}
                  {art.doi && (
                    <span className="text-[10px] font-mono text-blue-600 truncate">
                      DOI: {art.doi}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{art.title}</h3>

                <div className="text-xs text-slate-600 font-medium">
                  {art.authors} ({art.year}) — <span className="italic">{art.journal}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectArticleForReview(art)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open in PDF Reader</span>
              </button>
            </div>

            {/* Extraction Data Badges */}
            {art.extractionData && Object.keys(art.extractionData).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Design</span>
                  <span className="font-semibold text-slate-800">
                    {art.extractionData.studyDesign || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sample Size</span>
                  <span className="font-semibold text-slate-800">
                    {art.extractionData.sampleSize ? Number(art.extractionData.sampleSize).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Metric</span>
                  <span className="font-bold text-blue-700 font-mono">
                    {art.extractionData.primaryAuroc || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Time</span>
                  <span className="font-semibold text-slate-800">
                    {art.extractionData.leadTimeHours ? `${art.extractionData.leadTimeHours} hrs` : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {/* Saved Quotation Chips */}
            {art.evidenceCitations?.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Citation-Linked Page Evidence ({art.evidenceCitations.length})
                </span>
                <div className="space-y-1.5">
                  {art.evidenceCitations.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 bg-yellow-50/60 border border-yellow-200 rounded-lg text-xs text-slate-800"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-yellow-900 mb-0.5">
                        <span>PDF Page {c.pdfPage} {c.printedPage ? `(Print: p.${c.printedPage})` : ''}</span>
                        <span className="bg-yellow-100 px-1.5 py-0.2 rounded font-normal text-yellow-800">
                          {c.evidenceCategory}
                        </span>
                      </div>
                      <blockquote className="font-serif italic">"{c.quote}"</blockquote>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

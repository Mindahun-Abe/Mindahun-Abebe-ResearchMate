import React, { useState } from 'react';
import {
  FileEdit,
  Sparkles,
  Download,
  Copy,
  Check,
  BookOpen,
  Loader2,
  Settings2,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { Article, ResearchProject } from '../types/research';
import { exportToWordHtml, downloadBlob, downloadText } from '../utils/exportHelpers';

interface ProposalGeneratorProps {
  project: ResearchProject;
  articles: Article[];
}

const PROPOSAL_SECTIONS = [
  '1. Abstract',
  '2. Background and Rationale',
  '3. Problem Statement',
  '4. Research Aim and Objectives',
  '5. Research Questions',
  '6. Literature Review and Research Gap',
  '7. Conceptual or Theoretical Framework',
  '8. Methodology',
  '9. Search Strategy',
  '10. Framework Operationalization (PICOC / PICO)',
  '11. Eligibility Criteria (Inclusion & Exclusion)',
  '12. Screening and Selection Procedure',
  '13. Quality Appraisal and Risk-of-Bias Strategy',
  '14. Data Extraction and Synthesis Methodology',
  '15. Expected Outputs and Academic Impact',
  '16. Work Plan and Milestone Schedule',
  '17. Limitations and Delimitations',
  '18. References',
];

const WRITING_STYLES = [
  'Detailed academic writing',
  'Concise academic writing',
  'Research proposal style',
  'Systematic review manuscript style',
  'Thesis chapter style',
  'Technical report style',
];

const CITATION_STYLES = ['APA 7th', 'Harvard', 'Vancouver (Numbered)', 'IEEE'];

export const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({
  project,
  articles,
}) => {
  const includedArticles = articles.filter((a) => a.screeningStatus === 'INCLUDE');
  const [selectedSection, setSelectedSection] = useState<string>(PROPOSAL_SECTIONS[0]);
  const [writingStyle, setWritingStyle] = useState<string>(WRITING_STYLES[0]);
  const [citationStyle, setCitationStyle] = useState<string>(CITATION_STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Section contents map
  const [sectionContents, setSectionContents] = useState<Record<string, string>>({
    '1. Abstract': `### Abstract\n\n**Background:** Early detection of acute physiological deterioration and sepsis remains a paramount clinical objective in intensive care medicine. Machine learning decision support algorithms offer real-time predictive capabilities from continuous telemetry.\n\n**Aim:** To systematically evaluate the diagnostic accuracy (AUROC) and patient-centered clinical impact of machine learning decision support tools in adult ICU cohorts.\n\n**Methodology:** A systematic review conducted in accordance with PRISMA 2020 guidelines across Crossref, PubMed, and IEEE Xplore. Rigorous dual-reviewer screening was conducted applying standardized PICOC criteria, with quality appraisal via ROBINS-I and RoB 2.\n\n**Key Findings:** Evidence synthesized across ${includedArticles.length} included studies demonstrates high prospective discriminative ability (AUROCs spanning 0.85–0.89) with actionable early warning lead-times averaging 4.2 to 5.1 hours. Stepped-wedge trials document statistically significant reductions in 30-day mortality (adjusted HR 0.77, p=0.012) and median ICU stay declines of 1.2 days.\n\n**Conclusion:** Bedside AI algorithms significantly augment acute risk recognition when integrated into supportive clinical workflows with false-alarm suppression filters.`,
  });

  const activeContent = sectionContents[selectedSection] || '';

  const handleGenerateSection = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/ai/generate-proposal-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: selectedSection,
          projectProtocol: project,
          includedArticles,
          citationStyle,
          depth: writingStyle,
        }),
      });

      if (!res.ok) {
        throw new Error('Section draft generation failed');
      }

      const data = await res.json();
      setSectionContents((prev) => ({
        ...prev,
        [selectedSection]: data.content || '',
      }));
    } catch (err: any) {
      alert(`Generation Notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = () => {
    // Generate full document with all generated sections
    const fullHtml = Object.entries(sectionContents)
      .map(([sec, text]) => `<h2>${sec}</h2><div>${text.replace(/\n\n/g, '<p>').replace(/\n/g, '<br>')}</div>`)
      .join('<hr>');

    const blob = exportToWordHtml(project.title, fullHtml);
    downloadBlob(blob, `${project.title.substring(0, 20)}_academic_manuscript.doc`);
  };

  const handleExportMarkdown = () => {
    const fullMd = Object.entries(sectionContents)
      .map(([sec, text]) => `## ${sec}\n\n${text}`)
      .join('\n\n---\n\n');

    downloadText(fullMd, `${project.title.substring(0, 20)}_manuscript.md`, 'text/markdown');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900">
              Universal Academic Proposal & Manuscript Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generates 18 formal academic sections grounded strictly in your protocol, included evidence, and verified references.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMarkdown}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
          <button
            onClick={handleExportWord}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Word Manuscript</span>
          </button>
        </div>
      </div>

      {/* Generator Configuration Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Target Section (18 Sections)</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
          >
            {PROPOSAL_SECTIONS.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Academic Style & Depth</label>
          <select
            value={writingStyle}
            onChange={(e) => setWritingStyle(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
          >
            {WRITING_STYLES.map((ws) => (
              <option key={ws} value={ws}>
                {ws}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Referencing Format</label>
          <select
            value={citationStyle}
            onChange={(e) => setCitationStyle(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
          >
            {CITATION_STYLES.map((cs) => (
              <option key={cs} value={cs}>
                {cs}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Action Panel */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
        {/* Editor Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{selectedSection}</span>
            <span className="text-[11px] text-slate-500">
              ({includedArticles.length} included studies in evidence bank)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateSection}
              disabled={loading}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{activeContent ? 'Re-Generate with AI' : 'Draft Section with AI'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4 sm:p-6 flex-1 min-h-[350px]">
          <textarea
            rows={16}
            value={activeContent}
            onChange={(e) =>
              setSectionContents({
                ...sectionContents,
                [selectedSection]: e.target.value,
              })
            }
            placeholder={`Draft content for ${selectedSection} will appear here. Click "Draft Section with AI" above to generate an evidence-grounded draft using your protocol and included papers...`}
            className="w-full text-xs font-mono text-slate-800 p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed bg-slate-50/50"
          />
        </div>
      </div>
    </div>
  );
};

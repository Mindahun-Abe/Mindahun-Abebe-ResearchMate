import React from 'react';
import {
  GitBranch,
  Printer,
  Download,
  Info,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { PrismaReportCounts, ResearchProject } from '../types/research';
import { downloadText } from '../utils/exportHelpers';

interface PrismaFlowDiagramProps {
  prismaCounts: PrismaReportCounts;
  project: ResearchProject;
}

export const PrismaFlowDiagram: React.FC<PrismaFlowDiagramProps> = ({
  prismaCounts,
  project,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportTextSummary = () => {
    const text = `PRISMA 2020 FLOW DIAGRAM REPORT
Project: ${project.title}
Protocol Version: ${project.protocolVersion} (${project.protocolDate})
Generated: ${new Date().toLocaleString()}

1. IDENTIFICATION
- Records identified from databases: ${prismaCounts.recordsIdentifiedDatabases}
- Records identified from registers/registries: ${prismaCounts.recordsIdentifiedRegisters}
- Other sources: ${prismaCounts.recordsIdentifiedOther}
- Total records identified: ${prismaCounts.totalRecordsIdentified}
- Duplicate records removed: ${prismaCounts.duplicatesRemoved}

2. SCREENING
- Records screened (Title & Abstract): ${prismaCounts.recordsScreenedTitleAbstract}
- Records excluded (Title & Abstract): ${prismaCounts.recordsExcludedTitleAbstract}
${Object.entries(prismaCounts.titleAbstractExclusionReasons)
  .map(([r, n]) => `  * ${r}: ${n}`)
  .join('\n')}

3. RETRIEVAL & ELIGIBILITY
- Reports sought for retrieval: ${prismaCounts.reportsSoughtForRetrieval}
- Reports not retrieved: ${prismaCounts.reportsNotRetrieved}
- Full-text reports assessed for eligibility: ${prismaCounts.fullTextReportsAssessed}
- Full-text reports excluded: ${prismaCounts.fullTextReportsExcluded}
${Object.entries(prismaCounts.fullTextExclusionReasons)
  .map(([r, n]) => `  * ${r}: ${n}`)
  .join('\n')}

4. INCLUDED STUDIES
- Studies included in qualitative synthesis: ${prismaCounts.studiesIncludedQualitative}
- Studies included in quantitative synthesis (meta-analysis/extraction): ${prismaCounts.studiesIncludedQuantitative}
- Total included studies: ${prismaCounts.totalStudiesIncluded}
`;

    downloadText(text, `${project.title.substring(0, 20)}_prisma_report.txt`, 'text/plain');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900">PRISMA 2020 Flow Diagram</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit trail and numerical flow calculated dynamically from actual project screening records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Diagram</span>
          </button>
          <button
            onClick={handleExportTextSummary}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (TXT)</span>
          </button>
        </div>
      </div>

      {/* Visual PRISMA 2020 Flowchart Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            PRISMA 2020 Flow Diagram for Systematic Reviews
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {project.title} — Protocol {project.protocolVersion}
          </p>
        </div>

        {/* Section 1: Identification */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wider bg-blue-50/70 p-1.5 rounded text-center">
            Identification
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">
                Records identified from databases:
              </span>
              <div className="text-xl font-bold text-blue-700">
                n = {prismaCounts.recordsIdentifiedDatabases}
              </div>
              <p className="text-[11px] text-slate-500">
                Sources: {project.databasesAndSources.slice(0, 4).join(', ')}
              </p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-xs space-y-1">
              <span className="font-bold text-amber-900 block">
                Duplicate records removed:
              </span>
              <div className="text-xl font-bold text-amber-700">
                n = {prismaCounts.duplicatesRemoved}
              </div>
              <p className="text-[11px] text-amber-800">
                Resolved via exact DOI, normalized title, and fuzzy title similarity
              </p>
            </div>
          </div>
        </div>

        {/* Connector arrow */}
        <div className="flex justify-center text-slate-400 font-bold text-sm">↓</div>

        {/* Section 2: Screening */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider bg-indigo-50/70 p-1.5 rounded text-center">
            Screening
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">
                Records screened (Title & Abstract):
              </span>
              <div className="text-xl font-bold text-blue-700">
                n = {prismaCounts.recordsScreenedTitleAbstract}
              </div>
            </div>

            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 text-xs space-y-1">
              <span className="font-bold text-rose-900 block">
                Records excluded (Title & Abstract):
              </span>
              <div className="text-xl font-bold text-rose-700">
                n = {prismaCounts.recordsExcludedTitleAbstract}
              </div>
              {Object.keys(prismaCounts.titleAbstractExclusionReasons).length > 0 && (
                <div className="pt-1 text-[11px] text-rose-800 space-y-0.5">
                  {Object.entries(prismaCounts.titleAbstractExclusionReasons).map(([r, n]) => (
                    <div key={r}>
                      • {r}: {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connector arrow */}
        <div className="flex justify-center text-slate-400 font-bold text-sm">↓</div>

        {/* Section 3: Eligibility & Retrieval */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-purple-800 uppercase tracking-wider bg-purple-50/70 p-1.5 rounded text-center">
            Eligibility & Retrieval
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">
                Full-text reports sought for retrieval:
              </span>
              <div className="text-xl font-bold text-blue-700">
                n = {prismaCounts.reportsSoughtForRetrieval}
              </div>
              <div className="pt-2 text-[11px] text-slate-600">
                Reports not retrieved: <span className="font-bold">{prismaCounts.reportsNotRetrieved}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Full-text reports assessed: <span className="font-bold">{prismaCounts.fullTextReportsAssessed}</span>
              </div>
            </div>

            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 text-xs space-y-1">
              <span className="font-bold text-rose-900 block">
                Full-text reports excluded:
              </span>
              <div className="text-xl font-bold text-rose-700">
                n = {prismaCounts.fullTextReportsExcluded}
              </div>
              {Object.keys(prismaCounts.fullTextExclusionReasons).length > 0 && (
                <div className="pt-1 text-[11px] text-rose-800 space-y-0.5">
                  {Object.entries(prismaCounts.fullTextExclusionReasons).map(([r, n]) => (
                    <div key={r}>
                      • {r}: {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connector arrow */}
        <div className="flex justify-center text-slate-400 font-bold text-sm">↓</div>

        {/* Section 4: Included Studies */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50/70 p-1.5 rounded text-center">
            Included
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-5 text-xs text-center space-y-2">
            <span className="font-bold text-emerald-950 text-sm block">
              Studies included in systematic review synthesis:
            </span>
            <div className="text-3xl font-extrabold text-emerald-700">
              n = {prismaCounts.totalStudiesIncluded}
            </div>
            <div className="flex flex-wrap justify-center gap-6 pt-1 text-xs text-emerald-900 font-medium">
              <span>Studies in qualitative synthesis: n = {prismaCounts.studiesIncludedQualitative}</span>
              <span>Studies in quantitative synthesis / meta-analysis: n = {prismaCounts.studiesIncludedQuantitative}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  TableProperties,
  Download,
  Plus,
  Trash2,
  Save,
  Check,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Article, ResearchProject } from '../types/research';
import { exportExtractionMatrixCsv, downloadText } from '../utils/exportHelpers';

interface EvidenceExtractionProps {
  project: ResearchProject;
  articles: Article[];
  onUpdateArticle: (article: Article) => void;
  onUpdateProject: (project: ResearchProject) => void;
}

export const EvidenceExtraction: React.FC<EvidenceExtractionProps> = ({
  project,
  articles,
  onUpdateArticle,
  onUpdateProject,
}) => {
  const includedArticles = articles.filter((a) => a.screeningStatus === 'INCLUDE');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    includedArticles[0]?.id || ''
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeArticle = includedArticles.find((a) => a.id === selectedArticleId) || includedArticles[0];

  const handleFieldValueChange = (key: string, val: any) => {
    if (!activeArticle) return;
    const currentData = { ...(activeArticle.extractionData || {}) };
    currentData[key] = val;

    onUpdateArticle({
      ...activeArticle,
      extractionData: currentData,
    });
  };

  const handleAddField = () => {
    const name = prompt('Enter new extraction field label (e.g. "Follow-up Duration"):');
    if (!name?.trim()) return;

    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const updatedFields = [
      ...project.extractionFields,
      {
        key,
        label: name.trim(),
        type: 'text' as const,
        category: 'Study Characteristics',
        required: false,
      },
    ];

    onUpdateProject({
      ...project,
      extractionFields: updatedFields,
    });
  };

  const handleExportCsv = () => {
    const csv = exportExtractionMatrixCsv(includedArticles, project);
    downloadText(csv, `${project.title.substring(0, 25)}_extraction_matrix.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900">
              Evidence Extraction & Cross-Study Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable data extraction across {includedArticles.length} included studies. Add custom fields and export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddField}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Extraction Field</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Matrix (CSV)</span>
          </button>
        </div>
      </div>

      {includedArticles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <h3 className="font-bold text-sm text-slate-800">No Included Studies</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Articles marked INCLUDE during screening will appear here automatically for evidence extraction.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Comparative Extraction Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Comparative Evidence Matrix ({includedArticles.length} Studies)
              </span>
              <span className="text-[11px] text-slate-500">
                Click any row to edit study extraction data
              </span>
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Study ID / Citation</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Design</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Cohort (N)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Setting / Country</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Intervention</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Primary Metric (AUROC)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Clinical Impact</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Quality Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {includedArticles.map((art) => {
                    const isSelected = art.id === selectedArticleId;
                    const d = art.extractionData || {};
                    return (
                      <tr
                        key={art.id}
                        onClick={() => setSelectedArticleId(art.id)}
                        className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 font-medium' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900">
                            {art.authors.split(';')[0]?.split(',')[0]} et al. ({art.year})
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {art.journal}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                          {d.studyDesign || 'Unspecified'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-mono">
                          {d.sampleSize ? Number(d.sampleSize).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                          {d.country || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                          {d.aiModelType || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-blue-700 font-semibold">
                          {d.primaryAuroc || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                          {d.mortalityImpact || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {art.qualityAppraisal?.overallRisk || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form to Edit Extraction Data for Selected Study */}
          {activeArticle && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600">
                    Editing Extraction Record
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{activeArticle.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Switch Study:
                  </span>
                  <select
                    value={selectedArticleId}
                    onChange={(e) => setSelectedArticleId(e.target.value)}
                    className="text-xs p-1.5 border border-slate-300 rounded font-medium bg-white"
                  >
                    {includedArticles.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.authors.split(';')[0]} ({a.year})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic extraction fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {project.extractionFields.map((field) => {
                  const val = activeArticle.extractionData?.[field.key] ?? '';
                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="font-bold text-slate-700">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={2}
                          value={val}
                          onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                          className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={val}
                          onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                          className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

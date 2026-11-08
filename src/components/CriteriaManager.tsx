import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Save,
  Check,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Shield,
  Layers,
} from 'lucide-react';
import { EligibilityCriterion, CriterionCategory, ResearchProject } from '../types/research';

interface CriteriaManagerProps {
  project: ResearchProject;
  onSaveCriteria: (criteria: EligibilityCriterion[]) => void;
}

const CATEGORIES: CriterionCategory[] = [
  'Population',
  'Intervention',
  'Comparison',
  'Outcomes',
  'StudyDesign',
  'Methodology',
  'Relevance',
  'Geography',
  'Period',
  'Language',
  'PublicationType',
  'EvidenceAvailability',
  'Custom',
];

export const CriteriaManager: React.FC<CriteriaManagerProps> = ({ project, onSaveCriteria }) => {
  const [criteria, setCriteria] = useState<EligibilityCriterion[]>(project.criteria || []);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddCriterion = () => {
    const newId = 'crit_' + Date.now();
    const newCrit: EligibilityCriterion = {
      id: newId,
      name: 'New Eligibility Criterion',
      category: 'Population',
      description: 'Describe what the study must demonstrate.',
      inclusionCondition: 'Explicit condition for inclusion',
      exclusionCondition: 'Explicit condition triggering exclusion',
      mandatory: true,
      screeningStage: 'Both',
      decisionGuidance: 'Guidance notes for human reviewers',
      reasonCode: `EXC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    };
    setCriteria([...criteria, newCrit]);
    setEditingId(newId);
  };

  const handleUpdateCriterion = (id: string, field: keyof EligibilityCriterion, val: any) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };

  const handleRemoveCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    onSaveCriteria(criteria);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900">Eligibility & Screening Rules Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure mandatory and optional inclusion/exclusion rules with standardized reason codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Criteria Saved!
            </span>
          )}
          <button
            onClick={handleAddCriterion}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Criterion</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Rules</span>
          </button>
        </div>
      </div>

      {/* Criteria List */}
      <div className="space-y-4">
        {criteria.map((crit, idx) => (
          <div
            key={crit.id}
            className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
              crit.mandatory ? 'border-slate-200' : 'border-dashed border-slate-300'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={crit.name}
                  onChange={(e) => handleUpdateCriterion(crit.id, 'name', e.target.value)}
                  className="font-bold text-sm text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1"
                />
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    crit.mandatory
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {crit.mandatory ? 'MANDATORY' : 'OPTIONAL'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Reason Code:</span>
                <input
                  type="text"
                  value={crit.reasonCode}
                  onChange={(e) => handleUpdateCriterion(crit.id, 'reasonCode', e.target.value.toUpperCase())}
                  className="text-xs font-mono font-bold uppercase p-1 w-24 bg-slate-50 border border-slate-300 rounded text-center"
                  placeholder="EXC-CODE"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveCriterion(crit.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  title="Delete Criterion"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Category</label>
                <select
                  value={crit.category}
                  onChange={(e) => handleUpdateCriterion(crit.id, 'category', e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded mt-1"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Screening Stage</label>
                <select
                  value={crit.screeningStage}
                  onChange={(e) => handleUpdateCriterion(crit.id, 'screeningStage', e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded mt-1"
                >
                  <option value="Both">Both (Title/Abstract & Full Text)</option>
                  <option value="TitleAndAbstract">Stage 1 (Title & Abstract only)</option>
                  <option value="FullText">Stage 2 (Full-Text only)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id={`mand_${crit.id}`}
                  checked={crit.mandatory}
                  onChange={(e) => handleUpdateCriterion(crit.id, 'mandatory', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor={`mand_${crit.id}`} className="text-xs font-medium text-slate-800 cursor-pointer">
                  Mandatory (Violation causes automatic EXCLUDE)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                  Inclusion Condition (Required to INCLUDE)
                </span>
                <textarea
                  rows={2}
                  value={crit.inclusionCondition}
                  onChange={(e) => handleUpdateCriterion(crit.id, 'inclusionCondition', e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-emerald-300 rounded"
                  placeholder="e.g. Adult ICU patients aged 18 and older..."
                />
              </div>

              <div className="bg-rose-50/70 border border-rose-200/80 rounded-lg p-2.5">
                <span className="text-[11px] font-bold text-rose-800 block mb-1">
                  Exclusion Condition (Triggers EXCLUDE with Reason Code)
                </span>
                <textarea
                  rows={2}
                  value={crit.exclusionCondition}
                  onChange={(e) => handleUpdateCriterion(crit.id, 'exclusionCondition', e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-rose-300 rounded"
                  placeholder="e.g. Pediatric or neonatal populations..."
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-semibold text-slate-500">Reviewer Guidance Notes</label>
              <input
                type="text"
                value={crit.decisionGuidance}
                onChange={(e) => handleUpdateCriterion(crit.id, 'decisionGuidance', e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded mt-0.5 text-slate-700"
                placeholder="Specific guidance or boundary cases for reviewers..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

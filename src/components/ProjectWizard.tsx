import React, { useState } from 'react';
import {
  Save,
  Check,
  Plus,
  Trash2,
  Settings2,
  FileText,
  Users,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  ResearchProject,
  ReviewType,
  FrameworkType,
  ResearchFramework,
  FrameworkElement,
} from '../types/research';

interface ProjectWizardProps {
  project: ResearchProject;
  onSaveProject: (updated: ResearchProject) => void;
}

const REVIEW_TYPES: ReviewType[] = [
  'Systematic literature review',
  'Scoping review',
  'Systematic mapping review',
  'Meta-analysis',
  'Narrative literature review',
  'Integrative review',
  'Rapid review',
  'Evidence synthesis',
  'Bibliometric review',
  'User-defined review',
];

const FRAMEWORK_PRESETS: Record<FrameworkType, { name: string; elements: { key: string; label: string; description: string; placeholder: string }[] }> = {
  PICOC: {
    name: 'PICOC Framework (Booth et al., 2016)',
    elements: [
      { key: 'P', label: 'Population / Problem', description: 'Who or what is being studied?', placeholder: 'Target population, clinical condition, or problem domain' },
      { key: 'I', label: 'Intervention', description: 'What technology, treatment, or policy is applied?', placeholder: 'Intervention, system, model, or strategy' },
      { key: 'C', label: 'Comparison', description: 'What is the control or baseline comparator?', placeholder: 'Alternative method, standard care, or null baseline' },
      { key: 'O', label: 'Outcomes', description: 'What effects or metrics are evaluated?', placeholder: 'Primary and secondary outcome measures' },
      { key: 'C2', label: 'Context', description: 'In what environment or setting does this occur?', placeholder: 'Setting, geography, healthcare tier, or industry domain' },
    ],
  },
  PICO: {
    name: 'PICO Framework (Clinical / Healthcare)',
    elements: [
      { key: 'P', label: 'Population', description: 'Patient, population, or problem', placeholder: 'Target patient group' },
      { key: 'I', label: 'Intervention', description: 'Experimental intervention', placeholder: 'Drug, surgical technique, or device' },
      { key: 'C', label: 'Comparison', description: 'Control group or standard intervention', placeholder: 'Placebo, active control' },
      { key: 'O', label: 'Outcome', description: 'Clinical or laboratory endpoint', placeholder: 'Mortality, morbidity, recovery rate' },
    ],
  },
  PECO: {
    name: 'PECO Framework (Epidemiology / Environmental)',
    elements: [
      { key: 'P', label: 'Population', description: 'Exposed population', placeholder: 'Community, occupational cohort' },
      { key: 'E', label: 'Exposure', description: 'Environmental agent or risk factor', placeholder: 'Pollutant, chemical, behavioral factor' },
      { key: 'C', label: 'Comparator', description: 'Non-exposed or low-exposure group', placeholder: 'Baseline unexposed population' },
      { key: 'O', label: 'Outcome', description: 'Incidence or health effect', placeholder: 'Disease incidence, biomarker change' },
    ],
  },
  SPIDER: {
    name: 'SPIDER Framework (Qualitative / Mixed Methods)',
    elements: [
      { key: 'S', label: 'Sample', description: 'Participants or sample group', placeholder: 'Healthcare workers, students, community leaders' },
      { key: 'PI', label: 'Phenomenon of Interest', description: 'Experience, behavior, or intervention', placeholder: 'Experience of clinical adoption' },
      { key: 'D', label: 'Design', description: 'Study design', placeholder: 'Interviews, focus groups, grounded theory' },
      { key: 'E', label: 'Evaluation', description: 'Subjective outcomes or perceptions', placeholder: 'Perceptions, barriers, satisfaction' },
      { key: 'R', label: 'Research Type', description: 'Methodological category', placeholder: 'Qualitative, quantitative, mixed-methods' },
    ],
  },
  SPICE: {
    name: 'SPICE Framework (Information / Library Sciences)',
    elements: [
      { key: 'S', label: 'Setting', description: 'Where does the inquiry take place?', placeholder: 'Hospital library, university, digital portal' },
      { key: 'P', label: 'Perspective', description: 'Who are the stakeholders or users?', placeholder: 'Researchers, librarians, students' },
      { key: 'I', label: 'Intervention', description: 'What service or platform was initiated?', placeholder: 'Search platform, automated retrieval' },
      { key: 'C', label: 'Comparison', description: 'Existing system or practice', placeholder: 'Manual indexing, legacy OPAC' },
      { key: 'E', label: 'Evaluation', description: 'Impact or utility metric', placeholder: 'Retrieval accuracy, user satisfaction' },
    ],
  },
  PCC: {
    name: 'PCC Framework (Scoping Reviews - JBI)',
    elements: [
      { key: 'P', label: 'Population', description: 'Core population or participants', placeholder: 'Demographic, clinical, or social cohort' },
      { key: 'C', label: 'Concept', description: 'Core concept, principle, or topic', placeholder: 'Educational intervention, digital tool' },
      { key: 'C2', label: 'Context', description: 'Cultural, sub-cultural, or geographic context', placeholder: 'Setting, region, or healthcare level' },
    ],
  },
  CUSTOM: {
    name: 'Custom Research Framework',
    elements: [
      { key: 'F1', label: 'Component 1', description: 'User-defined element', placeholder: 'Describe component 1' },
      { key: 'F2', label: 'Component 2', description: 'User-defined element', placeholder: 'Describe component 2' },
      { key: 'F3', label: 'Component 3', description: 'User-defined element', placeholder: 'Describe component 3' },
    ],
  },
};

export const ProjectWizard: React.FC<ProjectWizardProps> = ({ project, onSaveProject }) => {
  const [activeStep, setActiveStep] = useState<'general' | 'framework' | 'eligibility' | 'reviewers'>('general');
  const [formData, setFormData] = useState<ResearchProject>(project);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFieldChange = (field: keyof ResearchProject, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
  };

  const handleFrameworkTypeChange = (newType: FrameworkType) => {
    const preset = FRAMEWORK_PRESETS[newType];
    const newElements: FrameworkElement[] = preset.elements.map((el) => {
      // Preserve existing element value if key matches
      const existing = formData.framework.elements.find((e) => e.key === el.key);
      return {
        key: el.key,
        label: el.label,
        description: el.description,
        value: existing ? existing.value : '',
      };
    });

    setFormData((prev) => ({
      ...prev,
      framework: {
        type: newType,
        name: preset.name,
        elements: newElements,
      },
    }));
  };

  const handleElementValueChange = (index: number, val: string) => {
    const updated = [...formData.framework.elements];
    updated[index] = { ...updated[index], value: val };
    setFormData((prev) => ({
      ...prev,
      framework: { ...prev.framework, elements: updated },
    }));
  };

  const handleAddCustomFrameworkElement = () => {
    const newKey = `E${formData.framework.elements.length + 1}`;
    const newElement: FrameworkElement = {
      key: newKey,
      label: `Custom Element ${formData.framework.elements.length + 1}`,
      description: 'Researcher-defined attribute',
      value: '',
    };
    setFormData((prev) => ({
      ...prev,
      framework: {
        ...prev.framework,
        elements: [...prev.framework.elements, newElement],
      },
    }));
  };

  const handleRemoveFrameworkElement = (index: number) => {
    const updated = formData.framework.elements.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      framework: { ...prev.framework, elements: updated },
    }));
  };

  const handleSave = () => {
    onSaveProject(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900">Project Protocol & Framework Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Universal configuration for any academic discipline and systematic review methodology.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fade-in">
              <Check className="w-4 h-4" /> Protocol Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Protocol</span>
          </button>
        </div>
      </div>

      {/* Wizard Steps Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 text-xs font-medium">
        <button
          onClick={() => setActiveStep('general')}
          className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
            activeStep === 'general'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Core Protocol</span>
        </button>

        <button
          onClick={() => setActiveStep('framework')}
          className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
            activeStep === 'framework'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Research Framework ({formData.framework.type})</span>
        </button>

        <button
          onClick={() => setActiveStep('eligibility')}
          className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
            activeStep === 'eligibility'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>3. Scope & Dates</span>
        </button>

        <button
          onClick={() => setActiveStep('reviewers')}
          className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
            activeStep === 'reviewers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>4. Reviewers & Sources</span>
        </button>
      </div>

      {/* Step 1: Core Protocol Content */}
      {activeStep === 'general' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Project Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                placeholder="Formal title of the research project or systematic review"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Review Type *</label>
              <select
                value={formData.reviewType}
                onChange={(e) => handleFieldChange('reviewType', e.target.value as ReviewType)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              >
                {REVIEW_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Research Topic / Discipline</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => handleFieldChange('topic', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Artificial Intelligence, Healthcare, Economics, Ecology"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Protocol Version & Date</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.protocolVersion}
                  onChange={(e) => handleFieldChange('protocolVersion', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  placeholder="e.g. v2.1"
                />
                <input
                  type="date"
                  value={formData.protocolDate}
                  onChange={(e) => handleFieldChange('protocolDate', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Research Aim</label>
            <textarea
              rows={2}
              value={formData.aim}
              onChange={(e) => handleFieldChange('aim', e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              placeholder="Overall research aim or primary purpose of the investigation"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Research Background & Rationale</label>
            <textarea
              rows={3}
              value={formData.background}
              onChange={(e) => handleFieldChange('background', e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              placeholder="Academic context, clinical/societal importance, and identified gap"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Research Questions</label>
              <button
                type="button"
                onClick={() =>
                  handleFieldChange('researchQuestions', [
                    ...formData.researchQuestions,
                    `RQ${formData.researchQuestions.length + 1}: `,
                  ])
                }
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Research Question
              </button>
            </div>
            <div className="space-y-2">
              {formData.researchQuestions.map((rq, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rq}
                    onChange={(e) => {
                      const updated = [...formData.researchQuestions];
                      updated[idx] = e.target.value;
                      handleFieldChange('researchQuestions', updated);
                    }}
                    className="flex-1 text-xs p-2 border border-slate-300 rounded-lg"
                    placeholder={`RQ${idx + 1}: Question...`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.researchQuestions.filter((_, i) => i !== idx);
                      handleFieldChange('researchQuestions', updated);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Framework Manager (PICOC / PICO / etc.) */}
      {activeStep === 'framework' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800">Select Review Framework:</span>
              <p className="text-[11px] text-slate-500">
                Choose the structural framework that best fits your discipline and methodology.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['PICOC', 'PICO', 'PECO', 'SPIDER', 'SPICE', 'PCC', 'CUSTOM'] as FrameworkType[]).map((fType) => (
                <button
                  key={fType}
                  type="button"
                  onClick={() => handleFrameworkTypeChange(fType)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    formData.framework.type === fType
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {fType}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                {formData.framework.name} Elements
              </h3>
              <button
                type="button"
                onClick={handleAddCustomFrameworkElement}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Framework Element
              </button>
            </div>

            <div className="space-y-3">
              {formData.framework.elements.map((el, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-blue-100 text-blue-700 font-bold text-xs rounded flex items-center justify-center">
                        {el.key}
                      </span>
                      <span className="font-semibold text-xs text-slate-900">{el.label}</span>
                      <span className="text-[11px] text-slate-400">({el.description})</span>
                    </div>
                    {formData.framework.elements.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFrameworkElement(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={el.value}
                    onChange={(e) => handleElementValueChange(idx, e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    placeholder={`Specify definitions, parameters, and boundaries for ${el.label}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Scope & Dates */}
      {activeStep === 'eligibility' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Geographic Eligibility</label>
              <input
                type="text"
                value={formData.geographicEligibility}
                onChange={(e) => handleFieldChange('geographicEligibility', e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                placeholder="e.g. Global (All countries), Low- and Middle-Income Countries, OECD"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Publication Period</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.publicationPeriod.startYear}
                  onChange={(e) =>
                    handleFieldChange('publicationPeriod', {
                      ...formData.publicationPeriod,
                      startYear: e.target.value,
                    })
                  }
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  placeholder="Start Year (e.g. 2018)"
                />
                <input
                  type="text"
                  value={formData.publicationPeriod.endYear}
                  onChange={(e) =>
                    handleFieldChange('publicationPeriod', {
                      ...formData.publicationPeriod,
                      endYear: e.target.value,
                    })
                  }
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  placeholder="End Year (e.g. 2026)"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Eligible Study Designs</label>
              <input
                type="text"
                value={formData.eligibleStudyDesigns.join(', ')}
                onChange={(e) =>
                  handleFieldChange(
                    'eligibleStudyDesigns',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                placeholder="Comma separated: Randomized trials, Prospective cohort, Retrospective"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Language Restrictions</label>
              <input
                type="text"
                value={formData.languageRestrictions.join(', ')}
                onChange={(e) =>
                  handleFieldChange(
                    'languageRestrictions',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                placeholder="Comma separated: English, French, Spanish"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Reviewers & Sources */}
      {activeStep === 'reviewers' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reviewer 1 (Primary / Lead)</label>
              <input
                type="text"
                value={formData.reviewerInformation.reviewer1}
                onChange={(e) =>
                  handleFieldChange('reviewerInformation', {
                    ...formData.reviewerInformation,
                    reviewer1: e.target.value,
                  })
                }
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                placeholder="Dr. Sarah Lin (Lead Methodologist)"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reviewer 2 (Secondary / Adjudicator)</label>
              <input
                type="text"
                value={formData.reviewerInformation.reviewer2}
                onChange={(e) =>
                  handleFieldChange('reviewerInformation', {
                    ...formData.reviewerInformation,
                    reviewer2: e.target.value,
                  })
                }
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                placeholder="Prof. Marcus Vance (Clinical Specialist)"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              id="dualReviewMode"
              checked={formData.reviewerInformation.dualReviewMode}
              onChange={(e) =>
                handleFieldChange('reviewerInformation', {
                  ...formData.reviewerInformation,
                  dualReviewMode: e.target.checked,
                })
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="dualReviewMode" className="text-xs font-medium text-slate-800 cursor-pointer">
              Enable Dual-Reviewer Consensus Workflow (requires independent screening & flags disagreements for adjudication)
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Target Databases & Search Sources</label>
            <input
              type="text"
              value={formData.databasesAndSources.join(', ')}
              onChange={(e) =>
                handleFieldChange(
                  'databasesAndSources',
                  e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                )
              }
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              placeholder="Comma separated: Crossref, PubMed / Europe PMC, IEEE Xplore, Scopus, Web of Science"
            />
          </div>
        </div>
      )}
    </div>
  );
};

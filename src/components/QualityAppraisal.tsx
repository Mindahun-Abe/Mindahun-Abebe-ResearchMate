import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MinusCircle,
  Save,
  Check,
  Award,
  Layers,
  FileText,
} from 'lucide-react';
import { Article, QualityAppraisalResult, AppraisalItem } from '../types/research';

interface QualityAppraisalProps {
  articles: Article[];
  onUpdateArticle: (article: Article) => void;
}

type ToolType = QualityAppraisalResult['toolType'];

const TOOL_DEFINITIONS: Record<ToolType, { name: string; questions: string[] }> = {
  ROBINS_I: {
    name: 'ROBINS-I (Non-Randomized Studies of Interventions)',
    questions: [
      'Bias due to confounding: Did the authors account for key pre-intervention baseline covariates?',
      'Bias in selection of participants into the study: Were participant inclusion dates and cohorts clearly reported?',
      'Bias in classification of interventions: Were intervention groups clearly and reliably classified?',
      'Bias due to deviations from intended interventions: Were adherence rates or protocol deviations documented?',
      'Bias due to missing data: Were outcome data reasonably complete across all enrolled cohorts?',
      'Bias in measurement of outcomes: Was the outcome assessor blinded or were objective diagnostic criteria used?',
      'Bias in selection of the reported result: Were outcomes reported in alignment with a pre-registered protocol?',
    ],
  },
  ROB_2: {
    name: 'Cochrane RoB 2 (Randomized Controlled Trials)',
    questions: [
      'Randomization process: Was the allocation sequence adequately generated and concealed?',
      'Deviations from intended interventions: Were participants and personnel blinded to group assignments?',
      'Missing outcome data: Were missing data balanced across intervention and control arms?',
      'Measurement of the outcome: Was an objective outcome measurement method applied?',
      'Selection of reported results: Did reporting align with the pre-specified statistical analysis plan?',
    ],
  },
  CASP: {
    name: 'CASP (Cohort & Observational Studies)',
    questions: [
      'Did the study address a clearly focused clinical issue?',
      'Was the cohort recruited in an acceptable way?',
      'Was the exposure accurately measured to minimize bias?',
      'Was the outcome accurately measured to minimize bias?',
      'Have the authors identified all important confounding factors?',
      'Was the follow up of subjects complete and long enough?',
      'Do you believe the clinical results and are they applicable locally?',
    ],
  },
  JBI: {
    name: 'JBI Critical Appraisal (Evidence-Based Synthesis)',
    questions: [
      'Were the criteria for inclusion in the sample clearly defined?',
      'Were the study subjects and the setting described in detail?',
      'Was the exposure measured in a valid and reliable way?',
      'Were objective, standard criteria used for measurement of the condition?',
      'Were confounding factors identified and strategies to deal with them stated?',
      'Were the outcomes measured in a valid and reliable way?',
      'Was appropriate statistical analysis utilized?',
    ],
  },
  MMAT: {
    name: 'MMAT (Mixed Methods Appraisal Tool)',
    questions: [
      'Are there clear qualitative and quantitative research questions?',
      'Do the collected data allow to address the research questions?',
      'Is the qualitative approach relevant to answer research questions?',
      'Are the quantitative measures adequate and standardized?',
      'Is there an adequate rationale for using a mixed methods design?',
      'Are the different components of the study effectively integrated?',
    ],
  },
  QUADAS_2: {
    name: 'QUADAS-2 (Diagnostic Accuracy Studies)',
    questions: [
      'Patient Selection: Could the selection of patients have introduced bias?',
      'Index Test: Could the conduct or interpretation of the index test have introduced bias?',
      'Reference Standard: Could the reference standard or its conduct have introduced bias?',
      'Flow and Timing: Could the patient flow or timing between tests have introduced bias?',
    ],
  },
  CUSTOM: {
    name: 'Custom Methodological Checklist',
    questions: [
      'Criterion 1: Clear problem definition and objective formulation',
      'Criterion 2: Robust sample size and representative cohort sampling',
      'Criterion 3: Verified reproducibility of experimental pipeline and data',
      'Criterion 4: Transparent disclosure of limitations and conflicts of interest',
    ],
  },
};

export const QualityAppraisal: React.FC<QualityAppraisalProps> = ({
  articles,
  onUpdateArticle,
}) => {
  const includedArticles = articles.filter((a) => a.screeningStatus === 'INCLUDE');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    includedArticles[0]?.id || articles[0]?.id || ''
  );

  const activeArticle = articles.find((a) => a.id === selectedArticleId) || includedArticles[0];

  const [activeTool, setActiveTool] = useState<ToolType>(
    activeArticle?.qualityAppraisal?.toolType || 'ROBINS_I'
  );

  // Initialize or get appraisal state
  const toolDef = TOOL_DEFINITIONS[activeTool];
  const [items, setItems] = useState<AppraisalItem[]>(
    activeArticle?.qualityAppraisal?.items?.length
      ? activeArticle.qualityAppraisal.items
      : toolDef.questions.map((q, idx) => ({
          id: `item_${idx + 1}`,
          question: q,
          score: 'Yes',
          explanation: '',
        }))
  );

  const [overallRisk, setOverallRisk] = useState<QualityAppraisalResult['overallRisk']>(
    activeArticle?.qualityAppraisal?.overallRisk || 'Low'
  );
  const [reviewerNotes, setReviewerNotes] = useState(
    activeArticle?.qualityAppraisal?.reviewerNotes || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToolChange = (newTool: ToolType) => {
    setActiveTool(newTool);
    const newDef = TOOL_DEFINITIONS[newTool];
    setItems(
      newDef.questions.map((q, idx) => ({
        id: `item_${idx + 1}`,
        question: q,
        score: 'Yes',
        explanation: '',
      }))
    );
  };

  const handleScoreChange = (
    index: number,
    score: AppraisalItem['score']
  ) => {
    const next = [...items];
    next[index] = { ...next[index], score };
    setItems(next);
  };

  const handleExplanationChange = (index: number, explanation: string) => {
    const next = [...items];
    next[index] = { ...next[index], explanation };
    setItems(next);
  };

  const handleSaveAppraisal = () => {
    if (!activeArticle) return;

    const result: QualityAppraisalResult = {
      toolType: activeTool,
      toolName: toolDef.name,
      items,
      overallRisk,
      reviewerNotes,
      completedAt: new Date().toISOString(),
    };

    onUpdateArticle({
      ...activeArticle,
      qualityAppraisal: result,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900">
              Quality Appraisal & Risk-of-Bias Assessment
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable critical appraisal tools (ROBINS-I, RoB 2, CASP, JBI, MMAT, QUADAS-2) with item-level evidence justification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Appraisal Saved!
            </span>
          )}
          <button
            onClick={handleSaveAppraisal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Appraisal</span>
          </button>
        </div>
      </div>

      {/* Traffic Light Summary Grid Across All Included Studies */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Risk-of-Bias Traffic Light Overview ({includedArticles.length} Included Studies)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Study</th>
                <th className="py-2 px-3">Appraisal Tool</th>
                <th className="py-2 px-3 text-center">Overall Risk</th>
                <th className="py-2 px-3">Domain Scores</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {includedArticles.map((art) => {
                const qa = art.qualityAppraisal;
                const isSelected = art.id === selectedArticleId;
                return (
                  <tr
                    key={art.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{art.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {art.authors.split(';')[0]} ({art.year})
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                      {qa?.toolName || 'Not Appraised'}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {qa?.overallRisk === 'Low' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Low Risk
                        </span>
                      )}
                      {qa?.overallRisk === 'Moderate' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Moderate Risk
                        </span>
                      )}
                      {qa?.overallRisk === 'High' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          High Risk
                        </span>
                      )}
                      {!qa?.overallRisk && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {qa?.items ? (
                          qa.items.map((it, i) => (
                            <span
                              key={i}
                              title={`${it.question}: ${it.score}`}
                              className={`w-3.5 h-3.5 rounded-full inline-block ${
                                it.score === 'Yes'
                                  ? 'bg-emerald-500'
                                  : it.score === 'Partial'
                                  ? 'bg-amber-400'
                                  : it.score === 'No'
                                  ? 'bg-rose-500'
                                  : 'bg-slate-300'
                              }`}
                            />
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedArticleId(art.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        Appraise
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item-by-item Appraisal Form for Active Study */}
      {activeArticle && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600">
                Currently Appraising Study
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">{activeArticle.title}</h2>
              <p className="text-xs text-slate-500">
                {activeArticle.authors} ({activeArticle.year}) — {activeArticle.journal}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Select Tool:</span>
              <select
                value={activeTool}
                onChange={(e) => handleToolChange(e.target.value as ToolType)}
                className="text-xs p-1.5 border border-slate-300 rounded-lg bg-white font-medium"
              >
                {Object.keys(TOOL_DEFINITIONS).map((k) => (
                  <option key={k} value={k}>
                    {TOOL_DEFINITIONS[k as ToolType].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overall Risk rating selector */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-800">Overall Risk of Bias Synthesis:</span>
            <div className="flex gap-2">
              {(['Low', 'Moderate', 'High', 'Critical', 'Unclear'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setOverallRisk(lvl)}
                  className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                    overallRisk === lvl
                      ? lvl === 'Low'
                        ? 'bg-emerald-600 text-white'
                        : lvl === 'Moderate'
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-rose-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {lvl} Risk
                </button>
              ))}
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-start gap-2 max-w-xl">
                    <span className="font-bold text-blue-700 shrink-0 w-6">#{idx + 1}</span>
                    <span className="font-semibold text-slate-900 leading-snug">
                      {item.question}
                    </span>
                  </div>

                  {/* Score buttons */}
                  <div className="flex flex-wrap gap-1 shrink-0">
                    {(['Yes', 'Partial', 'No', 'Unclear', 'NotApplicable'] as const).map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => handleScoreChange(idx, sc)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                          item.score === sc
                            ? sc === 'Yes'
                              ? 'bg-emerald-600 text-white'
                              : sc === 'Partial'
                              ? 'bg-amber-500 text-slate-900'
                              : sc === 'No'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-700 text-white'
                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explanation text */}
                <input
                  type="text"
                  value={item.explanation || ''}
                  onChange={(e) => handleExplanationChange(idx, e.target.value)}
                  placeholder="Supporting evidence citation, page reference, or reviewer explanation..."
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded text-slate-700"
                />
              </div>
            ))}
          </div>

          {/* Reviewer Synthesis Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Reviewer Methodological Synthesis & Summary Notes
            </label>
            <textarea
              rows={2}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Summary notes regarding methodological quality and impact on final synthesis..."
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

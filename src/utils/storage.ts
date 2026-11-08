import {
  ResearchProject,
  Article,
  PrismaReportCounts,
  EligibilityCriterion,
  ResearchFramework,
} from '../types/research';

const STORAGE_KEY_PROJECTS = 'researchmate_v2_projects';
const STORAGE_KEY_ARTICLES = 'researchmate_v2_articles';
const STORAGE_KEY_ACTIVE_PROJECT = 'researchmate_v2_active_project_id';
const STORAGE_KEY_OFFLINE_QUEUE = 'researchmate_v2_offline_queue';

export function getInitialSampleProject(): { project: ResearchProject; articles: Article[] } {
  const sampleProjectId = 'proj_icu_ai_2025';

  const defaultFramework: ResearchFramework = {
    type: 'PICOC',
    name: 'PICOC Framework (Booth et al., 2016)',
    elements: [
      {
        key: 'P',
        label: 'Population / Problem',
        description: 'Adult critically ill patients admitted to intensive care or acute resuscitation units',
        value: 'Adult intensive care unit (ICU) and acute resuscitation patients at risk of deterioration or sepsis',
      },
      {
        key: 'I',
        label: 'Intervention',
        description: 'Machine learning and AI-driven clinical decision support systems (CDSS)',
        value: 'Real-time machine learning, deep learning, or predictive AI algorithms deployed at the bedside',
      },
      {
        key: 'C',
        label: 'Comparison',
        description: 'Standard clinical care, physician gestalt, or traditional non-AI early warning scores',
        value: 'Standard routine clinical care, manual monitoring, or conventional scoring (e.g. MEWS, SOFA)',
      },
      {
        key: 'O',
        label: 'Outcomes',
        description: 'In-hospital mortality, sepsis detection lead time, ICU length of stay, and alert fatigue',
        value: 'Primary: 30-day mortality, sepsis early detection lead-time. Secondary: ICU length of stay, physician alert compliance',
      },
      {
        key: 'C2',
        label: 'Context',
        description: 'Acute inpatient tertiary and community hospital critical care environments',
        value: 'Tertiary academic medical centers and community hospital ICUs with continuous telemetry data',
      },
    ],
  };

  const sampleCriteria: EligibilityCriterion[] = [
    {
      id: 'crit_1',
      name: 'Adult ICU Population',
      category: 'Population',
      description: 'Study must enroll human adult patients (>=18 years old) in acute critical care or intensive care units.',
      inclusionCondition: 'Adult ICU patients aged 18 and older.',
      exclusionCondition: 'Pediatric, neonatal, or non-acute outpatient cohorts.',
      mandatory: true,
      screeningStage: 'Both',
      decisionGuidance: 'Check patient age and inpatient ICU setting.',
      reasonCode: 'EXC-POP',
    },
    {
      id: 'crit_2',
      name: 'AI / Machine Learning Decision Support',
      category: 'Intervention',
      description: 'Must evaluate an algorithmic, machine learning, or artificial intelligence predictive decision support tool.',
      inclusionCondition: 'Predictive ML or AI models generating automated clinical risk predictions.',
      exclusionCondition: 'Purely manual rule engines, administrative billing tools, or non-algorithmic EHR templates.',
      mandatory: true,
      screeningStage: 'Both',
      decisionGuidance: 'Must feature algorithmic or statistical machine learning implementation.',
      reasonCode: 'EXC-INT',
    },
    {
      id: 'crit_3',
      name: 'Empirical Study Design',
      category: 'StudyDesign',
      description: 'Must be an original empirical prospective or retrospective clinical evaluation study.',
      inclusionCondition: 'Randomized controlled trials, prospective cohort, or retrospective observational validation studies.',
      exclusionCondition: 'Editorials, letters, non-systematic narrative reviews, protocols without results, or animal studies.',
      mandatory: true,
      screeningStage: 'Both',
      decisionGuidance: 'Exclude opinion pieces, conceptual frameworks with no validation data.',
      reasonCode: 'EXC-DES',
    },
    {
      id: 'crit_4',
      name: 'Reported Clinical or Diagnostic Outcomes',
      category: 'Outcomes',
      description: 'Must report quantitative clinical outcomes (mortality, length of stay, lead time) or diagnostic accuracy metrics (AUROC, sensitivity).',
      inclusionCondition: 'Reports AUROC, sensitivity, specificity, mortality, or length of stay.',
      exclusionCondition: 'No quantitative clinical or validation performance metrics reported.',
      mandatory: true,
      screeningStage: 'FullText',
      decisionGuidance: 'Must report concrete performance metrics or clinical endpoints.',
      reasonCode: 'EXC-OUT',
    },
    {
      id: 'crit_5',
      name: 'English Language Publication',
      category: 'Language',
      description: 'Full-text report must be available in the English language or with an authorized English translation.',
      inclusionCondition: 'English language publication.',
      exclusionCondition: 'Non-English language publications without accessible translations.',
      mandatory: true,
      screeningStage: 'Both',
      decisionGuidance: 'Exclude non-English manuscripts.',
      reasonCode: 'EXC-LANG',
    },
    {
      id: 'crit_6',
      name: 'Peer-Reviewed Publication or Full Conference Proceeding',
      category: 'PublicationType',
      description: 'Articles published in peer-reviewed academic journals or indexed conference proceedings.',
      inclusionCondition: 'Peer-reviewed journal articles and IEEE/ACM indexed proceedings.',
      exclusionCondition: 'Unpublished slide presentations, vendor promotional materials, or non-archival abstracts.',
      mandatory: false,
      screeningStage: 'TitleAndAbstract',
      decisionGuidance: 'Prefer archival indexed publications.',
      reasonCode: 'EXC-PUB',
    },
  ];

  const sampleProject: ResearchProject = {
    id: sampleProjectId,
    title: 'Clinical AI Decision Support in Acute Critical Care: A Systematic Review & Evidence Synthesis',
    topic: 'Artificial Intelligence & Clinical Decision Support Systems in Intensive Care Units',
    background: 'Early detection of physiological deterioration and sepsis in critically ill intensive care patients remains a pressing clinical challenge. While numerous machine learning algorithms have been developed, their real-world impact on clinical outcomes, mortality reduction, and alert acceptance rates varies substantially across hospital systems.',
    reviewType: 'Systematic literature review',
    aim: 'To systematically identify, critically appraise, and synthesize empirical evidence evaluating machine learning decision support systems for predicting acute patient deterioration and mortality in adult ICU settings.',
    objectives: [
      'Quantify the diagnostic and predictive accuracy (AUROC, sensitivity, specificity) of deployed bedside AI models in adult ICUs.',
      'Evaluate the impact of AI decision support on patient-centered clinical outcomes, including 30-day mortality and length of stay.',
      'Assess methodological quality and risk-of-bias across published prospective and retrospective validation trials.',
      'Identify critical implementation barriers, including alert fatigue and physician override patterns.',
    ],
    researchQuestions: [
      'RQ1: What is the reported predictive accuracy (AUROC) of machine learning clinical decision support systems for early sepsis and deterioration in adult ICU cohorts?',
      'RQ2: Does the clinical integration of AI alerts result in statistically significant reductions in patient mortality or ICU length of stay?',
      'RQ3: What methodological limitations and risks of bias characterize current empirical validation studies?',
      'RQ4: What are the prevailing evidence gaps preventing universal multi-center bedside clinical adoption?',
    ],
    researchScope: 'Adult acute critical care, medical ICUs, surgical ICUs, continuous physiological data streams.',
    geographicEligibility: 'International (Global multicenter and single-center studies).',
    publicationPeriod: {
      startYear: '2019',
      endYear: '2026',
    },
    eligiblePublicationTypes: ['Journal Article', 'Conference Proceeding'],
    eligibleStudyDesigns: ['Randomized Controlled Trial', 'Prospective Cohort', 'Retrospective Observational Study'],
    methodsAndTechnologies: ['Deep Learning', 'Gradient Boosted Trees', 'Random Forests', 'Recurrent Neural Networks', 'Physiological Time-Series Analysis'],
    populationOrSubject: 'Adult ICU patients (aged 18+)',
    interventionOrPhenomenon: 'Real-time AI and machine learning clinical decision support tools',
    outcomesOfInterest: 'Mortality, ICU length of stay, lead time to intervention, AUROC, physician compliance',
    languageRestrictions: ['English'],
    databasesAndSources: ['Crossref', 'PubMed / Europe PMC', 'IEEE Xplore', 'Scopus'],
    reviewerInformation: {
      reviewer1: 'Dr. Sarah Lin (Lead Methodologist)',
      reviewer2: 'Prof. Marcus Vance (Clinical Specialist)',
      dualReviewMode: true,
    },
    protocolVersion: 'v2.1 (PRISMA-P Compliant)',
    protocolDate: '2025-10-14',
    framework: defaultFramework,
    criteria: sampleCriteria,
    extractionFields: [
      { key: 'studyDesign', label: 'Study Design', type: 'select', category: 'Methodology', required: true },
      { key: 'sampleSize', label: 'Total Sample Size (N)', type: 'number', category: 'Cohort', required: true },
      { key: 'country', label: 'Country / Setting', type: 'text', category: 'Setting', required: true },
      { key: 'aiModelType', label: 'AI Architecture', type: 'text', category: 'Intervention', required: true },
      { key: 'primaryAuroc', label: 'Primary AUROC (95% CI)', type: 'text', category: 'Outcomes', required: true },
      { key: 'mortalityImpact', label: 'Mortality Impact', type: 'textarea', category: 'Outcomes', required: true },
      { key: 'leadTimeHours', label: 'Lead Time (Hours)', type: 'number', category: 'Outcomes', required: false },
      { key: 'keyLimitations', label: 'Author-Reported Limitations', type: 'textarea', category: 'Critical Appraisal', required: true },
      { key: 'evidenceGaps', label: 'Identified Research Gaps', type: 'textarea', category: 'Synthesis', required: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleArticles: Article[] = [
    // 1. Included Study 1
    {
      id: 'art_001',
      projectId: sampleProjectId,
      title: 'Prospective evaluation of a deep learning early sepsis prediction algorithm in adult intensive care: A multicenter stepped-wedge trial',
      authors: 'Adams, Rachel; Chen, Kevin; Saria, Suchi; Henry, Katherine',
      year: '2024',
      journal: 'Nature Medicine',
      publisher: 'Nature Publishing Group',
      volume: '30',
      issue: '4',
      pages: '1102-1111',
      doi: '10.1038/s41591-024-02881-x',
      abstract: 'Early antimicrobial initiation remains paramount in combating septic shock. Here we evaluate a continuous deep learning sepsis prediction tool (TREWScore-v2) deployed across five tertiary adult intensive care units comprising 5,420 admissions. The system ingested continuous vitals, laboratory tests, and nursing documentation. The algorithm demonstrated an area under the receiver operating characteristic curve (AUROC) of 0.88 (95% CI 0.86-0.90) with an average prediction lead time of 4.2 hours prior to clinical recognition. In units with physician alert adherence exceeding 70%, in-hospital sepsis mortality was reduced from 21.4% to 16.8% (adjusted hazard ratio 0.77, p=0.012). No adverse alert desensitization was documented when alerts were rate-limited to 1.5 per bed per shift.',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1038/s41591-024-02881-x',
      database: 'Crossref',
      retrievalDate: '2025-10-15T09:30:00Z',
      fullText: 'Section 1: Introduction\nSevere sepsis and septic shock remain leading contributors to inpatient mortality within modern adult intensive care units...\n\nSection 2: Methods and Cohort\nBetween January 2023 and December 2023, 5,420 consecutive adult patients admitted to five medical and surgical intensive care units were monitored by the automated neural network pipeline...\n\nSection 3: Primary Clinical Outcomes\nAcross 5,420 evaluated ICU admissions, implementation of real-time deep learning alerts conferred a statistically significant reduction in 30-day all-cause mortality (aHR 0.77, 95% CI 0.63-0.94, p=0.012). The prospective AUROC was measured at 0.88, delivering an actionable median lead-time of 4.2 hours before overt physiological decompensation.\n\nSection 4: Discussion and Limitations\nA notable limitation stems from variable nurse-to-patient staffing ratios, which directly moderated response latency to high-risk warnings.',
      pdfFileName: 'Adams_2024_NatMed_Sepsis_ICU.pdf',
      pdfPages: [
        {
          pageNumber: 1,
          text: 'Nature Medicine | Vol 30 | April 2024 | 1102-1111\nProspective evaluation of a deep learning early sepsis prediction algorithm in adult intensive care: A multicenter stepped-wedge trial.\nRachel Adams, Kevin Chen, Suchi Saria, Katherine Henry.\nAbstract: Early antimicrobial initiation remains paramount in combating septic shock. Across five tertiary adult intensive care units (N=5,420), continuous deep learning yielded an AUROC of 0.88 (95% CI 0.86-0.90) with a 4.2-hour median lead time.',
        },
        {
          pageNumber: 2,
          text: 'Methods & Patient Population\nAdult patients aged 18 years or older admitted to medical, surgical, or cardiac intensive care units were enrolled under institutional review board oversight. Exclusion criteria encompassed palliative care orders at admission and transfer out within 2 hours. Predictive features were normalized every 15 minutes from bedside arterial line pressure, pulse oximetry, and laboratory feeds.',
        },
        {
          pageNumber: 3,
          text: 'Results: Mortality & Length of Stay\nIn units where clinicians acknowledged alerts within 30 minutes, 30-day in-hospital mortality declined by 4.6% in absolute terms (p=0.012). Median ICU length of stay diminished by 0.8 days (95% CI 0.3-1.4 days). Clinicians reported low alert fatigue owing to false-positive suppression filters.',
        },
      ],
      screeningStatus: 'INCLUDE',
      screeningStage: 'Completed',
      reviewerNotes: 'Exemplary prospective multicenter stepped-wedge trial. High methodological rigor, full adherence to eligibility protocol.',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'TitleAndAbstract', decision: 'INCLUDE', timestamp: '2025-10-16T11:00:00Z', notes: 'Prospective adult ICU cohort meeting all PICOC requirements.' },
        { reviewer: 'Prof. Marcus Vance', stage: 'FullText', decision: 'INCLUDE', timestamp: '2025-10-18T14:20:00Z', notes: 'Verified robust AUROC and mortality outcomes. Full text appraised.' },
      ],
      consensusStatus: 'Agreement',
      aiRecommendation: {
        recommendation: 'INCLUDE',
        confidence: 0.96,
        suggestedReasonCode: '',
        rationale: 'Fully satisfies all mandatory protocol criteria. Prospective multicenter trial in adult ICU with clear mortality and AUROC endpoints.',
        timestamp: '2025-10-16T10:55:00Z',
        criterionEvaluations: [
          { criterionId: 'crit_1', criterionName: 'Adult ICU Population', status: 'Met', explanation: 'Enrolled 5,420 adult ICU patients.', exactQuote: 'across five tertiary adult intensive care units comprising 5,420 admissions', pageNumber: 1 },
          { criterionId: 'crit_2', criterionName: 'AI / Machine Learning Decision Support', status: 'Met', explanation: 'Employed continuous deep learning sepsis prediction.', exactQuote: 'continuous deep learning sepsis prediction tool (TREWScore-v2)', pageNumber: 1 },
          { criterionId: 'crit_3', criterionName: 'Empirical Study Design', status: 'Met', explanation: 'Multicenter stepped-wedge clinical trial.', exactQuote: 'A multicenter stepped-wedge trial', pageNumber: 1 },
          { criterionId: 'crit_4', criterionName: 'Reported Outcomes', status: 'Met', explanation: 'AUROC 0.88 and 30-day mortality reported.', exactQuote: 'AUROC of 0.88 (95% CI 0.86-0.90)... mortality was reduced from 21.4% to 16.8%', pageNumber: 1 },
        ],
      },
      evidenceCitations: [
        {
          id: 'cit_001',
          articleId: 'art_001',
          pdfPage: 1,
          printedPage: '1102',
          quote: 'The algorithm demonstrated an area under the receiver operating characteristic curve (AUROC) of 0.88 (95% CI 0.86-0.90) with an average prediction lead time of 4.2 hours prior to clinical recognition.',
          evidenceCategory: 'Diagnostic Accuracy & Lead Time',
          relatedResearchQuestion: 'RQ1: Predictive accuracy of ML in adult ICU cohorts',
          relatedCriterionId: 'crit_4',
          reviewerNotes: 'Key benchmark finding for early sepsis lead-time in prospective setting.',
          createdAt: '2025-10-18T14:30:00Z',
        },
        {
          id: 'cit_002',
          articleId: 'art_001',
          pdfPage: 3,
          printedPage: '1105',
          quote: 'In units with physician alert adherence exceeding 70%, in-hospital sepsis mortality was reduced from 21.4% to 16.8% (adjusted hazard ratio 0.77, p=0.012).',
          evidenceCategory: 'Clinical Mortality Impact',
          relatedResearchQuestion: 'RQ2: Reductions in patient mortality',
          relatedCriterionId: 'crit_4',
          reviewerNotes: 'Statistically significant reduction demonstrated in prospective trial.',
          createdAt: '2025-10-18T14:35:00Z',
        },
      ],
      qualityAppraisal: {
        toolType: 'ROBINS_I',
        toolName: 'ROBINS-I (Risk Of Bias In Non-randomized Studies - of Interventions)',
        overallRisk: 'Low',
        reviewerNotes: 'Stepped-wedge adjustment adequately controls for time-trend confounding.',
        completedAt: '2025-10-19T10:00:00Z',
        items: [
          { id: 'q1', question: 'Bias due to confounding', score: 'Yes', explanation: 'Stepped-wedge cluster design adjusted for hospital-level covariates.', evidenceQuote: 'adjusted hazard ratio 0.77 controlling for baseline SOFA' },
          { id: 'q2', question: 'Bias in selection of participants into the study', score: 'Yes', explanation: 'Consecutive unselected adult ICU admissions.' },
          { id: 'q3', question: 'Bias in classification of interventions', score: 'Yes', explanation: 'Automated software deployment with exact timestamp logging.' },
          { id: 'q4', question: 'Bias due to deviations from intended interventions', score: 'Partial', explanation: 'Physician override rates differed by ward specialty.' },
          { id: 'q5', question: 'Bias due to missing data', score: 'Yes', explanation: 'Less than 1.5% telemetry loss across the monitoring period.' },
          { id: 'q6', question: 'Bias in measurement of outcomes', score: 'Yes', explanation: '30-day mortality tracked through verified hospital registry.' },
          { id: 'q7', question: 'Bias in selection of the reported result', score: 'Yes', explanation: 'Pre-registered clinical trial protocol followed faithfully.' },
        ],
      },
      extractionData: {
        studyDesign: 'Multicenter Stepped-Wedge Trial',
        sampleSize: 5420,
        country: 'United States (5 Academic Centers)',
        aiModelType: 'Recurrent Neural Network / LSTM Ensembles',
        primaryAuroc: '0.88 (95% CI 0.86-0.90)',
        mortalityImpact: 'Absolute 4.6% reduction (21.4% to 16.8%, aHR 0.77, p=0.012)',
        leadTimeHours: 4.2,
        keyLimitations: 'Adherence varied across shifts; outcome benefits attenuated when alert response exceeded 60 minutes.',
        evidenceGaps: 'Needs validation in low-resource community hospitals with non-continuous physiological monitors.',
      },
    },

    // 2. Included Study 2
    {
      id: 'art_002',
      projectId: sampleProjectId,
      title: 'Real-time machine learning prediction of clinical deterioration in intensive care: External validation across three European health systems',
      authors: 'van de Sande, Dennis; van Genderen, Michiel; Gommers, Diederik; Schuit, Stephanie',
      year: '2023',
      journal: 'The Lancet Digital Health',
      publisher: 'Elsevier',
      volume: '5',
      issue: '8',
      pages: 'e512-e522',
      doi: '10.1016/S2589-7500(23)00114-8',
      abstract: 'Clinical decision support systems using gradient boosted trees (LightGBM) were trained on 42,000 Dutch ICU admissions and externally validated on cohorts from the UK (N=11,200) and Germany (N=8,900). The model predicted acute respiratory failure and cardiopulmonary arrest within an 8-hour window with an AUROC of 0.85 (95% CI 0.83-0.87) in the primary validation cohort and 0.82 (0.80-0.84) in external international test sets. Implementation was associated with a 1.2-day decrease in median ICU stay (p=0.004). Calibration remained robust after temperature scaling.',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1016/S2589-7500(23)00114-8',
      database: 'PubMed / Europe PMC',
      retrievalDate: '2025-10-15T09:35:00Z',
      fullText: 'Section 1: Background\nPredicting acute deterioration in patients admitted to intensive care units requires scalable algorithms capable of generalizing across divergent healthcare infrastructures...\n\nSection 2: Cohort and External Validation\nWe assessed model transportability across three distinct European nations...\n\nSection 3: Key Findings\nExternal AUROC reached 0.82-0.85 across participating centers, preserving strong calibration. ICU length of stay demonstrated an absolute median decline of 1.2 days.',
      pdfFileName: 'vanDeSande_2023_LancetDigHealth.pdf',
      pdfPages: [
        {
          pageNumber: 1,
          text: 'The Lancet Digital Health 2023; 5: e512–22\nReal-time machine learning prediction of clinical deterioration in intensive care: External validation across three European health systems.\nDennis van de Sande, Michiel van Genderen, Diederik Gommers, Stephanie Schuit.\nSummary: External validation of gradient boosted models across 62,100 ICU admissions in Netherlands, UK, and Germany.',
        },
        {
          pageNumber: 2,
          text: 'External validation demonstrated an AUROC of 0.85 in domestic validation and 0.82 in international cross-validation for acute physiological decompensation within 8 hours. Length of ICU stay was significantly reduced (median reduction 1.2 days, p=0.004).',
        },
      ],
      screeningStatus: 'INCLUDE',
      screeningStage: 'Completed',
      reviewerNotes: 'Outstanding large-scale external validation across multiple international ICU networks.',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'TitleAndAbstract', decision: 'INCLUDE', timestamp: '2025-10-16T11:15:00Z' },
        { reviewer: 'Prof. Marcus Vance', stage: 'FullText', decision: 'INCLUDE', timestamp: '2025-10-18T14:40:00Z' },
      ],
      consensusStatus: 'Agreement',
      evidenceCitations: [
        {
          id: 'cit_003',
          articleId: 'art_002',
          pdfPage: 2,
          printedPage: 'e515',
          quote: 'The model predicted acute respiratory failure and cardiopulmonary arrest within an 8-hour window with an AUROC of 0.85 (95% CI 0.83-0.87) in the primary validation cohort and 0.82 (0.80-0.84) in external international test sets.',
          evidenceCategory: 'Diagnostic Accuracy',
          relatedResearchQuestion: 'RQ1: Predictive accuracy of ML in adult ICU cohorts',
          relatedCriterionId: 'crit_4',
          reviewerNotes: 'Proves cross-border generalizability of gradient boosting models.',
          createdAt: '2025-10-18T15:00:00Z',
        },
      ],
      qualityAppraisal: {
        toolType: 'ROBINS_I',
        toolName: 'ROBINS-I Tool',
        overallRisk: 'Low',
        items: [
          { id: 'q1', question: 'Bias due to confounding', score: 'Yes', explanation: 'Multivariable hierarchical adjustment for hospital-level variation.' },
          { id: 'q2', question: 'Selection of participants', score: 'Yes', explanation: 'Comprehensive complete-cohort extraction from ICU registries.' },
          { id: 'q3', question: 'Measurement of outcomes', score: 'Yes', explanation: 'Standardized vital sign thresholds and electronic code events.' },
        ],
      },
      extractionData: {
        studyDesign: 'Multicenter International Retrospective Validation',
        sampleSize: 62100,
        country: 'Netherlands, UK, Germany',
        aiModelType: 'Gradient Boosted Decision Trees (LightGBM)',
        primaryAuroc: '0.85 (95% CI 0.83-0.87)',
        mortalityImpact: 'Non-significant mortality reduction; 1.2 day decline in ICU stay (p=0.004)',
        leadTimeHours: 8.0,
        keyLimitations: 'Missing lab frequencies differed systematically between NHS and Dutch medical centers.',
        evidenceGaps: 'Impact of automated EHR data missingness imputation requires prospective benchmarking.',
      },
    },

    // 3. Included Study 3
    {
      id: 'art_003',
      projectId: sampleProjectId,
      title: 'Impact of an artificial intelligence sepsis surveillance system on antibiotic timing and clinical outcomes: A randomized pragmatic trial',
      authors: 'Burdick, Hoyt; Pino, Eduardo; Gacumu, Peter; Stojkovic, Nebojsa',
      year: '2023',
      journal: 'Critical Care Medicine',
      publisher: 'Lippincott Williams & Wilkins',
      volume: '51',
      issue: '2',
      pages: '224-233',
      doi: '10.1097/CCM.0000000000005721',
      abstract: 'We conducted a pragmatic cluster-randomized trial in two intensive care units evaluating the Targeted Real-Time Early Warning System. A total of 3,180 patients were enrolled (1,590 intervention, 1,590 usual care). The AI alert system led to an average antibiotic delivery time reduction of 1.85 hours (p=0.002). ICU mortality was 9.8% in the intervention arm versus 12.4% in the control arm (odds ratio 0.76, 95% CI 0.61-0.95). Clinician false positive alarm complaints were mitigated through adaptive notification thresholds.',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1097/CCM.0000000000005721',
      database: 'Crossref',
      retrievalDate: '2025-10-15T09:40:00Z',
      screeningStatus: 'INCLUDE',
      screeningStage: 'Completed',
      reviewerNotes: 'Pragmatic RCT providing level-1 evidence for antibiotic timing improvement and mortality benefit.',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'TitleAndAbstract', decision: 'INCLUDE', timestamp: '2025-10-16T11:20:00Z' },
        { reviewer: 'Prof. Marcus Vance', stage: 'FullText', decision: 'INCLUDE', timestamp: '2025-10-18T15:10:00Z' },
      ],
      consensusStatus: 'Agreement',
      evidenceCitations: [
        {
          id: 'cit_004',
          articleId: 'art_003',
          pdfPage: 1,
          printedPage: '226',
          quote: 'ICU mortality was 9.8% in the intervention arm versus 12.4% in the control arm (odds ratio 0.76, 95% CI 0.61-0.95).',
          evidenceCategory: 'Mortality Outcome',
          relatedResearchQuestion: 'RQ2: Reductions in patient mortality',
          relatedCriterionId: 'crit_4',
          reviewerNotes: 'Rigorous pragmatic randomized evidence confirming mortality improvement.',
          createdAt: '2025-10-18T15:20:00Z',
        },
      ],
      qualityAppraisal: {
        toolType: 'ROB_2',
        toolName: 'Cochrane Risk of Bias 2 (RoB 2)',
        overallRisk: 'Low',
        items: [
          { id: 'd1', question: 'Randomization process', score: 'Yes', explanation: 'Cluster-randomized unit allocation.' },
          { id: 'd2', question: 'Deviations from intended interventions', score: 'Yes', explanation: 'Intention-to-treat protocol adhered to.' },
          { id: 'd3', question: 'Missing outcome data', score: 'Yes', explanation: 'Zero loss to follow-up for in-hospital mortality.' },
          { id: 'd4', question: 'Measurement of the outcome', score: 'Yes', explanation: 'Objective death timestamp records.' },
          { id: 'd5', question: 'Selection of reported results', score: 'Yes', explanation: 'Registered trial with published analysis plan.' },
        ],
      },
      extractionData: {
        studyDesign: 'Pragmatic Cluster-Randomized Trial',
        sampleSize: 3180,
        country: 'United States',
        aiModelType: 'Supervised Random Forest / Gradient Boosting',
        primaryAuroc: '0.86 (95% CI 0.83-0.89)',
        mortalityImpact: 'Mortality 9.8% vs 12.4% (OR 0.76, 95% CI 0.61-0.95, p=0.015)',
        leadTimeHours: 3.5,
        keyLimitations: 'Conducted in two tertiary academic medical units; generalizability to non-academic hospitals remains untested.',
        evidenceGaps: 'Longer 90-day post-discharge outcomes and cognitive status were not captured.',
      },
    },

    // 4. Included Study 4
    {
      id: 'art_004',
      projectId: sampleProjectId,
      title: 'Machine learning for early recognition of septic shock in surgical intensive care: A prospective comparative cohort study',
      authors: 'Zhang, Wei; Liu, Min; Zhao, Hong; Tang, Jian',
      year: '2024',
      journal: 'Journal of Critical Care',
      publisher: 'Elsevier',
      volume: '80',
      pages: '154489',
      doi: '10.1016/j.jcrc.2023.154489',
      abstract: 'Purpose: To prospectively evaluate an XGBoost model versus MEWS and qSOFA in 2,410 surgical ICU patients. Methods: Continuous arterial line and central venous measurements were streamed to an inference server. Results: XGBoost achieved an AUROC of 0.89 (0.87-0.91) for septic shock onset within 6 hours, outperforming MEWS (AUROC 0.71) and qSOFA (AUROC 0.68). Mean lead-time before vasopressor initiation was 5.1 hours. Clinical adoption was 78%.',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1016/j.jcrc.2023.154489',
      database: 'Crossref',
      retrievalDate: '2025-10-15T09:45:00Z',
      screeningStatus: 'INCLUDE',
      screeningStage: 'Completed',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'TitleAndAbstract', decision: 'INCLUDE', timestamp: '2025-10-16T11:25:00Z' },
        { reviewer: 'Prof. Marcus Vance', stage: 'FullText', decision: 'INCLUDE', timestamp: '2025-10-18T15:30:00Z' },
      ],
      consensusStatus: 'Agreement',
      evidenceCitations: [
        {
          id: 'cit_005',
          articleId: 'art_004',
          pdfPage: 1,
          printedPage: '154490',
          quote: 'XGBoost achieved an AUROC of 0.89 (0.87-0.91) for septic shock onset within 6 hours, outperforming MEWS (AUROC 0.71) and qSOFA (AUROC 0.68).',
          evidenceCategory: 'Comparative Diagnostic Superiority',
          relatedResearchQuestion: 'RQ1: Predictive accuracy of ML in adult ICU cohorts',
          relatedCriterionId: 'crit_4',
          reviewerNotes: 'Clear statistical superiority over conventional bedside scoring tools.',
          createdAt: '2025-10-18T15:45:00Z',
        },
      ],
      qualityAppraisal: {
        toolType: 'QUADAS_2',
        toolName: 'QUADAS-2 (Quality Assessment of Diagnostic Accuracy Studies)',
        overallRisk: 'Low',
        items: [
          { id: 'p1', question: 'Patient selection: Risk of bias', score: 'Yes', explanation: 'Consecutive surgical ICU admissions.' },
          { id: 'i1', question: 'Index test: Risk of bias', score: 'Yes', explanation: 'Algorithm evaluated blinded to future clinical progression.' },
          { id: 'r1', question: 'Reference standard: Risk of bias', score: 'Yes', explanation: 'Consensus Sepsis-3 definition criteria applied.' },
        ],
      },
      extractionData: {
        studyDesign: 'Prospective Comparative Cohort',
        sampleSize: 2410,
        country: 'China',
        aiModelType: 'XGBoost with Wavelet Feature Extraction',
        primaryAuroc: '0.89 (95% CI 0.87-0.91)',
        mortalityImpact: 'Non-interventional comparative design; mortality differences not directly assigned.',
        leadTimeHours: 5.1,
        keyLimitations: 'Restricted to post-operative surgical ICU patients; cannot extrapolate to general medical or trauma ICUs.',
        evidenceGaps: 'Needs head-to-head testing against nurse clinical intuition.',
      },
    },

    // 5. Included Study 5
    {
      id: 'art_005',
      projectId: sampleProjectId,
      title: 'Implementation of continuous predictive physiological monitoring in intensive care: A multi-center stepped evaluation of alarm burden and clinical responsiveness',
      authors: 'Oster, Elena; Davies, Rhys; O’Connor, Brian; Patel, Samir',
      year: '2024',
      journal: 'IEEE Transactions on Biomedical Engineering',
      publisher: 'IEEE',
      volume: '71',
      issue: '6',
      pages: '1890-1901',
      doi: '10.1109/TBME.2024.3371902',
      abstract: 'Background: The clinical utility of AI decision support systems in critical care is frequently undermined by alert fatigue. We implemented an adaptive recurrent neural network alert filter across 3,890 admissions in 4 ICUs. Methods: We quantified true-positive to false-positive alarm ratios, physician response latency, and alert override percentages. Results: The AI filter reduced non-actionable alarms by 64% while maintaining 92% sensitivity for acute deterioration within 4 hours. Physician compliance rose from 38% to 74% (p<0.001).',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1109/TBME.2024.3371902',
      database: 'Crossref',
      retrievalDate: '2025-10-15T09:50:00Z',
      screeningStatus: 'INCLUDE',
      screeningStage: 'Completed',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'TitleAndAbstract', decision: 'INCLUDE', timestamp: '2025-10-16T11:30:00Z' },
        { reviewer: 'Prof. Marcus Vance', stage: 'FullText', decision: 'INCLUDE', timestamp: '2025-10-18T16:00:00Z' },
      ],
      consensusStatus: 'Agreement',
      evidenceCitations: [
        {
          id: 'cit_006',
          articleId: 'art_005',
          pdfPage: 1,
          printedPage: '1892',
          quote: 'The AI filter reduced non-actionable alarms by 64% while maintaining 92% sensitivity for acute deterioration within 4 hours. Physician compliance rose from 38% to 74% (p<0.001).',
          evidenceCategory: 'Implementation & Alert Fatigue',
          relatedResearchQuestion: 'RQ4: Critical implementation barriers and alert fatigue',
          relatedCriterionId: 'crit_2',
          reviewerNotes: 'Crucial paper documenting solution to ICU alert fatigue.',
          createdAt: '2025-10-18T16:15:00Z',
        },
      ],
      extractionData: {
        studyDesign: 'Multicenter Prospective Evaluation',
        sampleSize: 3890,
        country: 'United Kingdom (4 NHS Trust ICUs)',
        aiModelType: 'LSTM recurrent neural network with Bayesian alarm filtering',
        primaryAuroc: '0.87 (95% CI 0.85-0.89)',
        mortalityImpact: 'ICU stay reduced by 0.9 days; mortality reduction non-significant (aOR 0.88, p=0.08).',
        leadTimeHours: 4.0,
        keyLimitations: 'Relied on specialized telemetry infrastructure not standard in all European hospitals.',
        evidenceGaps: 'Cost-effectiveness and software licensing ROI analysis not reported.',
      },
    },

    // 6. Excluded Study 1 (Pediatric population: EXC-POP)
    {
      id: 'art_006',
      projectId: sampleProjectId,
      title: 'Machine learning for early detection of pediatric septic shock in the pediatric intensive care unit (PICU)',
      authors: 'Mercer, Claire; Howard, Thomas; Kim, Daniel',
      year: '2023',
      journal: 'Pediatric Critical Care Medicine',
      publisher: 'LWW',
      volume: '24',
      issue: '5',
      pages: '380-389',
      doi: '10.1097/PCC.0000000000003180',
      abstract: 'Objective: To validate a pediatric sepsis risk score in 1,200 PICU admissions aged 1 month to 16 years. Results: Random forest achieved an AUROC of 0.84.',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1097/PCC.0000000000003180',
      database: 'PubMed / Europe PMC',
      retrievalDate: '2025-10-15T10:00:00Z',
      screeningStatus: 'EXCLUDE',
      screeningStage: 'Stage1_TitleAbstract',
      primaryExclusionReason: 'EXC-POP',
      reviewerNotes: 'Excluded under Criterion 1 (Adult ICU Population). Enrolled pediatric cohort aged 1 month to 16 years.',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'TitleAndAbstract', decision: 'EXCLUDE', reasonCode: 'EXC-POP', timestamp: '2025-10-16T11:40:00Z', notes: 'Pediatric population (PICU)' },
      ],
      aiRecommendation: {
        recommendation: 'EXCLUDE',
        confidence: 0.98,
        suggestedReasonCode: 'EXC-POP',
        rationale: 'Involves pediatric intensive care cohort (aged 1 month to 16 years), violating mandatory Criterion 1 (Adult ICU patients).',
        timestamp: '2025-10-16T11:35:00Z',
      },
      evidenceCitations: [],
      extractionData: {},
    },

    // 7. Excluded Study 2 (Narrative review / non-empirical: EXC-DES)
    {
      id: 'art_007',
      projectId: sampleProjectId,
      title: 'Opportunities and pitfalls of artificial intelligence in critical care medicine: A comprehensive narrative review',
      authors: 'Gutiérrez, Carlos; Morales, Elena; Becker, Stefan',
      year: '2024',
      journal: 'Critical Care Reviews',
      publisher: 'BioMed Central',
      volume: '28',
      pages: '104',
      doi: '10.1186/s13054-024-04901-2',
      abstract: 'Artificial intelligence is rapidly entering acute clinical environments. In this narrative review, we summarize current literature regarding diagnostic algorithms, continuous bedside telemetry, and regulatory considerations.',
      publicationType: 'review-article',
      url: 'https://doi.org/10.1186/s13054-024-04901-2',
      database: 'Crossref',
      retrievalDate: '2025-10-15T10:05:00Z',
      screeningStatus: 'EXCLUDE',
      screeningStage: 'Stage1_TitleAbstract',
      primaryExclusionReason: 'EXC-DES',
      reviewerNotes: 'Excluded under Criterion 3: Narrative literature review without original empirical data or validation cohort.',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'TitleAndAbstract', decision: 'EXCLUDE', reasonCode: 'EXC-DES', timestamp: '2025-10-16T11:45:00Z' },
      ],
      evidenceCitations: [],
      extractionData: {},
    },

    // 8. Excluded Study 3 (Non-AI administrative tool: EXC-INT)
    {
      id: 'art_008',
      projectId: sampleProjectId,
      title: 'Evaluation of mandatory electronic checklist documentation for central-line associated bloodstream infections in surgical ICU',
      authors: 'Nelson, Laura; Cooper, Gary; Higgins, Amanda',
      year: '2023',
      journal: 'American Journal of Infection Control',
      publisher: 'Elsevier',
      volume: '51',
      issue: '3',
      pages: '298-304',
      doi: '10.1016/j.ajic.2022.09.014',
      abstract: 'A quality improvement audit evaluated nursing adherence to a mandatory static EHR electronic checklist. No automated predictive algorithms or machine learning models were deployed.',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1016/j.ajic.2022.09.014',
      database: 'Crossref',
      retrievalDate: '2025-10-15T10:10:00Z',
      screeningStatus: 'EXCLUDE',
      screeningStage: 'Stage1_TitleAbstract',
      primaryExclusionReason: 'EXC-INT',
      reviewerNotes: 'Static nursing checklist without machine learning or automated clinical decision support.',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'TitleAndAbstract', decision: 'EXCLUDE', reasonCode: 'EXC-INT', timestamp: '2025-10-16T11:50:00Z' },
      ],
      evidenceCitations: [],
      extractionData: {},
    },

    // 9. Uncertain Study 1 (Incomplete abstract, borderline: UNCERTAIN)
    {
      id: 'art_009',
      projectId: sampleProjectId,
      title: 'Algorithmic early warning signals for clinical deterioration across mixed hospital inpatient wards and ICU units',
      authors: 'Takahashi, Kenji; Yamamoto, Hiroshi; Sato, Ken',
      year: '2024',
      journal: 'Journal of Medical Systems',
      publisher: 'Springer',
      volume: '48',
      issue: '1',
      pages: '45',
      doi: '10.1007/s10916-024-02055-6',
      abstract: 'We tested an early warning classifier across 1,800 hospital admissions. The system ingested vital sign streams. Results showed notable improvement in response times. [Abstract truncated in publisher database; full-text retrieval requested to evaluate adult ICU subgroup].',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1007/s10916-024-02055-6',
      database: 'Crossref',
      retrievalDate: '2025-10-15T10:15:00Z',
      screeningStatus: 'UNCERTAIN',
      screeningStage: 'Stage1_TitleAbstract',
      reviewerNotes: 'Uncertain: Abstract lacks subgroup details on whether adult ICU data was analyzed separately from general ward data. Seeking full text.',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'TitleAndAbstract', decision: 'UNCERTAIN', timestamp: '2025-10-16T12:00:00Z', notes: 'Mixed ICU/ward cohort with truncated abstract.' },
      ],
      aiRecommendation: {
        recommendation: 'UNCERTAIN',
        confidence: 0.65,
        suggestedReasonCode: '',
        rationale: 'Incomplete abstract. Unable to ascertain whether ICU subgroup was independently reported with diagnostic metrics.',
        missingInformation: 'ICU-specific cohort breakdown, AUROC confidence intervals, and mortality endpoints.',
        timestamp: '2025-10-16T11:55:00Z',
      },
      evidenceCitations: [],
      extractionData: {},
    },

    // 10. Uncertain Study 2 (Reviewer disagreement requiring consensus adjudication)
    {
      id: 'art_010',
      projectId: sampleProjectId,
      title: 'Predicting septic shock progression in adult critical care using semi-supervised learning on high-frequency arterial waveforms',
      authors: 'Alvarez, Sofia; Font, Jordi; Gomez, Mateo',
      year: '2024',
      journal: 'IEEE Journal of Biomedical and Health Informatics',
      publisher: 'IEEE',
      volume: '28',
      pages: '2210-2221',
      doi: '10.1109/JBHI.2024.3361209',
      abstract: 'High-frequency arterial line waveforms (125 Hz) were processed with semi-supervised autoencoders across 840 adult surgical ICU patients. The model achieved an AUROC of 0.91 for predicting hypotension 2 hours prior to onset. However, clinical implementation details and bedside alert integration were simulated offline using recorded MIMIC-IV data.',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1109/JBHI.2024.3361209',
      database: 'IEEE Xplore',
      retrievalDate: '2025-10-15T10:20:00Z',
      screeningStatus: 'UNCERTAIN',
      screeningStage: 'Stage2_FullText',
      reviewerNotes: 'Reviewer disagreement: Reviewer 1 voted INCLUDE (high quality adult ICU predictive model), Reviewer 2 voted EXCLUDE (offline MIMIC simulation rather than prospective clinical deployment). Requires adjudication.',
      reviewerDecisions: [
        { reviewer: 'Dr. Sarah Lin', stage: 'FullText', decision: 'INCLUDE', timestamp: '2025-10-17T09:00:00Z', notes: 'Valid adult ICU validation cohort with high AUROC.' },
        { reviewer: 'Prof. Marcus Vance', stage: 'FullText', decision: 'EXCLUDE', reasonCode: 'EXC-INT', timestamp: '2025-10-17T14:00:00Z', notes: 'Retrospective offline simulation without active bedside deployment.' },
      ],
      consensusStatus: 'Conflict',
      evidenceCitations: [],
      extractionData: {},
    },

    // 11. Duplicate Pair A: Master Record (from Crossref)
    {
      id: 'art_011_master',
      projectId: sampleProjectId,
      title: 'Machine learning for ICU mortality prediction: An external validation study of the SuperICU algorithm',
      authors: 'Kowalski, Jan; Novak, Petr; Horvath, Laszlo',
      year: '2023',
      journal: 'Intensive Care Medicine',
      publisher: 'Springer Nature',
      volume: '49',
      issue: '7',
      pages: '810-820',
      doi: '10.1007/s00134-023-07110-3',
      abstract: 'Validation of the SuperICU algorithm in 14,200 adult patients across four European intensive care units. The ensemble model reached an AUROC of 0.87 for 30-day mortality.',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1007/s00134-023-07110-3',
      database: 'Crossref',
      retrievalDate: '2025-10-15T10:25:00Z',
      screeningStatus: 'UNSCREENED',
      screeningStage: 'Stage1_TitleAbstract',
      duplicateGroup: 'dup_group_supericu',
      reviewerDecisions: [],
      evidenceCitations: [],
      extractionData: {},
    },

    // 12. Duplicate Pair A: Duplicate Record (from PubMed with slight punctuation difference & same DOI)
    {
      id: 'art_012_duplicate',
      projectId: sampleProjectId,
      title: 'Machine learning for ICU mortality prediction: an external validation study of the SuperICU algorithm.',
      authors: 'Kowalski, J.; Novak, P.; Horvath, L.',
      year: '2023',
      journal: 'Intensive care medicine',
      publisher: '',
      doi: '10.1007/s00134-023-07110-3',
      abstract: 'Validation of the SuperICU algorithm in 14,200 adult patients across four European intensive care units.',
      publicationType: 'journal-article',
      database: 'PubMed / Europe PMC',
      retrievalDate: '2025-10-15T10:30:00Z',
      screeningStatus: 'UNSCREENED',
      screeningStage: 'Stage1_TitleAbstract',
      duplicateGroup: 'dup_group_supericu',
      reviewerDecisions: [],
      evidenceCitations: [],
      extractionData: {},
    },

    // 13. Unscreened Study 1 (Ready for live user screening demonstration)
    {
      id: 'art_013',
      projectId: sampleProjectId,
      title: 'Continuous deep learning for bedside multi-organ failure forecasting in adult surgical ICU: A single-center prospective observational cohort',
      authors: 'Fischer, Martin; Weber, Christian; Wagner, Stefan; Hoffman, Dirk',
      year: '2025',
      journal: 'Critical Care',
      publisher: 'BioMed Central',
      volume: '29',
      issue: '1',
      pages: '88',
      doi: '10.1186/s13054-025-05200-4',
      abstract: 'Background: Acute organ dysfunction in post-operative critical care often develops prior to standard biochemical recognition. We prospectively studied 1,840 adult surgical ICU patients monitored with an automated continuous transformer model. Methods: The system processed continuous vital signs, hourly fluid balance, and arterial blood gas values. Results: The transformer achieved an AUROC of 0.89 (95% CI 0.86-0.92) for anticipating acute renal and respiratory failure 6 hours in advance. Mean warning lead time was 4.8 hours. Sensitivity was 88% at a false alarm rate of 0.9 per patient-day.',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1186/s13054-025-05200-4',
      database: 'Crossref',
      retrievalDate: '2025-10-15T10:35:00Z',
      fullText: 'Section 1: Introduction\nMultiple organ dysfunction syndrome (MODS) remains the preeminent determinant of extended morbidity in adult post-operative intensive care...\n\nSection 2: Study Cohort\nConsecutive surgical ICU admissions aged 18 or older were prospectively monitored over a 14-month timeframe...\n\nSection 3: Primary Predictive Outcomes\nThe continuous transformer pipeline attained an AUROC of 0.89 (95% CI 0.86-0.92), yielding an operational lead-time advantage of 4.8 hours before escalation to renal replacement or invasive mechanical ventilation.',
      pdfFileName: 'Fischer_2025_CritCare_Transformer.pdf',
      pdfPages: [
        {
          pageNumber: 1,
          text: 'Critical Care (2025) 29:88\nContinuous deep learning for bedside multi-organ failure forecasting in adult surgical ICU: A single-center prospective observational cohort.\nMartin Fischer, Christian Weber, Stefan Wagner, Dirk Hoffman.\nAbstract: In 1,840 adult surgical ICU patients, an automated continuous transformer predicted multi-organ failure 6 hours in advance with an AUROC of 0.89.',
        },
        {
          pageNumber: 2,
          text: 'Methods: Patients aged 18+ admitted after high-risk abdominal or vascular surgery were prospectively monitored. The model yielded a 4.8 hour lead time with 88% sensitivity and false alarm rate under 1.0 per patient-day.',
        },
      ],
      screeningStatus: 'UNSCREENED',
      screeningStage: 'Stage1_TitleAbstract',
      reviewerDecisions: [],
      evidenceCitations: [],
      extractionData: {},
    },

    // 14. Unscreened Study 2 (Borderline publication ready for live user screening)
    {
      id: 'art_014',
      projectId: sampleProjectId,
      title: 'Machine learning for risk stratification in general hospital wards: A retrospective analysis',
      authors: 'LeBlanc, Marc; Dupont, Claire; Moreau, Jean',
      year: '2024',
      journal: 'European Journal of Internal Medicine',
      publisher: 'Elsevier',
      volume: '120',
      pages: '65-72',
      doi: '10.1016/j.ejim.2024.01.018',
      abstract: 'Retrospective analysis of 9,800 non-ICU general medical and surgical ward patients. Models identified patients requiring emergency transfer to ICU within 24 hours (AUROC 0.81). [Note: Conducted entirely in general wards prior to ICU admission].',
      publicationType: 'journal-article',
      url: 'https://doi.org/10.1016/j.ejim.2024.01.018',
      database: 'Crossref',
      retrievalDate: '2025-10-15T10:40:00Z',
      screeningStatus: 'UNSCREENED',
      screeningStage: 'Stage1_TitleAbstract',
      reviewerDecisions: [],
      evidenceCitations: [],
      extractionData: {},
    },
  ];

  return { project: sampleProject, articles: sampleArticles };
}

export function loadProjects(): ResearchProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      const initial = getInitialSampleProject();
      saveProjects([initial.project]);
      saveArticles(initial.articles);
      setActiveProjectId(initial.project.id);
      return [initial.project];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading projects:', err);
    const initial = getInitialSampleProject();
    return [initial.project];
  }
}

export function saveProjects(projects: ResearchProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects:', err);
  }
}

export function loadArticles(): Article[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTICLES);
    if (!raw) {
      const initial = getInitialSampleProject();
      saveArticles(initial.articles);
      return initial.articles;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading articles:', err);
    return [];
  }
}

export function saveArticles(articles: Article[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  } catch (err) {
    console.error('Error saving articles:', err);
  }
}

export function getActiveProjectId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT);
    if (id) return id;
    const projects = loadProjects();
    const defaultId = projects[0]?.id || 'proj_icu_ai_2025';
    setActiveProjectId(defaultId);
    return defaultId;
  } catch {
    return 'proj_icu_ai_2025';
  }
}

export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT, id);
  } catch (err) {
    console.error('Error setting active project:', err);
  }
}

export function resetToSampleProject(): { project: ResearchProject; articles: Article[] } {
  const initial = getInitialSampleProject();
  saveProjects([initial.project]);
  saveArticles(initial.articles);
  setActiveProjectId(initial.project.id);
  return initial;
}

/**
 * Calculates live PRISMA 2020 counts strictly from real article records in the project
 */
export function calculatePrismaCounts(articles: Article[]): PrismaReportCounts {
  let recordsIdentifiedDatabases = 0;
  let recordsIdentifiedRegisters = 0;
  let recordsIdentifiedOther = 0;
  let duplicatesRemoved = 0;
  let recordsScreenedTitleAbstract = 0;
  let recordsExcludedTitleAbstract = 0;
  const titleAbstractExclusionReasons: Record<string, number> = {};

  let reportsSoughtForRetrieval = 0;
  let reportsNotRetrieved = 0;
  let fullTextReportsAssessed = 0;
  let fullTextReportsExcluded = 0;
  const fullTextExclusionReasons: Record<string, number> = {};

  let studiesIncludedQualitative = 0;
  let studiesIncludedQuantitative = 0;

  for (const art of articles) {
    // Count identification sources
    const db = (art.database || '').toLowerCase();
    if (db.includes('register') || db.includes('clinicaltrials')) {
      recordsIdentifiedRegisters++;
    } else if (db.includes('manual') || db.includes('folder') || db.includes('other')) {
      recordsIdentifiedOther++;
    } else {
      recordsIdentifiedDatabases++;
    }

    // Check duplicate status
    if (art.duplicateResolved && art.duplicateResolutionAction === 'Merged') {
      duplicatesRemoved++;
    }

    // Screening stages
    if (art.screeningStatus !== 'UNSCREENED') {
      recordsScreenedTitleAbstract++;

      if (art.screeningStage === 'Stage1_TitleAbstract' && art.screeningStatus === 'EXCLUDE') {
        recordsExcludedTitleAbstract++;
        const reason = art.primaryExclusionReason || 'Unspecified';
        titleAbstractExclusionReasons[reason] = (titleAbstractExclusionReasons[reason] || 0) + 1;
      } else {
        // Advanced past Stage 1 to Full-text assessment
        reportsSoughtForRetrieval++;

        if (art.primaryExclusionReason === 'EXC-UNRETRIEVED') {
          reportsNotRetrieved++;
        } else {
          fullTextReportsAssessed++;

          if (art.screeningStatus === 'EXCLUDE') {
            fullTextReportsExcluded++;
            const reason = art.primaryExclusionReason || 'Unspecified';
            fullTextExclusionReasons[reason] = (fullTextExclusionReasons[reason] || 0) + 1;
          } else if (art.screeningStatus === 'INCLUDE') {
            studiesIncludedQualitative++;
            // If study has quantitative extraction data, count in quantitative synthesis
            if (art.extractionData?.primaryAuroc || art.extractionData?.sampleSize) {
              studiesIncludedQuantitative++;
            }
          }
        }
      }
    }
  }

  const totalRecordsIdentified = recordsIdentifiedDatabases + recordsIdentifiedRegisters + recordsIdentifiedOther;
  const totalStudiesIncluded = studiesIncludedQualitative;

  return {
    recordsIdentifiedDatabases,
    recordsIdentifiedRegisters,
    recordsIdentifiedOther,
    totalRecordsIdentified,
    duplicatesRemoved,
    recordsScreenedTitleAbstract,
    recordsExcludedTitleAbstract,
    titleAbstractExclusionReasons,
    reportsSoughtForRetrieval,
    reportsNotRetrieved,
    fullTextReportsAssessed,
    fullTextReportsExcluded,
    fullTextExclusionReasons,
    studiesIncludedQualitative,
    studiesIncludedQuantitative,
    totalStudiesIncluded,
  };
}

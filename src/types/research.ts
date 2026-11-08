export type ReviewType =
  | 'Systematic literature review'
  | 'Scoping review'
  | 'Systematic mapping review'
  | 'Meta-analysis'
  | 'Narrative literature review'
  | 'Integrative review'
  | 'Rapid review'
  | 'Evidence synthesis'
  | 'Bibliometric review'
  | 'User-defined review';

export type FrameworkType = 'PICOC' | 'PICO' | 'PECO' | 'SPIDER' | 'SPICE' | 'PCC' | 'CUSTOM';

export interface FrameworkElement {
  key: string;
  label: string;
  description: string;
  value: string;
}

export interface ResearchFramework {
  type: FrameworkType;
  name: string;
  elements: FrameworkElement[];
}

export type CriterionCategory =
  | 'Relevance'
  | 'Population'
  | 'Intervention'
  | 'Comparison'
  | 'Outcomes'
  | 'Geography'
  | 'Period'
  | 'Language'
  | 'StudyDesign'
  | 'Methodology'
  | 'PublicationType'
  | 'EvidenceAvailability'
  | 'Custom';

export interface EligibilityCriterion {
  id: string;
  name: string;
  category: CriterionCategory;
  description: string;
  inclusionCondition: string;
  exclusionCondition: string;
  mandatory: boolean;
  screeningStage: 'TitleAndAbstract' | 'FullText' | 'Both';
  decisionGuidance: string;
  reasonCode: string; // e.g. "EXC-POP", "EXC-INT", "EXC-METHOD"
}

export type ScreeningDecision = 'INCLUDE' | 'EXCLUDE' | 'UNCERTAIN' | 'UNSCREENED';

export interface ReviewerDecision {
  reviewer: string;
  stage: 'TitleAndAbstract' | 'FullText';
  decision: 'INCLUDE' | 'EXCLUDE' | 'UNCERTAIN';
  reasonCode?: string;
  notes?: string;
  timestamp: string;
}

export interface EvidenceCitation {
  id: string;
  articleId: string;
  pdfPage: number;
  printedPage?: string;
  quote: string;
  evidenceCategory: string;
  relatedResearchQuestion?: string;
  relatedCriterionId?: string;
  reviewerNotes?: string;
  createdAt: string;
}

export interface AppraisalItem {
  id: string;
  question: string;
  score: 'Yes' | 'No' | 'Partial' | 'Unclear' | 'NotApplicable';
  evidenceQuote?: string;
  explanation?: string;
  notes?: string;
}

export interface QualityAppraisalResult {
  toolType: 'CASP' | 'JBI' | 'ROB_2' | 'ROBINS_I' | 'MMAT' | 'QUADAS_2' | 'CUSTOM';
  toolName: string;
  items: AppraisalItem[];
  overallRisk: 'Low' | 'Moderate' | 'High' | 'Critical' | 'Unclear';
  reviewerNotes?: string;
  completedAt?: string;
}

export interface Article {
  id: string;
  projectId: string;
  title: string;
  authors: string;
  year: string;
  journal: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  abstract?: string;
  publicationType?: string;
  url?: string;
  issn?: string;
  database?: string;
  retrievalDate?: string;
  fullText?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfPages?: { pageNumber: number; text: string; hasImages?: boolean }[];
  isScannedPdf?: boolean;
  ocrDerived?: boolean;

  // Screening state
  screeningStatus: ScreeningDecision;
  screeningStage: 'Stage1_TitleAbstract' | 'Stage2_FullText' | 'Completed';
  primaryExclusionReason?: string;
  reviewerNotes?: string;

  // Dual-reviewer tracking
  reviewerDecisions: ReviewerDecision[];
  consensusStatus?: 'Agreement' | 'Conflict' | 'Resolved' | 'SingleReviewer';
  consensusResolution?: {
    finalDecision: 'INCLUDE' | 'EXCLUDE' | 'UNCERTAIN';
    reasonCode?: string;
    resolvedBy: string;
    notes?: string;
    timestamp: string;
  };

  // AI Recommendation
  aiRecommendation?: {
    recommendation: 'INCLUDE' | 'EXCLUDE' | 'UNCERTAIN';
    confidence: number;
    suggestedReasonCode: string;
    rationale: string;
    missingInformation?: string;
    timestamp: string;
    criterionEvaluations?: {
      criterionId: string;
      criterionName: string;
      status: 'Met' | 'Unmet' | 'Uncertain';
      explanation: string;
      exactQuote?: string;
      pageNumber?: number | null;
    }[];
  };

  // Evidence and appraisal
  evidenceCitations: EvidenceCitation[];
  qualityAppraisal?: QualityAppraisalResult;
  extractionData: Record<string, any>;

  // Duplicate detection & resolution
  duplicateOf?: string;
  duplicateGroup?: string;
  duplicateConfidence?: number;
  duplicateResolved?: boolean;
  duplicateResolutionAction?: 'Merged' | 'KeptBoth' | 'MasterSelected' | 'Flagged';
  duplicateProvenance?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  topic: string;
  background: string;
  reviewType: ReviewType;
  aim: string;
  objectives: string[];
  researchQuestions: string[];
  researchScope: string;
  geographicEligibility: string;
  publicationPeriod: {
    startYear: string;
    endYear: string;
  };
  eligiblePublicationTypes: string[];
  eligibleStudyDesigns: string[];
  methodsAndTechnologies: string[];
  populationOrSubject: string;
  interventionOrPhenomenon: string;
  outcomesOfInterest: string;
  languageRestrictions: string[];
  databasesAndSources: string[];
  reviewerInformation: {
    reviewer1: string;
    reviewer2: string;
    dualReviewMode: boolean;
  };
  protocolVersion: string;
  protocolDate: string;
  framework: ResearchFramework;
  criteria: EligibilityCriterion[];
  extractionFields: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'tags';
    category: string;
    required: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateGroup {
  id: string;
  normalizedTitle: string;
  doi?: string;
  matchType: 'Exact DOI' | 'Normalized Title' | 'Author & Year' | 'Fuzzy Similarity';
  similarityScore: number;
  articleIds: string[];
  status: 'Pending' | 'Resolved';
  resolution?: {
    action: 'Merged' | 'KeptBoth' | 'MasterSelected';
    masterArticleId?: string;
    resolvedAt: string;
    historyLog: string;
  };
}

export interface PrismaReportCounts {
  recordsIdentifiedDatabases: number;
  recordsIdentifiedRegisters: number;
  recordsIdentifiedOther: number;
  totalRecordsIdentified: number;
  duplicatesRemoved: number;
  recordsScreenedTitleAbstract: number;
  recordsExcludedTitleAbstract: number;
  titleAbstractExclusionReasons: Record<string, number>;
  reportsSoughtForRetrieval: number;
  reportsNotRetrieved: number;
  fullTextReportsAssessed: number;
  fullTextReportsExcluded: number;
  fullTextExclusionReasons: Record<string, number>;
  studiesIncludedQualitative: number;
  studiesIncludedQuantitative: number;
  totalStudiesIncluded: number;
}

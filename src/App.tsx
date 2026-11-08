import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectWizard } from './components/ProjectWizard';
import { CriteriaManager } from './components/CriteriaManager';
import { ArticleLibrary } from './components/ArticleLibrary';
import { DuplicateResolver } from './components/DuplicateResolver';
import { ScreeningWorkbench } from './components/ScreeningWorkbench';
import { PdfReaderWorkbench } from './components/PdfReaderWorkbench';
import { QualityAppraisal } from './components/QualityAppraisal';
import { EvidenceExtraction } from './components/EvidenceExtraction';
import { PrismaFlowDiagram } from './components/PrismaFlowDiagram';
import { IncludedResultsView } from './components/IncludedResultsView';
import { NotebookBriefing } from './components/NotebookBriefing';
import { ProposalGenerator } from './components/ProposalGenerator';
import { ExportBackupModal } from './components/ExportBackupModal';
import { OnlineSearchModal } from './components/OnlineSearchModal';
import { ImportModal } from './components/ImportModal';
import { ResearchProject, Article } from './types/research';
import {
  loadProjects,
  saveProjects,
  loadArticles,
  saveArticles,
  getActiveProjectId,
  setActiveProjectId as persistActiveProjectId,
  resetToSampleProject,
  calculatePrismaCounts,
} from './utils/storage';
import { findDuplicates } from './utils/duplicateDetector';
import { generateId } from './utils/parsers';

export default function App() {
  const [projects, setProjects] = useState<ResearchProject[]>(() => loadProjects());
  const [articles, setArticles] = useState<Article[]>(() => loadArticles());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => getActiveProjectId());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [platformMode, setPlatformMode] = useState<'windows' | 'android'>('windows');
  const [selectedReviewArticle, setSelectedReviewArticle] = useState<Article | null>(null);

  // Modals
  const [isOnlineSearchOpen, setIsOnlineSearchOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active project
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  // Active project articles
  const projectArticles = useMemo(() => {
    return articles.filter((a) => a.projectId === activeProject?.id);
  }, [articles, activeProject?.id]);

  // Duplicate detection
  const duplicateGroups = useMemo(() => {
    return findDuplicates(projectArticles).filter((g) => g.status === 'Pending');
  }, [projectArticles]);

  // Live PRISMA counts
  const prismaCounts = useMemo(() => {
    return calculatePrismaCounts(projectArticles);
  }, [projectArticles]);

  // Auto-save on state updates
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveArticles(articles);
  }, [articles]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch project
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    persistActiveProjectId(projectId);
    showToast(`Switched active project`);
  };

  // Create new blank project
  const handleCreateNewProject = () => {
    const newProjId = 'proj_' + Date.now();
    const newProject: ResearchProject = {
      id: newProjId,
      title: 'New Systematic Review Project',
      topic: 'Academic Research Domain',
      background: 'Background rationale for the new investigation...',
      reviewType: 'Systematic literature review',
      aim: 'Clear research aim and scope definition',
      objectives: ['Objective 1: Evaluate methodology', 'Objective 2: Quantify outcomes'],
      researchQuestions: ['RQ1: Primary research question?'],
      researchScope: 'Universal',
      geographicEligibility: 'Global',
      publicationPeriod: {
        startYear: '2020',
        endYear: '2026',
      },
      eligiblePublicationTypes: ['Journal Article', 'Conference Proceeding'],
      eligibleStudyDesigns: ['Empirical Study', 'Observational', 'Experimental'],
      methodsAndTechnologies: [],
      populationOrSubject: 'Target subject or population',
      interventionOrPhenomenon: 'Target intervention or concept',
      outcomesOfInterest: 'Outcomes of interest',
      languageRestrictions: ['English'],
      databasesAndSources: ['Crossref', 'PubMed / Europe PMC'],
      reviewerInformation: {
        reviewer1: 'Lead Researcher',
        reviewer2: 'Second Reviewer',
        dualReviewMode: false,
      },
      protocolVersion: 'v1.0',
      protocolDate: new Date().toISOString().split('T')[0],
      framework: {
        type: 'PICOC',
        name: 'PICOC Framework (Booth et al., 2016)',
        elements: [
          { key: 'P', label: 'Population / Problem', description: 'Subject or problem', value: '' },
          { key: 'I', label: 'Intervention', description: 'Intervention or technology', value: '' },
          { key: 'C', label: 'Comparison', description: 'Comparison or baseline', value: '' },
          { key: 'O', label: 'Outcomes', description: 'Primary and secondary outcomes', value: '' },
          { key: 'C2', label: 'Context', description: 'Setting and context', value: '' },
        ],
      },
      criteria: [
        {
          id: 'crit_' + Date.now(),
          name: 'Primary Relevance & Subject',
          category: 'Relevance',
          description: 'Must address the core research subject',
          inclusionCondition: 'Directly addresses research subject',
          exclusionCondition: 'Out-of-scope or irrelevant domain',
          mandatory: true,
          screeningStage: 'Both',
          decisionGuidance: 'Evaluate topical relevance',
          reasonCode: 'EXC-TOPIC',
        },
      ],
      extractionFields: [
        { key: 'sampleSize', label: 'Sample Size', type: 'number', category: 'Cohort', required: true },
        { key: 'studyDesign', label: 'Study Design', type: 'text', category: 'Methodology', required: true },
        { key: 'mainFindings', label: 'Main Findings', type: 'textarea', category: 'Findings', required: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects([...projects, newProject]);
    setActiveProjectId(newProjId);
    persistActiveProjectId(newProjId);
    setCurrentTab('project_wizard');
    showToast('New research project created!');
  };

  // Article mutation handlers
  const handleUpdateArticle = (updated: Article) => {
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDeleteArticle = (articleId: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    showToast('Article removed from library');
  };

  const handleImportArticles = (newArticles: Article[]) => {
    setArticles((prev) => [...newArticles, ...prev]);
    showToast(`Successfully added ${newArticles.length} paper(s) to library`);
  };

  const handleResolveDuplicateGroup = (
    groupId: string,
    action: 'Merged' | 'KeptBoth' | 'MasterSelected',
    masterArticle: Article,
    resolvedArticles: Article[]
  ) => {
    // Replace master record and others
    const otherMap = new Map(resolvedArticles.map((a) => [a.id, a]));
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === masterArticle.id) return masterArticle;
        if (otherMap.has(a.id)) return otherMap.get(a.id)!;
        return a;
      })
    );
    showToast(`Duplicate group resolved (${action})`);
  };

  const handleResetSample = () => {
    const initial = resetToSampleProject();
    setProjects([initial.project]);
    setArticles(initial.articles);
    setActiveProjectId(initial.project.id);
    showToast('Reset to synthetic Clinical AI ICU sample dataset');
  };

  const handleRestoreBackup = (restoredProj: ResearchProject, restoredArticles: Article[]) => {
    setProjects([restoredProj]);
    setArticles(restoredArticles);
    setActiveProjectId(restoredProj.id);
    persistActiveProjectId(restoredProj.id);
    showToast('Project database restored from archive');
  };

  if (!activeProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading ResearchMate AI...
      </div>
    );
  }

  const unscreenedCount = projectArticles.filter((a) => a.screeningStatus === 'UNSCREENED').length;
  const includedCount = projectArticles.filter((a) => a.screeningStatus === 'INCLUDE').length;

  return (
    <div className={`min-h-screen flex flex-col bg-slate-100 text-slate-800 ${platformMode === 'android' ? 'pb-16' : ''}`}>
      {/* Top Application Header */}
      <Header
        projects={projects}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        onNewProject={handleCreateNewProject}
        platformMode={platformMode}
        onTogglePlatformMode={(mode) => setPlatformMode(mode)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenOnlineSearch={() => setIsOnlineSearchOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onResetSampleData={handleResetSample}
        pendingDuplicateCount={duplicateGroups.length}
        onOpenDuplicateResolver={() => setCurrentTab('duplicate_resolver')}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          platformMode={platformMode}
          pendingDuplicateCount={duplicateGroups.length}
          unscreenedCount={unscreenedCount}
          includedCount={includedCount}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={(open) => setMobileMenuOpen(open)}
        />

        {/* Primary Content Viewport */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto max-w-full">
          {/* Toast feedback pill */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Tab 1: Research Dashboard */}
          {currentTab === 'dashboard' && (
            <Dashboard
              project={activeProject}
              articles={projectArticles}
              prismaCounts={prismaCounts}
              pendingDuplicateCount={duplicateGroups.length}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenOnlineSearch={() => setIsOnlineSearchOpen(true)}
              onOpenImport={() => setIsImportOpen(true)}
              onSelectArticle={(art) => {
                setSelectedReviewArticle(art);
                setCurrentTab('pdf_workbench');
              }}
            />
          )}

          {/* Tab 2: Universal Project Wizard & Protocol */}
          {currentTab === 'project_wizard' && (
            <ProjectWizard
              project={activeProject}
              onSaveProject={(updated) => {
                setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                showToast('Protocol and framework saved successfully');
              }}
            />
          )}

          {/* Tab 3: Eligibility Criteria Manager */}
          {currentTab === 'criteria_manager' && (
            <CriteriaManager
              project={activeProject}
              onSaveCriteria={(criteria) => {
                const updatedProj = { ...activeProject, criteria };
                setProjects(projects.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
                showToast('Eligibility criteria updated');
              }}
            />
          )}

          {/* Tab 4: Searchable Academic Article Library */}
          {currentTab === 'library' && (
            <ArticleLibrary
              articles={projectArticles}
              onUpdateArticle={handleUpdateArticle}
              onDeleteArticle={handleDeleteArticle}
              onOpenOnlineSearch={() => setIsOnlineSearchOpen(true)}
              onOpenImport={() => setIsImportOpen(true)}
              onSelectArticleForReview={(art) => {
                setSelectedReviewArticle(art);
                setCurrentTab('pdf_workbench');
              }}
            />
          )}

          {/* Tab 5: Duplicate Detection & Resolution Workbench */}
          {currentTab === 'duplicate_resolver' && (
            <DuplicateResolver
              duplicateGroups={duplicateGroups}
              articles={projectArticles}
              onResolveGroup={handleResolveDuplicateGroup}
            />
          )}

          {/* Tab 6: Title & Abstract Screening Workbench */}
          {currentTab === 'screening_workbench' && (
            <ScreeningWorkbench
              project={activeProject}
              articles={projectArticles}
              onUpdateArticle={handleUpdateArticle}
              onOpenPdfWorkbench={(art) => {
                setSelectedReviewArticle(art);
                setCurrentTab('pdf_workbench');
              }}
            />
          )}

          {/* Tab 7: PDF Reader & Evidence Citation Workbench */}
          {currentTab === 'pdf_workbench' && (
            <PdfReaderWorkbench
              article={selectedReviewArticle || projectArticles[0]}
              project={activeProject}
              onUpdateArticle={(updated) => {
                handleUpdateArticle(updated);
                setSelectedReviewArticle(updated);
              }}
              onClose={() => setCurrentTab('library')}
            />
          )}

          {/* Tab 8: Quality Appraisal & Risk of Bias */}
          {currentTab === 'quality_appraisal' && (
            <QualityAppraisal
              articles={projectArticles}
              onUpdateArticle={handleUpdateArticle}
            />
          )}

          {/* Tab 9: Evidence Extraction Matrix */}
          {currentTab === 'evidence_extraction' && (
            <EvidenceExtraction
              project={activeProject}
              articles={projectArticles}
              onUpdateArticle={handleUpdateArticle}
              onUpdateProject={(updated) => {
                setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                showToast('Extraction fields updated');
              }}
            />
          )}

          {/* Tab 10: PRISMA 2020 Flow Diagram */}
          {currentTab === 'prisma_diagram' && (
            <PrismaFlowDiagram
              prismaCounts={prismaCounts}
              project={activeProject}
            />
          )}

          {/* Tab 11: Dedicated Results for Included Articles */}
          {currentTab === 'included_results' && (
            <IncludedResultsView
              project={activeProject}
              articles={projectArticles}
              onSelectArticleForReview={(art) => {
                setSelectedReviewArticle(art);
                setCurrentTab('pdf_workbench');
              }}
            />
          )}

          {/* Tab 12: NotebookLM-Style Research Briefing */}
          {currentTab === 'notebook_briefing' && (
            <NotebookBriefing
              project={activeProject}
              articles={projectArticles}
              onOpenPdfAtPage={(art, page) => {
                setSelectedReviewArticle(art);
                setCurrentTab('pdf_workbench');
              }}
            />
          )}

          {/* Tab 13: Universal Academic Proposal & Manuscript Generator */}
          {currentTab === 'proposal_generator' && (
            <ProposalGenerator
              project={activeProject}
              articles={projectArticles}
            />
          )}

          {/* Tab 14: Export & Backup Hub */}
          {currentTab === 'export_backup' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Export & Backup Hub</h2>
              <p className="text-xs text-slate-500">
                Generate publication-ready exports in Word, Markdown, BibTeX, RIS, or download full database JSON backups.
              </p>
              <button
                onClick={() => setIsBackupOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors"
              >
                Open Full Backup & Export Center
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <OnlineSearchModal
        isOpen={isOnlineSearchOpen}
        onClose={() => setIsOnlineSearchOpen(false)}
        projectId={activeProject.id}
        onImportArticles={handleImportArticles}
        existingArticles={projectArticles}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        projectId={activeProject.id}
        onImportArticles={handleImportArticles}
      />

      <ExportBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        project={activeProject}
        articles={projectArticles}
        prismaCounts={prismaCounts}
        onRestoreBackup={handleRestoreBackup}
        onResetSampleData={handleResetSample}
      />
    </div>
  );
}

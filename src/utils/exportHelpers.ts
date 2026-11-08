import { Article, ResearchProject, PrismaReportCounts } from '../types/research';

export function exportToBibtex(articles: Article[]): string {
  return articles
    .map(a => {
      const citeKey = (a.authors.split(';')[0]?.split(',')[0] || 'study')
        .replace(/[^a-zA-Z]/g, '')
        .toLowerCase() + (a.year || '2024');

      return `@article{${citeKey},
  title = {${a.title || ''}},
  author = {${a.authors || ''}},
  journal = {${a.journal || ''}},
  year = {${a.year || ''}},
  volume = {${a.volume || ''}},
  number = {${a.issue || ''}},
  pages = {${a.pages || ''}},
  doi = {${a.doi || ''}},
  url = {${a.url || (a.doi ? 'https://doi.org/' + a.doi : '')}},
  abstract = {${(a.abstract || '').replace(/[\n\r]+/g, ' ')}}
}`;
    })
    .join('\n\n');
}

export function exportToRis(articles: Article[]): string {
  return articles
    .map(a => {
      const lines = [
        'TY  - JOUR',
        `TI  - ${a.title}`,
      ];

      if (a.authors) {
        a.authors.split(';').forEach(au => {
          if (au.trim()) lines.push(`AU  - ${au.trim()}`);
        });
      }

      if (a.year) lines.push(`PY  - ${a.year}`);
      if (a.journal) lines.push(`JO  - ${a.journal}`);
      if (a.volume) lines.push(`VL  - ${a.volume}`);
      if (a.issue) lines.push(`IS  - ${a.issue}`);
      if (a.pages) lines.push(`SP  - ${a.pages}`);
      if (a.doi) lines.push(`DO  - ${a.doi}`);
      if (a.abstract) lines.push(`AB  - ${a.abstract.replace(/[\n\r]+/g, ' ')}`);
      if (a.url) lines.push(`UR  - ${a.url}`);
      lines.push('ER  - ');

      return lines.join('\n');
    })
    .join('\n\n');
}

export function exportToCsv(articles: Article[]): string {
  const headers = [
    'ID',
    'Title',
    'Authors',
    'Year',
    'Journal',
    'DOI',
    'Database',
    'Screening Status',
    'Screening Stage',
    'Primary Exclusion Reason',
    'Abstract',
  ];

  const escapeCell = (str: any) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = articles.map(a => [
    escapeCell(a.id),
    escapeCell(a.title),
    escapeCell(a.authors),
    escapeCell(a.year),
    escapeCell(a.journal),
    escapeCell(a.doi),
    escapeCell(a.database),
    escapeCell(a.screeningStatus),
    escapeCell(a.screeningStage),
    escapeCell(a.primaryExclusionReason || ''),
    escapeCell(a.abstract || ''),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportExtractionMatrixCsv(articles: Article[], project: ResearchProject): string {
  const customFieldKeys = project.extractionFields.map(f => f.key);
  const customFieldLabels = project.extractionFields.map(f => f.label);

  const headers = [
    'Study ID',
    'Authors',
    'Year',
    'Title',
    'Journal',
    'DOI',
    ...customFieldLabels,
    'Quality Appraisal Risk',
    'Evidence Quotations Count',
  ];

  const escapeCell = (str: any) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = articles
    .filter(a => a.screeningStatus === 'INCLUDE')
    .map(a => {
      const customValues = customFieldKeys.map(k => escapeCell(a.extractionData?.[k] || ''));
      return [
        escapeCell(a.id),
        escapeCell(a.authors),
        escapeCell(a.year),
        escapeCell(a.title),
        escapeCell(a.journal),
        escapeCell(a.doi),
        ...customValues,
        escapeCell(a.qualityAppraisal?.overallRisk || 'Not Assessed'),
        escapeCell(a.evidenceCitations?.length || 0),
      ];
    });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportToWordHtml(
  title: string,
  htmlContent: string
): Blob {
  // Generates genuine Word-compatible file with MSO styles
  const fullHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <style>
    body {
      font-family: 'Calibri', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #111;
      margin: 1in;
    }
    h1 { font-size: 20pt; color: #1e3a8a; border-bottom: 2pt solid #1e3a8a; padding-bottom: 4pt; }
    h2 { font-size: 15pt; color: #1e40af; margin-top: 18pt; }
    h3 { font-size: 12pt; color: #374151; margin-top: 14pt; }
    p { margin: 6pt 0; text-align: justify; }
    table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
    th { background-color: #f1f5f9; color: #0f172a; border: 1pt solid #94a3b8; padding: 6pt 8pt; font-weight: bold; text-align: left; }
    td { border: 1pt solid #cbd5e1; padding: 5pt 8pt; vertical-align: top; }
    blockquote { border-left: 3pt solid #3b82f6; margin: 8pt 0 8pt 16pt; padding-left: 8pt; color: #475569; font-style: italic; }
    .meta-box { background: #f8fafc; border: 1pt solid #e2e8f0; padding: 10pt; margin-bottom: 16pt; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

  return new Blob([fullHtml], {
    type: 'application/msword',
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

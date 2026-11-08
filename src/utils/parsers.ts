import { Article } from '../types/research';

// Generate safe unique ID
export function generateId(): string {
  return 'art_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Parse RIS format bibliographic records
 */
export function parseRis(content: string, projectId: string): Article[] {
  const articles: Article[] = [];
  const entries = content.split(/(?:^|\n)ER\s*-(?:\r?\n|$)/m);

  for (const entry of entries) {
    if (!entry.trim()) continue;

    const lines = entry.split(/\r?\n/);
    let title = '';
    const authors: string[] = [];
    let year = '';
    let journal = '';
    let publisher = '';
    let volume = '';
    let issue = '';
    let pages = '';
    let doi = '';
    let abstract = '';
    let publicationType = 'journal-article';
    let url = '';
    let issn = '';

    for (const line of lines) {
      const match = line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);
      if (!match) continue;

      const tag = match[1].trim();
      const val = match[2].trim();

      switch (tag) {
        case 'TI':
        case 'T1':
        case 'CT':
          title = val;
          break;
        case 'AU':
        case 'A1':
          authors.push(val);
          break;
        case 'PY':
        case 'Y1':
          // Extract 4-digit year
          const yrMatch = val.match(/\b(19\d\d|20\d\d)\b/);
          if (yrMatch) year = yrMatch[1];
          else year = val;
          break;
        case 'JO':
        case 'JF':
        case 'T2':
        case 'JA':
          journal = val;
          break;
        case 'PB':
          publisher = val;
          break;
        case 'VL':
          volume = val;
          break;
        case 'IS':
          issue = val;
          break;
        case 'SP':
          pages = val;
          break;
        case 'EP':
          if (pages) pages += '-' + val;
          else pages = val;
          break;
        case 'DO':
          doi = val;
          break;
        case 'AB':
        case 'N2':
          abstract = val;
          break;
        case 'UR':
          url = val;
          break;
        case 'SN':
          issn = val;
          break;
        case 'TY':
          publicationType = val;
          break;
      }
    }

    if (title || doi) {
      articles.push({
        id: generateId(),
        projectId,
        title: title || 'Untitled Record',
        authors: authors.join('; ') || 'Unknown Authors',
        year: year || 'N/A',
        journal: journal || 'N/A',
        publisher,
        volume,
        issue,
        pages,
        doi,
        abstract,
        publicationType,
        url,
        issn,
        database: 'RIS Import',
        retrievalDate: new Date().toISOString(),
        screeningStatus: 'UNSCREENED',
        screeningStage: 'Stage1_TitleAbstract',
        reviewerDecisions: [],
        evidenceCitations: [],
        extractionData: {},
      });
    }
  }

  return articles;
}

/**
 * Parse BibTeX format records
 */
export function parseBibtex(content: string, projectId: string): Article[] {
  const articles: Article[] = [];
  // Match @article{key, ...} or similar
  const entryRegex = /@(\w+)\s*\{\s*([^,]+),([\s\S]*?)\n\}/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(content)) !== null) {
    const pubType = match[1];
    const body = match[3];

    const getField = (field: string): string => {
      const reg = new RegExp(`${field}\\s*=\\s*[{"']([^}"']+)["'}]`, 'i');
      const m = body.match(reg);
      return m ? m[1].trim() : '';
    };

    const title = getField('title');
    const author = getField('author');
    const year = getField('year');
    const journal = getField('journal') || getField('booktitle');
    const publisher = getField('publisher');
    const volume = getField('volume');
    const issue = getField('number') || getField('issue');
    const pages = getField('pages');
    const doi = getField('doi');
    const abstract = getField('abstract');
    const url = getField('url');
    const issn = getField('issn') || getField('isbn');

    if (title || doi) {
      articles.push({
        id: generateId(),
        projectId,
        title: title || 'Untitled Record',
        authors: author || 'Unknown Authors',
        year: year || 'N/A',
        journal: journal || 'N/A',
        publisher,
        volume,
        issue,
        pages,
        doi,
        abstract,
        publicationType: pubType,
        url,
        issn,
        database: 'BibTeX Import',
        retrievalDate: new Date().toISOString(),
        screeningStatus: 'UNSCREENED',
        screeningStage: 'Stage1_TitleAbstract',
        reviewerDecisions: [],
        evidenceCitations: [],
        extractionData: {},
      });
    }
  }

  return articles;
}

/**
 * Parse CSV format with header auto-detection
 */
export function parseCsv(content: string, projectId: string): Article[] {
  const articles: Article[] = [];
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return articles;

  // Simple CSV line splitter handling quoted fields
  const splitCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = splitCsvLine(lines[0]).map(h => h.toLowerCase());

  const findIdx = (names: string[]): number => {
    return headers.findIndex(h => names.some(n => h.includes(n)));
  };

  const titleIdx = findIdx(['title', 'article title', 'document title']);
  const authorIdx = findIdx(['author', 'authors', 'creator']);
  const yearIdx = findIdx(['year', 'pub year', 'publication year', 'date']);
  const journalIdx = findIdx(['journal', 'source', 'publication', 'container']);
  const doiIdx = findIdx(['doi', 'digital object identifier']);
  const abstractIdx = findIdx(['abstract', 'description', 'summary']);
  const pubTypeIdx = findIdx(['type', 'document type', 'publication type']);

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length === 0) continue;

    const title = titleIdx >= 0 ? cols[titleIdx] : cols[0];
    const authors = authorIdx >= 0 ? cols[authorIdx] : '';
    const year = yearIdx >= 0 ? cols[yearIdx] : '';
    const journal = journalIdx >= 0 ? cols[journalIdx] : '';
    const doi = doiIdx >= 0 ? cols[doiIdx] : '';
    const abstract = abstractIdx >= 0 ? cols[abstractIdx] : '';
    const publicationType = pubTypeIdx >= 0 ? cols[pubTypeIdx] : 'journal-article';

    if (title || doi) {
      articles.push({
        id: generateId(),
        projectId,
        title: title || 'Untitled Record',
        authors: authors || 'Unknown Authors',
        year: year || 'N/A',
        journal: journal || 'N/A',
        doi: doi.replace(/^https?:\/\/doi\.org\//i, ''),
        abstract,
        publicationType,
        database: 'CSV Import',
        retrievalDate: new Date().toISOString(),
        screeningStatus: 'UNSCREENED',
        screeningStage: 'Stage1_TitleAbstract',
        reviewerDecisions: [],
        evidenceCitations: [],
        extractionData: {},
      });
    }
  }

  return articles;
}

/**
 * Parse plain list of DOIs
 */
export function parseDoiList(content: string, projectId: string): Partial<Article>[] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items: Partial<Article>[] = [];

  for (const line of lines) {
    const cleanDoi = line
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
      .replace(/^doi:\s*/i, '')
      .trim();

    if (cleanDoi.startsWith('10.')) {
      items.push({
        id: generateId(),
        projectId,
        doi: cleanDoi,
        title: `DOI: ${cleanDoi} (Pending Metadata Resolution)`,
        authors: 'Retrieving...',
        year: '',
        journal: '',
        database: 'DOI Batch Entry',
        retrievalDate: new Date().toISOString(),
        screeningStatus: 'UNSCREENED',
        screeningStage: 'Stage1_TitleAbstract',
        reviewerDecisions: [],
        evidenceCitations: [],
        extractionData: {},
      });
    }
  }

  return items;
}

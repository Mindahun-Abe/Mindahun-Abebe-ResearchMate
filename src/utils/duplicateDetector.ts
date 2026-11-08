import { Article, DuplicateGroup } from '../types/research';

export function normalizeTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeDoi(doi?: string): string {
  if (!doi) return '';
  return doi
    .toLowerCase()
    .replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim();
}

export function extractFirstAuthorLastName(authors?: string): string {
  if (!authors) return '';
  // Format could be "Smith, John", "John Smith", "Smith J", or "Smith; Doe"
  const firstAuthor = authors.split(/;|\band\b|,/)[0].trim();
  const tokens = firstAuthor.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  return (tokens[tokens.length - 1] || tokens[0] || '').toLowerCase();
}

// Dice's coefficient for fuzzy string similarity (bigram overlap)
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeTitle(str1);
  const s2 = normalizeTitle(str2);

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;

  b1.forEach((count, bigram) => {
    if (b2.has(bigram)) {
      intersection += Math.min(count, b2.get(bigram)!);
    }
  });

  const total = (s1.length - 1) + (s2.length - 1);
  return (2.0 * intersection) / total;
}

export function findDuplicates(articles: Article[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < articles.length; i++) {
    const a1 = articles[i];
    if (assigned.has(a1.id)) continue;

    const matchedIds = [a1.id];
    let matchType: DuplicateGroup['matchType'] = 'Normalized Title';
    let highestScore = 1.0;

    const doi1 = normalizeDoi(a1.doi);
    const title1 = normalizeTitle(a1.title);
    const author1 = extractFirstAuthorLastName(a1.authors);
    const year1 = (a1.year || '').trim();

    for (let j = i + 1; j < articles.length; j++) {
      const a2 = articles[j];
      if (assigned.has(a2.id)) continue;

      const doi2 = normalizeDoi(a2.doi);
      const title2 = normalizeTitle(a2.title);
      const author2 = extractFirstAuthorLastName(a2.authors);
      const year2 = (a2.year || '').trim();

      // 1. Exact DOI matching
      if (doi1 && doi2 && doi1 === doi2) {
        matchedIds.push(a2.id);
        matchType = 'Exact DOI';
        highestScore = 1.0;
        continue;
      }

      // 2. Exact normalized title matching
      if (title1 && title2 && title1 === title2) {
        matchedIds.push(a2.id);
        matchType = 'Normalized Title';
        highestScore = 1.0;
        continue;
      }

      // 3. Author + Year matching + High Title Similarity (>0.75)
      if (author1 && author2 && author1 === author2 && year1 && year2 && year1 === year2) {
        const sim = stringSimilarity(a1.title, a2.title);
        if (sim >= 0.70) {
          matchedIds.push(a2.id);
          matchType = 'Author & Year';
          highestScore = Math.max(highestScore, sim);
          continue;
        }
      }

      // 4. High fuzzy title similarity (>0.85)
      const sim = stringSimilarity(a1.title, a2.title);
      if (sim >= 0.85) {
        matchedIds.push(a2.id);
        matchType = 'Fuzzy Similarity';
        highestScore = Math.max(highestScore, sim);
      }
    }

    if (matchedIds.length > 1) {
      matchedIds.forEach(id => assigned.add(id));
      groups.push({
        id: 'dup_' + a1.id,
        normalizedTitle: a1.title,
        doi: a1.doi,
        matchType,
        similarityScore: Math.round(highestScore * 100) / 100,
        articleIds: matchedIds,
        status: 'Pending',
      });
    }
  }

  return groups;
}

/**
 * Merge two or more article records into a consolidated master article,
 * preserving database provenance and picking the richest non-empty fields.
 */
export function mergeArticleRecords(master: Article, duplicates: Article[]): Article {
  const merged: Article = { ...master };

  const allDatabases = new Set<string>();
  if (master.database) allDatabases.add(master.database);

  for (const dup of duplicates) {
    if (dup.database) allDatabases.add(dup.database);
    if (!merged.abstract && dup.abstract) merged.abstract = dup.abstract;
    if (!merged.doi && dup.doi) merged.doi = dup.doi;
    if (!merged.url && dup.url) merged.url = dup.url;
    if (!merged.issn && dup.issn) merged.issn = dup.issn;
    if (!merged.publisher && dup.publisher) merged.publisher = dup.publisher;
    if (!merged.volume && dup.volume) merged.volume = dup.volume;
    if (!merged.issue && dup.issue) merged.issue = dup.issue;
    if (!merged.pages && dup.pages) merged.pages = dup.pages;
    if (!merged.fullText && dup.fullText) merged.fullText = dup.fullText;
    if (!merged.pdfUrl && dup.pdfUrl) merged.pdfUrl = dup.pdfUrl;
    if ((!merged.pdfPages || merged.pdfPages.length === 0) && dup.pdfPages && dup.pdfPages.length > 0) {
      merged.pdfPages = dup.pdfPages;
    }

    // Merge evidence citations
    if (dup.evidenceCitations && dup.evidenceCitations.length > 0) {
      const existingQuotes = new Set(merged.evidenceCitations.map(c => c.quote.trim().toLowerCase()));
      for (const cit of dup.evidenceCitations) {
        if (!existingQuotes.has(cit.quote.trim().toLowerCase())) {
          merged.evidenceCitations.push({ ...cit, articleId: merged.id });
        }
      }
    }
  }

  merged.database = Array.from(allDatabases).join('; ');
  merged.duplicateResolved = true;
  merged.duplicateResolutionAction = 'Merged';
  merged.duplicateProvenance = `Merged ${duplicates.length} duplicate record(s) on ${new Date().toLocaleDateString()}. Sources: ${Array.from(allDatabases).join(', ')}.`;

  return merged;
}

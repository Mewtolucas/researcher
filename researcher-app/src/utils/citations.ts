import { SourceResult, CitationStyle } from '../types';

function formatAuthorsAPA(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  if (authors.length <= 20) {
    return authors.slice(0, -1).join(', ') + ', & ' + authors[authors.length - 1];
  }
  return authors.slice(0, 19).join(', ') + ', ... ' + authors[authors.length - 1];
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]}, and ${authors[1]}`;
  return `${authors[0]}, et al.`;
}

function formatAuthorsChicago(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length <= 3) {
    return authors.slice(0, -1).join(', ') + ', and ' + authors[authors.length - 1];
  }
  return `${authors[0]} et al.`;
}

function formatAuthorsHarvard(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  if (authors.length <= 3) {
    return authors.slice(0, -1).join(', ') + ' and ' + authors[authors.length - 1];
  }
  return `${authors[0]} et al.`;
}

export function formatCitation(source: SourceResult, style: CitationStyle): string {
  const year = source.year || 'n.d.';
  const title = source.title;
  const authors = source.authors;
  const url = source.url;
  const doi = source.doi;

  switch (style) {
    case 'APA':
      return `${formatAuthorsAPA(authors)} (${year}). ${title}. ${doi ? `https://doi.org/${doi}` : url}`;
    case 'MLA':
      return `${formatAuthorsMLA(authors)}. "${title}." ${year}. ${doi ? `doi:${doi}` : url}.`;
    case 'Chicago':
      return `${formatAuthorsChicago(authors)}. "${title}." ${year}. ${doi ? `https://doi.org/${doi}` : url}.`;
    case 'Harvard':
      return `${formatAuthorsHarvard(authors)} (${year}) '${title}'. Available at: ${doi ? `https://doi.org/${doi}` : url}.`;
    default:
      return `${authors.join(', ')} (${year}). ${title}. ${url}`;
  }
}

export function generateAllCitations(source: SourceResult): Record<CitationStyle, string> {
  return {
    APA: formatCitation(source, 'APA'),
    MLA: formatCitation(source, 'MLA'),
    Chicago: formatCitation(source, 'Chicago'),
    Harvard: formatCitation(source, 'Harvard'),
  };
}

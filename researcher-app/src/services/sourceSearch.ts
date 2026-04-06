import { SourceResult, SourceType, SearchFilters } from '../types';
import { generateId } from '../utils/storage';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function retryFetch(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error('Fetch failed after retries');
}

export async function searchCORE(query: string, filters: SearchFilters): Promise<SourceResult[]> {
  try {
    const limit = Math.min(filters.maxResults, 50);
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      scroll: 'false',
    });
    if (filters.dateFrom) params.set('yearFrom', filters.dateFrom.toString());
    if (filters.dateTo) params.set('yearTo', filters.dateTo.toString());

    const response = await retryFetch(
      `https://api.core.ac.uk/v3/search/works?${params}`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) throw new Error(`CORE API error: ${response.status}`);
    const data = await response.json();

    return (data.results || []).map((item: any) => ({
      id: generateId(),
      title: item.title || 'Untitled',
      authors: (item.authors || []).map((a: any) => a.name || 'Unknown'),
      year: item.yearPublished || null,
      abstract: item.abstract || '',
      url: item.downloadUrl || item.sourceFulltextUrls?.[0] || `https://core.ac.uk/works/${item.id}`,
      doi: item.doi || null,
      source: 'core' as SourceType,
      documentType: item.documentType || 'article',
      relevanceScore: item._score || 0,
    }));
  } catch (err) {
    console.error('CORE search failed:', err);
    return [];
  }
}

export async function searchInternetArchive(query: string, filters: SearchFilters): Promise<SourceResult[]> {
  try {
    const rows = Math.min(filters.maxResults, 50);
    let queryStr = query;
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom || 1900;
      const to = filters.dateTo || new Date().getFullYear();
      queryStr += ` date:[${from} TO ${to}]`;
    }
    const params = new URLSearchParams({
      q: queryStr,
      output: 'json',
      rows: rows.toString(),
      'fl[]': 'identifier,title,creator,date,description,mediatype',
    });

    const response = await retryFetch(`https://archive.org/advancedsearch.php?${params}`);
    if (!response.ok) throw new Error(`Internet Archive API error: ${response.status}`);
    const data = await response.json();

    return (data.response?.docs || []).map((item: any) => ({
      id: generateId(),
      title: item.title || 'Untitled',
      authors: item.creator ? (Array.isArray(item.creator) ? item.creator : [item.creator]) : [],
      year: item.date ? parseInt(item.date.substring(0, 4)) || null : null,
      abstract: Array.isArray(item.description) ? item.description[0] || '' : item.description || '',
      url: `https://archive.org/details/${item.identifier}`,
      doi: null,
      source: 'internet_archive' as SourceType,
      documentType: item.mediatype || 'text',
      relevanceScore: 0,
    }));
  } catch (err) {
    console.error('Internet Archive search failed:', err);
    return [];
  }
}

export async function searchDOAJ(query: string, filters: SearchFilters): Promise<SourceResult[]> {
  try {
    const pageSize = Math.min(filters.maxResults, 50);
    let searchQuery = query;
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom || 1900;
      const to = filters.dateTo || new Date().getFullYear();
      searchQuery += ` AND bibjson.year:[${from} TO ${to}]`;
    }
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
    });

    const response = await retryFetch(
      `https://doaj.org/api/search/articles/${encodeURIComponent(searchQuery)}?${params}`
    );
    if (!response.ok) throw new Error(`DOAJ API error: ${response.status}`);
    const data = await response.json();

    return (data.results || []).map((item: any) => {
      const bib = item.bibjson || {};
      return {
        id: generateId(),
        title: bib.title || 'Untitled',
        authors: (bib.author || []).map((a: any) => a.name || 'Unknown'),
        year: bib.year ? parseInt(bib.year) : null,
        abstract: bib.abstract || '',
        url: (bib.link || []).find((l: any) => l.type === 'fulltext')?.url || `https://doaj.org/article/${item.id}`,
        doi: (bib.identifier || []).find((i: any) => i.type === 'doi')?.id || null,
        source: 'doaj' as SourceType,
        documentType: 'open_access',
        relevanceScore: 0,
      };
    });
  } catch (err) {
    console.error('DOAJ search failed:', err);
    return [];
  }
}

export async function searchPMC(query: string, filters: SearchFilters): Promise<SourceResult[]> {
  try {
    const retmax = Math.min(filters.maxResults, 50);
    let term = query;
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom || 1900;
      const to = filters.dateTo || new Date().getFullYear();
      term += ` AND ${from}:${to}[pdat]`;
    }
    const searchParams = new URLSearchParams({
      db: 'pmc',
      term,
      retmax: retmax.toString(),
      retmode: 'json',
    });

    const searchResponse = await retryFetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`
    );
    if (!searchResponse.ok) throw new Error(`PMC search error: ${searchResponse.status}`);
    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const summaryParams = new URLSearchParams({
      db: 'pmc',
      id: ids.join(','),
      retmode: 'json',
    });
    const summaryResponse = await retryFetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`
    );
    if (!summaryResponse.ok) throw new Error(`PMC summary error: ${summaryResponse.status}`);
    const summaryData = await summaryResponse.json();

    const results: SourceResult[] = [];
    for (const id of ids) {
      const item = summaryData.result?.[id];
      if (!item) continue;
      results.push({
        id: generateId(),
        title: item.title || 'Untitled',
        authors: (item.authors || []).map((a: any) => a.name || 'Unknown'),
        year: item.pubdate ? parseInt(item.pubdate.substring(0, 4)) || null : null,
        abstract: '',
        url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${id}/`,
        doi: (item.articleids || []).find((a: any) => a.idtype === 'doi')?.value || null,
        source: 'pmc' as SourceType,
        documentType: 'peer_reviewed',
        relevanceScore: 0,
      });
    }
    return results;
  } catch (err) {
    console.error('PMC search failed:', err);
    return [];
  }
}

export async function searchCrossRef(query: string, filters: SearchFilters): Promise<SourceResult[]> {
  try {
    const rows = Math.min(filters.maxResults, 50);
    const params = new URLSearchParams({
      query,
      rows: rows.toString(),
    });
    if (filters.dateFrom) {
      params.set('filter', `from-pub-date:${filters.dateFrom}`);
    }

    const response = await retryFetch(
      `https://api.crossref.org/works?${params}`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) throw new Error(`CrossRef API error: ${response.status}`);
    const data = await response.json();

    return (data.message?.items || []).map((item: any) => ({
      id: generateId(),
      title: (item.title || ['Untitled'])[0],
      authors: (item.author || []).map((a: any) => `${a.given || ''} ${a.family || ''}`.trim() || 'Unknown'),
      year: item.published?.['date-parts']?.[0]?.[0] || null,
      abstract: item.abstract?.replace(/<[^>]*>/g, '') || '',
      url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : ''),
      doi: item.DOI || null,
      source: 'google_scholar' as SourceType,
      documentType: item.type || 'article',
      relevanceScore: item.score || 0,
    }));
  } catch (err) {
    console.error('CrossRef search failed:', err);
    return [];
  }
}

export async function searchWeb(query: string, filters: SearchFilters): Promise<SourceResult[]> {
  try {
    const response = await retryFetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${Math.min(filters.maxResults, 20)}&format=json&origin=*`
    );
    if (!response.ok) throw new Error(`Web search error: ${response.status}`);
    const data = await response.json();

    return (data.query?.search || []).map((item: any) => ({
      id: generateId(),
      title: item.title || 'Untitled',
      authors: ['Wikipedia contributors'],
      year: new Date().getFullYear(),
      abstract: (item.snippet || '').replace(/<[^>]*>/g, ''),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
      doi: null,
      source: 'web_search' as SourceType,
      documentType: 'encyclopedia',
      relevanceScore: 0,
    }));
  } catch (err) {
    console.error('Web search failed:', err);
    return [];
  }
}

export async function fetchCustomUrl(url: string): Promise<SourceResult | null> {
  try {
    const response = await retryFetch(url, {}, 10000);
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    return {
      id: generateId(),
      title: titleMatch?.[1]?.trim() || url,
      authors: [],
      year: null,
      abstract: descMatch?.[1]?.trim() || '',
      url,
      doi: null,
      source: 'custom_url' as SourceType,
      documentType: 'web',
      relevanceScore: 0,
    };
  } catch (err) {
    console.error('Custom URL fetch failed:', err);
    return null;
  }
}

export type SearchFunction = (query: string, filters: SearchFilters) => Promise<SourceResult[]>;

export const sourceSearchMap: Record<SourceType, SearchFunction | null> = {
  google_scholar: searchCrossRef,
  core: searchCORE,
  internet_archive: searchInternetArchive,
  doaj: searchDOAJ,
  pmc: searchPMC,
  web_search: searchWeb,
  custom_url: null,
};

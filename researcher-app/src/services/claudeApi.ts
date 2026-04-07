import { SourceResult, OutputMode, CitationStyle, CredibilityAssessment } from '../types';
import { formatCitation } from '../utils/citations';

interface SynthesisRequest {
  query: string;
  results: SourceResult[];
  outputMode: OutputMode;
  citationStyle: CitationStyle;
  sourceTagging?: boolean;
}

const OUTPUT_MODE_PROMPTS: Record<OutputMode, string> = {
  thesis: `Write a comprehensive thesis-style paper that answers the research question.
Include an introduction, literature review, analysis, discussion, and conclusion.
Use inline citations referencing the provided sources by number [1], [2], etc.
The paper should be well-structured with clear arguments supported by evidence from the sources.`,

  evidence: `Extract and organize all supporting evidence from the provided sources that relates to the research question.
For each piece of evidence, cite the source by number [1], [2], etc.
Group evidence by theme or sub-topic. Rate the strength of each piece of evidence.
Include a summary of the overall evidence landscape.`,

  literature_review: `Write a comprehensive literature review based on the provided sources.
Organize the review thematically, discussing how different sources relate to and build upon each other.
Identify gaps in the literature, areas of consensus, and points of disagreement.
Use inline citations referencing sources by number [1], [2], etc.`,

  summary: `Provide a clear, concise synthesis of the key findings from all provided sources.
Organize the summary by main themes and findings.
Highlight the most important conclusions and any areas where sources disagree.
Use inline citations referencing sources by number [1], [2], etc.
Keep the summary focused and accessible.`,
};

const SOURCE_TAG_INSTRUCTION = `

IMPORTANT: For EVERY sentence that uses information from a source, you MUST wrap it with a source tag like this: <src id="1">sentence here</src> where the id is the source number. If a sentence draws from multiple sources, use comma-separated IDs: <src id="1,3">sentence here</src>. Sentences that are your own analysis or transitions don't need tags. This is critical for source highlighting.`;

function buildSourceContext(results: SourceResult[], citationStyle: CitationStyle): string {
  return results
    .map((r, i) => {
      const citation = formatCitation(r, citationStyle);
      return `[${i + 1}] ${citation}\nTitle: ${r.title}\nAuthors: ${r.authors.join(', ')}\nYear: ${r.year || 'Unknown'}\nAbstract: ${r.abstract || 'No abstract available'}\nURL: ${r.url}${r.doi ? `\nDOI: ${r.doi}` : ''}`;
    })
    .join('\n\n---\n\n');
}

export async function synthesizeResearch(
  request: SynthesisRequest,
  apiKey: string,
  onStream?: (chunk: string) => void
): Promise<string> {
  if (!apiKey) {
    // Generate a structured output without AI
    return generateLocalSynthesis(request);
  }

  const sourceContext = buildSourceContext(request.results, request.citationStyle);
  const systemPrompt = `You are an expert academic research assistant. You help synthesize research findings into well-structured academic content. Always cite sources using the provided reference numbers. Be thorough, accurate, and objective.`;

  const tagInstruction = request.sourceTagging ? SOURCE_TAG_INSTRUCTION : '';

  const userMessage = `Research Question: ${request.query}

${OUTPUT_MODE_PROMPTS[request.outputMode]}${tagInstruction}

Here are the sources found during research:

${sourceContext}

Please generate the requested output based on these sources. Ensure all claims are properly cited.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        stream: !!onStream,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    if (onStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullText += parsed.delta.text;
                onStream(fullText);
              }
            } catch {
              // skip non-JSON lines
            }
          }
        }
      }
      return fullText;
    } else {
      const data = await response.json();
      return data.content?.[0]?.text || 'No content generated.';
    }
  } catch (err: any) {
    if (err.message.includes('API key')) throw err;
    throw new Error(`Failed to synthesize research: ${err.message}`);
  }
}

/**
 * Generate structured output locally without the Claude API.
 * Groups sources by theme/topic based on keyword overlap and produces
 * a formatted report with proper citations.
 */
function generateLocalSynthesis(request: SynthesisRequest): string {
  const { query, results, outputMode } = request;
  const lines: string[] = [];

  if (results.length === 0) {
    return `# Research Results\n\nNo sources were found for: "${query}"\n\nTry broadening your search terms or selecting more source databases.`;
  }

  const modeTitle: Record<OutputMode, string> = {
    thesis: 'Research Paper',
    evidence: 'Evidence Summary',
    literature_review: 'Literature Review',
    summary: 'Research Summary',
  };

  lines.push(`# ${modeTitle[outputMode]}: ${query}`);
  lines.push('');
  lines.push(`*Generated from ${results.length} sources across multiple databases. Add a Claude API key for AI-synthesized analysis with deeper insights.*`);
  lines.push('');

  // Overview section
  lines.push('## Overview');
  lines.push('');

  // Group by source database
  const bySource: Record<string, SourceResult[]> = {};
  results.forEach(r => {
    const key = r.source;
    if (!bySource[key]) bySource[key] = [];
    bySource[key].push(r);
  });

  const sourceLabels: Record<string, string> = {
    google_scholar: 'CrossRef / Google Scholar',
    core: 'CORE Academic',
    internet_archive: 'Internet Archive',
    doaj: 'DOAJ (Open Access)',
    pmc: 'PubMed Central',
    web_search: 'Wikipedia / Web',
    custom_url: 'Custom Sources',
  };

  const sourceBreakdown = Object.entries(bySource)
    .map(([src, items]) => `**${sourceLabels[src] || src}**: ${items.length} results`)
    .join(' | ');

  lines.push(`This research gathered ${results.length} sources. ${sourceBreakdown}`);
  lines.push('');

  // Year range
  const years = results.map(r => r.year).filter((y): y is number => y !== null).sort();
  if (years.length > 0) {
    lines.push(`Sources span from **${years[0]}** to **${years[years.length - 1]}**.`);
    lines.push('');
  }

  // Key Findings by Source
  if (outputMode === 'evidence') {
    lines.push('## Evidence by Source');
    lines.push('');
    results.forEach((r, i) => {
      lines.push(`### [${i + 1}] ${r.title}`);
      lines.push(`**Authors:** ${r.authors.length > 0 ? r.authors.join(', ') : 'Unknown'}`);
      if (r.year) lines.push(`**Year:** ${r.year}`);
      lines.push(`**Source:** ${sourceLabels[r.source] || r.source} | **Type:** ${r.documentType}`);
      if (r.doi) lines.push(`**DOI:** ${r.doi}`);
      lines.push('');
      if (r.abstract) {
        lines.push(`${r.abstract}`);
      } else {
        lines.push('*No abstract available for this source.*');
      }
      lines.push('');
    });
  } else if (outputMode === 'summary') {
    lines.push('## Key Sources');
    lines.push('');
    results.forEach((r, i) => {
      const abstractSnippet = r.abstract
        ? r.abstract.length > 300 ? r.abstract.substring(0, 300) + '...' : r.abstract
        : 'No abstract available.';
      lines.push(`${i + 1}. **${r.title}** (${r.year || 'n.d.'}) [${i + 1}]`);
      lines.push(`   ${r.authors.join(', ')}`);
      lines.push(`   ${abstractSnippet}`);
      lines.push('');
    });
  } else {
    // thesis or literature_review
    lines.push('## Sources and Findings');
    lines.push('');

    // Group by source type for literature review style
    for (const [src, items] of Object.entries(bySource)) {
      lines.push(`### ${sourceLabels[src] || src} (${items.length} sources)`);
      lines.push('');
      items.forEach(r => {
        const idx = results.indexOf(r) + 1;
        lines.push(`**${r.title}** (${r.year || 'n.d.'}) [${idx}]`);
        lines.push(`*${r.authors.length > 0 ? r.authors.join(', ') : 'Unknown author(s)'}*`);
        if (r.abstract) {
          lines.push('');
          lines.push(r.abstract);
        }
        if (r.doi) lines.push(`DOI: ${r.doi}`);
        lines.push('');
      });
    }

    lines.push('## Discussion');
    lines.push('');
    lines.push(`This collection of ${results.length} sources provides a foundation for research on "${query}". ` +
      `Sources were gathered from ${Object.keys(bySource).length} different databases, ` +
      `providing diverse perspectives on the topic.`);
    lines.push('');

    const peerReviewedCount = results.filter(r =>
      r.source === 'pmc' || r.source === 'doaj' || r.documentType === 'peer_reviewed'
    ).length;
    if (peerReviewedCount > 0) {
      lines.push(`**${peerReviewedCount}** of the sources are from peer-reviewed databases (PubMed Central, DOAJ), indicating strong academic credibility.`);
      lines.push('');
    }
  }

  lines.push('## References');
  lines.push('');
  results.forEach((r, i) => {
    lines.push(`[${i + 1}] ${r.authors.join(', ')} (${r.year || 'n.d.'}). *${r.title}*. ${r.url}`);
  });

  return lines.join('\n');
}

/**
 * Rule-based credibility assessment — works without any API key.
 * Uses heuristics based on source database, document type, DOI presence,
 * author count, abstract quality, and other metadata signals.
 */
export function assessCredibilityLocal(results: SourceResult[]): CredibilityAssessment[] {
  return results.map(r => {
    let score = 5;
    const factors: string[] = [];

    // Source database signals
    if (r.source === 'pmc') {
      score += 3;
      factors.push('PubMed Central (peer-reviewed biomedical literature)');
    } else if (r.source === 'doaj') {
      score += 2;
      factors.push('DOAJ (verified open-access, peer-reviewed journal)');
    } else if (r.source === 'google_scholar') {
      score += 1;
      factors.push('CrossRef (registered scholarly publication)');
    } else if (r.source === 'core') {
      score += 1;
      factors.push('CORE (academic repository, may include preprints)');
    } else if (r.source === 'internet_archive') {
      score -= 1;
      factors.push('Internet Archive (mixed content, not peer-reviewed)');
    } else if (r.source === 'web_search') {
      score -= 2;
      factors.push('Wikipedia (community-edited, not peer-reviewed)');
    } else if (r.source === 'custom_url') {
      factors.push('Custom URL (credibility varies)');
    }

    // DOI = registered with a standards body
    if (r.doi) {
      score += 1;
      factors.push('Has DOI (registered publication)');
    }

    // Author signals
    if (r.authors.length >= 3) {
      score += 1;
      factors.push(`${r.authors.length} authors (collaborative research)`);
    } else if (r.authors.length === 0 || (r.authors.length === 1 && r.authors[0] === 'Unknown')) {
      score -= 1;
      factors.push('No identified authors');
    }

    // Abstract quality
    if (r.abstract && r.abstract.length > 200) {
      score += 1;
      factors.push('Detailed abstract available');
    } else if (!r.abstract || r.abstract.length < 30) {
      score -= 1;
      factors.push('No substantive abstract');
    }

    // Document type signals
    const peerTypes = ['peer_reviewed', 'journal-article', 'journal article'];
    if (peerTypes.some(t => r.documentType.toLowerCase().includes(t))) {
      score += 1;
      factors.push('Peer-reviewed document type');
    } else if (['preprint', 'working-paper'].includes(r.documentType.toLowerCase())) {
      factors.push('Preprint (not yet peer-reviewed)');
    }

    // Recency
    const currentYear = new Date().getFullYear();
    if (r.year && r.year >= currentYear - 5) {
      factors.push(`Recent publication (${r.year})`);
    } else if (r.year && r.year < currentYear - 20) {
      factors.push(`Older publication (${r.year}) — may not reflect current knowledge`);
    }

    // Clamp score
    score = Math.max(1, Math.min(10, score));

    // Determine level
    const level: 'high' | 'medium' | 'low' = score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low';

    // Determine peer review status
    const peerReviewed = r.source === 'pmc' || r.source === 'doaj' ||
      peerTypes.some(t => r.documentType.toLowerCase().includes(t));

    // Publication type description
    const pubType = r.source === 'pmc' ? 'Biomedical journal article'
      : r.source === 'doaj' ? 'Open-access journal article'
      : r.source === 'google_scholar' ? 'Scholarly publication'
      : r.source === 'core' ? 'Academic repository item'
      : r.source === 'internet_archive' ? 'Archived document/media'
      : r.source === 'web_search' ? 'Encyclopedia article'
      : 'Web page';

    // Journal reputation
    const journalRep = r.source === 'pmc' ? 'Indexed in PubMed Central (NLM/NIH)'
      : r.source === 'doaj' ? 'Listed in Directory of Open Access Journals'
      : r.doi ? 'DOI-registered publisher'
      : 'Reputation not verified';

    // Author expertise
    const authorExpertise = r.authors.length === 0
      ? 'No author information available'
      : r.authors.length >= 3
        ? `Collaborative work by ${r.authors.length} authors (${r.authors.slice(0, 2).join(', ')}${r.authors.length > 2 ? ', et al.' : ''})`
        : `${r.authors.join(', ')} — expertise not independently verified`;

    return {
      score,
      level,
      authorExpertise,
      publicationType: pubType,
      peerReviewed,
      journalReputation: journalRep,
      methodology: r.abstract && r.abstract.length > 100
        ? 'Abstract suggests structured research'
        : 'Insufficient information to assess methodology',
      reasoning: factors.join('. ') + '.',
    };
  });
}

/**
 * Full AI-powered credibility assessment — requires Claude API key.
 * Falls back to rule-based assessment if API key is missing.
 */
export async function assessCredibility(
  results: SourceResult[],
  apiKey: string
): Promise<CredibilityAssessment[]> {
  if (!apiKey || results.length === 0) {
    return assessCredibilityLocal(results);
  }

  const sourceSummaries = results.map((r, i) =>
    `[${i + 1}] Title: ${r.title}\nAuthors: ${r.authors.join(', ')}\nYear: ${r.year || 'Unknown'}\nSource Database: ${r.source}\nDocument Type: ${r.documentType}\nDOI: ${r.doi || 'None'}\nURL: ${r.url}\nAbstract: ${(r.abstract || 'None').substring(0, 300)}`
  ).join('\n\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Assess the credibility of each academic source below. For each source, evaluate:
1. Author expertise (are they likely experts based on name recognition, institutional affiliation if visible, publication context?)
2. Publication type (peer-reviewed journal, preprint, book, encyclopedia, web page, etc.)
3. Whether it's likely peer-reviewed
4. Journal/publisher reputation (based on the source database and URL)
5. Methodology quality (based on abstract if available)
6. Overall credibility score (1-10, where 10 = highest credibility)
7. Credibility level: "high" (8-10), "medium" (5-7), or "low" (1-4)

Sources from PubMed Central (pmc) are always peer-reviewed. Sources from DOAJ are open-access and peer-reviewed. CORE aggregates from repositories (mixed). Internet Archive is mixed. Wikipedia (web_search) is not peer-reviewed. CrossRef/Google Scholar (google_scholar) links to published works, usually peer-reviewed.

Return a JSON array with one object per source, in order. Each object:
{"score": number, "level": "high"|"medium"|"low", "authorExpertise": "brief assessment", "publicationType": "type", "peerReviewed": boolean, "journalReputation": "brief assessment", "methodology": "brief assessment or N/A", "reasoning": "1-2 sentence summary"}

Return ONLY the JSON array, no other text.

Sources:

${sourceSummaries}`,
        }],
      }),
    });

    if (!response.ok) throw new Error(`Credibility API error: ${response.status}`);
    const data = await response.json();
    const text = data.content?.[0]?.text || '[]';

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');

    const assessments: CredibilityAssessment[] = JSON.parse(jsonMatch[0]);
    return assessments.map(a => ({
      score: Math.max(1, Math.min(10, a.score || 5)),
      level: (['high', 'medium', 'low'].includes(a.level) ? a.level : 'unknown') as 'high' | 'medium' | 'low' | 'unknown',
      authorExpertise: a.authorExpertise || 'Not assessed',
      publicationType: a.publicationType || 'Unknown',
      peerReviewed: !!a.peerReviewed,
      journalReputation: a.journalReputation || 'Not assessed',
      methodology: a.methodology || 'Not assessed',
      reasoning: a.reasoning || 'No assessment available',
    }));
  } catch (err) {
    console.error('AI credibility assessment failed, using rule-based fallback:', err);
    return assessCredibilityLocal(results);
  }
}

export async function generateSearchQueries(
  query: string,
  apiKey: string
): Promise<string[]> {
  if (!apiKey) return [query];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Given this research question, generate 3 different search queries optimized for academic databases. Return only the queries, one per line, no numbering or prefixes.\n\nResearch question: ${query}`,
        }],
      }),
    });

    if (!response.ok) return [query];
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const queries = text.split('\n').filter((q: string) => q.trim().length > 0).slice(0, 3);
    return queries.length > 0 ? queries : [query];
  } catch {
    return [query];
  }
}

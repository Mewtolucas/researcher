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
    throw new Error('Claude API key is required. Please enter your API key in the settings.');
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

export async function assessCredibility(
  results: SourceResult[],
  apiKey: string
): Promise<CredibilityAssessment[]> {
  if (!apiKey || results.length === 0) {
    return results.map(() => ({
      score: 5,
      level: 'unknown' as const,
      authorExpertise: 'Unable to assess without API key',
      publicationType: 'Unknown',
      peerReviewed: false,
      journalReputation: 'Unknown',
      methodology: 'Not assessed',
      reasoning: 'Credibility assessment requires an API key.',
    }));
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
    console.error('Credibility assessment failed:', err);
    return results.map(() => ({
      score: 5,
      level: 'unknown' as const,
      authorExpertise: 'Assessment failed',
      publicationType: 'Unknown',
      peerReviewed: false,
      journalReputation: 'Unknown',
      methodology: 'Not assessed',
      reasoning: 'Credibility assessment encountered an error.',
    }));
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

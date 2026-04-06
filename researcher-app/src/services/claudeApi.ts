import { SourceResult, OutputMode, CitationStyle } from '../types';
import { formatCitation } from '../utils/citations';

interface SynthesisRequest {
  query: string;
  results: SourceResult[];
  outputMode: OutputMode;
  citationStyle: CitationStyle;
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

  const userMessage = `Research Question: ${request.query}

${OUTPUT_MODE_PROMPTS[request.outputMode]}

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

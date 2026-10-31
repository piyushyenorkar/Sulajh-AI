import { db } from '../lib/db.js';

function generateVector(text: string, dim = 128): number[] {
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    const sign = (hash & 1) === 0 ? 1 : -1;
    vec[idx] += sign * (1 / (1 + Math.log(1 + i)));
  }

  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dim; i++) vec[i] = Number((vec[i] / norm).toFixed(6));

  return vec;
}

export interface KbSearchResult {
  id: string;
  source: string;
  text: string;
  score?: number;
  rule_key?: string;
}

/**
 * Searches Qdrant Cloud collection 'sulajh_kb' for relevant policy passages.
 * Seamlessly falls back to local in-memory KB on network error.
 */
export async function searchQdrantKb(query: string, limit = 3): Promise<KbSearchResult[]> {
  const qdrantUrl = process.env.QDRANT_URL;
  const qdrantKey = process.env.QDRANT_API_KEY;

  if (qdrantUrl && qdrantKey) {
    try {
      const vector = generateVector(query, 128);
      const res = await fetch(`${qdrantUrl}/collections/sulajh_kb/points/search`, {
        method: 'POST',
        headers: {
          'api-key': qdrantKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vector,
          limit,
          with_payload: true,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.result && data.result.length > 0) {
          return data.result.map((r: any) => ({
            id: String(r.id),
            source: r.payload?.source || 'Paytm Policy Manual 2026',
            text: r.payload?.text || '',
            score: r.score,
            rule_key: r.payload?.rule_key || 'paytm_merchant_knowledge_base',
          }));
        }
      }
    } catch {
      // Graceful fallback to local db
    }
  }

  // Local in-memory fallback
  const localChunks = db.searchKb(query);
  return localChunks.map((c) => ({
    id: c.id,
    source: c.source,
    text: c.text,
    rule_key: 'paytm_merchant_knowledge_base',
  }));
}


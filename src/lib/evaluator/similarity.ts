/**
 * Code Similarity & Anti-Plagiarism Engine
 * Uses normalized n-gram tokenization and Jaccard similarity coefficient.
 */

function tokenizeCode(code: string): Set<string> {
  // Normalize: remove comments, lowercase, remove whitespace
  const sanitized = code
    .replace(/#.*$/gm, "")
    .replace(/""".*?"""/gs, "")
    .replace(/'''.*?'''/gs, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

  // Extract alphanumeric tokens
  const tokens = sanitized.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  
  // Build 3-grams
  const ngrams = new Set<string>();
  const n = 3;
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.add(tokens.slice(i, i + n).join("_"));
  }
  return ngrams;
}

export function computeCodeSimilarity(code1: string, code2: string): number {
  if (!code1 || !code2) return 0;
  
  const tokens1 = tokenizeCode(code1);
  const tokens2 = tokenizeCode(code2);

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) intersection++;
  });

  const union = tokens1.size + tokens2.size - intersection;
  if (union === 0) return 0;

  const similarity = (intersection / union) * 100;
  return Math.round(similarity * 10) / 10;
}

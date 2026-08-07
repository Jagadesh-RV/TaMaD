// Lightweight fuzzy matcher for keyboard-first search.
// Returns a score (higher = better) or null when there is no subsequence match.
export function fuzzyScore(query: string, text: string): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = text.toLowerCase();
  if (q.length > t.length) return null;

  let score = 0;
  let lastMatch = -1;
  let ti = 0;

  for (let qi = 0; qi < q.length; qi++) {
    let matched = false;
    for (; ti < t.length; ti++) {
      if (t[ti] === q[qi]) {
        const consecutive = ti === lastMatch + 1;
        const wordBoundary = ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-';
        if (consecutive) score += 6;
        else if (wordBoundary) score += 4;
        else score += 1;
        if (qi === 0) score += 3;
        lastMatch = ti;
        ti++;
        matched = true;
        break;
      }
    }
    if (!matched) return null;
  }

  return score - Math.abs(t.length - q.length) * 0.05;
}

export function fuzzyFilter<T>(
  items: T[],
  query: string,
  getText: (item: T) => string,
  limit = 8,
): T[] {
  if (!query.trim()) return items.slice(0, limit);
  const scored: Array<{ item: T; score: number }> = [];
  for (const item of items) {
    const score = fuzzyScore(query, getText(item));
    if (score !== null) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

// Returns the index ranges in `text` matched by `query` as a fuzzy
// subsequence, for highlighting.
export function matchRanges(query: string, text: string): Array<[number, number]> {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return [];
  const ranges: Array<[number, number]> = [];
  let ti = 0;
  let start = -1;
  let prev = -1;
  for (let qi = 0; qi < q.length; qi++) {
    let found = false;
    for (; ti < t.length; ti++) {
      if (t[ti] === q[qi]) {
        if (start === -1 || ti === prev + 1) {
          if (start === -1) start = ti;
        } else {
          if (start !== -1) ranges.push([start, prev]);
          start = ti;
        }
        prev = ti;
        ti++;
        found = true;
        break;
      }
    }
    if (!found) return [];
  }
  if (start !== -1) ranges.push([start, prev]);
  return ranges;
}

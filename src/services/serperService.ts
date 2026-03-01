export interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

/**
 * 토픽으로 실제 뉴스/아티클 검색
 */
export const searchArticles = async (topic: string): Promise<SerperResult[]> => {
  const res = await fetch("/api/serper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: topic, type: "news", num: 5 }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items = data.news || data.organic || [];

  return items.map((item: any) => ({
    title: item.title || "",
    link: item.link || "",
    snippet: item.snippet || "",
    date: item.date || "",
  }));
};

/**
 * 단어 예문 검색 (실제 웹에서 자연스러운 예문 수집)
 */
export const searchWordExamples = async (word: string): Promise<string[]> => {
  const res = await fetch("/api/serper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `"${word}" example sentence english`,
      type: "search",
      num: 5,
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const results: SerperResult[] = (data.organic || []).map((item: any) => ({
    snippet: item.snippet || "",
  }));

  return results.map((r) => r.snippet).filter(Boolean);
};

/**
 * 검색 결과를 Gemini 프롬프트용 컨텍스트 문자열로 변환
 */
export const buildSearchContext = (results: SerperResult[]): string => {
  if (results.length === 0) return "";

  const lines = results.map(
    (r, i) => `[Source ${i + 1}] ${r.title}\n${r.snippet}`
  );

  return `
=== REAL WEB SEARCH RESULTS (use as factual reference) ===
${lines.join("\n\n")}
=== END OF SEARCH RESULTS ===
`;
};

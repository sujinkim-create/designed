import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SERPER_API_KEY not set" }, { status: 500 });
  }

  const { query, type = "search", num = 5 } = await req.json();
  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const endpoint =
    type === "news"
      ? "https://google.serper.dev/news"
      : "https://google.serper.dev/search";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num, hl: "en", gl: "us" }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Serper API error" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

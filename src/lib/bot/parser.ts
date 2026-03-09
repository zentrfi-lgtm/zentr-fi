export type ParsedQuery = {
  origin: string;
  destination: string;
  date: string | null;
  budget: number | null;
};

export type ParseResult =
  | { ok: true; data: ParsedQuery }
  | { ok: false; reason: string };

function getGeminiApiKey() {
  // Project contract: we use NEXT_PUBLIC_GEMINI_API_KEY.
  // (This code runs server-side in Next route handlers too.)
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
}

function heuristicParse(cleaned: string): ParseResult {
  // Very lightweight fallback so builds/dev work without external SDKs or keys.
  const budgetMatch = cleaned.match(/\$?\s*([0-9]{2,6})(?:\s*usd|\s*dollars)?/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;

  // Common patterns: "from X to Y", "X to Y"
  const fromTo = cleaned.match(/from\s+(.+?)\s+to\s+(.+?)(?:\s+on|\s+with|\s*$)/i);
  const toOnly = cleaned.match(/^(.+?)\s+to\s+(.+?)(?:\s+on|\s+with|\s*$)/i);
  const origin = (fromTo?.[1] || toOnly?.[1] || "").trim().replace(/[",]/g, "");
  const destination = (fromTo?.[2] || toOnly?.[2] || "").trim().replace(/[",]/g, "");

  // Minimal date support (YYYY-MM-DD). Everything else is handled by AI later.
  const dateMatch = cleaned.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  const date = dateMatch ? dateMatch[1] : null;

  if (!origin || !destination) return { ok: false, reason: "missing_fields" };
  return { ok: true, data: { origin, destination, date, budget } };
}

export async function parseTravelQuery(castText: string): Promise<ParseResult> {
  const cleaned = castText.replace(/@\w+/g, "").trim();

  if (!cleaned) {
    return { ok: false, reason: "empty" };
  }

  try {
    const key = getGeminiApiKey();
    if (!key) return heuristicParse(cleaned);

    const today = new Date().toISOString().split("T")[0];
    const prompt = `You are a travel query parser. Extract travel details from the user's message.

Return ONLY valid JSON with these fields:
- "origin": string (city or state name, e.g. "Florida", "New York")
- "destination": string (city or state name)
- "date": string in YYYY-MM-DD format, or null if not specified
- "budget": number in USD, or null if not specified

Rules:
- If you cannot identify both an origin AND a destination, return: {"error": "missing_fields"}
- Strip any @mentions from the text before parsing.
- Interpret relative dates based on today's date: ${today}
- Do NOT wrap JSON in markdown code blocks. Return raw JSON only.

User message: "${cleaned}"`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
        key,
      )}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 180 },
        }),
      },
    );
    if (!res.ok) return heuristicParse(cleaned);

    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const parsed = JSON.parse(text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim());

    if (parsed.error) return { ok: false, reason: String(parsed.error) };
    if (!parsed.origin || !parsed.destination) return { ok: false, reason: "missing_fields" };

    return {
      ok: true,
      data: {
        origin: String(parsed.origin),
        destination: String(parsed.destination),
        date: parsed.date ? String(parsed.date) : null,
        budget: typeof parsed.budget === "number" ? parsed.budget : null,
      },
    };
  } catch (err) {
    console.error("[parser] Failed to parse query:", err);
    return heuristicParse(cleaned);
  }
}

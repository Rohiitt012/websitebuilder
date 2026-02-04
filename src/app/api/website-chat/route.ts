import { NextRequest, NextResponse } from "next/server";

// Gemini REST API – .env me GEMINI_API_KEY honi chahiye
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const CANVAS_COPY_KEYS = [
  "experienceHeading", "experienceParagraph",
  "work1Title", "work1Category", "work2Title", "work2Category", "work3Title", "work3Category", "work4Title", "work4Category",
  "exp1Company", "exp1Role", "exp1Period", "exp2Company", "exp2Role", "exp2Period", "exp3Company", "exp3Role", "exp3Period", "exp4Company", "exp4Role", "exp4Period",
  "contactHeading", "contactSubheading", "contactParagraph", "footerText",
  "sectionNew1Title", "sectionNew1Category", "sectionNew2Title", "sectionNew2Category", "sectionNew3Title", "sectionNew3Category", "sectionNew4Title", "sectionNew4Category",
] as const;

type PageContext = {
  title?: string;
  heroHeading?: string;
  heroDescription?: string;
  heroJumboText?: string;
  canvasCopy?: Record<string, string>;
};
type UpdatesPayload = PageContext & { canvasCopy?: Record<string, string> };
const APPLY_JSON_MARKER = "APPLY_JSON:";

function buildPromptWithPageContext(userPrompt: string, currentContent?: PageContext | null): string {
  if (!currentContent) return userPrompt;
  const title = currentContent.title ?? "";
  const heroHeading = currentContent.heroHeading ?? "";
  const heroDescription = currentContent.heroDescription ?? "";
  const heroJumboText = currentContent.heroJumboText ?? "";
  const copy = currentContent.canvasCopy ?? {};
  const canvasLines = CANVAS_COPY_KEYS.map((k) => `- ${k}: "${(copy[k] ?? "").replace(/"/g, '\\"')}"`).join("\n");
  const allKeys = ["title", "heroHeading", "heroDescription", "heroJumboText", ...CANVAS_COPY_KEYS].join(", ");
  const ctx = `You are a website editor. The live page next to this chat updates ONLY when you output APPLY_JSON with the new values. Your reply text is not enough – you MUST output the JSON.

Current page content (exact keys for your JSON):
- title: "${title.replace(/"/g, '\\"')}"
- heroHeading: "${heroHeading.replace(/"/g, '\\"')}"
- heroDescription: "${heroDescription.replace(/"/g, '\\"')}"
- heroJumboText: "${heroJumboText.replace(/"/g, '\\"')}"
${canvasLines}

User request: ${userPrompt}

CRITICAL RULES:
1. When the user asks to change a name (e.g. Dr Sandeep to Dr Ayushi) OR "update all content" OR "make it doctor/medical themed" OR "whole website" – you MUST put in APPLY_JSON every relevant key with new values: at least title, heroHeading, heroDescription, heroJumboText, experienceHeading, experienceParagraph, contactHeading, contactSubheading, contactParagraph, footerText, and the exp1Company, exp1Role, exp1Period through exp4Company, exp4Role, exp4Period, and work1Title, work1Category through work4Title, work4Category. Update ALL of them to match the new theme/name. Do not leave APPLY_JSON empty or with only 1-2 keys when user asked for full update.
2. Reply in 1-2 short sentences, then on a NEW LINE add exactly: ${APPLY_JSON_MARKER} followed by a single JSON object. Use only these keys: ${allKeys}. No code block, no markdown – just the marker and then { "key": "value", ... }.
3. Example for "change to Dr Ayushi and doctor theme": ${APPLY_JSON_MARKER} {"title": "Dr. Ayushi", "heroHeading": "Welcome to Your Health", "heroDescription": "Providing care for you.", "heroJumboText": "I am Dr. Ayushi, your healthcare partner.", "experienceHeading": "My Medical Experience", "experienceParagraph": "Years of experience in patient care...", "contactHeading": "Get in touch", "footerText": "Dr. Ayushi Clinic"}`;
  return ctx;
}

/** Extract JSON object from text after marker – supports multi-line and values containing } */
function extractJsonObject(afterMarker: string): string {
  const trimmed = afterMarker.trim();
  const start = trimmed.indexOf("{");
  if (start === -1) return "";
  let depth = 0;
  let inString = false;
  let escape = false;
  let quote = "";
  for (let i = start; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (!inString) {
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) return trimmed.slice(start, i + 1);
      } else if (c === '"' || c === "'") {
        inString = true;
        quote = c;
      }
      continue;
    }
    if (c === quote) inString = false;
  }
  return "";
}

function parseApplyJson(text: string): { cleanText: string; updates: UpdatesPayload } {
  const marker = APPLY_JSON_MARKER;
  const idx = text.lastIndexOf(marker);
  const updates: UpdatesPayload = {};
  let cleanText = text;
  if (idx !== -1) {
    let after = text.slice(idx + marker.length);
    after = after.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    const jsonStr = extractJsonObject(after);
    try {
      const obj = JSON.parse(jsonStr) as Record<string, string>;
      if (typeof obj.title === "string") updates.title = obj.title;
      if (typeof obj.heroHeading === "string") updates.heroHeading = obj.heroHeading;
      if (typeof obj.heroDescription === "string") updates.heroDescription = obj.heroDescription;
      if (typeof obj.heroJumboText === "string") updates.heroJumboText = obj.heroJumboText;
      const canvasCopy: Record<string, string> = {};
      for (const k of CANVAS_COPY_KEYS) {
        if (typeof obj[k] === "string") canvasCopy[k] = obj[k];
      }
      if (Object.keys(canvasCopy).length > 0) updates.canvasCopy = canvasCopy;
    } catch {
      /* ignore parse error */
    }
    cleanText = text.slice(0, idx).trim();
  }
  return { cleanText, updates };
}

/**
 * POST /api/website-chat
 * Body: { prompt, provider, currentContent?: { title, heroHeading, heroDescription } }
 * When currentContent is sent, AI can return APPLY_JSON and we return updates for the page.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const provider = (body?.provider ?? "gemini").toLowerCase();
    const currentContent = body?.currentContent as PageContext | null | undefined;

    if (!prompt) {
      return NextResponse.json({ error: "Missing or empty prompt." }, { status: 400 });
    }

    const effectivePrompt = buildPromptWithPageContext(prompt, currentContent);

    if (provider === "none") {
      return NextResponse.json({ text: "No AI provider selected. Choose Gemini, ChatGPT, or Grok from the Auto menu." });
    }

    if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY not set. Add it in .env or .env.local (see .env.example)." },
          { status: 503 }
        );
      }
      const res = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: effectivePrompt }] }],
        }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const errMsg =
          (data?.error as { message?: string })?.message ??
          (data?.message as string) ??
          (data?.error as string) ??
          res.statusText;
        return NextResponse.json({ error: String(errMsg) }, { status: res.status >= 500 ? 502 : 400 });
      }
      const candidate = (data?.candidates as { content?: { parts?: { text?: string }[] } }[] | undefined)?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text ?? "";
      if (!rawText && (data?.promptFeedback as { blockReason?: string })?.blockReason) {
        return NextResponse.json(
          { error: "Response was blocked by safety filters." },
          { status: 400 }
        );
      }
      const text = rawText || "(No response from model.)";
      const { cleanText, updates } = parseApplyJson(text);
      const payload: { text: string; updates?: UpdatesPayload } = { text: cleanText || text };
      if (Object.keys(updates).length > 0) payload.updates = updates;
      return NextResponse.json(payload);
    }

    if (provider === "grok") {
      const apiKey = process.env.XAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "XAI_API_KEY not set. Add it in .env or .env.local (see .env.example)." },
          { status: 503 }
        );
      }
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [{ role: "user", content: effectivePrompt }],
        }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const errMsg =
          (data?.error as { message?: string })?.message ??
          (data?.message as string) ??
          (data?.error as string) ??
          res.statusText;
        return NextResponse.json({ error: String(errMsg) }, { status: res.status >= 500 ? 502 : 400 });
      }
      const choice = (data?.choices as { message?: { content?: string } }[] | undefined)?.[0];
      const rawText = choice?.message?.content ?? "";
      const text = rawText || "(No response from model.)";
      const { cleanText, updates } = parseApplyJson(text);
      const payload: { text: string; updates?: UpdatesPayload } = { text: cleanText || text };
      if (Object.keys(updates).length > 0) payload.updates = updates;
      return NextResponse.json(payload);
    }

    if (provider === "chatgpt") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "OPENAI_API_KEY not set. Add it in .env or .env.local (see .env.example)." },
          { status: 503 }
        );
      }
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: effectivePrompt }],
        }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const errMsg =
          (data?.error as { message?: string })?.message ??
          (data?.message as string) ??
          (data?.error as string) ??
          res.statusText;
        return NextResponse.json({ error: String(errMsg) }, { status: res.status >= 500 ? 502 : 400 });
      }
      const choice = (data?.choices as { message?: { content?: string } }[] | undefined)?.[0];
      const rawText = choice?.message?.content ?? "";
      const text = rawText || "(No response from model.)";
      const { cleanText, updates } = parseApplyJson(text);
      const payload: { text: string; updates?: UpdatesPayload } = { text: cleanText || text };
      if (Object.keys(updates).length > 0) payload.updates = updates;
      return NextResponse.json(payload);
    }

    return NextResponse.json({ error: "Invalid provider." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

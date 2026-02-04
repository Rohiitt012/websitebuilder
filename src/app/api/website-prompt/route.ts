import { NextRequest, NextResponse } from "next/server";

const PROMPT_LABELS: Record<string, string> = {
  "fashion-designer": "Fashion Designer",
  "business-website": "Business Website",
  "food-delivery": "Food Delivery Website",
  "mobile-friendly": "Mobile Friendly Design",
  "adaptive-layouts": "Adaptive Layouts",
  "fast-performance": "Fast Performance",
  "cross-device": "Cross Device Support",
};

/**
 * Website prompt API – uses GEMINI_API_KEY, OPENAI_API_KEY, or XAI_API_KEY from .env.
 * Call with ?provider=gemini|chatgpt|grok and ?prompt=fashion-designer | business-website | etc.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = (searchParams.get("provider") ?? "gemini").toLowerCase();
  const promptId = searchParams.get("prompt") ?? "";
  const label = PROMPT_LABELS[promptId] ?? promptId || "Website";

  if (provider === "chatgpt") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not set. Add it in .env (see .env.example)." },
        { status: 503 }
      );
    }
    return NextResponse.json({
      ok: true,
      provider: "chatgpt",
      message: "OpenAI API key is set. Use this endpoint to generate content for: " + label,
      promptId,
      label,
    });
  }

  if (provider === "grok") {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "XAI_API_KEY not set. Add it in .env (see .env.example)." },
        { status: 503 }
      );
    }
    return NextResponse.json({
      ok: true,
      provider: "grok",
      message: "xAI (Grok) API key is set. Use this endpoint to generate content for: " + label,
      promptId,
      label,
    });
  }

  if (provider === "none") {
    return NextResponse.json({
      ok: true,
      provider: "none",
      message: "No AI provider selected.",
      promptId,
      label,
    });
  }

  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not set. Add it in .env (see .env.example)." },
        { status: 503 }
      );
    }
    return NextResponse.json({
      ok: true,
      provider: "gemini",
      message: "Gemini API key is set. Use this endpoint to generate content for: " + label,
      promptId,
      label,
    });
  }

  return NextResponse.json({ error: "Invalid provider. Use gemini, chatgpt, grok, or none." }, { status: 400 });
}

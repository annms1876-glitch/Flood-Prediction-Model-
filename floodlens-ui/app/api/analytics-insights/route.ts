import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ADMIN_EMAIL = "somenbarik75@gmail.com";

export async function POST(request: Request) {
  if (request.headers.get("x-umeed-admin-email") !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
  }

  const snapshot = await request.json();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are a flood-monitoring decision-support analyst. Analyze only this locked telemetry snapshot. Do not invent readings. Return valid JSON with exactly these keys: summary (string), trends (string array), recommendations (string array). Keep the summary under 70 words, trends to 3 items, and recommendations to 3 operational actions. Mention uncertainty when appropriate. Snapshot: ${JSON.stringify(snapshot)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: { temperature: 0.2, responseMimeType: "application/json" },
    });
    const raw = response.text || "{}";
    const parsed = JSON.parse(raw) as { summary?: string; trends?: string[]; recommendations?: string[] };
    return NextResponse.json({
      summary: parsed.summary || "The model returned no summary.",
      trends: Array.isArray(parsed.trends) ? parsed.trends.slice(0, 3) : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 3) : [],
    });
  } catch (error) {
    console.error("Analytics insight generation failed", error);
    return NextResponse.json({ error: "Unable to generate analytics insights" }, { status: 502 });
  }
}

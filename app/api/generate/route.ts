import { NextResponse } from "next/server";
import { getGeminiClient, WORLD_GENERATION_PROMPT } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: WORLD_GENERATION_PROMPT + "\n\nUser's world description: " + prompt }] },
      ],
    });

    const text = response.text ?? "";
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const world = JSON.parse(cleaned);
    return NextResponse.json(world);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

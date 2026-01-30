import { NextResponse } from "next/server";
import { getGeminiClient, CHAT_EXPANSION_PROMPT } from "@/lib/gemini";
import type { WorldData } from "@/lib/world-types";

export async function POST(req: Request) {
  try {
    const { message, world } = (await req.json()) as { message: string; world: WorldData };
    const ai = getGeminiClient();

    const systemPrompt = CHAT_EXPANSION_PROMPT.replace("{WORLD_STATE}", JSON.stringify(world));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\nUser says: " + message }] },
      ],
    });

    const text = response.text ?? "";
    const parts = text.split("---WORLD_UPDATE---");
    const reply = parts[0].trim();
    let newObjects = [];

    if (parts[1]) {
      try {
        const cleaned = parts[1].replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        newObjects = JSON.parse(cleaned);
      } catch {
        // No valid objects to add
      }
    }

    return NextResponse.json({ reply, newObjects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

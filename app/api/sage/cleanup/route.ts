import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: `Clean up this voice-to-text transcript. Fix grammar, remove repeated words, make it read naturally. Keep the meaning and intent exactly the same. Do not add any new ideas or information. Return ONLY the cleaned text, nothing else.\n\nTranscript:\n${text.slice(0, 2000)}` }],
    });
    const cleaned = response.content[0].type === "text" ? response.content[0].text : text;
    return NextResponse.json({ cleaned });
  } catch (e: any) {
    return NextResponse.json({ cleaned: text, error: e.message });
  }
}

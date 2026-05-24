import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOne, query } from "@/lib/db";
import { searchLennyChunks } from "@/lib/embeddings";
import { callClaudeJSON } from "@/lib/claude";
import { getFounderProfile, updateProfileAfterSage } from "@/lib/profile";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const { input_text, input_type } = await req.json();

  if (!input_text || input_text.trim().length < 20) {
    return NextResponse.json({ error: "Please provide more detail" }, { status: 400 });
  }

  const truncatedInput = input_text.slice(0, 8000);
  const user = await getOne("SELECT * FROM users WHERE id = $1", [userId]);
  const profile = await getFounderProfile(userId);

  // Search for relevant Lenny chunks
  let chunks: any[] = [];
  try {
    chunks = await searchLennyChunks(truncatedInput, 12);
  } catch (searchError) {
    console.error("Chunk search failed:", searchError);
    // Continue with empty chunks — Claude can still give general advice
  }

  // Group by guest (max 4 guests, best chunks from each)
  const guestChunks: Record<string, any[]> = {};
  for (const chunk of chunks) {
    const guest = chunk.guest || "Unknown";
    if (!guestChunks[guest]) guestChunks[guest] = [];
    if (guestChunks[guest].length < 2) guestChunks[guest].push(chunk);
  }

  const formattedChunks = Object.entries(guestChunks)
    .slice(0, 4)
    .map(([guest, chks]) =>
      chks.map((c: any) => `[${guest} — "${c.title}"]\n${c.content}`).join("\n\n")
    ).join("\n\n---\n\n");

  let analysis;
  try {
    analysis = await callClaudeJSON(
    `You are The Sage, an expert product advisor powered by the collective wisdom of 300+ conversations with the world's best product builders from Lenny Rachitsky's podcast.

Analyze this founder's real situation and identify 2-3 SPECIFIC blind spots they are likely missing. Each blind spot must be:
1. Grounded in a specific insight from the retrieved podcast segments below
2. Directly relevant to the founder's situation
3. Actionable — a specific thing they should investigate or reconsider

For each blind spot, cite the specific guest and their insight. Do NOT give generic advice.

The founder's profile:
Stage: ${user?.stage || "unknown"}, Business model: ${user?.business_model || "unknown"}, Team: ${user?.team_size || "unknown"}
Current challenge: ${user?.current_challenge || "not specified"}
Known blind spots: ${JSON.stringify(profile?.blind_spots || [])}

${chunks.length === 0 ? "Note: No specific podcast segments were retrieved. Provide general product wisdom based on common patterns from Lenny's Podcast guests." : ""}

Respond in this exact JSON format:
{
  "blind_spots": [
    {
      "title": "One sentence identifying the blind spot",
      "explanation": "2-3 sentences explaining why this matters for their specific situation",
      "guest": "Guest Name",
      "episode": "Episode Title",
      "guest_insight": "1-2 sentences paraphrasing what the guest said about this"
    }
  ],
  "tendency_detected": "One sentence about what this reveals about their decision-making",
  "decision_category": "one of: growth, positioning, pricing, hiring, product, gtm, retention, fundraising",
  "next_steps": [
    "Specific action step 1 — what to do this week",
    "Specific action step 2 — who to talk to or what to measure",
    "Specific action step 3 — what to track over 30 days"
  ]
}`,
    `FOUNDER'S INPUT:\n${truncatedInput}\n\n${formattedChunks ? `RELEVANT WISDOM FROM LENNY'S ARCHIVE:\n${formattedChunks}` : "No specific segments retrieved."}`,
    1024
    );
  } catch (parseError: any) {
    console.error("Claude parse error:", parseError?.message || parseError);
    console.error("Full error:", JSON.stringify(parseError, null, 2));
    return NextResponse.json({
      blind_spots: [{
        title: "The Sage needs a moment",
        explanation: `Error: ${parseError?.message || "Unknown error"}. Try rephrasing your input with more specific context about the decision you're facing.`,
        guest: "The Sage",
        episode: "",
        guest_insight: "Sometimes the most useful thing is to reframe the question."
      }],
      tendency_detected: "Unable to detect pattern from this input — try providing more context.",
      decision_category: "product"
    });
  }

  // Save session
  try {
    await query(
      `INSERT INTO sage_sessions (user_id, input_type, input_text, sage_analysis, decision_category)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, input_type || "paste", input_text, JSON.stringify(analysis), analysis.decision_category]
    );
  } catch (saveError) {
    console.error("Failed to save sage session:", saveError);
    // Don't fail the request — still return the analysis
  }

  // Update profile
  try {
    await updateProfileAfterSage(userId, analysis.tendency_detected, analysis.decision_category);
  } catch (profileError) {
    console.error("Failed to update profile:", profileError);
  }

  return NextResponse.json(analysis);
}

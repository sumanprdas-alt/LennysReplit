import { NextRequest, NextResponse } from "next/server";
import { getOne, getMany, query } from "@/lib/db";
import { searchLennyChunks } from "@/lib/embeddings";
import { callClaudeJSON } from "@/lib/claude";
import { getFounderProfile } from "@/lib/profile";

// Eval endpoint — accepts EVAL_SECRET header instead of session
// This lets the eval script test the full pipeline without NextAuth
export async function POST(req: NextRequest) {
  const evalSecret = req.headers.get("x-eval-secret");
  if (evalSecret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, input_text, email } = await req.json();

  // Get user by email
  const user = await getOne("SELECT * FROM users WHERE email = $1", [email]);

  if (action === "sage") {
    const truncatedInput = input_text.slice(0, 8000);
    const profile = user ? await getFounderProfile(user.id) : null;

    let chunks: any[] = [];
    try {
      chunks = await searchLennyChunks(truncatedInput, 12);
    } catch (e) {
      console.error("Chunk search failed:", e);
    }

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

    try {
      const analysis = await callClaudeJSON(
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
  "decision_category": "one of: growth, positioning, pricing, hiring, product, gtm, retention, fundraising"
}`,
        `FOUNDER'S INPUT:\n${truncatedInput}\n\nRELEVANT WISDOM FROM LENNY'S ARCHIVE:\n${formattedChunks || "No specific segments retrieved."}`,
        1024
      );
      return NextResponse.json({ ...analysis, chunks_found: chunks.length, guests_cited: Object.keys(guestChunks).length });
    } catch (e: any) {
      return NextResponse.json({ error: e.message, chunks_found: chunks.length });
    }
  }

  if (action === "profile") {
    if (!user) return NextResponse.json({ error: "User not found" });
    const profile = await getFounderProfile(user.id);
    const recentSage = await getMany("SELECT * FROM sage_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5", [user.id]);
    const recentScenarios = await getMany(
      `SELECT sr.*, s.guest, s.decision_category FROM scenario_responses sr 
       JOIN scenarios s ON sr.scenario_id = s.id WHERE sr.user_id = $1 ORDER BY sr.created_at DESC LIMIT 5`, [user.id]);
    return NextResponse.json({ user, profile, recent_sage: recentSage, recent_scenarios: recentScenarios });
  }

  if (action === "scenarios") {
    const scenarios = await getMany("SELECT id, scenario_id, guest, decision_category, situation FROM scenarios LIMIT 18");
    return NextResponse.json({ scenarios, count: scenarios.length });
  }

  if (action === "stats") {
    const chunks = await getOne("SELECT count(*) as count FROM lenny_chunks WHERE embedding IS NOT NULL");
    const scenarios = await getOne("SELECT count(*) as count FROM scenarios");
    const users = await getOne("SELECT count(*) as count FROM users");
    const sessions = await getOne("SELECT count(*) as count FROM sage_sessions");
    return NextResponse.json({ chunks: chunks.count, scenarios: scenarios.count, users: users.count, sage_sessions: sessions.count });
  }

  return NextResponse.json({ error: "Unknown action" });
}

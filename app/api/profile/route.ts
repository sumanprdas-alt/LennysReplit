import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOne, getMany } from "@/lib/db";
import { getFounderProfile } from "@/lib/profile";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const user = await getOne("SELECT * FROM users WHERE id = $1", [userId]);
  const profile = await getFounderProfile(userId);

  // Recent scenario responses
  const recentScenarios = await getMany(
    `SELECT sr.*, s.situation, s.decision_category, s.guest
     FROM scenario_responses sr
     JOIN scenarios s ON s.id = sr.scenario_id
     WHERE sr.user_id = $1
     ORDER BY sr.created_at DESC
     LIMIT 10`,
    [userId]
  );

  // Recent sage sessions
  const recentSage = await getMany(
    `SELECT id, input_type, input_text, sage_analysis, decision_category, created_at
     FROM sage_sessions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId]
  );

  return NextResponse.json({
    user: {
      name: user.name,
      stage: user.stage,
      business_model: user.business_model,
      domain: user.domain,
      team_size: user.team_size,
      current_challenge: user.current_challenge,
    },
    profile,
    recent_scenarios: recentScenarios,
    recent_sage_sessions: recentSage,
  });
}

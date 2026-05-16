import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOne } from "@/lib/db";
import { getContextualScenario } from "@/lib/scenarios";
import { getFounderProfile } from "@/lib/profile";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const user = await getOne("SELECT * FROM users WHERE id = $1", [userId]);
  const profile = await getFounderProfile(userId);

  const scenario = await getContextualScenario(userId, {
    stage: user.stage || "seed",
    business_model: user.business_model || "b2b-saas",
    domain: user.domain || "",
    team_size: user.team_size || "2-5",
    blind_spots: profile?.blind_spots || [],
  });

  if (!scenario) {
    return NextResponse.json({ error: "No scenarios available" }, { status: 404 });
  }

  // Don't send what_happened or lesson — that's the reveal
  return NextResponse.json({
    id: scenario.id,
    scenario_id: scenario.scenario_id,
    situation: scenario.situation,
    options: scenario.options,
    decision_category: scenario.decision_category,
    guest: scenario.guest,
    market_anchor: scenario.market_anchor,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOne, query } from "@/lib/db";
import { callClaude } from "@/lib/claude";
import { updateProfileAfterScenario } from "@/lib/profile";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const { scenario_id, chosen_option, reasoning } = await req.json();

  const scenario = await getOne("SELECT * FROM scenarios WHERE id = $1", [scenario_id]);
  if (!scenario) return NextResponse.json({ error: "Scenario not found" }, { status: 404 });

  const user = await getOne("SELECT * FROM users WHERE id = $1", [userId]);

  // Save response
  await query(
    `INSERT INTO scenario_responses (user_id, scenario_id, chosen_option, reasoning)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, scenario_id) DO UPDATE SET chosen_option = $3, reasoning = $4`,
    [userId, scenario_id, chosen_option, reasoning || ""]
  );

  // Get personalized insight from Claude
  const insight = await callClaude(
    `You are The Sage, a product judgment coach. A founder just made a product decision in a scenario exercise. Based on their choice and the actual outcome, give them ONE specific, generous insight about their decision-making tendency. Be direct but warm — make them feel smarter, not judged. Two sentences maximum.`,
    `Scenario: ${scenario.situation}
Their choice: Option ${chosen_option}
What actually happened: ${scenario.what_happened}
Their stage: ${user.stage}
Their domain: ${user.business_model}
Category: ${scenario.decision_category}
${reasoning ? `Their reasoning: ${reasoning}` : ""}`,
    256
  );

  // Update profile
  const updatedProfile = await updateProfileAfterScenario(
    userId,
    scenario.decision_category,
    insight
  );

  return NextResponse.json({
    what_happened: scenario.what_happened,
    lesson: scenario.lesson,
    guest: scenario.guest,
    episode_title: scenario.episode_title,
    personal_insight: insight,
    updated_profile: updatedProfile,
  });
}

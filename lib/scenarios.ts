import { getOne, getMany } from "./db";

interface UserProfile {
  stage: string;
  business_model: string;
  domain: string;
  team_size: string;
  blind_spots: string[];
}

export async function getContextualScenario(userId: number, profile: UserProfile) {
  // Get completed scenario IDs
  const completed = await getMany(
    "SELECT scenario_id FROM scenario_responses WHERE user_id = $1",
    [userId]
  );
  const completedIds = completed.map((r: any) => r.scenario_id);

  // Get all scenarios
  const allScenarios = await getMany("SELECT * FROM scenarios");

  // Filter out completed ones
  let available = allScenarios.filter(
    (s: any) => !completedIds.includes(s.id)
  );

  if (available.length === 0) {
    // All scenarios completed — reset (or return null)
    available = allScenarios;
  }

  // Score each scenario by relevance to user profile
  const scored = available.map((s: any) => {
    let score = 0;
    const tags = s.context_tags;

    // Stage match (highest weight)
    if (tags.stage && tags.stage.includes(profile.stage)) score += 3;

    // Domain match
    if (tags.domain && tags.domain.includes(profile.business_model)) score += 2;

    // Team size match
    if (tags.team_size && tags.team_size.includes(profile.team_size)) score += 1;

    // Blind spot targeting — prefer scenarios in weak categories
    if (profile.blind_spots && profile.blind_spots.includes(s.decision_category)) {
      score += 4; // Highest boost for targeting blind spots
    }

    return { ...s, relevance_score: score };
  });

  // Sort by relevance, then pick randomly among top candidates
  scored.sort((a: any, b: any) => b.relevance_score - a.relevance_score);

  // Get top 5 most relevant
  const topCandidates = scored.slice(0, Math.min(5, scored.length));

  // Pick randomly among them
  const picked = topCandidates[Math.floor(Math.random() * topCandidates.length)];

  return picked;
}

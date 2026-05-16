import { getOne, getMany, query } from "./db";

export async function getFounderProfile(userId: number) {
  let profile = await getOne(
    "SELECT * FROM founder_profiles WHERE user_id = $1",
    [userId]
  );

  if (!profile) {
    await query(
      "INSERT INTO founder_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
      [userId]
    );
    profile = await getOne(
      "SELECT * FROM founder_profiles WHERE user_id = $1",
      [userId]
    );
  }

  return profile;
}

export async function updateProfileAfterScenario(
  userId: number,
  category: string,
  insight: string
) {
  const profile = await getFounderProfile(userId);

  // Get all responses for this user to compute fresh scores
  const responses = await getMany(
    `SELECT sr.chosen_option, s.decision_category, s.options
     FROM scenario_responses sr
     JOIN scenarios s ON s.id = sr.scenario_id
     WHERE sr.user_id = $1`,
    [userId]
  );

  const totalScenarios = responses.length;

  // Compute per-category scores
  const categoryGroups: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  for (const r of responses) {
    const cat = r.decision_category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    // For now, every response counts as engagement (we don't have "correct" answers)
    categoryGroups[cat] = (categoryGroups[cat] || 0) + 1;
  }

  // Identify blind spots (categories with fewest responses or lowest engagement)
  const allCategories = ['growth', 'positioning', 'pricing', 'hiring', 'product', 'gtm', 'retention', 'fundraising'];
  const blindSpots = allCategories
    .filter(cat => !categoryCounts[cat] || categoryCounts[cat] < 2)
    .slice(0, 3);

  // Calibration score — for now, based on total engagement
  const calibrationScore = Math.min(100, totalScenarios * 8 + 20);

  // Category scores as percentages
  const categoryScores: Record<string, number> = {};
  for (const cat of allCategories) {
    if (categoryCounts[cat]) {
      categoryScores[cat] = Math.min(100, categoryCounts[cat] * 15 + 30);
    }
  }

  await query(
    `UPDATE founder_profiles
     SET calibration_score = $1,
         category_scores = $2,
         blind_spots = $3,
         tendencies = $4,
         total_scenarios = $5,
         updated_at = NOW()
     WHERE user_id = $6`,
    [
      calibrationScore,
      JSON.stringify(categoryScores),
      JSON.stringify(blindSpots),
      insight || profile.tendencies,
      totalScenarios,
      userId,
    ]
  );

  return {
    calibration_score: calibrationScore,
    category_scores: categoryScores,
    blind_spots: blindSpots,
    tendencies: insight,
    total_scenarios: totalScenarios,
  };
}

export async function updateProfileAfterSage(
  userId: number,
  tendencyDetected: string,
  category: string
) {
  const profile = await getFounderProfile(userId);

  await query(
    `UPDATE founder_profiles
     SET total_sage_sessions = total_sage_sessions + 1,
         tendencies = $1,
         updated_at = NOW()
     WHERE user_id = $2`,
    [tendencyDetected || profile.tendencies, userId]
  );
}

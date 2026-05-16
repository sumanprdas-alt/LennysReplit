const { Pool } = require("pg");
const scenarios = require("../scenarios.json");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log(`Seeding ${scenarios.scenarios.length} scenarios...`);

  for (const s of scenarios.scenarios) {
    try {
      await pool.query(
        `INSERT INTO scenarios (scenario_id, situation, context_tags, options, what_happened, guest, episode_title, decision_category, lesson, market_anchor)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (scenario_id) DO NOTHING`,
        [
          s.id,
          s.situation,
          JSON.stringify(s.context_tags),
          JSON.stringify(s.options),
          s.what_happened,
          s.guest,
          s.episode_title,
          s.decision_category,
          s.lesson,
          s.market_anchor || "",
        ]
      );
      console.log(`  ✓ ${s.id}`);
    } catch (err) {
      console.error(`  ✗ ${s.id}: ${err.message}`);
    }
  }

  console.log("Done!");
  process.exit(0);
}

seed();

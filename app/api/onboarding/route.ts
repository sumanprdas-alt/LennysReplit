import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stage, business_model, domain, team_size, current_challenge } = await req.json();
  const userId = Number((session.user as any).id);

  await query(
    `UPDATE users SET stage = $1, business_model = $2, domain = $3,
     team_size = $4, current_challenge = $5,
     updated_at = NOW()
     WHERE id = $6`,
    [stage, business_model, domain, team_size, current_challenge, userId]
  );

  // Create founder profile
  await query(
    `INSERT INTO founder_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );

  return NextResponse.json({ success: true });
}

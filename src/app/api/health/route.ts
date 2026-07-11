import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const checkDatabase =
    new URL(request.url).searchParams.get("database") === "true";
  if (!checkDatabase) return NextResponse.json({ status: "ok" });

  try {
    const { getDatabase } = await import("@/db/client");
    await getDatabase().execute(sql`select 1`);
    return NextResponse.json({ status: "ok", database: "ready" });
  } catch {
    return NextResponse.json(
      { status: "degraded", database: "unavailable" },
      { status: 503 },
    );
  }
}

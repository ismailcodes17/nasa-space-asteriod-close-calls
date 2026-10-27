import { NextResponse } from "next/server";
import { loadApod } from "@/lib/nasa";

export async function GET(_request: Request, context: { params: Promise<{ day: string }> }) {
  const { day } = await context.params;
  try {
    return NextResponse.json(await loadApod(day));
  } catch (error) {
    const message = error instanceof Error ? error.message : "NASA APOD request failed";
    const status = message.includes("not found") ? 404 : 502;
    return NextResponse.json({ detail: message }, { status });
  }
}

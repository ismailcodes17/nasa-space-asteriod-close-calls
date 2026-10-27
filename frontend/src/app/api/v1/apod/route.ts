import { NextResponse } from "next/server";
import { loadApod } from "@/lib/nasa";

export async function GET() {
  try {
    return NextResponse.json(await loadApod());
  } catch (error) {
    const message = error instanceof Error ? error.message : "NASA APOD request failed";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}

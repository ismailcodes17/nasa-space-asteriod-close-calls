import { NextResponse } from "next/server";
import { loadAsteroids } from "@/lib/nasa";

export async function GET(request: Request) {
  const sort = new URL(request.url).searchParams.get("sort") || "distance";
  try {
    return NextResponse.json(await loadAsteroids(sort));
  } catch (error) {
    const message = error instanceof Error ? error.message : "NASA asteroid request failed";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}

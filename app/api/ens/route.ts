import { NextRequest, NextResponse } from "next/server";
import { resolveENSName } from "@/lib/providers/alchemy";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim().toLowerCase();

  if (!name) {
    return NextResponse.json(
      { error: "name query parameter is required" },
      { status: 400 }
    );
  }

  // Basic ENS format check — must contain a dot
  if (!name.includes(".")) {
    return NextResponse.json(
      { error: "Invalid ENS name format" },
      { status: 400 }
    );
  }

  try {
    const address = await resolveENSName(name);

    if (!address) {
      return NextResponse.json(
        { error: `ENS name "${name}" could not be resolved` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { name, address },
      {
        headers: {
          // ENS records change rarely — cache for 10 minutes
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to resolve ENS name" },
      { status: 500 }
    );
  }
}

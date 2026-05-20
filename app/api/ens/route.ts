import { NextRequest, NextResponse } from "next/server";
import { resolveENSName } from "@/lib/providers/alchemy";

// ─── Validation ───────────────────────────────────────────────────────────────

const MAX_ENS_LENGTH = 255;

/**
 * Validates a normalised (lowercased) ENS name.
 * Rules:
 *   - At least two labels separated by dots (e.g. "foo.eth")
 *   - Each label: starts/ends with alphanumeric, may contain hyphens in the middle
 *   - Total length ≤ 255 characters
 */
const ENS_NAME_RE =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$|^[a-z0-9]\.[a-z0-9]+$/;

function isValidENSFormat(name: string): boolean {
  if (name.length > MAX_ENS_LENGTH) return false;
  if (!name.includes(".")) return false;
  // Each label must be non-empty and contain only alphanumeric / hyphens
  const labels = name.split(".");
  return labels.every((label) => label.length > 0 && /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(label));
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("name");

  if (!raw || !raw.trim()) {
    return NextResponse.json(
      { error: "name query parameter is required" },
      { status: 400 }
    );
  }

  const name = raw.trim().toLowerCase();

  if (!isValidENSFormat(name)) {
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

import { NextRequest, NextResponse } from "next/server";
import { getCurrentNetWorth, listNetWorthSnapshots, recordNetWorth, saveNetWorthSources } from "@/lib/financial-holdings/net-worth-data";
import { validDate, validSources } from "@/lib/financial-holdings/net-worth";

export const dynamic = "force-dynamic";

function failure(error: unknown) {
  if (error instanceof Error && (error.name === "ConditionalCheckFailedException" || error.name === "TransactionCanceledException" || error.message === "NetWorthConflict")) {
    return NextResponse.json({ error: "Balances changed in another session. Reload the page before trying again." }, { status: 409 });
  }
  if (error instanceof Error && error.message === "NetWorthEmpty") return NextResponse.json({ error: "Add a source before recording." }, { status: 400 });
  console.error("Net worth storage request failed", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: "Unable to access net worth storage. Please try again." }, { status: 503 });
}

export async function GET() {
  try {
    const [current, snapshots] = await Promise.all([getCurrentNetWorth(), listNetWorthSnapshots()]);
    return NextResponse.json({ ...current, snapshots }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!Number.isSafeInteger(body?.revision) || body.revision < 0 || body.revision >= Number.MAX_SAFE_INTEGER || !validSources(body?.sources)) {
    return NextResponse.json({ error: "Enter valid sources and rates (up to 100 sources)." }, { status: 400 });
  }
  try { return NextResponse.json(await saveNetWorthSources(body.sources, body.revision)); }
  catch (error) { return failure(error); }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!validDate(body?.date) || !Number.isSafeInteger(body?.revision) || body.revision < 0 || body.revision >= Number.MAX_SAFE_INTEGER) {
    return NextResponse.json({ error: "A valid date and revision are required." }, { status: 400 });
  }
  try { return NextResponse.json(await recordNetWorth(body.date, body.revision), { status: 201 }); }
  catch (error) { return failure(error); }
}

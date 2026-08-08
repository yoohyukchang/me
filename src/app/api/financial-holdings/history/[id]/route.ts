import { NextRequest, NextResponse } from "next/server";
import { deleteHistoryEntry, updateHistoryEntry } from "@/lib/financial-holdings/data";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const update: {
    date?: string;
    netContribution?: number;
    portfolioValue?: number;
  } = {};

  if (body?.date !== undefined) {
    if (typeof body.date !== "string" || body.date.trim().length === 0) {
      return NextResponse.json({ error: "Date cannot be empty" }, { status: 400 });
    }
    update.date = body.date.trim();
  }

  if (body?.netContribution !== undefined) {
    const netContribution = Number(body.netContribution);
    if (!Number.isFinite(netContribution)) {
      return NextResponse.json({ error: "Net contribution must be a number" }, { status: 400 });
    }
    update.netContribution = netContribution;
  }

  if (body?.portfolioValue !== undefined) {
    const portfolioValue = Number(body.portfolioValue);
    if (!Number.isFinite(portfolioValue) || portfolioValue < 0) {
      return NextResponse.json({ error: "Portfolio value must be a non-negative number" }, { status: 400 });
    }
    update.portfolioValue = portfolioValue;
  }

  await updateHistoryEntry(id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteHistoryEntry(id);
  return NextResponse.json({ ok: true });
}

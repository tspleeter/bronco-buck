import { NextResponse } from "next/server";
import { readDB } from "@/lib/dev-db";
import { SharedBuild } from "@/types/shared-build";

export async function GET(
  _req: Request,
  { params }: { params: { shareId: string } }
) {
  const db = readDB() as SharedBuild[];

  const item = db.find((b: SharedBuild) => b.shareId === params.shareId);

  if (!item) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
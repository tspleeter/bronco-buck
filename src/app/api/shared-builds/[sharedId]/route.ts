import { NextResponse } from "next/server";
import { readSharedBuildById } from "@/lib/dev-db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sharedId: string }> }
) {
  try {
    const { sharedId } = await params;
    const item = await readSharedBuildById(sharedId);

    if (!item) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (err) {
    console.error("Failed to read shared build:", err);
    return NextResponse.json(
      { message: "Failed to load shared build" },
      { status: 500 }
    );
  }
}
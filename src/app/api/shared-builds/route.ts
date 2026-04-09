import { NextResponse } from "next/server";
import { writeSharedBuild, readAllSharedBuilds } from "@/lib/dev-db";
import { SharedBuild } from "@/types/shared-build";

export async function GET() {
  try {
    const builds = await readAllSharedBuilds();
    return NextResponse.json(builds);
  } catch (err) {
    console.error("Failed to read shared builds:", err);
    return NextResponse.json(
      { message: "Failed to load shared builds" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const item: SharedBuild = {
      shareId: crypto.randomUUID(),
      buildName: body.buildName,
      productId: body.productId,
      productSlug: body.productSlug,
      productName: body.productName,
      selectedOptions: body.selectedOptions ?? {},
      customFields: body.customFields ?? {},
      price: Number(body.price ?? 0),
      createdAt: new Date().toISOString(),
      isFeatured: false,
    };

    await writeSharedBuild(item);

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Failed to create shared build:", err);
    return NextResponse.json(
      { message: "Failed to create shared build" },
      { status: 500 }
    );
  }
}

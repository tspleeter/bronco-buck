import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/dev-db";
import { SharedBuild } from "@/types/shared-build";

export async function GET() {
  const db = readDB();

  const sorted = [...db].sort((a, b) => {
    if ((a.isFeatured ?? false) !== (b.isFeatured ?? false)) {
      return a.isFeatured ? -1 : 1;
    }

    return String(b.createdAt).localeCompare(String(a.createdAt));
  });

  return NextResponse.json(sorted);
}

export async function POST(req: Request) {
  const body = await req.json();

  const db = readDB();

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

  db.unshift(item);
  writeDB(db);

  return NextResponse.json(item, { status: 201 });
}
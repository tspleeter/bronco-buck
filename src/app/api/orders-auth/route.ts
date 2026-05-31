import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ORDERS_PASSWORD = process.env.ORDERS_PASSWORD ?? "061970";
const COOKIE_NAME = "orders_auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== ORDERS_PASSWORD) {
    return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, ORDERS_PASSWORD, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}

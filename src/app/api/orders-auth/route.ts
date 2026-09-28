import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieValue,
  checkAdminPassword,
  getAdminPassword,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: undefined }));

  if (!(await getAdminPassword())) {
    return NextResponse.json(
      { message: "Admin login is not configured" },
      { status: 503 }
    );
  }

  if (!(await checkAdminPassword(password))) {
    return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, await adminCookieValue(password as string), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const gated =
    pathname.startsWith("/orders") || pathname.startsWith("/discounts");
  if (!gated) {
    return NextResponse.next();
  }

  // Already authenticated (fails closed if no password is configured)
  if (await isAdminRequest(request)) {
    return NextResponse.next();
  }

  // Login form submission
  if (request.method === "POST") {
    return NextResponse.next();
  }

  // Redirect to login
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/orders-login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/orders", "/orders/:path*", "/discounts", "/discounts/:path*"],
};

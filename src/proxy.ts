import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ORDERS_PASSWORD = process.env.ORDERS_PASSWORD ?? "061970";
const COOKIE_NAME = "orders_auth";

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/orders")) {
    return NextResponse.next();
  }

  // Already authenticated
  if (request.cookies.get(COOKIE_NAME)?.value === ORDERS_PASSWORD) {
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
  matcher: ["/orders", "/orders/:path*"],
};

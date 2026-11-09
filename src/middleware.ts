import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken, SESSION_COOKIE_NAME } from "@/lib/financial-management/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/financial-management/login";
  const isLoginApi = pathname === "/api/financial-management/login";
  const isPlaidWebhook = pathname === "/api/financial-management/plaid/webhook";
  if (isLoginPage || isLoginApi || isPlaidWebhook) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = await isValidSessionToken(token);

  if (authenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/financial-management")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/financial-management/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/financial-management/:path*", "/api/financial-management/:path*"],
};

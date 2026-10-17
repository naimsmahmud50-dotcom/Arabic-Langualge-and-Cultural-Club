/**
 * @file src/middleware.ts
 * @description Next.js Edge Middleware for Administrative Route Protection & RBAC Enforcement.
 * 
 * SECURITY ARCHITECTURE:
 * - Runs ahead of all `/admin/*` route handlers.
 * - Public routes (/admin/login, /admin/forgot-password, /admin/reset-password, /admin/forbidden)
 *   are permitted through without session token verification.
 * - All other `/admin/*` routes require a valid, non-expired, HMAC-verified session cookie.
 * - Enforces least-privilege route permissions at the edge before pages or server components render.
 * - Forwards authenticated user context via request headers (`x-user-id`, `x-user-role`).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySignedToken, SESSION_COOKIE_NAME } from "./lib/auth/token";
import { canAccessRoute } from "./lib/auth/rbac";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Only process /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // 2. Public auth routes inside /admin are exempt from authentication guards
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password" ||
    pathname === "/admin/forbidden"
  ) {
    return NextResponse.next();
  }

  // 3. Extract session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Cryptographically verify session token
  const payload = await verifySignedToken(sessionCookie.value);
  if (!payload) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "session_expired");
    loginUrl.searchParams.set("next", pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // 5. Evaluate Role-Based Access Control policy for this route
  const isAuthorized = canAccessRoute(payload.role, pathname);
  if (!isAuthorized) {
    const forbiddenUrl = new URL("/admin/forbidden", request.url);
    forbiddenUrl.searchParams.set("from", pathname);
    forbiddenUrl.searchParams.set("role", payload.role);
    return NextResponse.redirect(forbiddenUrl);
  }

  // 6. Forward authenticated user metadata to server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.uid);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-email", payload.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};

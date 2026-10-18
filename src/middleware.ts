/**
 * @file src/middleware.ts
 * @description Next.js Edge Middleware for Administrative Route Protection & RBAC Enforcement.
 * 
 * DEVELOPER NOTE:
 * - Runs ahead of both administrative page routes (`/admin/*`) and administrative API endpoints (`/api/admin/*`).
 * - Public auth routes (/admin/login, /admin/forgot-password, /admin/reset-password, /admin/forbidden)
 *   are permitted through without session token verification.
 * - For web routes (`/admin/*`), unauthenticated visitors are redirected to `/admin/login?next=...`.
 * - For API routes (`/api/admin/*`), unauthenticated or unauthorized callers receive immediate JSON 401/403.
 * - Cryptographically verifies HMAC-SHA256 session signatures at the edge.
 * - Evaluates Role-Based Access Control policy matrix before server handlers execute.
 * - Forwards authenticated user context via request headers (`x-user-id`, `x-user-role`, `x-user-email`).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySignedToken, SESSION_COOKIE_NAME } from "./lib/auth/token";
import { canAccessRoute } from "./lib/auth/rbac";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/admin");
  const isAdminRoute = pathname.startsWith("/admin");

  // 1. Only process /admin and /api/admin routes
  if (!isAdminRoute && !isApiRoute) {
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
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Unauthorized: Active administrative session required." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Cryptographically verify session token
  const payload = await verifySignedToken(sessionCookie.value);
  if (!payload) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Unauthorized: Session is invalid or has expired." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "session_expired");
    loginUrl.searchParams.set("next", pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // 5. Evaluate Role-Based Access Control policy
  // For API routes, map /api/admin/audit-logs/... to /admin/audit-logs to match RBAC route tree
  const routeToCheck = isApiRoute ? pathname.replace(/^\/api/, "") : pathname;
  const isAuthorized = canAccessRoute(payload.role, routeToCheck);

  if (!isAuthorized) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient role permissions for this endpoint." },
        { status: 403 }
      );
    }
    const forbiddenUrl = new URL("/admin/forbidden", request.url);
    forbiddenUrl.searchParams.set("from", pathname);
    forbiddenUrl.searchParams.set("role", payload.role);
    return NextResponse.redirect(forbiddenUrl);
  }

  // 6. Forward authenticated user metadata to server components & route handlers
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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

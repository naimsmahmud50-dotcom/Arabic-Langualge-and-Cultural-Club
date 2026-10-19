/**
 * @file src/middleware.ts
 * @description Next.js Edge Middleware for Administrative Route Protection, RBAC Enforcement & Subdomain Routing.
 * 
 * DEVELOPER NOTE:
 * - Supports Dual-Mode Admin Access:
 *   1. Dedicated Subdomain (e.g. `admin.arabicclub.org` or `admin.localhost:3005`):
 *      - Requests to `/` rewrite internally to `/admin`.
 *      - Requests to clean paths (`/settings`, `/events`, `/gallery`, `/login`) rewrite to `/admin/*`.
 *   2. Path-based Admin Access (`/admin/*` and `/api/admin/*`):
 *      - Full backward-compatibility for direct `/admin` routes on the primary domain or IP.
 * - Public auth routes (/admin/login, /admin/forgot-password, /admin/reset-password, /admin/forbidden)
 *   are permitted through without session token verification.
 * - Unauthenticated visitors are redirected to the respective login route (`/login` on subdomain, `/admin/login` otherwise).
 * - Administrative API routes (`/api/admin/*`) return immediate JSON 401/403 to unauthenticated/unauthorized callers.
 * - Cryptographically verifies HMAC-SHA256 session signatures at the edge.
 * - Evaluates Role-Based Access Control (RBAC) policy matrix before server handlers execute.
 * - Forwards authenticated user context via request headers (`x-user-id`, `x-user-role`, `x-user-email`).
 * Strictly human vibe; zero AI emojis.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySignedToken, SESSION_COOKIE_NAME } from "./lib/auth/token";
import { canAccessRoute } from "./lib/auth/rbac";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostWithoutPort = host.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // 1. Detect if the request arrives via a dedicated admin subdomain
  const configuredAdminDomain = process.env.ADMIN_DOMAIN?.toLowerCase();
  const isAdminSubdomain = 
    hostWithoutPort.startsWith("admin.") ||
    (Boolean(configuredAdminDomain) && hostWithoutPort === configuredAdminDomain);

  // Determine effective admin paths
  const isDirectAdminRoute = pathname.startsWith("/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin");

  // If not on an admin subdomain and not accessing an admin route, pass through immediately
  if (!isAdminSubdomain && !isDirectAdminRoute && !isApiAdminRoute) {
    return NextResponse.next();
  }

  // Calculate target internal path
  let targetPath = pathname;
  if (isAdminSubdomain && !isDirectAdminRoute && !isApiAdminRoute) {
    targetPath = pathname === "/" ? "/admin" : `/admin${pathname}`;
  }

  const isPublicAuthRoute = 
    targetPath === "/admin/login" ||
    targetPath.startsWith("/admin/login/") ||
    targetPath === "/admin/forgot-password" ||
    targetPath === "/admin/reset-password" ||
    targetPath === "/admin/forbidden";

  // 2. Extract and verify session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const payload = sessionCookie?.value ? await verifySignedToken(sessionCookie.value) : null;

  // 3. Handle public authentication routes
  if (isPublicAuthRoute) {
    // If user is already authenticated and visits login page, redirect to dashboard
    if (payload && (targetPath === "/admin/login" || targetPath.startsWith("/admin/login/"))) {
      const dashboardUrl = isAdminSubdomain 
        ? new URL("/", request.url)
        : new URL("/admin", request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Rewrite clean subdomain URL (e.g. admin.arabicclub.org/login -> /admin/login)
    if (isAdminSubdomain && !isDirectAdminRoute) {
      return NextResponse.rewrite(new URL(targetPath, request.url));
    }
    return NextResponse.next();
  }

  // 4. Guard protected routes: Reject unauthenticated requests
  if (!sessionCookie?.value) {
    if (isApiAdminRoute) {
      return NextResponse.json(
        { error: "Unauthorized: Active administrative session required." },
        { status: 401 }
      );
    }

    const loginUrl = isAdminSubdomain 
      ? new URL("/login", request.url)
      : new URL("/admin/login", request.url);

    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Guard invalid or expired sessions
  if (!payload) {
    if (isApiAdminRoute) {
      return NextResponse.json(
        { error: "Unauthorized: Session is invalid or has expired." },
        { status: 401 }
      );
    }

    const loginUrl = isAdminSubdomain 
      ? new URL("/login", request.url)
      : new URL("/admin/login", request.url);

    loginUrl.searchParams.set("error", "session_expired");
    loginUrl.searchParams.set("next", pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // 6. Evaluate Role-Based Access Control (RBAC) policy
  const routeToCheck = isApiAdminRoute ? pathname.replace(/^\/api/, "") : targetPath;
  const isAuthorized = canAccessRoute(payload.role, routeToCheck);

  if (!isAuthorized) {
    if (isApiAdminRoute) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient role permissions for this endpoint." },
        { status: 403 }
      );
    }

    const forbiddenUrl = isAdminSubdomain 
      ? new URL("/forbidden", request.url)
      : new URL("/admin/forbidden", request.url);

    forbiddenUrl.searchParams.set("from", pathname);
    forbiddenUrl.searchParams.set("role", payload.role);
    return NextResponse.redirect(forbiddenUrl);
  }

  // 7. Forward authenticated user metadata to server components & route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.uid);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-email", payload.email);

  // If on admin subdomain and clean path was used, rewrite internally to target /admin path
  if (isAdminSubdomain && !isDirectAdminRoute && !isApiAdminRoute) {
    return NextResponse.rewrite(new URL(targetPath, request.url), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, and public static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/).*)",
  ],
};

/**
 * @file src/app/api/health/route.ts
 * @route GET /api/health
 * @description Production Health Check and Uptime Probe.
 * 
 * DEVELOPER USAGE NOTE:
 * - Unauthenticated endpoint intended for load balancers, uptime monitors
 *   (e.g., BetterStack, UptimeRobot, Pingdom), and container orchestration probes.
 * - Performs an active read query on SQLite database to verify database connectivity.
 * - Returns HTTP 200 { status: "ok" } on success.
 * - Returns HTTP 503 { status: "degraded", error: ... } if database query fails.
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  try {
    // Probe database connectivity with lightweight read
    const settings = db.select({ id: siteSettings.id }).from(siteSettings).limit(1).all();
    const dbLatencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: "connected",
          engine: "sqlite",
          latencyMs: dbLatencyMs,
          tablesVerified: settings !== undefined,
        },
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    const dbLatencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: "error",
          error: error instanceof Error ? error.message : "Database connection failed",
          latencyMs: dbLatencyMs,
        },
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

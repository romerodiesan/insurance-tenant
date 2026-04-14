import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  TENANT_ID_HEADER,
  TENANT_SLUG_HEADER,
  resolveTenantByHost,
  resolveTenantBySlug
} from "@repo/tenant-core";
import { resolveTenantByCustomDomain } from "@/lib/domain-store";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/tenant"
]);

function isLocalOrLanHost(host: string | null): boolean {
  if (!host) return false;
  const normalized = host.toLowerCase().split(":")[0] ?? "";
  if (!normalized) return false;

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.endsWith(".local")
  ) {
    return true;
  }

  if (normalized.startsWith("10.") || normalized.startsWith("192.168.")) {
    return true;
  }

  const match = normalized.match(/^172\.(\d{1,2})\./);
  if (!match) return false;

  const secondOctet = Number(match[1]);
  return secondOctet >= 16 && secondOctet <= 31;
}

export default clerkMiddleware(async (auth, req) => {
  const rootDomain = process.env.ROOT_DOMAIN ?? "localhost";
  const devTenantSlug = process.env.DEV_TENANT_SLUG ?? "tenant-a";
  const host = req.headers.get("host");
  let tenant = resolveTenantByCustomDomain(host);

  if (!tenant) {
    tenant = resolveTenantByHost(host, rootDomain);
  }

  // In local development it is common to access by LAN IP/localhost without subdomain.
  // Use a controlled fallback tenant on local/LAN hosts to avoid missing-context crashes.
  if (!tenant && isLocalOrLanHost(host)) {
    tenant = resolveTenantBySlug(devTenantSlug);
  }

  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant not found or inactive." },
      { status: 404 }
    );
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(TENANT_ID_HEADER, tenant.id);
  requestHeaders.set(TENANT_SLUG_HEADER, tenant.slug);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:.*)$).*)", "/", "/(api|trpc)(.*)"]
};

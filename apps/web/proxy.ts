import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  TENANT_ID_HEADER,
  TENANT_SLUG_HEADER,
  resolveTenantByHost
} from "@repo/tenant-core";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/tenant"
]);

export default clerkMiddleware(async (auth, req) => {
  const rootDomain = process.env.ROOT_DOMAIN ?? "localhost";
  const host = req.headers.get("host");
  const tenant = resolveTenantByHost(host, rootDomain);

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

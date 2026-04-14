import { auth } from "@clerk/nextjs/server";
import {
  getTenantContextFromHeaders,
  resolveTenantByHost,
  resolveTenantBySlug
} from "@repo/tenant-core";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function resolveTenantContextWithFallback(requestHeaders: Headers) {
  try {
    return getTenantContextFromHeaders(requestHeaders);
  } catch {
    const host = requestHeaders.get("host");
    const rootDomain = process.env.ROOT_DOMAIN ?? "localhost";
    const fallbackSlug = process.env.DEV_TENANT_SLUG ?? "tenant-a";

    const tenantFromHost = resolveTenantByHost(host, rootDomain);
    const tenant = tenantFromHost ?? resolveTenantBySlug(fallbackSlug);

    if (!tenant) {
      throw new Error("Tenant context is unavailable and fallback tenant is invalid.");
    }

    return {
      id: tenant.id,
      slug: tenant.slug
    };
  }
}

export default async function HomePage() {
  const requestHeaders = await headers();
  const tenant = resolveTenantContextWithFallback(requestHeaders);
  const { userId } = await auth();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>FMO SaaS Platform</h1>
      <p>Tenant slug: {tenant.slug}</p>
      <p>Tenant ID: {tenant.id}</p>
      <p>Current user: {userId ?? "anonymous"}</p>
      <p>
        Core multi-tenant routing is active. Use subdomains like
        {" "}
        <code>tenant-a.localhost:3000</code> in local DNS/proxy.
      </p>
    </main>
  );
}

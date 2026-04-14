import { auth } from "@clerk/nextjs/server";
import { getTenantContextFromHeaders } from "@repo/tenant-core";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const requestHeaders = await headers();
  const tenant = getTenantContextFromHeaders(requestHeaders);
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

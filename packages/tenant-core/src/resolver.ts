import type { Tenant } from "@repo/types";

const defaultTenants: Tenant[] = [
  { id: "tenant_001", slug: "tenant-a", displayName: "Tenant A", status: "active" },
  { id: "tenant_002", slug: "tenant-b", displayName: "Tenant B", status: "active" },
  { id: "tenant_003", slug: "tenant-c", displayName: "Tenant C", status: "inactive" }
];

function normalizeHost(host: string | null): string {
  if (!host) return "";
  return host.toLowerCase().split(":")[0] ?? "";
}

function extractSubdomain(host: string, rootDomain: string): string | null {
  if (!host || !rootDomain) return null;
  if (host === rootDomain) return null;
  if (!host.endsWith(`.${rootDomain}`)) return null;

  const suffixLength = rootDomain.length + 1;
  const subdomain = host.slice(0, -suffixLength);
  return subdomain || null;
}

export function resolveTenantByHost(host: string | null, rootDomain: string): Tenant | null {
  const normalizedHost = normalizeHost(host);
  const normalizedRootDomain = normalizeHost(rootDomain);
  const slug = extractSubdomain(normalizedHost, normalizedRootDomain);
  if (!slug) return null;

  const tenant = defaultTenants.find((item) => item.slug === slug);
  if (!tenant || tenant.status !== "active") {
    return null;
  }

  return tenant;
}

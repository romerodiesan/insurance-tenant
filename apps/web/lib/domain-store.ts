import { resolveTenantBySlug } from "@repo/tenant-core";
import type { Tenant } from "@repo/types";

export type TenantDomainRecord = {
  domain: string;
  tenantSlug: string;
  verified: boolean;
  redirectTo?: string;
};

const domainStore = new Map<string, TenantDomainRecord>([
  [
    "tenant-a.localhost",
    {
      domain: "tenant-a.localhost",
      tenantSlug: "tenant-a",
      verified: true
    }
  ],
  [
    "tenant-b.localhost",
    {
      domain: "tenant-b.localhost",
      tenantSlug: "tenant-b",
      verified: true
    }
  ]
]);

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase();
}

function normalizeHost(host: string | null): string {
  if (!host) return "";
  return host.toLowerCase().split(":")[0] ?? "";
}

export function listTenantDomains(): TenantDomainRecord[] {
  return [...domainStore.values()];
}

export function getTenantDomain(domain: string): TenantDomainRecord | null {
  return domainStore.get(normalizeDomain(domain)) ?? null;
}

export function resolveTenantByCustomDomain(host: string | null): Tenant | null {
  const normalizedHost = normalizeHost(host);
  if (!normalizedHost) return null;

  const mapping = domainStore.get(normalizedHost);
  if (!mapping || !mapping.verified) {
    return null;
  }

  return resolveTenantBySlug(mapping.tenantSlug);
}

export function upsertTenantDomain(record: TenantDomainRecord): TenantDomainRecord {
  const normalizedDomain = normalizeDomain(record.domain);
  const normalizedTenantSlug = record.tenantSlug.trim().toLowerCase();

  const tenant = resolveTenantBySlug(normalizedTenantSlug);
  if (!tenant) {
    throw new Error("Invalid or inactive tenant slug.");
  }

  const normalizedRecord: TenantDomainRecord = {
    ...record,
    domain: normalizedDomain,
    tenantSlug: normalizedTenantSlug
  };

  domainStore.set(normalizedDomain, normalizedRecord);
  return normalizedRecord;
}

export function setTenantDomainVerified(domain: string, verified: boolean): TenantDomainRecord {
  const existing = getTenantDomain(domain);
  if (!existing) {
    throw new Error("Domain mapping not found.");
  }

  const updated = {
    ...existing,
    verified
  };

  domainStore.set(existing.domain, updated);
  return updated;
}

export function removeTenantDomain(domain: string): boolean {
  return domainStore.delete(normalizeDomain(domain));
}

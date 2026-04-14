import { assertTenantAccess, withTenantScope } from "@repo/tenant-core";

type PolicyRecord = {
  id: string;
  tenantId: string;
  holderName: string;
};

const policyRows: PolicyRecord[] = [
  { id: "p-1", tenantId: "tenant_001", holderName: "Ana Rodriguez" },
  { id: "p-2", tenantId: "tenant_002", holderName: "Luis Perez" }
];

export async function listPolicies(tenantId: string): Promise<PolicyRecord[]> {
  const scopedFilter = withTenantScope(tenantId);
  return policyRows.filter((row) => row.tenantId === scopedFilter.tenantId);
}

export async function getPolicyById(
  tenantId: string,
  policyId: string
): Promise<PolicyRecord | null> {
  const record = policyRows.find((row) => row.id === policyId) ?? null;
  if (!record) return null;
  assertTenantAccess(tenantId, record.tenantId);
  return record;
}

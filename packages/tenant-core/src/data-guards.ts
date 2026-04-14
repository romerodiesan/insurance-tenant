type TenantScopedRecord = {
  tenantId: string;
};

export function assertTenantAccess(currentTenantId: string, resourceTenantId: string): void {
  if (currentTenantId !== resourceTenantId) {
    throw new Error("Cross-tenant access denied.");
  }
}

export function withTenantScope<T extends Record<string, unknown>>(
  tenantId: string,
  criteria: T = {} as T
): T & { tenantId: string } {
  return {
    ...criteria,
    tenantId
  };
}

export function ensureTenantScopedRows<T extends TenantScopedRecord>(
  currentTenantId: string,
  rows: T[]
): T[] {
  for (const row of rows) {
    assertTenantAccess(currentTenantId, row.tenantId);
  }
  return rows;
}

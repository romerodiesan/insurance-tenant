export type TenantStatus = "active" | "inactive";

export type Tenant = {
  id: string;
  slug: string;
  displayName: string;
  status: TenantStatus;
};

export type TenantContext = {
  id: string;
  slug: string;
};

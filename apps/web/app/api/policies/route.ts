import { getTenantContextFromHeaders } from "@repo/tenant-core";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { listPolicies } from "@/lib/tenant-repository";

export async function GET() {
  const requestHeaders = await headers();
  const tenant = getTenantContextFromHeaders(requestHeaders);
  const policies = await listPolicies(tenant.id);

  return NextResponse.json({ tenant, policies });
}

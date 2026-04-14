import { getTenantContextFromHeaders } from "@repo/tenant-core";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const requestHeaders = await headers();
  const tenant = getTenantContextFromHeaders(requestHeaders);

  return NextResponse.json({ tenant });
}

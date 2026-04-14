import {
  getTenantDomain,
  listTenantDomains,
  upsertTenantDomain
} from "@/lib/domain-store";
import { addProjectDomain, isVercelDomainApiConfigured } from "@/lib/vercel-domains";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createDomainSchema = z.object({
  domain: z.string().min(3),
  tenantSlug: z.string().min(1),
  redirectTo: z.string().optional()
});

export async function GET() {
  return NextResponse.json({
    domains: listTenantDomains(),
    vercelConfigured: isVercelDomainApiConfigured()
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = createDomainSchema.parse(payload);

    const existing = getTenantDomain(parsed.domain);
    if (existing) {
      return NextResponse.json(
        { error: "Domain already assigned.", domain: existing },
        { status: 409 }
      );
    }

    let vercelResult: unknown = null;
    if (isVercelDomainApiConfigured()) {
      vercelResult = await addProjectDomain(parsed.domain);
    }

    const saved = upsertTenantDomain({
      domain: parsed.domain,
      tenantSlug: parsed.tenantSlug,
      redirectTo: parsed.redirectTo,
      verified: false
    });

    return NextResponse.json(
      {
        domain: saved,
        vercel: vercelResult
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

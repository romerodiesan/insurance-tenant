import { getTenantDomain, removeTenantDomain } from "@/lib/domain-store";
import { isVercelDomainApiConfigured, removeProjectDomain } from "@/lib/vercel-domains";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ domain: string }>;
};

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { domain } = await params;
    const decodedDomain = decodeURIComponent(domain);
    const mapping = getTenantDomain(decodedDomain);
    if (!mapping) {
      return NextResponse.json({ error: "Domain mapping not found." }, { status: 404 });
    }

    if (isVercelDomainApiConfigured()) {
      await removeProjectDomain(decodedDomain);
    }

    removeTenantDomain(decodedDomain);
    return NextResponse.json({ removed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

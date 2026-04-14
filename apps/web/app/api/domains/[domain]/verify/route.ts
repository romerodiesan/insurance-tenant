import { getTenantDomain, setTenantDomainVerified } from "@/lib/domain-store";
import {
  isVercelDomainApiConfigured,
  verifyProjectDomain
} from "@/lib/vercel-domains";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ domain: string }>;
};

export async function POST(_: Request, { params }: Params) {
  try {
    const { domain } = await params;
    const decodedDomain = decodeURIComponent(domain);
    const mapping = getTenantDomain(decodedDomain);
    if (!mapping) {
      return NextResponse.json({ error: "Domain mapping not found." }, { status: 404 });
    }

    let verified = true;
    let vercelResult: unknown = null;

    if (isVercelDomainApiConfigured()) {
      const result = await verifyProjectDomain(decodedDomain);
      verified = result.verified;
      vercelResult = result;
    }

    const updated = setTenantDomainVerified(decodedDomain, verified);

    return NextResponse.json({
      domain: updated,
      vercel: vercelResult
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

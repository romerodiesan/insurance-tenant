type VercelConfig = {
  token: string;
  projectId: string;
  teamId?: string;
};

type AddDomainResult = {
  name: string;
  verified?: boolean;
  verification?: unknown;
};

type VerifyDomainResult = {
  verified: boolean;
  verification?: unknown;
};

function getVercelConfig(): VercelConfig | null {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID;

  if (!token || !projectId) {
    return null;
  }

  return { token, projectId, teamId };
}

function buildVercelUrl(path: string, teamId?: string): string {
  const url = new URL(`https://api.vercel.com${path}`);
  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }
  return url.toString();
}

async function vercelFetch(path: string, init: RequestInit): Promise<Response> {
  const config = getVercelConfig();
  if (!config) {
    throw new Error("Vercel API is not configured.");
  }

  return fetch(buildVercelUrl(path, config.teamId), {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });
}

export function isVercelDomainApiConfigured(): boolean {
  return Boolean(getVercelConfig());
}

export async function addProjectDomain(domain: string): Promise<AddDomainResult> {
  const config = getVercelConfig();
  if (!config) {
    throw new Error("Missing Vercel configuration.");
  }

  const response = await vercelFetch(`/v10/projects/${config.projectId}/domains`, {
    method: "POST",
    body: JSON.stringify({ name: domain })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed adding domain in Vercel: ${body}`);
  }

  return response.json();
}

export async function verifyProjectDomain(domain: string): Promise<VerifyDomainResult> {
  const config = getVercelConfig();
  if (!config) {
    throw new Error("Missing Vercel configuration.");
  }

  const response = await vercelFetch(
    `/v10/projects/${config.projectId}/domains/${encodeURIComponent(domain)}/verify`,
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed verifying domain in Vercel: ${body}`);
  }

  return response.json();
}

export async function removeProjectDomain(domain: string): Promise<void> {
  const config = getVercelConfig();
  if (!config) {
    throw new Error("Missing Vercel configuration.");
  }

  const response = await vercelFetch(
    `/v9/projects/${config.projectId}/domains/${encodeURIComponent(domain)}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed removing domain in Vercel: ${body}`);
  }
}

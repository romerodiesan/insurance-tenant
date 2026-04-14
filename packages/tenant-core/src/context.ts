import type { TenantContext } from "@repo/types";
import { z } from "zod";
import { TENANT_ID_HEADER, TENANT_SLUG_HEADER } from "./constants";

const tenantContextSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1)
});

type HeaderReader = Pick<Headers, "get">;

export function getTenantContextFromHeaders(headers: HeaderReader): TenantContext {
  const rawContext = {
    id: headers.get(TENANT_ID_HEADER),
    slug: headers.get(TENANT_SLUG_HEADER)
  };

  const parsed = tenantContextSchema.safeParse(rawContext);
  if (!parsed.success) {
    throw new Error("Missing tenant context on request.");
  }

  return parsed.data;
}

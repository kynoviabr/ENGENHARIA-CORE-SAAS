import { requireSession, type CoreSession } from "@/core/auth/session";

export type CoreAccessRequest = {
  tenantId: string;
  userId: string;
  productCode: string;
  moduleCode?: string;
  permission: string;
  resourceType?: "project" | "tenant" | "module";
  resourceId?: string;
};

export type CoreAccessDecision = {
  allowed: boolean;
  reason: string;
  source: "mock" | "core";
};

export async function checkCoreAccess(request: CoreAccessRequest): Promise<CoreAccessDecision> {
  const session = await requireSession();
  const source = session.mode === "mock" ? "mock" : "core";

  if (session.activeTenant.id !== request.tenantId) {
    return { allowed: false, reason: "Tenant ativo diferente do tenant solicitado.", source };
  }

  if (session.user.id !== request.userId) {
    return { allowed: false, reason: "Usuário autenticado diferente do usuário solicitado.", source };
  }

  if (!session.permissions.includes(request.permission)) {
    return { allowed: false, reason: `Permissão ausente: ${request.permission}.`, source };
  }

  if (!session.products.includes(request.productCode)) {
    return { allowed: false, reason: `Produto não habilitado: ${request.productCode}.`, source };
  }

  if (request.moduleCode && !session.modules.includes(request.moduleCode)) {
    return { allowed: false, reason: `Módulo não habilitado: ${request.moduleCode}.`, source };
  }

  return { allowed: true, reason: "Acesso comercial e permissão geral válidos.", source };
}

export async function requireCoreAccess(request: Omit<CoreAccessRequest, "tenantId" | "userId">) {
  const session = await requireSession();
  const decision = await checkCoreAccess({
    ...request,
    tenantId: session.activeTenant.id,
    userId: session.user.id,
  });

  if (!decision.allowed) {
    throw new Error(`Acesso negado pelo Core: ${decision.reason}`);
  }

  return { session, decision };
}

export function getCoreAccessRequest(
  session: CoreSession,
  permission: string,
  resourceType?: CoreAccessRequest["resourceType"],
  resourceId?: string,
): CoreAccessRequest {
  return {
    tenantId: session.activeTenant.id,
    userId: session.user.id,
    productCode: "pmt",
    moduleCode: "pmt-core",
    permission,
    resourceType,
    resourceId,
  };
}

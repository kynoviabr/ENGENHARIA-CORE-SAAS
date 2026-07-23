import { requireCoreAccess } from "@/core/auth/access";
import { projectMemberships } from "@/features/pmt/repositories/mock-data";

export async function requirePmtProjectAccess(projectId: string, permission: string) {
  const { session, decision } = await requireCoreAccess({
    productCode: "pmt",
    moduleCode: "pmt-core",
    permission,
    resourceType: "project",
    resourceId: projectId
  });

  const membership = projectMemberships.find((item) =>
    item.tenantId === session.activeTenant.id &&
    item.projectId === projectId &&
    item.userId === session.user.id &&
    item.status === "active"
  );
  const canBypassProjectMembership = session.permissions.includes("pmt.projects.update");

  if (!membership && !canBypassProjectMembership) {
    throw new Error("Acesso negado pelo BTT: usuário sem vínculo operacional ativo com o projeto.");
  }

  return { session, decision, membership };
}

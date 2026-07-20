"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/core/auth/session";
import { createRoleRow, updateRoleRow, type RoleInput } from "@/core/repositories/access-repository";
import { getDataSourceMode } from "@/core/repositories";
import { readRequiredText } from "@/core/security/validation";
import type { RoleScope } from "@/core/types";

export async function createRoleAction(formData: FormData) {
  await requirePermission("platform.roles.manage");
  const input = parseRoleForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect("/acesso?accessAction=mock-create");
  }

  const roleId = await createRoleRow(input);
  revalidatePath("/acesso");
  redirect(`/acesso/${roleId}`);
}

export async function updateRoleAction(roleId: string, formData: FormData) {
  await requirePermission("platform.roles.manage");
  const input = parseRoleForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect(`/acesso/${roleId}?accessAction=mock-update`);
  }

  await updateRoleRow(roleId, input);
  revalidatePath("/acesso");
  revalidatePath(`/acesso/${roleId}`);
  redirect(`/acesso/${roleId}`);
}

function parseRoleForm(formData: FormData): RoleInput {
  const scope = String(formData.get("scope") ?? "tenant") as RoleScope;
  const tenantId = String(formData.get("tenantId") ?? "").trim();
  const permissionIds = formData.getAll("permissionIds").map(String).filter(Boolean);

  if (!["global", "tenant"].includes(scope)) {
    throw new Error("Invalid role scope");
  }

  if (scope === "tenant" && !tenantId) {
    throw new Error("Tenant role requires a tenant");
  }

  return {
    name: readRequiredText(formData, "name", 80),
    scope,
    tenantId: scope === "global" ? null : tenantId,
    description: readRequiredText(formData, "description", 240),
    permissionIds,
  };
}

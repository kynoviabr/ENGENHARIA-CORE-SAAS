"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/core/auth/session";
import { getDataSourceMode } from "@/core/repositories";
import {
  createTenantRow,
  updateTenantRow,
  updateTenantStatus,
  type TenantInput,
} from "@/core/repositories/tenant-repository";
import { readOptionalText, readRequiredEmail, readRequiredText } from "@/core/security/validation";
import type { TenantStatus } from "@/core/types";

export async function createTenantAction(formData: FormData) {
  await requirePermission("platform.tenants.manage");
  const input = parseTenantForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect("/empresas?tenantAction=mock-create");
  }

  const tenantId = await createTenantRow(input);
  revalidatePath("/empresas");
  redirect(`/empresas/${tenantId}`);
}

export async function updateTenantAction(tenantId: string, formData: FormData) {
  await requirePermission("platform.tenants.manage");
  const input = parseTenantForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect(`/empresas/${tenantId}?tenantAction=mock-update`);
  }

  await updateTenantRow(tenantId, input);
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${tenantId}`);
  redirect(`/empresas/${tenantId}`);
}

export async function activateTenantAction(tenantId: string) {
  await setTenantStatus(tenantId, "active");
}

export async function suspendTenantAction(tenantId: string) {
  await setTenantStatus(tenantId, "suspended");
}

async function setTenantStatus(tenantId: string, status: TenantStatus) {
  await requirePermission("platform.tenants.manage");

  if (getDataSourceMode() === "mock") {
    redirect(`/empresas/${tenantId}?tenantAction=mock-status-${status}`);
  }

  await updateTenantStatus(tenantId, status);
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${tenantId}`);
  redirect(`/empresas/${tenantId}`);
}

function parseTenantForm(formData: FormData): TenantInput {
  const status = String(formData.get("status") ?? "pending") as TenantStatus;

  if (!["pending", "active", "suspended", "cancelled"].includes(status)) {
    throw new Error("Invalid tenant status");
  }

  return {
    legalName: readRequiredText(formData, "legalName"),
    tradeName: readRequiredText(formData, "tradeName"),
    document: readRequiredText(formData, "document", 32),
    email: readRequiredEmail(formData, "email"),
    phone: readOptionalText(formData, "phone", 40) ?? "",
    status,
  };
}

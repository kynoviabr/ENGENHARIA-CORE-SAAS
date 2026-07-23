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
  const document = readRequiredText(formData, "document", 18).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (!["pending", "active", "suspended", "cancelled"].includes(status)) {
    throw new Error("Invalid tenant status");
  }

  if (!/^[A-Z0-9]{14}$/.test(document)) {
    throw new Error("CNPJ inválido");
  }

  readOptionalText(formData, "contactName", 120);
  readOptionalText(formData, "zipCode", 9);
  readOptionalText(formData, "street", 160);
  readOptionalText(formData, "addressNumber", 20);
  readOptionalText(formData, "addressComplement", 80);
  readOptionalText(formData, "district", 100);
  readOptionalText(formData, "city", 100);
  readOptionalText(formData, "state", 2);

  return {
    legalName: readRequiredText(formData, "legalName"),
    tradeName: readRequiredText(formData, "tradeName"),
    document,
    email: readRequiredEmail(formData, "email"),
    phone: readOptionalText(formData, "phone", 40) ?? "",
    status,
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/core/auth/session";
import { getDataSourceMode } from "@/core/repositories";
import {
  createEntitlementRow,
  updateEntitlementRow,
  updateEntitlementStatus,
  type EntitlementInput,
} from "@/core/repositories/catalog-repository";
import { readOptionalDate, readOptionalText, readRequiredDate, readRequiredText } from "@/core/security/validation";
import type { CatalogStatus, EntitlementSource } from "@/core/types";

export async function createEntitlementAction(formData: FormData) {
  await requirePermission("platform.contracts.manage");
  const input = parseEntitlementForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect("/modulos?catalogAction=mock-create");
  }

  const entitlementId = await createEntitlementRow(input);
  revalidatePath("/modulos");
  redirect(`/modulos/entitlements/${entitlementId}`);
}

export async function updateEntitlementAction(entitlementId: string, formData: FormData) {
  await requirePermission("platform.contracts.manage");
  const input = parseEntitlementForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect(`/modulos/entitlements/${entitlementId}?catalogAction=mock-update`);
  }

  await updateEntitlementRow(entitlementId, input);
  revalidatePath("/modulos");
  revalidatePath(`/modulos/entitlements/${entitlementId}`);
  redirect(`/modulos/entitlements/${entitlementId}`);
}

export async function activateEntitlementAction(entitlementId: string) {
  await setEntitlementStatus(entitlementId, "active");
}

export async function suspendEntitlementAction(entitlementId: string) {
  await setEntitlementStatus(entitlementId, "suspended");
}

async function setEntitlementStatus(entitlementId: string, status: CatalogStatus) {
  await requirePermission("platform.contracts.manage");

  if (getDataSourceMode() === "mock") {
    redirect(`/modulos/entitlements/${entitlementId}?catalogAction=mock-status-${status}`);
  }

  await updateEntitlementStatus(entitlementId, status);
  revalidatePath("/modulos");
  revalidatePath(`/modulos/entitlements/${entitlementId}`);
  redirect(`/modulos/entitlements/${entitlementId}`);
}

function parseEntitlementForm(formData: FormData): EntitlementInput {
  const status = String(formData.get("status") ?? "active") as CatalogStatus;
  const source = String(formData.get("source") ?? "manual") as EntitlementSource;
  const moduleId = String(formData.get("moduleId") ?? "").trim();

  if (!["active", "pending", "planned", "suspended"].includes(status)) {
    throw new Error("Invalid entitlement status");
  }

  if (!["plan", "contract", "subscription", "trial", "manual", "core"].includes(source)) {
    throw new Error("Invalid entitlement source");
  }

  return {
    tenantId: readRequiredText(formData, "tenantId", 80),
    productId: readRequiredText(formData, "productId", 80),
    moduleId: moduleId || null,
    resourceType: readOptionalText(formData, "resourceType", 80),
    resourceId: readOptionalText(formData, "resourceId", 160),
    status,
    source,
    sourceId: readOptionalText(formData, "sourceId", 160),
    startsAt: readRequiredDate(formData, "startsAt"),
    expiresAt: readOptionalDate(formData, "expiresAt"),
  };
}

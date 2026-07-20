"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/core/auth/session";
import { getDataSourceMode } from "@/core/repositories";
import {
  createContractItemRow,
  createContractRow,
  createContractScopeRow,
  createExternalResourceRow,
  updateContractRow,
  updateContractStatus,
  type ContractItemInput,
  type ContractInput,
  type ContractScopeInput,
  type ExternalResourceInput,
} from "@/core/repositories/contract-repository";
import { readOptionalDate, readOptionalText, readRequiredDate, readRequiredText } from "@/core/security/validation";
import type { BillingCycle, BillingModel, CatalogStatus, ContractStatus } from "@/core/types";

export async function createContractAction(formData: FormData) {
  await requirePermission("platform.contracts.manage");
  const input = parseContractForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect("/contratos?contractAction=mock-create");
  }

  const contractId = await createContractRow(input);
  revalidatePath("/contratos");
  redirect(`/contratos/${contractId}`);
}

export async function updateContractAction(contractId: string, formData: FormData) {
  await requirePermission("platform.contracts.manage");
  const input = parseContractForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect(`/contratos/${contractId}?contractAction=mock-update`);
  }

  await updateContractRow(contractId, input);
  revalidatePath("/contratos");
  revalidatePath(`/contratos/${contractId}`);
  redirect(`/contratos/${contractId}`);
}

export async function activateContractAction(contractId: string) {
  await setContractStatus(contractId, "active");
}

export async function suspendContractAction(contractId: string) {
  await setContractStatus(contractId, "suspended");
}

export async function createContractItemAction(contractId: string, tenantId: string, formData: FormData) {
  await requirePermission("platform.contracts.manage");
  const input = parseContractItemForm(contractId, tenantId, formData);

  if (getDataSourceMode() === "mock") {
    redirect(`/contratos/${contractId}?contractAction=mock-create-item`);
  }

  await createContractItemRow(input);
  revalidatePath("/contratos");
  revalidatePath(`/contratos/${contractId}`);
  redirect(`/contratos/${contractId}`);
}

export async function createContractScopeAction(contractId: string, tenantId: string, formData: FormData) {
  await requirePermission("platform.contracts.manage");
  const input = parseContractScopeForm(contractId, tenantId, formData);

  if (getDataSourceMode() === "mock") {
    redirect(`/contratos/${contractId}?contractAction=mock-create-scope`);
  }

  await createContractScopeRow(input);
  revalidatePath("/contratos");
  revalidatePath(`/contratos/${contractId}`);
  redirect(`/contratos/${contractId}`);
}

export async function createExternalResourceAction(contractId: string, tenantId: string, formData: FormData) {
  await requirePermission("platform.contracts.manage");
  const input = parseExternalResourceForm(tenantId, formData);

  if (getDataSourceMode() === "mock") {
    redirect(`/contratos/${contractId}?contractAction=mock-create-resource`);
  }

  await createExternalResourceRow(input);
  revalidatePath("/contratos");
  revalidatePath(`/contratos/${contractId}`);
  redirect(`/contratos/${contractId}`);
}

async function setContractStatus(contractId: string, status: ContractStatus) {
  await requirePermission("platform.contracts.manage");

  if (getDataSourceMode() === "mock") {
    redirect(`/contratos/${contractId}?contractAction=mock-status-${status}`);
  }

  await updateContractStatus(contractId, status);
  revalidatePath("/contratos");
  revalidatePath(`/contratos/${contractId}`);
  redirect(`/contratos/${contractId}`);
}

function parseContractForm(formData: FormData): ContractInput {
  const status = String(formData.get("status") ?? "draft") as ContractStatus;
  const billingCycle = String(formData.get("billingCycle") ?? "monthly") as BillingCycle;

  if (!["draft", "pending", "active", "expired", "suspended", "cancelled", "closed"].includes(status)) {
    throw new Error("Invalid contract status");
  }

  if (!["monthly", "quarterly", "yearly", "trial"].includes(billingCycle)) {
    throw new Error("Invalid billing cycle");
  }

  return {
    tenantId: readRequiredText(formData, "tenantId", 80),
    planId: readRequiredText(formData, "planId", 80),
    contractNumber: readRequiredText(formData, "contractNumber", 80),
    billingCycle,
    startDate: readRequiredDate(formData, "startDate"),
    endDate: readOptionalDate(formData, "endDate") ?? "",
    renewalDate: readOptionalDate(formData, "renewalDate") ?? "",
    status,
    notes: readOptionalText(formData, "notes", 1000),
  };
}

function parseContractItemForm(contractId: string, tenantId: string, formData: FormData): ContractItemInput {
  const billingModel = String(formData.get("billingModel") ?? "flat") as BillingModel;
  const status = readCatalogStatus(formData);

  if (!["flat", "per_user", "per_resource", "per_unit", "usage_based", "custom"].includes(billingModel)) {
    throw new Error("Invalid billing model");
  }

  return {
    tenantId,
    contractId,
    productId: readOptionalText(formData, "productId", 80),
    moduleId: readOptionalText(formData, "moduleId", 80),
    itemType: readRequiredText(formData, "itemType", 80),
    description: readRequiredText(formData, "description", 240),
    billingModel,
    quantity: readRequiredNumber(formData, "quantity"),
    unitPrice: readRequiredNumber(formData, "unitPrice"),
    totalPrice: readRequiredNumber(formData, "totalPrice"),
    startsAt: readRequiredDate(formData, "startsAt"),
    endsAt: readOptionalDate(formData, "endsAt"),
    status,
  };
}

function parseContractScopeForm(contractId: string, tenantId: string, formData: FormData): ContractScopeInput {
  return {
    tenantId,
    contractId,
    contractItemId: readOptionalText(formData, "contractItemId", 80),
    productId: readOptionalText(formData, "productId", 80),
    resourceType: readRequiredText(formData, "resourceType", 80),
    resourceId: readRequiredText(formData, "resourceId", 160),
    resourceCode: readRequiredText(formData, "resourceCode", 120),
    displayName: readOptionalText(formData, "displayName", 160),
    startsAt: readRequiredDate(formData, "startsAt"),
    expiresAt: readOptionalDate(formData, "expiresAt"),
    status: readCatalogStatus(formData),
  };
}

function parseExternalResourceForm(tenantId: string, formData: FormData): ExternalResourceInput {
  return {
    tenantId,
    productId: readOptionalText(formData, "productId", 80),
    resourceType: readRequiredText(formData, "resourceType", 80),
    externalId: readRequiredText(formData, "externalId", 160),
    code: readRequiredText(formData, "code", 120),
    displayName: readOptionalText(formData, "displayName", 160),
    status: readCatalogStatus(formData),
  };
}

function readCatalogStatus(formData: FormData): CatalogStatus {
  const status = String(formData.get("status") ?? "active") as CatalogStatus;

  if (!["active", "pending", "planned", "suspended"].includes(status)) {
    throw new Error("Invalid catalog status");
  }

  return status;
}

function readRequiredNumber(formData: FormData, field: string): number {
  const value = Number(String(formData.get(field) ?? "").replace(",", "."));

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Valor numérico inválido: ${field}`);
  }

  return value;
}

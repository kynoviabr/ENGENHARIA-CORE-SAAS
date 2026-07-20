"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/core/auth/session";
import { getDataSourceMode } from "@/core/repositories";
import { upsertBrandingRow, type BrandingInput } from "@/core/repositories/settings-repository";
import {
  readOptionalHttpsUrl,
  readOptionalText,
  readRequiredEmail,
  readRequiredHexColor,
  readRequiredText,
} from "@/core/security/validation";

export async function saveBrandingAction(formData: FormData) {
  await requirePermission("platform.settings.manage");
  const input = parseBrandingForm(formData);

  if (getDataSourceMode() === "mock") {
    redirect(`/configuracoes/branding/${input.tenantId}?settingsAction=mock-save`);
  }

  const tenantId = await upsertBrandingRow(input);
  revalidatePath("/configuracoes");
  revalidatePath(`/configuracoes/branding/${tenantId}`);
  redirect(`/configuracoes/branding/${tenantId}`);
}

function parseBrandingForm(formData: FormData): BrandingInput {
  return {
    tenantId: readRequiredText(formData, "tenantId", 80),
    name: readRequiredText(formData, "name"),
    logoUrl: readOptionalHttpsUrl(formData, "logoUrl"),
    smallLogoUrl: readOptionalHttpsUrl(formData, "smallLogoUrl"),
    faviconUrl: readOptionalHttpsUrl(formData, "faviconUrl"),
    loginImageUrl: readOptionalHttpsUrl(formData, "loginImageUrl"),
    primaryColor: readRequiredHexColor(formData, "primaryColor"),
    secondaryColor: readRequiredHexColor(formData, "secondaryColor"),
    supportEmail: readRequiredEmail(formData, "supportEmail"),
    supportPhone: readOptionalText(formData, "supportPhone", 40) ?? "",
    termsUrl: readOptionalHttpsUrl(formData, "termsUrl"),
    privacyUrl: readOptionalHttpsUrl(formData, "privacyUrl"),
  };
}

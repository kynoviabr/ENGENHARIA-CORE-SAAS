import { coreStore } from "../mock-store";
import { getSupabaseServerClient } from "../supabase/server";
import type { BrandingSettings } from "../types";

export interface BrandingInput {
  tenantId: string;
  name: string;
  logoUrl: string | null;
  smallLogoUrl: string | null;
  faviconUrl: string | null;
  loginImageUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  supportPhone: string;
  termsUrl: string | null;
  privacyUrl: string | null;
}

export interface BrandingListItem extends BrandingSettings {
  tenantName: string;
  tenantStatus: string;
}

export async function listBrandingRows(): Promise<BrandingSettings[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.branding;
  }

  const { data, error } = await supabase
    .from("branding_settings")
    .select(
      "id, tenant_id, name, logo_url, small_logo_url, favicon_url, login_image_url, primary_color, secondary_color, support_email, support_phone, terms_url, privacy_url",
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to list branding settings: ${error.message}`);
  }

  return (data ?? []).map(mapBrandingRow);
}

export async function listBrandingListRows(): Promise<BrandingListItem[]> {
  const [branding, tenants] = await Promise.all([listBrandingRows(), listTenantLiteRows()]);

  return branding.map((item) => {
    const tenant = tenants.find((tenantRow) => tenantRow.id === item.tenantId);

    return {
      ...item,
      tenantName: tenant?.tradeName ?? "Tenant desconhecido",
      tenantStatus: tenant?.status ?? "pending",
    };
  });
}

export async function getBrandingRowByTenantId(tenantId: string): Promise<BrandingSettings | null> {
  const branding = await listBrandingRows();

  return branding.find((item) => item.tenantId === tenantId) ?? null;
}

export async function upsertBrandingRow(input: BrandingInput): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return input.tenantId;
  }

  const { data, error } = await supabase
    .from("branding_settings")
    .upsert(
      {
        tenant_id: input.tenantId,
        name: input.name,
        logo_url: input.logoUrl,
        small_logo_url: input.smallLogoUrl,
        favicon_url: input.faviconUrl,
        login_image_url: input.loginImageUrl,
        primary_color: input.primaryColor,
        secondary_color: input.secondaryColor,
        support_email: input.supportEmail,
        support_phone: input.supportPhone,
        terms_url: input.termsUrl,
        privacy_url: input.privacyUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id" },
    )
    .select("tenant_id")
    .single();

  if (error) {
    throw new Error(`Unable to save branding settings: ${error.message}`);
  }

  return data.tenant_id;
}

function mapBrandingRow(row: {
  id: string;
  tenant_id: string;
  name: string;
  logo_url: string | null;
  small_logo_url: string | null;
  favicon_url: string | null;
  login_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  support_email: string | null;
  support_phone: string | null;
  terms_url: string | null;
  privacy_url: string | null;
}): BrandingSettings {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    logoUrl: row.logo_url,
    smallLogoUrl: row.small_logo_url,
    faviconUrl: row.favicon_url,
    loginImageUrl: row.login_image_url,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    supportEmail: row.support_email ?? "",
    supportPhone: row.support_phone ?? "",
    termsUrl: row.terms_url,
    privacyUrl: row.privacy_url,
  };
}

async function listTenantLiteRows() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.tenants.map((tenant) => ({
      id: tenant.id,
      tradeName: tenant.tradeName,
      status: tenant.status,
    }));
  }

  const { data, error } = await supabase.from("tenants").select("id, trade_name, status");

  if (error) {
    throw new Error(`Unable to list tenants for branding: ${error.message}`);
  }

  return (data ?? []).map((tenant) => ({
    id: tenant.id,
    tradeName: tenant.trade_name,
    status: tenant.status,
  }));
}

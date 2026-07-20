import { coreStore } from "../mock-store";
import { getSupabaseServerClient } from "../supabase/server";
import type { Tenant, TenantStatus } from "../types";

export interface TenantInput {
  legalName: string;
  tradeName: string;
  document: string;
  email: string;
  phone: string;
  status: TenantStatus;
}

export async function listTenantRows(): Promise<Tenant[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.tenants;
  }

  const { data, error } = await supabase
    .from("tenants")
    .select("id, legal_name, trade_name, document, email, phone, status, created_at, updated_at")
    .order("trade_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to list tenants: ${error.message}`);
  }

  return data.map((tenant) => ({
    id: tenant.id,
    legalName: tenant.legal_name,
    tradeName: tenant.trade_name,
    document: tenant.document,
    email: tenant.email,
    phone: tenant.phone ?? "",
    status: tenant.status,
    createdAt: tenant.created_at,
    updatedAt: tenant.updated_at,
  }));
}

export async function getTenantRowById(id: string): Promise<Tenant | null> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.tenants.find((tenant) => tenant.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("tenants")
    .select("id, legal_name, trade_name, document, email, phone, status, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load tenant: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    legalName: data.legal_name,
    tradeName: data.trade_name,
    document: data.document,
    email: data.email,
    phone: data.phone ?? "",
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createTenantRow(input: TenantInput): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "mock-created-tenant";
  }

  const { data, error } = await supabase
    .from("tenants")
    .insert({
      legal_name: input.legalName,
      trade_name: input.tradeName,
      document: input.document,
      email: input.email,
      phone: input.phone,
      status: input.status,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create tenant: ${error.message}`);
  }

  return data.id;
}

export async function updateTenantRow(id: string, input: TenantInput): Promise<void> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("tenants")
    .update({
      legal_name: input.legalName,
      trade_name: input.tradeName,
      document: input.document,
      email: input.email,
      phone: input.phone,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to update tenant: ${error.message}`);
  }
}

export async function updateTenantStatus(id: string, status: TenantStatus): Promise<void> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("tenants")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to update tenant status: ${error.message}`);
  }
}

import { coreStore } from "../mock-store";
import { getSupabaseServerClient } from "../supabase/server";
import type { CatalogStatus, Entitlement, EntitlementSource, Product, ProductModule } from "../types";

export interface EntitlementInput {
  tenantId: string;
  productId: string;
  moduleId: string | null;
  resourceType: string | null;
  resourceId: string | null;
  status: CatalogStatus;
  source: EntitlementSource;
  sourceId: string | null;
  startsAt: string;
  expiresAt: string | null;
}

export interface ModuleListItem extends ProductModule {
  productCode: string;
  productName: string;
  entitlementCount: number;
  activeEntitlementCount: number;
}

export interface EntitlementListItem extends Entitlement {
  tenantName: string;
  productCode: string;
  productName: string;
  moduleCode: string;
  moduleName: string;
}

export async function listProductRows(): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.products;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, code, name, description, status")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to list products: ${error.message}`);
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description ?? "",
    status: product.status,
  }));
}

export async function listModuleRows(): Promise<ProductModule[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.modules;
  }

  const { data, error } = await supabase
    .from("modules")
    .select("id, product_id, code, name, description, status")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to list modules: ${error.message}`);
  }

  return (data ?? []).map((module) => ({
    id: module.id,
    productId: module.product_id,
    code: module.code,
    name: module.name,
    description: module.description ?? "",
    status: module.status,
  }));
}

export async function listModuleListRows(): Promise<ModuleListItem[]> {
  const [products, modules, entitlements] = await Promise.all([
    listProductRows(),
    listModuleRows(),
    listEntitlementRows(),
  ]);

  return modules.map((module) => {
    const product = products.find((item) => item.id === module.productId);
    const moduleEntitlements = entitlements.filter((item) => item.moduleId === module.id);

    return {
      ...module,
      productCode: product?.code ?? "unknown-product",
      productName: product?.name ?? "Produto desconhecido",
      entitlementCount: moduleEntitlements.length,
      activeEntitlementCount: moduleEntitlements.filter((item) => item.status === "active").length,
    };
  });
}

export async function getModuleRowById(id: string): Promise<ModuleListItem | null> {
  const modules = await listModuleListRows();

  return modules.find((module) => module.id === id) ?? null;
}

export async function listEntitlementRows(): Promise<Entitlement[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.entitlements;
  }

  const { data, error } = await supabase
    .from("entitlements")
    .select(
      "id, tenant_id, product_id, module_id, resource_type, resource_id, status, source, source_id, starts_at, expires_at, metadata",
    )
    .order("starts_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list entitlements: ${error.message}`);
  }

  return (data ?? []).map((entitlement) => ({
    id: entitlement.id,
    tenantId: entitlement.tenant_id,
    productId: entitlement.product_id,
    moduleId: entitlement.module_id,
    resourceType: entitlement.resource_type,
    resourceId: entitlement.resource_id,
    status: entitlement.status,
    source: entitlement.source,
    sourceId: entitlement.source_id,
    startsAt: entitlement.starts_at,
    expiresAt: entitlement.expires_at,
    metadata: isObjectRecord(entitlement.metadata) ? entitlement.metadata : {},
  }));
}

export async function listEntitlementListRows(): Promise<EntitlementListItem[]> {
  const [entitlements, tenants, products, modules] = await Promise.all([
    listEntitlementRows(),
    listTenantLiteRows(),
    listProductRows(),
    listModuleRows(),
  ]);

  return entitlements.map((entitlement) => {
    const tenant = tenants.find((item) => item.id === entitlement.tenantId);
    const product = products.find((item) => item.id === entitlement.productId);
    const productModule = modules.find((item) => item.id === entitlement.moduleId);

    return {
      ...entitlement,
      tenantName: tenant?.tradeName ?? "Tenant desconhecido",
      productCode: product?.code ?? "unknown-product",
      productName: product?.name ?? "Produto desconhecido",
      moduleCode: productModule?.code ?? "produto-inteiro",
      moduleName: productModule?.name ?? "Produto inteiro",
    };
  });
}

export async function getEntitlementRowById(id: string): Promise<EntitlementListItem | null> {
  const entitlements = await listEntitlementListRows();

  return entitlements.find((entitlement) => entitlement.id === id) ?? null;
}

export async function createEntitlementRow(input: EntitlementInput): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "mock-created-entitlement";
  }

  const { data, error } = await supabase
    .from("entitlements")
    .insert({
      tenant_id: input.tenantId,
      product_id: input.productId,
      module_id: input.moduleId,
      resource_type: input.resourceType,
      resource_id: input.resourceId,
      status: input.status,
      source: input.source,
      source_id: input.sourceId,
      starts_at: input.startsAt,
      expires_at: input.expiresAt,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create entitlement: ${error.message}`);
  }

  return data.id;
}

export async function updateEntitlementRow(id: string, input: EntitlementInput): Promise<void> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("entitlements")
    .update({
      tenant_id: input.tenantId,
      product_id: input.productId,
      module_id: input.moduleId,
      resource_type: input.resourceType,
      resource_id: input.resourceId,
      status: input.status,
      source: input.source,
      source_id: input.sourceId,
      starts_at: input.startsAt,
      expires_at: input.expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to update entitlement: ${error.message}`);
  }
}

export async function updateEntitlementStatus(id: string, status: CatalogStatus): Promise<void> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("entitlements")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to update entitlement status: ${error.message}`);
  }
}

async function listTenantLiteRows() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.tenants.map((tenant) => ({
      id: tenant.id,
      tradeName: tenant.tradeName,
    }));
  }

  const { data, error } = await supabase.from("tenants").select("id, trade_name");

  if (error) {
    throw new Error(`Unable to list tenants for entitlements: ${error.message}`);
  }

  return (data ?? []).map((tenant) => ({
    id: tenant.id,
    tradeName: tenant.trade_name,
  }));
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

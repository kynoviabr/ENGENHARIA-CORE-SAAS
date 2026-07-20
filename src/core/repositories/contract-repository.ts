import { coreStore } from "../mock-store";
import { getSupabaseServerClient } from "../supabase/server";
import type {
  BillingCycle,
  BillingModel,
  CatalogStatus,
  Contract,
  ContractItem,
  ContractScope,
  ContractStatus,
  ExternalResource,
  Plan,
  SubscriptionStatus,
} from "../types";

export interface ContractInput {
  tenantId: string;
  planId: string;
  contractNumber: string;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: ContractStatus;
  notes: string | null;
}

export interface ContractItemInput {
  tenantId: string;
  contractId: string;
  productId: string | null;
  moduleId: string | null;
  itemType: string;
  description: string;
  billingModel: BillingModel;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startsAt: string;
  endsAt: string | null;
  status: CatalogStatus;
}

export interface ContractScopeInput {
  tenantId: string;
  contractId: string;
  contractItemId: string | null;
  productId: string | null;
  resourceType: string;
  resourceId: string;
  resourceCode: string;
  displayName: string | null;
  status: CatalogStatus;
  startsAt: string;
  expiresAt: string | null;
}

export interface ExternalResourceInput {
  tenantId: string;
  productId: string | null;
  resourceType: string;
  externalId: string;
  code: string;
  displayName: string | null;
  status: CatalogStatus;
}

export interface ContractListItem extends Contract {
  tenantName: string;
  planName: string;
  planCode: string;
  subscriptionStatus: SubscriptionStatus;
  period: string;
  limitLabel: string;
  usageLabel: string;
}

export interface ContractItemListItem extends ContractItem {
  productName: string;
  moduleName: string;
  billingLabel: string;
}

export interface ContractScopeListItem extends ContractScope {
  productName: string;
  periodLabel: string;
}

export interface ExternalResourceListItem extends ExternalResource {
  productName: string;
}

export async function listPlanRows(): Promise<Plan[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.plans;
  }

  const { data, error } = await supabase
    .from("plans")
    .select("id, code, name, description, billing_cycle, status, maximum_users")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to list plans: ${error.message}`);
  }

  return (data ?? []).map((plan) => ({
    id: plan.id,
    code: plan.code,
    name: plan.name,
    description: plan.description ?? "",
    billingCycle: plan.billing_cycle,
    status: plan.status,
    maximumUsers: plan.maximum_users,
  }));
}

export async function listContractRows(): Promise<Contract[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.contracts;
  }

  const { data, error } = await supabase
    .from("contracts")
    .select(
      "id, tenant_id, plan_id, contract_number, billing_cycle, start_date, end_date, renewal_date, status, notes, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list contracts: ${error.message}`);
  }

  return (data ?? []).map((contract) => ({
    id: contract.id,
    tenantId: contract.tenant_id,
    planId: contract.plan_id,
    contractNumber: contract.contract_number,
    billingCycle: contract.billing_cycle,
    startDate: contract.start_date,
    endDate: contract.end_date ?? "",
    renewalDate: contract.renewal_date ?? "",
    status: contract.status,
    notes: contract.notes,
  }));
}

export async function listContractListRows(): Promise<ContractListItem[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.contracts.map(mapMockContract);
  }

  const [
    { data: contracts, error: contractsError },
    { data: tenants, error: tenantsError },
    { data: plans, error: plansError },
    { data: subscriptions, error: subscriptionsError },
    { data: usageLimits, error: usageLimitsError },
  ] = await Promise.all([
    supabase
      .from("contracts")
      .select("id, tenant_id, plan_id, contract_number, billing_cycle, start_date, end_date, renewal_date, status, notes")
      .order("created_at", { ascending: false }),
    supabase.from("tenants").select("id, trade_name"),
    supabase.from("plans").select("id, code, name, maximum_users"),
    supabase.from("subscriptions").select("tenant_id, contract_id, status"),
    supabase.from("usage_limits").select("tenant_id, code, limit_value, used_value"),
  ]);

  const error = contractsError ?? tenantsError ?? plansError ?? subscriptionsError ?? usageLimitsError;

  if (error) {
    throw new Error(`Unable to list contract rows: ${error.message}`);
  }

  return (contracts ?? []).map((contract) => {
    const tenant = (tenants ?? []).find((item) => item.id === contract.tenant_id);
    const plan = (plans ?? []).find((item) => item.id === contract.plan_id);
    const subscription = (subscriptions ?? []).find((item) => item.contract_id === contract.id);
    const usage = (usageLimits ?? []).find(
      (item) => item.tenant_id === contract.tenant_id && item.code === "maximum_users",
    );
    const limit = usage?.limit_value ?? plan?.maximum_users ?? 0;
    const used = usage?.used_value ?? 0;

    return {
      id: contract.id,
      tenantId: contract.tenant_id,
      planId: contract.plan_id,
      contractNumber: contract.contract_number,
      billingCycle: contract.billing_cycle,
      startDate: contract.start_date,
      endDate: contract.end_date ?? "",
      renewalDate: contract.renewal_date ?? "",
      status: contract.status,
      notes: contract.notes,
      tenantName: tenant?.trade_name ?? "Tenant desconhecido",
      planName: plan?.name ?? "Sem plano",
      planCode: plan?.code ?? "sem-plano",
      subscriptionStatus: subscription?.status ?? "pending",
      period: `${contract.start_date} / ${contract.end_date ?? "-"}`,
      limitLabel: limit ? `${limit} usuários` : "Sem limite",
      usageLabel: limit ? `${used}/${limit}` : "-",
    };
  });
}

export async function getContractRowById(id: string): Promise<ContractListItem | null> {
  const contracts = await listContractListRows();

  return contracts.find((contract) => contract.id === id) ?? null;
}

export async function listContractItemRows(contractId: string): Promise<ContractItemListItem[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.contractItems
      .filter((item) => item.contractId === contractId)
      .map(mapMockContractItem);
  }

  const [{ data: items, error: itemsError }, { data: products, error: productsError }, { data: modules, error: modulesError }] =
    await Promise.all([
      supabase
        .from("contract_items")
        .select(
          "id, tenant_id, contract_id, product_id, module_id, item_type, description, billing_model, quantity, unit_price, total_price, starts_at, ends_at, status, metadata",
        )
        .eq("contract_id", contractId)
        .order("created_at", { ascending: true }),
      supabase.from("products").select("id, name"),
      supabase.from("modules").select("id, name"),
    ]);

  const error = itemsError ?? productsError ?? modulesError;

  if (error) {
    throw new Error(`Unable to list contract items: ${error.message}`);
  }

  return (items ?? []).map((item) => {
    const product = (products ?? []).find((row) => row.id === item.product_id);
    const productModule = (modules ?? []).find((row) => row.id === item.module_id);

    return {
      id: item.id,
      tenantId: item.tenant_id,
      contractId: item.contract_id,
      productId: item.product_id,
      moduleId: item.module_id,
      itemType: item.item_type,
      description: item.description,
      billingModel: item.billing_model,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      totalPrice: Number(item.total_price),
      startsAt: item.starts_at,
      endsAt: item.ends_at,
      status: item.status,
      metadata: isObjectRecord(item.metadata) ? item.metadata : {},
      productName: product?.name ?? "Sem produto",
      moduleName: productModule?.name ?? "Produto inteiro",
      billingLabel: formatMoney(Number(item.total_price)),
    };
  });
}

export async function listContractScopeRows(contractId: string): Promise<ContractScopeListItem[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.contractScopes
      .filter((scope) => scope.contractId === contractId)
      .map(mapMockContractScope);
  }

  const [{ data: scopes, error: scopesError }, { data: products, error: productsError }] = await Promise.all([
    supabase
      .from("contract_scopes")
      .select(
        "id, tenant_id, contract_id, contract_item_id, product_id, resource_type, resource_id, resource_code, display_name, status, starts_at, expires_at, metadata",
      )
      .eq("contract_id", contractId)
      .order("created_at", { ascending: true }),
    supabase.from("products").select("id, name"),
  ]);

  const error = scopesError ?? productsError;

  if (error) {
    throw new Error(`Unable to list contract scopes: ${error.message}`);
  }

  return (scopes ?? []).map((scope) => {
    const product = (products ?? []).find((row) => row.id === scope.product_id);

    return {
      id: scope.id,
      tenantId: scope.tenant_id,
      contractId: scope.contract_id,
      contractItemId: scope.contract_item_id,
      productId: scope.product_id,
      resourceType: scope.resource_type,
      resourceId: scope.resource_id,
      resourceCode: scope.resource_code,
      displayName: scope.display_name,
      status: scope.status,
      startsAt: scope.starts_at,
      expiresAt: scope.expires_at,
      metadata: isObjectRecord(scope.metadata) ? scope.metadata : {},
      productName: product?.name ?? "Sem produto",
      periodLabel: `${scope.starts_at.slice(0, 10)} / ${scope.expires_at?.slice(0, 10) ?? "-"}`,
    };
  });
}

export async function listExternalResourceRows(tenantId: string): Promise<ExternalResourceListItem[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.externalResources
      .filter((resource) => resource.tenantId === tenantId)
      .map(mapMockExternalResource);
  }

  const [{ data: resources, error: resourcesError }, { data: products, error: productsError }] = await Promise.all([
    supabase
      .from("external_resources")
      .select("id, tenant_id, product_id, resource_type, external_id, code, display_name, status, metadata")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true }),
    supabase.from("products").select("id, name"),
  ]);

  const error = resourcesError ?? productsError;

  if (error) {
    throw new Error(`Unable to list external resources: ${error.message}`);
  }

  return (resources ?? []).map((resource) => {
    const product = (products ?? []).find((row) => row.id === resource.product_id);

    return {
      id: resource.id,
      tenantId: resource.tenant_id,
      productId: resource.product_id,
      resourceType: resource.resource_type,
      externalId: resource.external_id,
      code: resource.code,
      displayName: resource.display_name,
      status: resource.status,
      metadata: isObjectRecord(resource.metadata) ? resource.metadata : {},
      productName: product?.name ?? "Sem produto",
    };
  });
}

export async function createContractRow(input: ContractInput): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "mock-created-contract";
  }

  const { data, error } = await supabase
    .from("contracts")
    .insert({
      tenant_id: input.tenantId,
      plan_id: input.planId,
      contract_number: input.contractNumber,
      billing_cycle: input.billingCycle,
      start_date: input.startDate,
      end_date: input.endDate || null,
      renewal_date: input.renewalDate || null,
      status: input.status,
      notes: input.notes,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create contract: ${error.message}`);
  }

  return data.id;
}

export async function updateContractRow(id: string, input: ContractInput): Promise<void> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("contracts")
    .update({
      tenant_id: input.tenantId,
      plan_id: input.planId,
      contract_number: input.contractNumber,
      billing_cycle: input.billingCycle,
      start_date: input.startDate,
      end_date: input.endDate || null,
      renewal_date: input.renewalDate || null,
      status: input.status,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to update contract: ${error.message}`);
  }
}

export async function updateContractStatus(id: string, status: ContractStatus): Promise<void> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("contracts")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to update contract status: ${error.message}`);
  }
}

export async function createContractItemRow(input: ContractItemInput): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "mock-created-contract-item";
  }

  const { data, error } = await supabase
    .from("contract_items")
    .insert({
      tenant_id: input.tenantId,
      contract_id: input.contractId,
      product_id: input.productId,
      module_id: input.moduleId,
      item_type: input.itemType,
      description: input.description,
      billing_model: input.billingModel,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      total_price: input.totalPrice,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      status: input.status,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create contract item: ${error.message}`);
  }

  return data.id;
}

export async function createContractScopeRow(input: ContractScopeInput): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "mock-created-contract-scope";
  }

  const { data, error } = await supabase
    .from("contract_scopes")
    .insert({
      tenant_id: input.tenantId,
      contract_id: input.contractId,
      contract_item_id: input.contractItemId,
      product_id: input.productId,
      resource_type: input.resourceType,
      resource_id: input.resourceId,
      resource_code: input.resourceCode,
      display_name: input.displayName,
      starts_at: input.startsAt,
      expires_at: input.expiresAt,
      status: input.status,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create contract scope: ${error.message}`);
  }

  return data.id;
}

export async function createExternalResourceRow(input: ExternalResourceInput): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "mock-created-external-resource";
  }

  const { data, error } = await supabase
    .from("external_resources")
    .insert({
      tenant_id: input.tenantId,
      product_id: input.productId,
      resource_type: input.resourceType,
      external_id: input.externalId,
      code: input.code,
      display_name: input.displayName,
      status: input.status,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create external resource: ${error.message}`);
  }

  return data.id;
}

function mapMockContract(contract: Contract): ContractListItem {
  const tenant = coreStore.tenants.find((item) => item.id === contract.tenantId);
  const plan = coreStore.plans.find((item) => item.id === contract.planId);
  const subscription = coreStore.subscriptions.find((item) => item.contractId === contract.id);
  const usage = coreStore.usageLimits.find(
    (item) => item.tenantId === contract.tenantId && item.code === "maximum_users",
  );

  return {
    ...contract,
    tenantName: tenant?.tradeName ?? "Tenant desconhecido",
    planName: plan?.name ?? "Sem plano",
    planCode: plan?.code ?? "sem-plano",
    subscriptionStatus: subscription?.status ?? "pending",
    period: `${contract.startDate} / ${contract.endDate}`,
    limitLabel: usage ? `${usage.limit} usuários` : "Sem limite",
    usageLabel: usage ? `${usage.used}/${usage.limit}` : "-",
  };
}

function mapMockContractItem(item: ContractItem): ContractItemListItem {
  const product = coreStore.products.find((row) => row.id === item.productId);
  const productModule = coreStore.modules.find((row) => row.id === item.moduleId);

  return {
    ...item,
    productName: product?.name ?? "Sem produto",
    moduleName: productModule?.name ?? "Produto inteiro",
    billingLabel: formatMoney(item.totalPrice),
  };
}

function mapMockContractScope(scope: ContractScope): ContractScopeListItem {
  const product = coreStore.products.find((row) => row.id === scope.productId);

  return {
    ...scope,
    productName: product?.name ?? "Sem produto",
    periodLabel: `${scope.startsAt.slice(0, 10)} / ${scope.expiresAt?.slice(0, 10) ?? "-"}`,
  };
}

function mapMockExternalResource(resource: ExternalResource): ExternalResourceListItem {
  const product = coreStore.products.find((row) => row.id === resource.productId);

  return {
    ...resource,
    productName: product?.name ?? "Sem produto",
  };
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

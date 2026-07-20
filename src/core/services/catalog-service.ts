import { coreStore } from "../mock-store";

export interface ModuleListItem {
  id: string;
  product: string;
  module: string;
  name: string;
  status: "active" | "pending" | "planned" | "suspended";
  tenants: number;
  source: string;
}

export function listProductModules(): ModuleListItem[] {
  return coreStore.modules.map((module) => {
    const product = coreStore.products.find((item) => item.id === module.productId);
    const entitlements = coreStore.entitlements.filter((item) => item.moduleId === module.id);

    return {
      id: module.id,
      product: product?.code ?? "unknown-product",
      module: module.code,
      name: module.name,
      status: module.status,
      tenants: entitlements.length,
      source: entitlements[0]?.source ?? "manual",
    };
  });
}

export function getCatalogSummary() {
  return {
    products: coreStore.products.length,
    modules: coreStore.modules.length,
    entitlements: coreStore.entitlements.length,
  };
}

import type { Permission, Product } from "./types";

export type AccessActionCode = "view" | "create" | "update" | "delete" | "approve";

export interface AccessActionDefinition {
  code: AccessActionCode;
  label: string;
}

export interface AccessScreenDefinition {
  code: string;
  label: string;
  category: string;
  actions: AccessActionCode[];
}

export interface AccessSystemDefinition {
  code: string;
  name: string;
  description: string;
  permissionPrefixes: string[];
  screens: AccessScreenDefinition[];
}

export const accessActions: AccessActionDefinition[] = [
  { code: "view", label: "Ler" },
  { code: "create", label: "Criar" },
  { code: "update", label: "Editar" },
  { code: "delete", label: "Deletar" },
  { code: "approve", label: "Aprovar" },
];

const defaultSystems: AccessSystemDefinition[] = [
  {
    code: "core-platform",
    name: "Core Admin",
    description: "Administração central de empresas, contratos, sistemas, acessos e usuários.",
    permissionPrefixes: ["platform", "core"],
    screens: [
      { code: "tenants", label: "Empresas", category: "Cadastro", actions: ["view", "create", "update", "delete"] },
      { code: "contracts", label: "Contratos", category: "Comercial", actions: ["view", "create", "update", "delete"] },
      { code: "products", label: "Sistemas", category: "Catálogo", actions: ["view", "create", "update", "delete"] },
      { code: "roles", label: "Acessos", category: "Segurança", actions: ["view", "create", "update", "delete"] },
      { code: "users", label: "Usuários", category: "Segurança", actions: ["view", "create", "update", "delete"] },
      { code: "audit", label: "Auditoria", category: "Controle", actions: ["view"] },
      { code: "settings", label: "Configurações", category: "Administração", actions: ["view", "update"] },
    ],
  },
  {
    code: "pmt",
    name: "BTT",
    description: "Produto acoplado para produtividade da manutenção.",
    permissionPrefixes: ["pmt"],
    screens: [
      { code: "projects", label: "Projetos BTT", category: "Operação", actions: ["view", "create", "update", "delete"] },
      { code: "employees", label: "Funcionários", category: "Cadastro", actions: ["view", "create", "update", "delete"] },
      { code: "daily_reports", label: "Diários", category: "Operação", actions: ["view", "create", "update", "delete"] },
      { code: "validation", label: "Validação", category: "Controle", actions: ["view", "update", "approve"] },
      { code: "calculations", label: "Cálculos", category: "Processamento", actions: ["view", "create"] },
      { code: "analytics", label: "Análises", category: "Gestão", actions: ["view"] },
      { code: "reports", label: "Relatórios", category: "Gestão", actions: ["view", "create"] },
      { code: "documents", label: "Documentos", category: "Apoio", actions: ["view", "create", "update", "delete"] },
      { code: "settings", label: "Configurações BTT", category: "Administração", actions: ["view", "update"] },
    ],
  },
];

export function buildAccessSystems(products: Product[], permissions: Permission[]): AccessSystemDefinition[] {
  const defaultsByCode = new Map(defaultSystems.map((system) => [system.code, system]));
  const productSystems = products.map((product) => {
    const defaultSystem = defaultsByCode.get(product.code);

    if (defaultSystem) {
      return {
        ...defaultSystem,
        name: product.name,
        description: product.description || defaultSystem.description,
      };
    }

    const prefix = product.code.split("-")[0];

    return {
      code: product.code,
      name: product.name,
      description: product.description || "Sistema cadastrado no Core.",
      permissionPrefixes: [prefix],
      screens: inferScreensForPrefix(prefix, permissions),
    };
  });
  const productCodes = new Set(productSystems.map((system) => system.code));
  const missingDefaults = defaultSystems.filter((system) => !productCodes.has(system.code));

  return [...productSystems, ...missingDefaults];
}

export function permissionCodeFor(system: AccessSystemDefinition, screen: AccessScreenDefinition, action: AccessActionCode) {
  const prefix = system.permissionPrefixes[0] ?? system.code;
  return `${prefix}.${screen.code}.${action}`;
}

export function findPermissionFor(
  permissions: Permission[],
  system: AccessSystemDefinition,
  screen: AccessScreenDefinition,
  action: AccessActionCode,
) {
  const expected = permissionCodeFor(system, screen, action);
  const manageFallback = `${system.permissionPrefixes[0]}.${screen.code}.manage`;

  return permissions.find((permission) => permission.code === expected || permission.code === manageFallback);
}

export function filterPermissionsBySystem(permissions: Permission[], system: AccessSystemDefinition) {
  return permissions.filter((permission) =>
    system.permissionPrefixes.some((prefix) => permission.code === prefix || permission.code.startsWith(`${prefix}.`)),
  );
}

function inferScreensForPrefix(prefix: string, permissions: Permission[]): AccessScreenDefinition[] {
  const screens = new Map<string, Set<AccessActionCode>>();

  permissions
    .filter((permission) => permission.code.startsWith(`${prefix}.`))
    .forEach((permission) => {
      const [, screenCode, actionCode] = permission.code.split(".");
      if (!screenCode || !isAccessAction(actionCode)) return;
      const actions = screens.get(screenCode) ?? new Set<AccessActionCode>();
      actions.add(actionCode);
      screens.set(screenCode, actions);
    });

  return [...screens.entries()].map(([screenCode, actions]) => ({
    code: screenCode,
    label: humanizeCode(screenCode),
    category: "Sistema",
    actions: [...actions],
  }));
}

function isAccessAction(action?: string): action is AccessActionCode {
  return action === "view" || action === "create" || action === "update" || action === "delete" || action === "approve";
}

function humanizeCode(code: string) {
  return code
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

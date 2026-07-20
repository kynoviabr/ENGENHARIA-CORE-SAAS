import {
  BadgeCheck,
  Building2,
  CreditCard,
  KeyRound,
  Layers3,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export const metrics = [
  {
    label: "Tenants ativos",
    value: "18",
    detail: "3 em onboarding",
    tone: "green",
  },
  {
    label: "Usuários vinculados",
    value: "426",
    detail: "RBAC por empresa",
    tone: "blue",
  },
  {
    label: "Módulos publicados",
    value: "12",
    detail: "catálogo genérico",
    tone: "blue",
  },
  {
    label: "Contratos monitorados",
    value: "31",
    detail: "7 renovam em 30 dias",
    tone: "yellow",
  },
] as const;

export const coreModules = [
  {
    id: "01",
    title: "Identidade",
    description: "Autenticação, sessões, recuperação de senha, confirmação de e-mail e provedores futuros.",
    tag: "auth",
    icon: KeyRound,
  },
  {
    id: "02",
    title: "Tenants",
    description: "Empresas isoladas por tenant_id, alternância de empresa ativa e status operacional.",
    tag: "multi-tenant",
    icon: Building2,
  },
  {
    id: "03",
    title: "Usuários",
    description: "Cadastro central, vínculos por empresa, convites, ativação e suspensão.",
    tag: "memberships",
    icon: UsersRound,
  },
  {
    id: "04",
    title: "RBAC",
    description: "Papéis, permissões padronizadas e autorização avaliada no contexto do tenant ativo.",
    tag: "access",
    icon: ShieldCheck,
  },
  {
    id: "05",
    title: "Produtos e módulos",
    description: "Catálogo genérico para liberar produtos e módulos de forma independente por empresa.",
    tag: "catalog",
    icon: Layers3,
  },
  {
    id: "06",
    title: "Contratos",
    description: "Planos, assinaturas, limites, vigências e entitlements prontos para integração futura.",
    tag: "billing",
    icon: CreditCard,
  },
] as const;

export const tenants = [
  {
    name: "Kynovia Labs",
    document: "00.000.000/0001-00",
    status: "active",
    users: 42,
    plan: "Platform Pro",
    renewal: "2026-08-20",
  },
  {
    name: "Northwind Cloud",
    document: "11.111.111/0001-11",
    status: "pending",
    users: 8,
    plan: "Core Trial",
    renewal: "2026-07-30",
  },
  {
    name: "Atlas Operations",
    document: "22.222.222/0001-22",
    status: "active",
    users: 67,
    plan: "Enterprise",
    renewal: "2026-10-05",
  },
  {
    name: "Orion Services",
    document: "33.333.333/0001-33",
    status: "suspended",
    users: 19,
    plan: "Platform Basic",
    renewal: "2026-07-22",
  },
] as const;

export const permissions = [
  "platform.users.view",
  "platform.users.create",
  "platform.users.update",
  "platform.roles.manage",
  "platform.settings.manage",
  "platform.contracts.view",
  "platform.contracts.manage",
  "platform.audit.view",
] as const;

export const users = [
  {
    name: "Amanda Rocha",
    email: "amanda@kynovia.com.br",
    tenant: "Kynovia Labs",
    role: "super_admin",
    status: "active",
    lastAccess: "2026-07-15 08:42",
  },
  {
    name: "Bruno Martins",
    email: "bruno@northwind.dev",
    tenant: "Northwind Cloud",
    role: "tenant_admin",
    status: "invited",
    lastAccess: "-",
  },
  {
    name: "Clara Nunes",
    email: "clara@atlasops.com",
    tenant: "Atlas Operations",
    role: "tenant_manager",
    status: "active",
    lastAccess: "2026-07-14 17:18",
  },
  {
    name: "Diego Almeida",
    email: "diego@orionservices.com",
    tenant: "Orion Services",
    role: "tenant_user",
    status: "suspended",
    lastAccess: "2026-07-01 10:04",
  },
] as const;

export const roles = [
  {
    name: "super_admin",
    scope: "global",
    permissions: 8,
    members: 2,
    description: "Administração completa da plataforma e operação do Core.",
  },
  {
    name: "platform_admin",
    scope: "global",
    permissions: 7,
    members: 4,
    description: "Gestão operacional sem acesso a configurações sensíveis.",
  },
  {
    name: "tenant_admin",
    scope: "tenant",
    permissions: 6,
    members: 28,
    description: "Administração completa dentro da empresa ativa.",
  },
  {
    name: "viewer",
    scope: "tenant",
    permissions: 2,
    members: 91,
    description: "Acesso de leitura para auditoria e acompanhamento.",
  },
] as const;

export const productModules = [
  {
    product: "core-platform",
    module: "identity",
    name: "Identidade e sessão",
    status: "active",
    tenants: 18,
    source: "core",
  },
  {
    product: "core-platform",
    module: "tenant-admin",
    name: "Administração de empresas",
    status: "active",
    tenants: 18,
    source: "core",
  },
  {
    product: "core-platform",
    module: "contracts",
    name: "Contratos e assinaturas",
    status: "pending",
    tenants: 7,
    source: "plan",
  },
  {
    product: "core-platform",
    module: "audit",
    name: "Auditoria",
    status: "planned",
    tenants: 0,
    source: "manual",
  },
] as const;

export const contracts = [
  {
    tenant: "Kynovia Labs",
    plan: "Platform Pro",
    status: "active",
    period: "2026-07-01 / 2026-08-01",
    limits: "100 usuários",
  },
  {
    tenant: "Northwind Cloud",
    plan: "Core Trial",
    status: "trial",
    period: "2026-07-10 / 2026-07-30",
    limits: "10 usuários",
  },
  {
    tenant: "Atlas Operations",
    plan: "Enterprise",
    status: "active",
    period: "2026-07-05 / 2026-10-05",
    limits: "500 usuários",
  },
  {
    tenant: "Orion Services",
    plan: "Platform Basic",
    status: "suspended",
    period: "2026-06-22 / 2026-07-22",
    limits: "25 usuários",
  },
] as const;

export const authProviders = [
  {
    name: "E-mail e senha",
    status: "planned",
    detail: "Fluxo base com confirmação de e-mail, recuperação de senha e políticas de sessão.",
  },
  {
    name: "Google",
    status: "planned",
    detail: "OAuth para onboarding rápido, preservando memberships por tenant.",
  },
  {
    name: "Outros provedores",
    status: "waiting",
    detail: "Arquitetura deve permitir novos provedores sem reescrever autorização.",
  },
] as const;

export const platformSettings = [
  {
    label: "Tenant ativo obrigatório",
    value: "Sim",
    detail: "Toda autorização operacional depende de tenant_id.",
  },
  {
    label: "Branding por empresa",
    value: "Preparado",
    detail: "Logo, favicon, cores e canais de suporte por tenant.",
  },
  {
    label: "Auditoria",
    value: "Planejada",
    detail: "Eventos de acesso, alterações administrativas e contratos.",
  },
  {
    label: "Ambiente Supabase",
    value: "DEV",
    detail: "Usará a base Supabase DEV do PMT-Braidotti.",
  },
] as const;

export const roadmap = [
  {
    title: "Base visual e app shell",
    status: "done",
    detail: "Next.js, tokens Kynovia, layout responsivo e painel inicial.",
  },
  {
    title: "Modelo multitenant",
    status: "next",
    detail: "Schemas, tenant_id obrigatório e helpers de contexto ativo.",
  },
  {
    title: "Supabase DEV",
    status: "waiting",
    detail: "Conectar Auth, Postgres, RLS e migrations na base compartilhada.",
  },
  {
    title: "RBAC persistente",
    status: "planned",
    detail: "Papéis, permissões, atribuições e checkAccess centralizado.",
  },
] as const;

export const statusLabels = {
  active: "Ativo",
  pending: "Pendente",
  draft: "Rascunho",
  suspended: "Suspenso",
  cancelled: "Cancelado",
  closed: "Fechado",
  expired: "Expirado",
  invited: "Convidado",
  removed: "Removido",
  trial: "Trial",
  past_due: "Em atraso",
  done: "Feito",
  next: "Próximo",
  waiting: "Aguardando",
  planned: "Planejado",
} as const;

export function statusClass(status: keyof typeof statusLabels): string {
  if (status === "active" || status === "done" || status === "closed") {
    return "pill-green";
  }

  if (
    status === "pending" ||
    status === "draft" ||
    status === "next" ||
    status === "waiting" ||
    status === "invited" ||
    status === "trial" ||
    status === "past_due"
  ) {
    return "pill-yellow";
  }

  if (status === "suspended" || status === "cancelled" || status === "expired" || status === "removed") {
    return "pill-red";
  }

  return "pill-blue";
}

export const productPrinciples = [
  {
    icon: BadgeCheck,
    title: "Core sem regra de negócio final",
    detail: "O repositório entrega identidade, acesso, licenciamento e administração reutilizável.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança por padrão",
    detail: "Permissões e limites sempre avaliados no contexto do tenant ativo.",
  },
  {
    icon: Layers3,
    title: "Extensível por produto",
    detail: "Produtos e módulos ficam genéricos para receber sistemas futuros sem acoplamento.",
  },
] as const;

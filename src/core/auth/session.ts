import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { coreStore } from "@/core/mock-store";
import { getSupabaseServerClient } from "@/core/supabase/server";
import { isSupabaseConfigured } from "@/core/supabase/config";

export interface SessionTenant {
  id: string;
  name: string;
  status: string;
  timezone?: string;
}

export interface CoreSession {
  mode: "mock" | "supabase";
  runtimeMode: "mock" | "supabase";
  user: {
    id: string;
    name: string;
    email: string;
  };
  activeTenant: SessionTenant;
  tenants: SessionTenant[];
  roles: string[];
  permissions: string[];
  products: string[];
  modules: string[];
}

export async function getCurrentSession(): Promise<CoreSession | null> {
  if (!isSupabaseConfigured()) {
    if (!isMockSessionAllowed()) {
      return null;
    }

    return getMockSession();
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    if (!isMockSessionAllowed()) {
      return null;
    }

    return getMockSession();
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (isMockSessionAllowed()) {
      return getMockSession();
    }

    return null;
  }

  return {
    mode: "supabase",
    runtimeMode: "supabase",
    user: {
      id: user.id,
      name: user.email ?? "Usuário Supabase",
      email: user.email ?? "",
    },
    activeTenant: {
      id: "pending-tenant-context",
      name: "Tenant pendente",
      status: "pending",
    },
    tenants: [],
    roles: [],
    permissions: [],
    products: [],
    modules: [],
  };
}

export async function requireSession(): Promise<CoreSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requirePermission(permission: string): Promise<CoreSession> {
  const session = await requireSession();

  if (!session.permissions.includes(permission)) {
    throw new Error(`Acesso negado: permissão necessária ${permission}`);
  }

  return session;
}

function isMockSessionAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_MOCK_AUTH === "true";
}

export const ACTIVE_TENANT_COOKIE = "core_active_tenant_id";

async function getMockSession(): Promise<CoreSession> {
  const user = {
    id: "7f40e2c9-8af0-4d47-b8b5-45f2f98f1a21",
    name: "Consultor Braidotti",
    email: "consultor@braidotti.com",
  };
  const tenants = [
    {
      id: "5e78e5fc-3482-4102-9bd4-f6fbe7035ef1",
      name: "Cliente Gerdau",
      status: "active",
      timezone: "America/Sao_Paulo",
    },
    {
      id: "8f8ce7d2-2b0e-4d21-bd44-cf8d930e1e22",
      name: "Cliente Eneva",
      status: "active",
      timezone: "America/Sao_Paulo",
    },
  ];
  const cookieStore = await cookies();
  const selectedTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value;
  const activeTenant = tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0];
  const platformPermissions = coreStore.permissions.map((permission) => permission.code);

  return {
    mode: "mock",
    runtimeMode: "mock",
    user,
    activeTenant,
    tenants,
    roles: ["Super Admin Braidotti", "Consultor BTT"],
    permissions: [...new Set([...platformPermissions, ...pmtMockPermissions])],
    products: ["core-platform", "pmt"],
    modules: ["identity", "tenant-admin", "contracts", "audit", "pmt-core", "pmt-admin", "pmt-reports"],
  };
}

const pmtMockPermissions = [
  "pmt.dashboard.view",
  "pmt.studies.view",
  "pmt.studies.create",
  "pmt.studies.update",
  "pmt.projects.view",
  "pmt.projects.create",
  "pmt.projects.update",
  "pmt.project_memberships.manage",
  "pmt.employees.view",
  "pmt.costs.view",
  "pmt.costs.manage",
  "pmt.employees.create",
  "pmt.employees.update",
  "pmt.employees.import",
  "pmt.observations.create",
  "pmt.observations.validate",
  "pmt.daily_reports.view",
  "pmt.daily_reports.create",
  "pmt.daily_reports.submit",
  "pmt.daily_reports.validate",
  "pmt.calculations.run",
  "pmt.analysis.view",
  "pmt.reports.view",
  "pmt.documents.view",
  "pmt.documents.manage",
  "pmt.action_items.manage",
  "pmt.methodologies.manage",
  "pmt.settings.manage",
];

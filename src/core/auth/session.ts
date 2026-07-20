import { redirect } from "next/navigation";
import { coreStore } from "@/core/mock-store";
import { getSupabaseServerClient } from "@/core/supabase/server";
import { isSupabaseConfigured } from "@/core/supabase/config";

export interface SessionTenant {
  id: string;
  name: string;
  status: string;
}

export interface CoreSession {
  mode: "mock" | "supabase";
  user: {
    id: string;
    name: string;
    email: string;
  };
  activeTenant: SessionTenant;
  tenants: SessionTenant[];
  roles: string[];
  permissions: string[];
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
    return null;
  }

  return {
    mode: "supabase",
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

function getMockSession(): CoreSession {
  const user = coreStore.users.find((item) => item.id === "user_amanda") ?? coreStore.users[0];
  const memberships = coreStore.memberships.filter(
    (membership) => membership.userId === user.id && membership.status === "active",
  );
  const tenants = memberships
    .map((membership) => coreStore.tenants.find((tenant) => tenant.id === membership.tenantId))
    .filter((tenant): tenant is NonNullable<typeof tenant> => Boolean(tenant))
    .map((tenant) => ({
      id: tenant.id,
      name: tenant.tradeName,
      status: tenant.status,
    }));
  const activeTenant = tenants[0];
  const roleIds = coreStore.userRoles
    .filter((userRole) => userRole.userId === user.id && userRole.tenantId === activeTenant.id)
    .map((userRole) => userRole.roleId);
  const roles = coreStore.roles.filter((role) => roleIds.includes(role.id));
  const permissionIds = new Set(roles.flatMap((role) => role.permissionIds));
  const permissions = coreStore.permissions
    .filter((permission) => permissionIds.has(permission.id))
    .map((permission) => permission.code);

  return {
    mode: "mock",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    activeTenant,
    tenants,
    roles: roles.map((role) => role.name),
    permissions,
  };
}

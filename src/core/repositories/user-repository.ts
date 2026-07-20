import { coreStore } from "../mock-store";
import { getSupabaseServerClient } from "../supabase/server";
import type { CoreUser, MembershipStatus } from "../types";

export interface UserMembershipListItem {
  membershipId: string;
  userId: string;
  tenantId: string;
  roleId: string | null;
  name: string;
  email: string;
  tenant: string;
  role: string;
  status: MembershipStatus;
  userStatus: CoreUser["status"];
  lastAccess: string;
}

export interface UserMembershipInput {
  name: string;
  email: string;
  tenantId: string;
  roleId: string;
  status: MembershipStatus;
  userStatus: CoreUser["status"];
}

export async function listUserRows(): Promise<CoreUser[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.users;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, status, last_access_at, created_at, updated_at")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to list users: ${error.message}`);
  }

  return data.map((user) => ({
    id: user.id,
    name: user.full_name,
    email: user.email,
    status: user.status === "removed" ? "suspended" : user.status,
    lastAccessAt: user.last_access_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }));
}

export async function listUserMembershipRows(): Promise<UserMembershipListItem[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.memberships.map(mapMockMembership);
  }

  const [
    { data: memberships, error: membershipsError },
    { data: profiles, error: profilesError },
    { data: tenants, error: tenantsError },
    { data: roles, error: rolesError },
    { data: userRoles, error: userRolesError },
  ] = await Promise.all([
    supabase.from("tenant_memberships").select("id, tenant_id, user_id, status"),
    supabase.from("profiles").select("id, full_name, email, status, last_access_at"),
    supabase.from("tenants").select("id, trade_name"),
    supabase.from("roles").select("id, name"),
    supabase.from("user_roles").select("id, tenant_id, user_id, role_id"),
  ]);

  const error = membershipsError ?? profilesError ?? tenantsError ?? rolesError ?? userRolesError;

  if (error) {
    throw new Error(`Unable to list user memberships: ${error.message}`);
  }

  const membershipRows = memberships ?? [];
  const profileRows = profiles ?? [];
  const tenantRows = tenants ?? [];
  const roleRows = roles ?? [];
  const userRoleRows = userRoles ?? [];

  return membershipRows.map((membership) => {
    const profile = profileRows.find((item) => item.id === membership.user_id);
    const tenant = tenantRows.find((item) => item.id === membership.tenant_id);
    const userRole = userRoleRows.find(
      (item) => item.user_id === membership.user_id && item.tenant_id === membership.tenant_id,
    );
    const role = roleRows.find((item) => item.id === userRole?.role_id);

    return {
      membershipId: membership.id,
      userId: membership.user_id,
      tenantId: membership.tenant_id,
      roleId: userRole?.role_id ?? null,
      name: profile?.full_name ?? "Usuário desconhecido",
      email: profile?.email ?? "-",
      tenant: tenant?.trade_name ?? "Tenant desconhecido",
      role: role?.name ?? "sem_papel",
      status: membership.status,
      userStatus: profile?.status === "removed" ? "suspended" : (profile?.status ?? "invited"),
      lastAccess: formatLastAccess(profile?.last_access_at ?? null),
    };
  });
}

export async function getUserMembershipRowById(id: string): Promise<UserMembershipListItem | null> {
  const memberships = await listUserMembershipRows();

  return memberships.find((membership) => membership.membershipId === id) ?? null;
}

export async function createUserMembershipRow(input: UserMembershipInput): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "mock-created-membership";
  }

  void input;

  throw new Error(
    "Unable to create user invitation without a secure Supabase Auth invite flow configured.",
  );
}

export async function updateUserMembershipRow(
  membershipId: string,
  input: UserMembershipInput,
): Promise<void> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const existing = await getUserMembershipRowById(membershipId);

  if (!existing) {
    throw new Error("Unable to update user membership: membership not found");
  }

  const now = new Date().toISOString();

  const [{ error: profileError }, { error: membershipError }] = await Promise.all([
    supabase
      .from("profiles")
      .update({
        full_name: input.name,
        email: input.email,
        status: input.userStatus,
        updated_at: now,
      })
      .eq("id", existing.userId),
    supabase
      .from("tenant_memberships")
      .update({
        tenant_id: input.tenantId,
        status: input.status,
        updated_at: now,
      })
      .eq("id", membershipId),
  ]);

  const error = profileError ?? membershipError;

  if (error) {
    throw new Error(`Unable to update user membership: ${error.message}`);
  }

  await replaceUserRole(existing.userId, existing.tenantId, input.tenantId, input.roleId);
}

export async function updateUserMembershipStatus(
  membershipId: string,
  status: MembershipStatus,
): Promise<void> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("tenant_memberships")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", membershipId);

  if (error) {
    throw new Error(`Unable to update user membership status: ${error.message}`);
  }
}

async function replaceUserRole(
  userId: string,
  previousTenantId: string,
  nextTenantId: string,
  roleId: string,
) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error: deleteError } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("tenant_id", previousTenantId);

  if (deleteError) {
    throw new Error(`Unable to replace user role: ${deleteError.message}`);
  }

  if (nextTenantId !== previousTenantId) {
    const { error: deleteNextError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("tenant_id", nextTenantId);

    if (deleteNextError) {
      throw new Error(`Unable to replace user role: ${deleteNextError.message}`);
    }
  }

  const { error: insertError } = await supabase.from("user_roles").insert({
    tenant_id: nextTenantId,
    user_id: userId,
    role_id: roleId,
  });

  if (insertError) {
    throw new Error(`Unable to assign user role: ${insertError.message}`);
  }
}

function mapMockMembership(membership: (typeof coreStore.memberships)[number]): UserMembershipListItem {
  const user = coreStore.users.find((item) => item.id === membership.userId);
  const tenant = coreStore.tenants.find((item) => item.id === membership.tenantId);
  const userRole = coreStore.userRoles.find(
    (item) => item.userId === membership.userId && item.tenantId === membership.tenantId,
  );
  const role = coreStore.roles.find((item) => item.id === userRole?.roleId);

  return {
    membershipId: membership.id,
    userId: membership.userId,
    tenantId: membership.tenantId,
    roleId: userRole?.roleId ?? null,
    name: user?.name ?? "Usuário desconhecido",
    email: user?.email ?? "-",
    tenant: tenant?.tradeName ?? "Tenant desconhecido",
    role: role?.name ?? "sem_papel",
    status: membership.status,
    userStatus: user?.status ?? "invited",
    lastAccess: formatLastAccess(user?.lastAccessAt ?? null),
  };
}

function formatLastAccess(value: string | null): string {
  return value ? value.replace("T", " ").replace(":00Z", "") : "-";
}

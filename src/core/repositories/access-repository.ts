import { coreStore } from "../mock-store";
import { getSupabaseServerClient } from "../supabase/server";
import type { Permission, Role, RoleScope } from "../types";

export interface RoleInput {
  name: string;
  scope: RoleScope;
  tenantId: string | null;
  description: string;
  permissionIds: string[];
}

export interface RoleListItem extends Role {
  permissionCount: number;
  memberCount: number;
  tenantName: string;
}

export async function listPermissionRows(): Promise<Permission[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.permissions;
  }

  const { data, error } = await supabase
    .from("permissions")
    .select("id, code, description")
    .order("code", { ascending: true });

  if (error) {
    throw new Error(`Unable to list permissions: ${error.message}`);
  }

  return data.map((permission) => ({
    id: permission.id,
    code: permission.code,
    description: permission.description,
  }));
}

export async function listRoleRows(): Promise<Role[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.roles;
  }

  const [{ data: roles, error: rolesError }, { data: rolePermissions, error: rolePermissionsError }] =
    await Promise.all([
      supabase.from("roles").select("id, tenant_id, name, scope, description").order("name", { ascending: true }),
      supabase.from("role_permissions").select("role_id, permission_id"),
    ]);

  const error = rolesError ?? rolePermissionsError;

  if (error) {
    throw new Error(`Unable to list roles: ${error.message}`);
  }

  return (roles ?? []).map((role) => ({
    id: role.id,
    tenantId: role.tenant_id,
    name: role.name,
    scope: role.scope,
    description: role.description,
    permissionIds: (rolePermissions ?? [])
      .filter((permission) => permission.role_id === role.id)
      .map((permission) => permission.permission_id),
  }));
}

export async function listRoleListRows(): Promise<RoleListItem[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.roles.map((role) => {
      const tenant = coreStore.tenants.find((item) => item.id === role.tenantId);

      return {
        ...role,
        permissionCount: role.permissionIds.length,
        memberCount: coreStore.userRoles.filter((item) => item.roleId === role.id).length,
        tenantName: tenant?.tradeName ?? "Global",
      };
    });
  }

  const [
    { data: roles, error: rolesError },
    { data: rolePermissions, error: rolePermissionsError },
    { data: userRoles, error: userRolesError },
    { data: tenants, error: tenantsError },
  ] = await Promise.all([
    supabase.from("roles").select("id, tenant_id, name, scope, description").order("name", { ascending: true }),
    supabase.from("role_permissions").select("role_id, permission_id"),
    supabase.from("user_roles").select("role_id"),
    supabase.from("tenants").select("id, trade_name"),
  ]);

  const error = rolesError ?? rolePermissionsError ?? userRolesError ?? tenantsError;

  if (error) {
    throw new Error(`Unable to list role rows: ${error.message}`);
  }

  return (roles ?? []).map((role) => {
    const permissionIds = (rolePermissions ?? [])
      .filter((permission) => permission.role_id === role.id)
      .map((permission) => permission.permission_id);
    const tenant = (tenants ?? []).find((item) => item.id === role.tenant_id);

    return {
      id: role.id,
      tenantId: role.tenant_id,
      name: role.name,
      scope: role.scope,
      description: role.description,
      permissionIds,
      permissionCount: permissionIds.length,
      memberCount: (userRoles ?? []).filter((item) => item.role_id === role.id).length,
      tenantName: tenant?.trade_name ?? "Global",
    };
  });
}

export async function getRoleRowById(id: string): Promise<Role | null> {
  const roles = await listRoleRows();

  return roles.find((role) => role.id === id) ?? null;
}

export async function createRoleRow(input: RoleInput): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "mock-created-role";
  }

  const { data, error } = await supabase
    .from("roles")
    .insert({
      tenant_id: input.tenantId,
      name: input.name,
      scope: input.scope,
      description: input.description,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create role: ${error.message}`);
  }

  await replaceRolePermissions(data.id, input.permissionIds);

  return data.id;
}

export async function updateRoleRow(id: string, input: RoleInput): Promise<void> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("roles")
    .update({
      tenant_id: input.tenantId,
      name: input.name,
      scope: input.scope,
      description: input.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to update role: ${error.message}`);
  }

  await replaceRolePermissions(id, input.permissionIds);
}

async function replaceRolePermissions(roleId: string, permissionIds: string[]) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_id", roleId);

  if (deleteError) {
    throw new Error(`Unable to replace role permissions: ${deleteError.message}`);
  }

  if (permissionIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("role_permissions").insert(
    permissionIds.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    })),
  );

  if (insertError) {
    throw new Error(`Unable to assign role permissions: ${insertError.message}`);
  }
}

import { coreStore } from "../mock-store";
import { getSupabaseServerClient } from "../supabase/server";
import type { AuditLog } from "../types";

export interface AuditLogListItem extends AuditLog {
  tenantName: string;
  actorName: string;
}

export async function listAuditLogRows(): Promise<AuditLog[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.auditLogs;
  }

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, tenant_id, actor_user_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Unable to list audit logs: ${error.message}`);
  }

  return (data ?? []).map((log) => ({
    id: log.id,
    tenantId: log.tenant_id,
    actorUserId: log.actor_user_id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    metadata: isObjectRecord(log.metadata) ? log.metadata : {},
    createdAt: log.created_at,
  }));
}

export async function listAuditLogListRows(): Promise<AuditLogListItem[]> {
  const [logs, tenants, users] = await Promise.all([
    listAuditLogRows(),
    listTenantLiteRows(),
    listUserLiteRows(),
  ]);

  return logs.map((log) => {
    const tenant = tenants.find((item) => item.id === log.tenantId);
    const user = users.find((item) => item.id === log.actorUserId);

    return {
      ...log,
      tenantName: tenant?.tradeName ?? "Plataforma",
      actorName: user?.name ?? "Sistema",
    };
  });
}

export async function getAuditLogRowById(id: string): Promise<AuditLogListItem | null> {
  const logs = await listAuditLogListRows();

  return logs.find((log) => log.id === id) ?? null;
}

export async function createAuditLogRow(input: Omit<AuditLog, "id" | "createdAt">): Promise<string> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "mock-created-audit-log";
  }

  void input;

  throw new Error("Audit log writes require a secure server-side writer before enabling Supabase inserts.");
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
    throw new Error(`Unable to list tenants for audit logs: ${error.message}`);
  }

  return (data ?? []).map((tenant) => ({
    id: tenant.id,
    tradeName: tenant.trade_name,
  }));
}

async function listUserLiteRows() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return coreStore.users.map((user) => ({
      id: user.id,
      name: user.name,
    }));
  }

  const { data, error } = await supabase.from("profiles").select("id, full_name");

  if (error) {
    throw new Error(`Unable to list users for audit logs: ${error.message}`);
  }

  return (data ?? []).map((user) => ({
    id: user.id,
    name: user.full_name,
  }));
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

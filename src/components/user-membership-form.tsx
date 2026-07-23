"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildAccessSystems,
  filterPermissionsBySystem,
} from "@/core/access-matrix";
import type { EntitlementListItem } from "@/core/repositories/catalog-repository";
import type { UserMembershipListItem } from "@/core/repositories/user-repository";
import type { Permission, Product, Role, Tenant } from "@/core/types";

interface UserMembershipFormProps {
  action: (formData: FormData) => void | Promise<void>;
  entitlements: EntitlementListItem[];
  membership?: UserMembershipListItem;
  permissions: Permission[];
  products: Product[];
  roles: Role[];
  submitLabel: string;
  tenants: Tenant[];
}

export function UserMembershipForm({
  action,
  entitlements,
  membership,
  permissions,
  products,
  roles,
  submitLabel,
  tenants,
}: UserMembershipFormProps) {
  const systems = useMemo(() => buildAccessSystems(products, permissions), [permissions, products]);
  const [selectedTenantId, setSelectedTenantId] = useState(membership?.tenantId ?? tenants[0]?.id ?? "");
  const tenantSystemOptions = useMemo(() => {
    const activeEntitlements = entitlements.filter(
      (entitlement) => entitlement.tenantId === selectedTenantId && entitlement.status === "active",
    );
    const entitledProductIds = new Set(activeEntitlements.map((entitlement) => entitlement.productId));

    return systems.filter((system) => {
      const product = products.find((item) => item.code === system.code);
      return product ? entitledProductIds.has(product.id) : system.code === "core-platform";
    });
  }, [entitlements, products, selectedTenantId, systems]);
  const initialSystemCode = inferSystemCodeFromRole(membership?.roleId ?? null, roles, permissions, systems);
  const [selectedSystemCode, setSelectedSystemCode] = useState(
    initialSystemCode && tenantSystemOptions.some((system) => system.code === initialSystemCode)
      ? initialSystemCode
      : tenantSystemOptions[0]?.code ?? "",
  );
  const selectedSystem =
    tenantSystemOptions.find((system) => system.code === selectedSystemCode) ?? tenantSystemOptions[0];
  const selectedSystemPermissionIds = new Set(
    selectedSystem ? filterPermissionsBySystem(permissions, selectedSystem).map((permission) => permission.id) : [],
  );
  const roleOptions = selectedSystem
    ? roles.filter((role) => role.permissionIds.some((permissionId) => selectedSystemPermissionIds.has(permissionId)))
    : [];
  const currentRoleStillValid = roleOptions.some((role) => role.id === membership?.roleId);

  function handleTenantChange(tenantId: string) {
    const activeEntitlements = entitlements.filter(
      (entitlement) => entitlement.tenantId === tenantId && entitlement.status === "active",
    );
    const entitledProductIds = new Set(activeEntitlements.map((entitlement) => entitlement.productId));
    const nextSystems = systems.filter((system) => {
      const product = products.find((item) => item.code === system.code);
      return product ? entitledProductIds.has(product.id) : system.code === "core-platform";
    });

    setSelectedTenantId(tenantId);
    setSelectedSystemCode(nextSystems[0]?.code ?? "");
  }

  return (
    <form action={action} className="grid gap-4">
      <section className="grid gap-3">
        <h3 className="text-[14px] font-semibold leading-tight text-[var(--text)]">Empresa e sistema</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="field-label">Empresa</span>
            <select
              className="field-control"
              name="tenantId"
              onChange={(event) => handleTenantChange(event.target.value)}
              required
              value={selectedTenantId}
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.tradeName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="field-label">Sistema</span>
            <select
              className="field-control"
              disabled={tenantSystemOptions.length === 0}
              name="systemCode"
              onChange={(event) => setSelectedSystemCode(event.target.value)}
              required
              value={selectedSystemCode}
            >
              {tenantSystemOptions.length === 0 ? <option value="">Nenhum sistema liberado</option> : null}
              {tenantSystemOptions.map((system) => (
                <option key={system.code} value={system.code}>
                  {system.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="text-[14px] font-semibold leading-tight text-[var(--text)]">Usuário</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field defaultValue={membership?.name} label="Nome" name="name" required />
          <Field defaultValue={membership?.email} label="E-mail" name="email" required type="email" />

          <label className="block">
            <span className="field-label">Perfil de acesso</span>
            <select
              key={selectedSystemCode}
              className="field-control"
              defaultValue={currentRoleStillValid ? membership?.roleId ?? roleOptions[0]?.id : roleOptions[0]?.id}
              disabled={!selectedSystem || roleOptions.length === 0}
              name="roleId"
              required
            >
              {roleOptions.length === 0 ? <option value="">Nenhum perfil disponível</option> : null}
              {roleOptions.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="field-label">Status do vínculo</span>
            <select className="field-control" defaultValue={membership?.status ?? "invited"} name="status">
              <option value="invited">Convidado</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
              <option value="removed">Removido</option>
            </select>
          </label>

          <label className="block">
            <span className="field-label">Status do usuário</span>
            <select className="field-control" defaultValue={membership?.userStatus ?? "invited"} name="userStatus">
              <option value="invited">Convidado</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
            </select>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        <Link className="btn btn-outline" href="/usuarios">
          Cancelar
        </Link>
        <button className="btn btn-primary" disabled={!selectedSystem || roleOptions.length === 0} type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}

function Field({ defaultValue, label, name, required = false, type = "text" }: FieldProps) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field-control" defaultValue={defaultValue} name={name} required={required} type={type} />
    </label>
  );
}

function inferSystemCodeFromRole(
  roleId: string | null,
  roles: Role[],
  permissions: Permission[],
  systems: ReturnType<typeof buildAccessSystems>,
) {
  const role = roles.find((item) => item.id === roleId);
  if (!role) return "";

  return (
    systems.find((system) => {
      const systemPermissionIds = new Set(filterPermissionsBySystem(permissions, system).map((permission) => permission.id));
      return role.permissionIds.some((permissionId) => systemPermissionIds.has(permissionId));
    })?.code ?? ""
  );
}

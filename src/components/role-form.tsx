"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import {
  accessActions,
  buildAccessSystems,
  findPermissionFor,
  permissionCodeFor,
} from "@/core/access-matrix";
import type { Permission, Product, Role } from "@/core/types";

interface RoleFormProps {
  action: (formData: FormData) => void | Promise<void>;
  permissions: Permission[];
  products: Product[];
  role?: Role;
  submitLabel: string;
}

export function RoleForm({ action, permissions, products, role, submitLabel }: RoleFormProps) {
  const systems = useMemo(() => buildAccessSystems(products, permissions), [permissions, products]);
  const systemWithRolePermissions = systems.find((system) =>
    system.screens.some((screen) =>
      screen.actions.some((accessAction) => {
        const permission = findPermissionFor(permissions, system, screen, accessAction);

        return permission ? role?.permissionIds.includes(permission.id) : false;
      }),
    ),
  );
  const [selectedSystemCode, setSelectedSystemCode] = useState(systemWithRolePermissions?.code ?? "");
  const selectedSystem = systems.find((system) => system.code === selectedSystemCode) ?? systems[0];
  const selectedSystemPermissionIds = selectedSystem
    ? new Set(
        selectedSystem.screens.flatMap((screen) =>
          screen.actions
            .map((accessAction) => findPermissionFor(permissions, selectedSystem, screen, accessAction)?.id)
            .filter((permissionId): permissionId is string => Boolean(permissionId)),
        ),
      )
    : new Set<string>();
  const preservedPermissionIds =
    role?.permissionIds.filter((permissionId) => !selectedSystemPermissionIds.has(permissionId)) ?? [];
  const canConfigure = Boolean(selectedSystemCode);

  return (
    <form action={action} className="grid gap-4">
      <input name="scope" type="hidden" value="global" />
      <input name="tenantId" type="hidden" value="" />
      {preservedPermissionIds.map((permissionId) => (
        <input key={permissionId} name="permissionIds" type="hidden" value={permissionId} />
      ))}

      <div className="grid gap-3">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Sistema
          </span>
          <select
            className="mt-1.5 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[13.5px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            onChange={(event) => setSelectedSystemCode(event.target.value)}
            value={selectedSystemCode}
          >
            <option value="">Selecione o sistema</option>
            {systems.map((system) => (
              <option key={system.code} value={system.code}>
                {system.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!canConfigure ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg2)] px-4 py-4 text-[13px] text-[var(--text2)]">
          Selecione um sistema para visualizar, editar ou criar perfis de acesso.
        </div>
      ) : null}

      {canConfigure ? (
        <>
          <section className="grid gap-3 border-t border-[var(--border)] pt-4">
            <div>
              <h3 className="text-[16px] font-semibold leading-tight text-[var(--text)]">Perfil</h3>
              <p className="mt-1 text-[12.5px] text-[var(--text2)]">
                Crie ou ajuste o perfil que será aplicado aos usuários deste sistema.
              </p>
            </div>

            <div className="grid gap-3">
              <Field defaultValue={role?.name} label="Nome do perfil" name="name" required />

              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
                  Descrição
                </span>
                <textarea
                  className="mt-1.5 min-h-16 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[13.5px] leading-5 text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
                  defaultValue={role?.description}
                  name="description"
                  required
                />
              </label>
            </div>
          </section>

          <section className="grid gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
              Matriz de permissões
            </div>
            <p className="mt-0.5 text-[12.5px] text-[var(--text2)]">
              Configure o que este perfil pode fazer nas telas do sistema selecionado.
            </p>
          </div>
          <span className="pill pill-blue">Sem marcação = sem acesso</span>
        </div>

        {selectedSystem ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg2)]">
            <div className="border-b border-[var(--border)] px-4 py-2.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
                Matriz de permissões
              </div>
              <h3 className="mt-0.5 text-[14px] font-medium text-[var(--text)]">{selectedSystem.name}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg3)] text-[11px] uppercase tracking-[0.04em] text-[var(--text3)]">
                    <th className="px-4 py-2.5 font-medium">Tela</th>
                    <th className="px-3 py-2.5 font-medium">Sem acesso</th>
                    {accessActions.map((accessAction) => (
                      <th className="px-3 py-2.5 font-medium" key={accessAction.code}>
                        {accessAction.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {selectedSystem.screens.map((screen) => (
                    <tr key={screen.code}>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-[var(--text)]">{screen.label}</div>
                        <div className="mt-1 text-[12px] text-[var(--text2)]">{screen.category}</div>
                      </td>
                      <td className="px-3 py-2.5 text-[12.5px] text-[var(--text2)]">Padrão</td>
                      {accessActions.map((accessAction) => {
                        const available = screen.actions.includes(accessAction.code);
                        const permission = available ? findPermissionFor(permissions, selectedSystem, screen, accessAction.code) : null;
                        const code = permissionCodeFor(selectedSystem, screen, accessAction.code);
                        const checked = permission ? role?.permissionIds.includes(permission.id) ?? false : false;

                        return (
                          <td className="px-3 py-2.5" key={accessAction.code}>
                            {available ? (
                              <PermissionToggle
                                checked={checked}
                                disabled={!permission}
                                label={permission?.code ?? `${code} ainda não existe no catálogo de permissões`}
                                value={permission?.id ?? ""}
                              />
                            ) : (
                              <span className="text-[var(--text3)]">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
          </section>

          <div className="flex flex-wrap justify-end gap-2">
            <Link className="btn btn-outline" href="/acesso">
              Cancelar
            </Link>
            <button className="btn btn-primary" type="submit">
              {submitLabel}
            </button>
          </div>
        </>
      ) : null}
    </form>
  );
}

function PermissionToggle({
  checked,
  disabled,
  label,
  value,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  value: string;
}) {
  return (
    <label className={`relative inline-flex h-7 w-7 items-center justify-center ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`} title={label}>
      <input
        className="peer sr-only"
        defaultChecked={checked}
        disabled={disabled}
        name="permissionIds"
        type="checkbox"
        value={value}
      />
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-transparent transition peer-checked:border-[var(--border-b)] peer-checked:bg-[var(--accent-soft)] peer-checked:text-[var(--blue-xl)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--blue-xl)]">
        <Check size={13} strokeWidth={2} />
      </span>
    </label>
  );
}

interface FieldProps {
  defaultValue?: string;
  disabled?: boolean;
  label: string;
  name: string;
  required?: boolean;
}

function Field({ defaultValue, disabled = false, label, name, required = false }: FieldProps) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
        {label}
      </span>
      <input
        className="mt-1.5 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[13.5px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)] disabled:cursor-not-allowed disabled:opacity-60"
        defaultValue={defaultValue}
        disabled={disabled}
        name={name}
        required={required}
        type="text"
      />
    </label>
  );
}

"use client";

import Link from "next/link";
import { Check, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { DataPanel } from "@/components/data-panel";
import {
  accessActions,
  buildAccessSystems,
  filterPermissionsBySystem,
  findPermissionFor,
} from "@/core/access-matrix";
import type { RoleListItem } from "@/core/repositories/access-repository";
import type { Permission, Product } from "@/core/types";

interface AccessWorkspaceProps {
  permissions: Permission[];
  products: Product[];
  roles: RoleListItem[];
}

export function AccessWorkspace({ permissions, products, roles }: AccessWorkspaceProps) {
  const systems = useMemo(() => buildAccessSystems(products, permissions), [permissions, products]);
  const [selectedSystemCode, setSelectedSystemCode] = useState("");
  const selectedSystem = systems.find((system) => system.code === selectedSystemCode);
  const selectedPermissions = selectedSystem ? filterPermissionsBySystem(permissions, selectedSystem) : [];
  const selectedPermissionIds = new Set(selectedPermissions.map((permission) => permission.id));
  const selectedRoles = selectedSystem
    ? roles.filter((role) => role.permissionIds.some((permissionId) => selectedPermissionIds.has(permissionId)))
    : [];

  if (systems.length === 0) {
    return (
      <DataPanel title="Nenhum sistema cadastrado">
        <div className="p-4 text-[13px] leading-6 text-[var(--text2)]">
          Cadastre um sistema para consultar e administrar seus perfis de acesso.
        </div>
      </DataPanel>
    );
  }

  return (
    <div className="space-y-4">
      <DataPanel title="Sistema">
        <div className="grid gap-3 p-4 md:grid-cols-[1fr_360px] md:items-end">
          <div>
            <p className="text-[13px] leading-6 text-[var(--text2)]">
              Selecione um sistema para visualizar os perfis existentes e revisar a matriz de permissões.
            </p>
          </div>
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
      </DataPanel>

      {!selectedSystem ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg2)] px-4 py-5 text-[13px] text-[var(--text2)]">
          Escolha um sistema para ver os perfis de acesso cadastrados.
        </div>
      ) : (
        <>
          <DataPanel title={`Perfis de ${selectedSystem.name}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg3)] text-[11px] uppercase tracking-[0.04em] text-[var(--text3)]">
                    <th className="px-4 py-2.5 font-medium">Perfil</th>
                    <th className="px-3 py-2.5 font-medium">Permissões</th>
                    <th className="px-3 py-2.5 font-medium">Usuários</th>
                    <th className="px-3 py-2.5 font-medium">Aplicação</th>
                    <th className="px-3 py-2.5 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {selectedRoles.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-[13px] text-[var(--text2)]" colSpan={5}>
                        Nenhum perfil usa permissões deste sistema ainda.
                      </td>
                    </tr>
                  ) : null}
                  {selectedRoles.map((role) => (
                    <tr className="bg-[var(--bg2)]" key={role.id}>
                      <td className="px-4 py-3">
                        <Link className="font-medium text-[var(--text)] hover:text-[var(--blue-xl)]" href={`/acesso/${role.id}`}>
                          {role.name}
                        </Link>
                        <p className="mt-1 text-[12.5px] leading-5 text-[var(--text2)]">{role.description}</p>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-[var(--text2)]">{role.permissionCount}</td>
                      <td className="px-3 py-3 text-[13px] text-[var(--text2)]">{role.memberCount}</td>
                      <td className="px-3 py-3">
                        <span className="pill pill-blue">Global</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link className="btn btn-outline h-8 px-3 text-[12.5px]" href={`/acesso/${role.id}`}>
                          <Pencil size={13} />
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>

          <DataPanel title={`Matriz de ${selectedSystem.name}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg3)] text-[11px] uppercase tracking-[0.04em] text-[var(--text3)]">
                    <th className="px-4 py-2.5 font-medium">Tela</th>
                    <th className="px-3 py-2.5 font-medium">Categoria</th>
                    <th className="px-3 py-2.5 font-medium">Sem acesso</th>
                    {accessActions.map((action) => (
                      <th className="px-3 py-2.5 font-medium" key={action.code}>
                        {action.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {selectedSystem.screens.map((screen) => (
                    <tr className="bg-[var(--bg2)]" key={screen.code}>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-[var(--text)]">{screen.label}</div>
                        <div className="mt-1 font-mono text-[11px] text-[var(--text3)]">
                          {selectedSystem.permissionPrefixes[0]}.{screen.code}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[12.5px] text-[var(--text2)]">{screen.category}</td>
                      <td className="px-3 py-2.5 text-[12.5px] text-[var(--text2)]">Opção do perfil</td>
                      {accessActions.map((action) => {
                        const available = screen.actions.includes(action.code);
                        const permission = available ? findPermissionFor(permissions, selectedSystem, screen, action.code) : null;

                        return (
                          <td className="px-3 py-2.5" key={action.code}>
                            {available ? (
                              <span
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                                  permission
                                    ? "border-[var(--border-b)] bg-[var(--accent-soft)] text-[var(--blue-xl)]"
                                    : "border-[var(--border)] bg-[var(--bg)] text-[var(--text3)]"
                                }`}
                                title={permission?.code ?? "Permissão ainda não cadastrada no banco"}
                              >
                                <Check size={13} strokeWidth={1.8} />
                              </span>
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
          </DataPanel>
        </>
      )}
    </div>
  );
}

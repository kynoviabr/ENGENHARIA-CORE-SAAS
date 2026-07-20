import { Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { listPermissionRows, listRoleListRows } from "@/core/repositories/access-repository";

interface AcessoPageProps {
  searchParams: Promise<{
    accessAction?: string;
  }>;
}

export default async function AcessoPage({ searchParams }: AcessoPageProps) {
  const { accessAction } = await searchParams;
  const [roles, permissions] = await Promise.all([listRoleListRows(), listPermissionRows()]);
  const summary = {
    roles: roles.length,
    permissions: permissions.length,
    checkAccessContracts: 1,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Acesso"
        title="RBAC e permissões"
        description="Autorização baseada em papéis, permissões padronizadas e avaliação sempre contextualizada pelo tenant ativo."
        action={
          <Link className="btn btn-primary" href="/acesso/novo">
            <Plus size={15} />
            Novo papel
          </Link>
        }
      />

      {accessAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.08)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{accessAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Papéis iniciais" value={summary.roles.toString()} detail="Globais e restritos por empresa." />
        <InfoCard label="Permissões" value={summary.permissions.toString()} detail="Códigos padronizados para autorização." />
        <InfoCard label="Check central" value={summary.checkAccessContracts.toString()} detail="Contrato futuro para checkAccess()." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <DataPanel eyebrow="// Roles" title="Papéis configurados">
          <div className="divide-y divide-[var(--border)]">
            {roles.map((role) => (
              <article className="p-5" key={role.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      className="font-mono text-[13px] text-[var(--blue-xl)] hover:text-[var(--text)]"
                      href={`/acesso/${role.id}`}
                    >
                      {role.name}
                    </Link>
                    <p className="mt-2 text-[13.5px] leading-6 text-[var(--text2)]">{role.description}</p>
                  </div>
                  <span className="pill pill-blue">{role.scope}</span>
                </div>
                <div className="mt-4 grid gap-3 text-[12.5px] text-[var(--text2)] sm:grid-cols-3">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                    <span className="font-mono text-[var(--text3)]">Tenant</span>
                    <div className="mt-1 font-semibold text-[var(--text)]">{role.tenantName}</div>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                    <span className="font-mono text-[var(--text3)]">Permissões</span>
                    <div className="mt-1 font-semibold text-[var(--text)]">{role.permissionCount}</div>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                    <span className="font-mono text-[var(--text3)]">Membros</span>
                    <div className="mt-1 font-semibold text-[var(--text)]">{role.memberCount}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </DataPanel>

        <DataPanel eyebrow="// Permissions" title="Catálogo inicial">
          <div className="space-y-2 p-5">
            {permissions.map((permission) => (
              <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5" key={permission.id}>
                <ShieldCheck size={15} strokeWidth={1.4} className="text-[var(--blue-xl)]" />
                <span className="font-mono text-[12px] text-[var(--text2)]">{permission.code}</span>
              </div>
            ))}
          </div>
        </DataPanel>
      </section>
    </div>
  );
}

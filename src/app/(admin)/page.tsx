import { ArrowUpRight, CheckCircle2, Database, Plus, ShieldCheck } from "lucide-react";
import { DashboardCard } from "@/components/dashboard-card";
import { StatusPill } from "@/components/status-pill";
import {
  coreModules,
  productPrinciples,
  roadmap,
} from "@/lib/core-data";
import { getAccessPreview, getDashboardMetrics, listPermissions, listTenants } from "@/core/services";

export default function Home() {
  const metrics = getDashboardMetrics();
  const permissions = listPermissions();
  const tenants = listTenants();
  const accessPreview = getAccessPreview();

  return (
    <div className="space-y-6">
        <section className="grid gap-5 rounded-[14px] border border-[var(--border)] bg-[rgba(17,17,18,0.78)] p-6 shadow-2xl shadow-black/20 lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(37,99,235,0.22)] bg-[rgba(37,99,235,0.10)] py-1.5 pl-2 pr-4 font-mono text-[11.5px] font-medium uppercase tracking-[0.04em] text-[var(--blue-2xl)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue-l)] shadow-[0_0_6px_var(--blue-l)]" />
              Core em desenvolvimento
            </div>
            <h1 className="max-w-3xl text-[38px] font-bold leading-[0.98] tracking-[-2px] text-[var(--text)] md:text-[56px]">
              Painel base para operar SaaS <b className="text-[var(--blue-l)]">multitenant</b>.
            </h1>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-7 text-[var(--text2)]">
              Estrutura inicial do Kynovia SaaS Core com administração global,
              tenants, usuários, RBAC, catálogo de módulos, contratos e preparo
              para integrar Supabase quando o projeto dedicado estiver criado.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn btn-primary">
                <Plus size={15} />
                Novo tenant
              </button>
              <button className="btn btn-outline">
                Ver roadmap
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>

          <DashboardCard className="p-5">
            <div className="section-label mb-4">{"// Próximo marco"}</div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.10)] text-[var(--blue-xl)]">
                <Database size={20} strokeWidth={1.3} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
                  Supabase dedicado
                </h2>
                <p className="mt-2 text-[13.5px] leading-6 text-[var(--text2)]">
                  A UI e os contratos de dados ficam prontos agora. Depois
                  conectamos Auth, Postgres, RLS e migrations ao projeto Supabase
                  especifico.
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
                checkAccess()
              </div>
              <div className="mt-2 text-[13.5px] leading-6 text-[var(--text2)]">
                {accessPreview.allowed
                  ? "Amostra autorizada para tenant ativo, módulo identity e permissão platform.users.view."
                  : `Acesso negado: ${accessPreview.reason}`}
              </div>
            </div>
          </DashboardCard>
        </section>

        <section className="grid gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div className="bg-[var(--bg2)] p-5 transition hover:bg-[var(--bg3)]" key={metric.label}>
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
                {metric.label}
              </div>
              <div className="mt-4 text-[36px] font-bold leading-none tracking-[-2px] text-[var(--text)]">
                {metric.value}
              </div>
              <div
                className={`mt-3 text-[12.5px] ${
                  metric.tone === "green"
                    ? "text-[var(--green)]"
                    : metric.tone === "yellow"
                      ? "text-[var(--yellow)]"
                      : "text-[var(--blue-xl)]"
                }`}
              >
                {metric.detail}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <DashboardCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <div>
                <div className="section-label">{"// Tenants"}</div>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.8px]">
                  Empresas cadastradas
                </h2>
              </div>
              <button className="btn btn-outline hidden h-9 px-3 text-[13px] sm:inline-flex">
                Exportar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--text3)]">
                    <th className="px-5 py-3 font-medium">Empresa</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Usuários</th>
                    <th className="px-5 py-3 font-medium">Plano</th>
                    <th className="px-5 py-3 font-medium">Renovação</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr className="border-b border-[var(--border)] last:border-0" key={tenant.name}>
                      <td className="px-5 py-4">
                        <div className="text-[14px] font-semibold tracking-[-0.2px]">
                          {tenant.name}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-[var(--text3)]">
                          {tenant.document}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={tenant.status} />
                      </td>
                      <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">
                        {tenant.users}
                      </td>
                      <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">
                        {tenant.plan}
                      </td>
                      <td className="px-5 py-4 font-mono text-[12px] text-[var(--text3)]">
                        {tenant.renewal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          <DashboardCard className="p-5">
            <div className="section-label">{"// RBAC"}</div>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.8px]">
              Permissões iniciais
            </h2>
            <div className="mt-5 space-y-2">
              {permissions.map((permission) => (
                <div
                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5"
                  key={permission}
                >
                  <ShieldCheck size={15} strokeWidth={1.4} className="text-[var(--blue-xl)]" />
                  <span className="font-mono text-[12px] text-[var(--text2)]">
                    {permission}
                  </span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </section>

        <section className="grid gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)] lg:grid-cols-3">
          {productPrinciples.map((principle) => {
            const Icon = principle.icon;

            return (
              <div className="bg-[var(--bg2)] p-6 transition hover:bg-[var(--bg3)]" key={principle.title}>
                <Icon size={32} strokeWidth={1.3} className="text-[var(--blue-xl)]" />
                <h3 className="mt-6 text-[15px] font-semibold tracking-[-0.2px]">
                  {principle.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-6 text-[var(--text2)]">
                  {principle.detail}
                </p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-3">
            {coreModules.map((module) => {
              const Icon = module.icon;

              return (
                <article className="group relative overflow-hidden bg-[var(--bg2)] p-6 transition hover:bg-[var(--bg3)]" key={module.id}>
                  <div className="absolute left-[-100%] top-0 h-px w-3/5 bg-gradient-to-r from-transparent via-[var(--blue-l)] to-transparent opacity-0 transition group-hover:left-[150%] group-hover:opacity-100 group-hover:duration-700" />
                  <div className="font-mono text-[11px] text-[var(--text3)]">{module.id}</div>
                  <Icon size={36} strokeWidth={1.3} className="mt-8 text-[var(--blue-xl)]" />
                  <h3 className="mt-5 text-[15px] font-semibold tracking-[-0.2px]">
                    {module.title}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-6 text-[var(--text2)]">
                    {module.description}
                  </p>
                  <span className="pill pill-blue mt-5">{module.tag}</span>
                </article>
              );
            })}
          </div>

          <DashboardCard className="p-5">
            <div className="section-label">{"// Roadmap"}</div>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.8px]">
              Sequencia de desenvolvimento
            </h2>
            <div className="mt-5 space-y-4">
              {roadmap.map((item) => (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4" key={item.title}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[14px] font-semibold tracking-[-0.2px]">
                      {item.title}
                    </h3>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-[var(--text2)]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.08)] p-4 text-[13.5px] text-[var(--text2)]">
              <CheckCircle2 size={17} className="shrink-0 text-[var(--blue-xl)]" />
              Pronto para receber schemas, services e providers reais.
            </div>
          </DashboardCard>
        </section>
    </div>
  );
}

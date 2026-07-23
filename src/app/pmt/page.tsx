import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Building2, ClipboardList, FolderKanban } from "lucide-react";
import { ACTIVE_TENANT_COOKIE, requirePermission } from "@/core/auth/session";
import { getDashboard } from "@/features/pmt/services/queries";

export default async function PmtProductEntryPage() {
  const session = await requirePermission("pmt.dashboard.view");
  const dashboard = await getDashboard(session.activeTenant.id);

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Produto acoplado ao Core</span>
          <h1>BTT Braidotti</h1>
          <p>
            Selecione a empresa antes de abrir projetos, funcionários, diários e relatórios.
            Todo o contexto operacional do BTT será filtrado pelo tenant ativo do Core.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Empresa ativa</h2>
            <span>{session.activeTenant.name}</span>
          </div>
          <Building2 size={18} />
        </div>
        <div className="client-context-grid">
          <div>
            <span>Projetos BTT</span>
            <strong>{dashboard.studies.length}</strong>
          </div>
          <div>
            <span>Funcionários</span>
            <strong>{dashboard.activeEmployees}</strong>
          </div>
          <div>
            <span>Relatórios recebidos</span>
            <strong>{dashboard.submittedDailyReports}</strong>
          </div>
          <div>
            <span>Ações abertas</span>
            <strong>{dashboard.openActions}</strong>
          </div>
        </div>
        <div className="form-actions compact-actions">
          <Link className="primary-button" href="/pmt/projetos">
            <FolderKanban size={18} />
            Abrir carteira BTT
          </Link>
          <Link className="secondary-button" href="/pmt/novo">
            <ClipboardList size={18} />
            Cadastrar projeto
          </Link>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Selecionar empresa</h2>
            <span>Tenants autorizados no Core</span>
          </div>
        </div>
        <div className="tenant-choice-list">
          {session.tenants.map((tenant) => {
            const active = tenant.id === session.activeTenant.id;

            return (
              <form action={selectTenantAction} className="tenant-choice-row" key={tenant.id}>
                <input type="hidden" name="tenantId" value={tenant.id} />
                <div>
                  <strong>{tenant.name}</strong>
                  <span>{active ? "Empresa ativa" : "Disponível para operação BTT"}</span>
                </div>
                <button className={active ? "secondary-button" : "primary-button"} type="submit">
                  {active ? "Continuar" : "Selecionar"}
                  <ArrowRight size={16} />
                </button>
              </form>
            );
          })}
        </div>
      </section>
    </div>
  );
}

async function selectTenantAction(formData: FormData) {
  "use server";

  const session = await requirePermission("pmt.dashboard.view");
  const tenantId = String(formData.get("tenantId") ?? "");
  const allowed = session.tenants.some((tenant) => tenant.id === tenantId);

  if (!allowed) {
    throw new Error("Empresa não autorizada para o usuário atual.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/pmt/projetos");
}

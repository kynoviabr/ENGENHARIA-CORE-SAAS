import { Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listUserMembershipRows } from "@/core/repositories/user-repository";

interface UsuariosPageProps {
  searchParams: Promise<{
    userAction?: string;
  }>;
}

export default async function UsuariosPage({ searchParams }: UsuariosPageProps) {
  const { userAction } = await searchParams;
  const users = await listUserMembershipRows();
  const summary = getUserSummary(users);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Usuários"
        title="Identidades e vínculos"
        description="Usuários são cadastrados de forma centralizada e vinculados a uma ou mais empresas por memberships."
        action={
          <Link className="btn btn-primary" href="/usuarios/novo">
            <UserPlus size={15} />
            Convidar usuário
          </Link>
        }
      />

      {userAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[rgba(37,99,235,0.08)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{userAction}</span>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Usuários mockados" value={summary.total.toString()} detail="Primeiro recorte para validar o fluxo." />
        <InfoCard label="Convites" value={summary.invited.toString()} detail="Aceite pendente por e-mail." />
        <InfoCard label="Papéis usados" value={summary.roleCount.toString()} detail="Atribuições no contexto do tenant." />
      </section>

      <DataPanel eyebrow="// Memberships" title="Usuários vinculados">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--text3)]">
                <th className="px-5 py-3 font-medium">Usuário</th>
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 font-medium">Papel</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Ultimo acesso</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="border-b border-[var(--border)] last:border-0" key={user.membershipId}>
                  <td className="px-5 py-4">
                    <Link
                      className="text-[14px] font-semibold tracking-[-0.2px] hover:text-[var(--blue-xl)]"
                      href={`/usuários/${user.membershipId}`}
                    >
                      {user.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-[var(--text3)]">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{user.tenant}</td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[var(--blue-xl)]">{user.role}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={user.status} />
                  </td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[var(--text3)]">
                    {user.lastAccess}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  );
}

function getUserSummary(users: Awaited<ReturnType<typeof listUserMembershipRows>>) {
  return {
    total: users.length,
    invited: users.filter((item) => item.status === "invited").length,
    active: users.filter((item) => item.status === "active").length,
    roleCount: new Set(users.map((item) => item.role)).size,
  };
}

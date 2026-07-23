import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { listPermissionRows, listRoleListRows } from "@/core/repositories/access-repository";
import { listProductRows } from "@/core/repositories/catalog-repository";
import { AccessWorkspace } from "./access-workspace";

interface AcessoPageProps {
  searchParams: Promise<{
    accessAction?: string;
  }>;
}

export default async function AcessoPage({ searchParams }: AcessoPageProps) {
  const { accessAction } = await searchParams;
  const [roles, permissions, products] = await Promise.all([
    listRoleListRows(),
    listPermissionRows(),
    listProductRows(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Acessos"
        title="Administração de perfis de Acesso"
        description="Defina perfis e permissões por sistema. Depois, os usuários recebem esses perfis dentro de cada cliente."
        action={
          <Link className="btn btn-primary" href="/acesso/novo">
            <Plus size={15} />
            Novo perfil
          </Link>
        }
      />

      {accessAction ? (
        <div className="rounded-lg border border-[var(--border-b)] bg-[var(--accent-soft)] p-4 text-[13.5px] text-[var(--text2)]">
          Ação simulada em modo mock: <span className="font-mono text-[var(--blue-xl)]">{accessAction}</span>
        </div>
      ) : null}

      <AccessWorkspace permissions={permissions} products={products} roles={roles} />
    </div>
  );
}

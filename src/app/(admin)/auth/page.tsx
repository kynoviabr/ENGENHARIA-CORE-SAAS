import { KeyRound } from "lucide-react";
import { DataPanel } from "@/components/data-panel";
import { InfoCard } from "@/components/info-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { authProviders } from "@/lib/core-data";

export default function AuthPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Auth"
        title="Autenticação reutilizável"
        description="A autenticação será centralizada e preparada para Supabase Auth, e-mail/senha, Google e provedores futuros."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Provedores" value={authProviders.length.toString()} detail="Contratos iniciais de login." />
        <InfoCard label="Sessão" value="Contextual" detail="Usuário, empresas e tenant ativo." />
        <InfoCard label="Supabase Auth" value="Depois" detail="Aguardando projeto dedicado." />
      </section>

      <DataPanel eyebrow="// Providers" title="Métodos de autenticação">
        <div className="grid gap-px bg-[var(--border)] md:grid-cols-3">
          {authProviders.map((provider) => (
            <article className="bg-[var(--bg2)] p-5 transition hover:bg-[var(--bg3)]" key={provider.name}>
              <div className="flex items-start justify-between gap-3">
                <KeyRound size={32} strokeWidth={1.3} className="text-[var(--blue-xl)]" />
                <StatusPill status={provider.status} />
              </div>
              <h2 className="mt-5 text-[15px] font-semibold tracking-[-0.2px]">{provider.name}</h2>
              <p className="mt-3 text-[13.5px] leading-6 text-[var(--text2)]">{provider.detail}</p>
            </article>
          ))}
        </div>
      </DataPanel>
    </div>
  );
}

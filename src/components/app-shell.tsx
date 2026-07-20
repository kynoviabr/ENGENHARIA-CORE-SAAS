"use client";

import {
  Bell,
  Building2,
  CreditCard,
  FileClock,
  Gauge,
  KeyRound,
  Layers3,
  Menu,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type { CoreSession } from "@/core/auth/session";
import { SessionProvider, useCoreSession } from "@/components/session-provider";

const navItems = [
  { label: "Painel", href: "/", icon: Gauge },
  { label: "Empresas", href: "/empresas", icon: Building2 },
  { label: "Usuários", href: "/usuarios", icon: UsersRound },
  { label: "Acesso", href: "/acesso", icon: ShieldCheck },
  { label: "Módulos", href: "/modulos", icon: Layers3 },
  { label: "Contratos", href: "/contratos", icon: CreditCard },
  { label: "Auditoria", href: "/auditoria", icon: FileClock },
  { label: "Auth", href: "/auth", icon: KeyRound },
  { label: "Config.", href: "/configuracoes", icon: Settings },
] as const;

interface AppShellProps {
  children: React.ReactNode;
  session: CoreSession;
}

export function AppShell({ children, session }: AppShellProps) {
  return (
    <SessionProvider session={session}>
      <AppShellContent>{children}</AppShellContent>
    </SessionProvider>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, activeTenant, setActiveTenantId } = useCoreSession();
  const tenantOptions = session.tenants.length > 0 ? session.tenants : [activeTenant];

  return (
    <div className="min-h-screen">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[rgba(10,10,11,0.80)] px-6 backdrop-blur-[24px] backdrop-saturate-[180%] lg:px-12">
        <div className="flex items-center gap-5">
          <button className="btn btn-outline h-9 w-9 p-0 lg:hidden" aria-label="Abrir menu">
            <Menu size={15} />
          </button>
          <a className="logo" href="#">
            Kynov<b>ia</b>
          </a>
          <span className="hidden border-l border-[var(--border)] pl-5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text3)] sm:inline">
            SaaS Core
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-[13px] text-[var(--text2)] md:inline-flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text3)]">
              Tenant
            </span>
            <select
              aria-label="Tenant ativo"
              className="bg-transparent text-[13px] text-[var(--text)] outline-none"
              onChange={(event) => setActiveTenantId(event.target.value)}
              value={activeTenant.id}
            >
              {tenantOptions.map((tenant) => (
                <option className="bg-[var(--bg2)] text-[var(--text)]" key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-outline h-9 w-9 p-0" aria-label="Notificações">
            <Bell size={15} />
          </button>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--blue)] text-xs font-bold text-white"
            title={`${session.user.name} (${session.mode})`}
          >
            {session.user.name
              .split(" ")
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 px-5 pb-8 pt-20 lg:grid-cols-[232px_1fr] lg:px-12">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 pr-6">
            <div className="section-label mb-4">{"// Core Admin"}</div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition ${
                      pathname === item.href
                        ? "bg-[rgba(37,99,235,0.12)] text-[var(--text)]"
                        : "text-[var(--text3)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text2)]"
                    }`}
                    href={item.href}
                    key={item.label}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

"use client";

import {
  Bell,
  Building2,
  CreditCard,
  FileClock,
  Gauge,
  KeyRound,
  Layers3,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
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
  const initials = session.user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="core-sidebar">
        <Link className="core-brand" href="/">
          <span className="core-brand-mark">K</span>
          <span className="core-brand-copy">
            <strong>Kynovia</strong>
            <span>Engenharia Core</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal">
          <div className="core-nav-label">Core Admin</div>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                aria-current={pathname === item.href ? "page" : undefined}
                className="core-nav-link"
                href={item.href}
                key={item.label}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="core-sidebar-footer">
          <strong>{activeTenant.name}</strong>
          <span>Tenant ativo</span>
        </div>
      </aside>

      <div className="core-main">
        <header className="core-topbar">
          <div className="core-topbar-title">
            <span>Engenharia SaaS Core</span>
            <strong>Administração multitenant</strong>
          </div>

          <div className="core-topbar-actions">
            <label className="tenant-select">
              <span>Tenant</span>
              <select
                aria-label="Tenant ativo"
                onChange={(event) => setActiveTenantId(event.target.value)}
                value={activeTenant.id}
              >
                {tenantOptions.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-outline h-9 w-9 p-0" aria-label="Notificações">
              <Bell size={15} />
            </button>
            <div className="avatar" title={`${session.user.name} (${session.mode})`}>
              {initials}
            </div>
          </div>
        </header>

        <main className="core-content">{children}</main>
      </div>
    </div>
  );
}

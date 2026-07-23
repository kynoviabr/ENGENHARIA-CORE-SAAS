"use client";

import {
  ArrowLeft,
  Bell,
  BarChart3,
  Building2,
  Calculator,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileClock,
  FileText,
  Gauge,
  GitBranch,
  KeyRound,
  Layers3,
  LineChart,
  NotebookPen,
  Settings,
  ShieldCheck,
  LogOut,
  UserRound,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/core/actions/auth-actions";
import type { CoreSession } from "@/core/auth/session";
import { SessionProvider, useCoreSession } from "@/components/session-provider";

const coreNavItems = [
  { label: "Painel", href: "/", icon: Gauge },
  { label: "Empresas", href: "/empresas", icon: Building2 },
  { label: "Contratos", href: "/contratos", icon: CreditCard },
  { label: "Sistemas", href: "/modulos", icon: Layers3 },
  { label: "Perfis", href: "/acesso", icon: ShieldCheck },
  { label: "Usuários", href: "/usuarios", icon: UsersRound },
  { label: "BTT", href: "/pmt", icon: NotebookPen },
  { label: "Auditoria", href: "/auditoria", icon: FileClock },
  { label: "Auth", href: "/auth", icon: KeyRound },
  { label: "Config.", href: "/configuracoes", icon: Settings },
] as const;

const pmtNavItems = [
  { label: "Selecionar empresa", href: "/pmt", icon: Building2 },
  { label: "Projetos", href: "/pmt/projetos", icon: Gauge },
  { label: "Jornada", href: "/pmt/jornada", icon: GitBranch },
  { label: "Novo projeto", href: "/pmt/novo", icon: ClipboardList },
  { label: "Funcionários", href: "/pmt/funcionarios", icon: UsersRound },
  { label: "Diários", href: "/pmt/diarios", icon: NotebookPen },
  { label: "Validação", href: "/pmt/validacao", icon: CheckSquare },
  { label: "Cálculos", href: "/pmt/calculos", icon: Calculator },
  { label: "Análises", href: "/pmt/analises", icon: LineChart },
  { label: "Relatórios", href: "/pmt/relatorios", icon: BarChart3 },
  { label: "Cadastros sistema", href: "/pmt/configuracoes", icon: Settings },
  { label: "Documentos", href: "/pmt/cadastros-cliente", icon: FileText },
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
  const isPmtArea = pathname.startsWith("/pmt");
  const showTenantSelector = isPmtArea;
  const navItems = isPmtArea ? pmtNavItems : coreNavItems;
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
          {isPmtArea ? (
            <Image
              alt="Braidotti Engenharia e Consultoria"
              className="pmt-sidebar-logo"
              height={44}
              priority
              src="/logo-braidotti-transparent.png"
              width={130}
            />
          ) : (
            <>
              <span className="core-brand-mark">K</span>
              <span className="core-brand-copy">
                <strong>Kynovia</strong>
                <span>Engenharia Core</span>
              </span>
            </>
          )}
        </Link>

        <nav aria-label="Navegação principal">
          <div className="core-nav-label">{isPmtArea ? "Produto BTT" : "Core Admin"}</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" || item.href === "/pmt"
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className="core-nav-link"
                href={item.href}
                key={item.label}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {isPmtArea ? (
            <>
              <div className="core-nav-label">Plataforma</div>
              <Link className="core-nav-link" href="/">
                <ArrowLeft size={16} strokeWidth={1.5} />
                <span>Voltar ao Core</span>
              </Link>
            </>
          ) : null}
        </nav>

        <div className="core-sidebar-footer">
          <strong>{activeTenant.name}</strong>
          <span>Tenant ativo</span>
        </div>
      </aside>

      <div className="core-main">
        <header className="core-topbar">
          <div className="core-topbar-title">
            <span>{isPmtArea ? "BTT Braidotti" : "Engenharia SaaS Core"}</span>
            <strong>{isPmtArea ? `Operação BTT: ${activeTenant.name}` : "Administração Global"}</strong>
          </div>

          <div className="core-topbar-actions">
            {showTenantSelector ? (
              <label className="tenant-select">
                <span>Cliente</span>
                <select
                  aria-label="Cliente ativo"
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
            ) : null}
            <button className="btn btn-outline h-9 w-9 p-0" aria-label="Notificações">
              <Bell size={15} />
            </button>
            <details className="account-menu">
              <summary className="account-trigger" aria-label="Abrir menu da conta">
                <span className="avatar" aria-hidden="true">{initials}</span>
                <ChevronDown size={15} aria-hidden="true" />
              </summary>
              <div className="account-dropdown">
                <div className="account-card">
                  <span className="avatar avatar-lg" aria-hidden="true">{initials}</span>
                  <div>
                    <strong>{session.user.name}</strong>
                    <span>{session.user.email}</span>
                    <small>{session.roles.join(" / ")}</small>
                  </div>
                </div>
                <Link href="/usuarios" className="account-action">
                  <UserRound size={16} />
                  Meus dados
                </Link>
                <Link href="/recuperar-senha" className="account-action">
                  <KeyRound size={16} />
                  Trocar senha
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="account-action account-action-danger">
                    <LogOut size={16} />
                    Sair
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>

        <main className="core-content">{children}</main>
      </div>
    </div>
  );
}

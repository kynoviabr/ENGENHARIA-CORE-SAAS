"use client";

import Link from "next/link";
import { Building2, ClipboardList, FolderKanban, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { StatusPill } from "@/components/status-pill";
import type { ContractListItem, TenantListItem } from "@/core/services";
import type { statusLabels } from "@/lib/core-data";

type DashboardSection = "clients" | "contracts" | "systems" | "projects";

type SystemListItem = {
  id: string;
  name: string;
  code: string;
  status: keyof typeof statusLabels;
  modules: number;
  tenants: number;
};

type ProjectListItem = {
  id: string;
  name: string;
  client: string;
  product: string;
  contract: string;
  status: keyof typeof statusLabels;
  period: string;
};

interface CoreDashboardWorkspaceProps {
  tenants: TenantListItem[];
  contracts: ContractListItem[];
  systems: SystemListItem[];
  projects: ProjectListItem[];
}

const sectionLabels: Record<DashboardSection, string> = {
  clients: "Clientes cadastrados",
  contracts: "Contratos ativos",
  systems: "Sistemas cadastrados",
  projects: "Projetos em andamento",
};

export function CoreDashboardWorkspace({ tenants, contracts, systems, projects }: CoreDashboardWorkspaceProps) {
  const [selectedSection, setSelectedSection] = useDashboardSection();
  const activeContracts = contracts.filter((contract) => contract.status === "active");
  const activeProjects = projects.filter((project) => project.status === "active");
  const cards = [
    {
      id: "clients" as const,
      label: sectionLabels.clients,
      value: tenants.length,
      detail: `${tenants.filter((tenant) => tenant.status === "active").length} ativos`,
      icon: Building2,
    },
    {
      id: "contracts" as const,
      label: sectionLabels.contracts,
      value: activeContracts.length,
      detail: `${contracts.length} contratos no total`,
      icon: ClipboardList,
    },
    {
      id: "systems" as const,
      label: sectionLabels.systems,
      value: systems.length,
      detail: `${systems.reduce((total, system) => total + system.modules, 0)} módulos`,
      icon: LayoutGrid,
    },
    {
      id: "projects" as const,
      label: sectionLabels.projects,
      value: activeProjects.length,
      detail: `${projects.length} projetos no total`,
      icon: FolderKanban,
    },
  ];

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do painel">
        {cards.map((card) => {
          const Icon = card.icon;
          const active = selectedSection === card.id;

          return (
            <button
              aria-pressed={active}
              className={`data-card p-4 text-left transition hover:border-[var(--border-b)] hover:bg-[var(--bg3)] ${
                active ? "border-[var(--border-b)] bg-[var(--accent-soft)]" : "bg-[var(--bg2)]"
              }`}
              key={card.id}
              onClick={() => setSelectedSection(card.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[12px] font-medium text-[var(--text2)]">{card.label}</div>
                  <div className="mt-3 text-[28px] font-semibold leading-none text-[var(--text)]">{card.value}</div>
                  <div className="mt-2 text-[12.5px] text-[var(--text2)]">{card.detail}</div>
                </div>
                <Icon size={20} strokeWidth={1.5} className={active ? "text-[var(--accent-h)]" : "text-[var(--blue-xl)]"} />
              </div>
            </button>
          );
        })}
      </section>

      <section className="data-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="section-label">Lista</div>
            <h2 className="mt-1 text-[18px] font-semibold">{sectionLabels[selectedSection]}</h2>
          </div>
          <SectionLink section={selectedSection} />
        </div>
        <div className="overflow-x-auto">
          {selectedSection === "clients" ? <ClientsTable tenants={tenants} /> : null}
          {selectedSection === "contracts" ? <ContractsTable contracts={activeContracts} /> : null}
          {selectedSection === "systems" ? <SystemsTable systems={systems} /> : null}
          {selectedSection === "projects" ? <ProjectsTable projects={activeProjects} /> : null}
        </div>
      </section>
    </>
  );
}

function useDashboardSection(): [DashboardSection, (section: DashboardSection) => void] {
  return useState<DashboardSection>("clients");
}

function SectionLink({ section }: { section: DashboardSection }) {
  const hrefBySection: Record<DashboardSection, string> = {
    clients: "/empresas",
    contracts: "/contratos",
    systems: "/modulos",
    projects: "/contratos",
  };

  return (
    <Link className="btn btn-outline h-9 px-3 text-[13px]" href={hrefBySection[section]}>
      Abrir tela
    </Link>
  );
}

function ClientsTable({ tenants }: { tenants: TenantListItem[] }) {
  return (
    <table className="w-full min-w-[760px] border-collapse text-left">
      <thead>
        <tr className="border-b border-[var(--border)] text-[12px] text-[var(--text2)]">
          <th className="px-5 py-3 font-medium">Cliente</th>
          <th className="px-5 py-3 font-medium">Documento</th>
          <th className="px-5 py-3 font-medium">Status</th>
          <th className="px-5 py-3 font-medium">Usuários</th>
          <th className="px-5 py-3 font-medium">Plano</th>
          <th className="px-5 py-3 font-medium">Renovação</th>
        </tr>
      </thead>
      <tbody>
        {tenants.map((tenant) => (
          <tr className="border-b border-[var(--border)] last:border-0" key={tenant.id}>
            <td className="px-5 py-4">
              <Link className="text-[14px] font-medium hover:text-[var(--blue-xl)]" href={`/empresas/${tenant.id}`}>
                {tenant.name}
              </Link>
              <div className="mt-1 text-[12px] text-[var(--text3)]">{tenant.legalName}</div>
            </td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{tenant.document}</td>
            <td className="px-5 py-4"><StatusPill status={tenant.status} /></td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{tenant.users}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{tenant.plan}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{tenant.renewal}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ContractsTable({ contracts }: { contracts: ContractListItem[] }) {
  return (
    <table className="w-full min-w-[760px] border-collapse text-left">
      <thead>
        <tr className="border-b border-[var(--border)] text-[12px] text-[var(--text2)]">
          <th className="px-5 py-3 font-medium">Cliente</th>
          <th className="px-5 py-3 font-medium">Plano</th>
          <th className="px-5 py-3 font-medium">Status</th>
          <th className="px-5 py-3 font-medium">Período</th>
          <th className="px-5 py-3 font-medium">Limites</th>
        </tr>
      </thead>
      <tbody>
        {contracts.map((contract) => (
          <tr className="border-b border-[var(--border)] last:border-0" key={contract.id}>
            <td className="px-5 py-4 text-[14px] font-medium">{contract.tenant}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{contract.plan}</td>
            <td className="px-5 py-4"><StatusPill status={contract.status} /></td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{contract.period}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{contract.limits}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SystemsTable({ systems }: { systems: SystemListItem[] }) {
  return (
    <table className="w-full min-w-[680px] border-collapse text-left">
      <thead>
        <tr className="border-b border-[var(--border)] text-[12px] text-[var(--text2)]">
          <th className="px-5 py-3 font-medium">Sistema</th>
          <th className="px-5 py-3 font-medium">Código</th>
          <th className="px-5 py-3 font-medium">Status</th>
          <th className="px-5 py-3 font-medium">Módulos</th>
          <th className="px-5 py-3 font-medium">Clientes habilitados</th>
        </tr>
      </thead>
      <tbody>
        {systems.map((system) => (
          <tr className="border-b border-[var(--border)] last:border-0" key={system.id}>
            <td className="px-5 py-4 text-[14px] font-medium">{system.name}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{system.code}</td>
            <td className="px-5 py-4"><StatusPill status={system.status} /></td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{system.modules}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{system.tenants}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProjectsTable({ projects }: { projects: ProjectListItem[] }) {
  return (
    <table className="w-full min-w-[780px] border-collapse text-left">
      <thead>
        <tr className="border-b border-[var(--border)] text-[12px] text-[var(--text2)]">
          <th className="px-5 py-3 font-medium">Projeto</th>
          <th className="px-5 py-3 font-medium">Cliente</th>
          <th className="px-5 py-3 font-medium">Sistema</th>
          <th className="px-5 py-3 font-medium">Contrato</th>
          <th className="px-5 py-3 font-medium">Período</th>
          <th className="px-5 py-3 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr className="border-b border-[var(--border)] last:border-0" key={project.id}>
            <td className="px-5 py-4 text-[14px] font-medium">{project.name}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{project.client}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{project.product}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{project.contract}</td>
            <td className="px-5 py-4 text-[13.5px] text-[var(--text2)]">{project.period}</td>
            <td className="px-5 py-4"><StatusPill status={project.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

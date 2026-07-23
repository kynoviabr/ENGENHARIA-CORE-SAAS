import Link from "next/link";
import { ArrowRight, BarChart3, Calculator, CheckCheck, ClipboardList, FileText, FileUp, GitBranch, Mail, NotebookPen, Settings2, UserCheck, UsersRound } from "lucide-react";
import { requirePermission } from "@/core/auth/session";

const operatingFlow = [
  {
    number: "01",
    title: "Configurar bibliotecas do sistema",
    owner: "Administrador BTT",
    route: "/pmt/configuracoes",
    cta: "Abrir cadastros",
    icon: Settings2,
    description: "Revise catálogos globais: atividades, níveis hierárquicos, cargos e funções, benchmarks, memória de cálculo e regra de validação. Estes dados são a referência sugerida para todos os projetos."
  },
  {
    number: "02",
    title: "Cadastrar o projeto BTT",
    owner: "Braidotti",
    route: "/pmt/novo",
    cta: "Cadastrar projeto",
    icon: ClipboardList,
    description: "Selecione cliente e contrato, informe dados do estudo e confirme os cadastros do projeto: equipes, turnos, disciplinas, organograma, cargos/funções, benchmark e memória de cálculo."
  },
  {
    number: "03",
    title: "Preparar funcionários",
    owner: "Braidotti + cliente",
    route: "/pmt/funcionarios",
    cta: "Abrir funcionários",
    icon: UsersRound,
    description: "Baixe o template, envie ao cliente, importe a planilha preenchida, revise matrícula, função, turno, status e envie convites por e-mail aos funcionários que vão apontar digitalmente."
  },
  {
    number: "04",
    title: "Receber diários de rotina e horas",
    owner: "Braidotti",
    route: "/pmt/diarios",
    cta: "Ver diários",
    icon: NotebookPen,
    description: "Use a tela de diários para baixar template CSV, fazer upload de planilha ou digitar apontamentos manualmente. Os registros enviados entram como Recebidos e seguem para validação."
  },
  {
    number: "05",
    title: "Validar apontamentos",
    owner: "Gestor ou consultor",
    route: "/pmt/validacao",
    cta: "Validar dados",
    icon: CheckCheck,
    description: "Selecione um ou vários apontamentos recebidos, normalize horas quando necessário, aprove ou reprove. Apenas apontamentos aprovados entram na base de cálculo."
  },
  {
    number: "06",
    title: "Executar cálculos",
    owner: "Consultor Braidotti",
    route: "/pmt/calculos",
    cta: "Rodar cálculos",
    icon: Calculator,
    description: "Calcule produtividade média, deslocamento, fator de produtividade, perdas e cobertura com base nos apontamentos aprovados e na memória de cálculo configurada."
  },
  {
    number: "07",
    title: "Analisar resultados",
    owner: "Braidotti + cliente",
    route: "/pmt/analises",
    cta: "Abrir análises",
    icon: BarChart3,
    description: "Compare indicadores com benchmark, identifique desvios por equipe, função e processo, e estime oportunidades de ganho para propor plano de ação."
  },
  {
    number: "08",
    title: "Gerar relatórios",
    owner: "Consultor Braidotti",
    route: "/pmt/relatorios",
    cta: "Ver relatórios",
    icon: FileText,
    description: "Consolide diagnóstico, recomendações, plano de ação proposto, responsáveis, prazos, exportações e acompanhamento dos ganhos."
  }
];

const operatingRules = [
  ["Cadastro do sistema", "Mantém regras globais reutilizadas em todos os clientes: catálogos, benchmarks, memória de cálculo e regra de validação."],
  ["Cadastro do projeto", "Confirma as variações do cliente: turnos, equipes, disciplinas, organograma e nomenclatura de cargos/funções."],
  ["Funcionários", "A base pode ser importada por template ou digitada manualmente. Matrícula e e-mail são essenciais para identificação e convite de acesso."],
  ["Entrada de diários", "Os apontamentos podem vir por app digital, upload de planilha ou digitação manual. Ao entrar no sistema, seguem como Recebidos."],
  ["Normalização", "A rotina compara horas apontadas com a regra global de validação e complementa o tempo faltante com a atividade configurada."],
  ["Custos", "Custo horário individual não deve aparecer em listas operacionais. Use apenas classificações necessárias, como direto ou indireto."],
  ["Integração futura", "Cliente, contrato, usuários, permissões, auditoria e persistência dos apontamentos devem ficar preparados para Kynovia SaaS Core e Supabase."]
];

const routine = [
  ["Antes da coleta", "Confirmar projeto, turnos, equipes, disciplinas, organograma, cargos/funções, funcionários, e-mails e convites enviados."],
  ["Durante a coleta", "Receber diários por app, planilha ou digitação manual; acompanhar por período, turno, status e busca."],
  ["Após a coleta", "Selecionar apontamentos recebidos, normalizar quando necessário, aprovar ou reprovar a base."],
  ["Entrega", "Rodar cálculos, analisar desvios, gerar relatórios e propor plano de ação."]
];

const intakeModes = [
  {
    title: "App digital",
    description: "Funcionário aponta rotinas e horas no formulário digital do sistema.",
    icon: NotebookPen
  },
  {
    title: "Upload de planilha",
    description: "Equipe carrega planilha CSV preenchida a partir do template de diários.",
    icon: FileUp
  },
  {
    title: "Digitação manual",
    description: "Assistente autorizado registra apontamentos diretamente no sistema.",
    icon: ClipboardList
  }
];

const roles = [
  {
    title: "Braidotti",
    items: ["Configura sistema e projeto", "Importa funcionários", "Envia convites", "Recebe diários", "Normaliza e valida dados", "Calcula e entrega resultados"]
  },
  {
    title: "Cliente",
    items: ["Fornece funcionários", "Confirma organograma", "Confirma cargos, equipes, turnos e disciplinas", "Apoia comunicação interna", "Executa plano de ação"]
  },
  {
    title: "Funcionário",
    items: ["Recebe convite por e-mail", "Acessa formulário digital", "Aponta rotina e horas", "Informa OS/serviço", "Envia diário como Recebido"]
  }
];

export default async function JourneyPage() {
  await requirePermission("pmt.dashboard.view");

  return (
    <div className="page-stack journey-manual-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Manual operacional</span>
          <h1>Guia de Uso do Sistema BTT</h1>
        </div>
      </section>

      <section className="journey-strip" aria-label="Sequência operacional BTT">
        {operatingFlow.map((step) => (
          <Link className="journey-node" href={step.route} key={step.number}>
            <span>{step.number}</span>
            <strong>{step.title}</strong>
          </Link>
        ))}
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Entrada dos apontamentos</h2>
          <NotebookPen size={18} />
        </div>
        <div className="journey-intake-grid">
          {intakeModes.map((mode) => {
            const Icon = mode.icon;

            return (
              <article key={mode.title}>
                <Icon size={18} />
                <span>{mode.title}</span>
                <strong>{mode.description}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className="journey-grid">
        {operatingFlow.map((step) => {
          const Icon = step.icon;

          return (
            <article className="panel journey-card" key={step.number}>
              <div className="journey-card-top">
                <span className="journey-number">{step.number}</span>
                <Icon size={21} />
              </div>
              <h2>{step.title}</h2>
              <span className="journey-owner">{step.owner}</span>
              <p>{step.description}</p>
              <Link className="secondary-button" href={step.route}>
                {step.cta}
                <ArrowRight size={16} />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Rotina de operação</h2>
          <GitBranch size={18} />
        </div>
        <div className="process-list">
          {routine.map(([label, description]) => (
            <div key={label}><span>{label}</span><strong>{description}</strong></div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Regras importantes</h2>
          <Mail size={18} />
        </div>
        <div className="settings-list">
          {operatingRules.map(([label, description]) => (
            <div key={label}><span>{label}</span><strong>{description}</strong></div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Responsabilidades</h2>
          <UserCheck size={18} />
        </div>
        <div className="role-list journey-responsibility-list">
          {roles.map((role) => (
            <article key={role.title}>
              <h3>{role.title}</h3>
              <ul>
                {role.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

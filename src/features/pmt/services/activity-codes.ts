import type { ActivityCode } from "@/features/pmt/types";

export const activityCodes: ActivityCode[] = [
  { code: 10, label: "Complemento de jornada", group: "indirect", description: "Tempo complementar automático para fechar a jornada mínima apontável." },
  { code: 100, label: "Execução do serviço", group: "productive", description: "Tempo produtivo direto no serviço solicitado." },
  { code: 110, label: "Preparação", group: "indirect", description: "Separação de ferramentas, orientação e preparação segura." },
  { code: 120, label: "Deslocamento", group: "indirect", description: "Movimentação até área, almoxarifado ou frente de trabalho." },
  { code: 130, label: "Aguardando liberação", group: "loss", description: "Espera por permissão, bloqueio, acesso ou equipamento." },
  { code: 140, label: "Aguardando material", group: "loss", description: "Espera por peças, consumíveis, ferramentas ou recursos." },
  { code: 150, label: "Aguardando apoio", group: "loss", description: "Espera por operador, inspeção, guindaste ou terceiros." },
  { code: 160, label: "Retrabalho", group: "loss", description: "Reexecução por falha, informação incorreta ou mudança." },
  { code: 170, label: "Busca de informação", group: "loss", description: "Consulta não planejada a desenho, OS, sistema ou supervisor." },
  { code: 180, label: "Reunião/DDS", group: "indirect", description: "Diálogo de segurança, alinhamento e reuniões operacionais." },
  { code: 190, label: "Pausa operacional", group: "indirect", description: "Intervalos previstos, higiene e recomposição operacional." },
  { code: 200, label: "Inspeção/Teste", group: "productive", description: "Teste funcional, medição, comissionamento ou verificação." },
  { code: 210, label: "Documentação", group: "indirect", description: "Registro em OS, apontamento, permissão ou checklist." },
  { code: 220, label: "Interferência externa", group: "loss", description: "Clima, produção, segurança ou prioridade externa." },
  { code: 230, label: "Sem atividade observável", group: "loss", description: "Tempo sem atividade técnica atribuível ao serviço." }
];

export function getActivityCode(code: number) {
  return activityCodes.find((item) => item.code === code);
}

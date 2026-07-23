const labels: Record<string, string> = {
  draft: "Pendente",
  collecting: "Coleta",
  validation: "Validação",
  published: "Publicado",
  archived: "Arquivado",
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  open: "Aberta",
  in_progress: "Em andamento",
  done: "Concluida",
  blocked: "Bloqueada",
  active: "Ativo",
  inactive: "Inativo",
  submitted: "Recebido",
  validated: "Validado"
};

export function StatusBadge({ value }: { value: string }) {
  return <span className={`status status-${value}`}>{labels[value] ?? value}</span>;
}

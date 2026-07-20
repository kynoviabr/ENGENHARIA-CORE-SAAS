import { statusClass, statusLabels } from "@/lib/core-data";

type StatusKey = keyof typeof statusLabels;

interface StatusPillProps {
  status: StatusKey;
}

export function StatusPill({ status }: StatusPillProps) {
  return <span className={`pill ${statusClass(status)}`}>{statusLabels[status]}</span>;
}

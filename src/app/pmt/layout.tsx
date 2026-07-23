import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/core/auth/session";

export default async function PmtLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <AppShell session={session}>{children}</AppShell>;
}

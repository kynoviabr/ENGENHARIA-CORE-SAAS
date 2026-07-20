import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/core/auth/session";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireSession();

  return <AppShell session={session}>{children}</AppShell>;
}

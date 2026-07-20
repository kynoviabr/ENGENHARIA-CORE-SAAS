"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { CoreSession, SessionTenant } from "@/core/auth/session";

interface SessionContextValue {
  session: CoreSession;
  activeTenant: SessionTenant;
  setActiveTenantId: (tenantId: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: React.ReactNode;
  session: CoreSession;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  const [activeTenantId, setActiveTenantId] = useState(session.activeTenant.id);
  const activeTenant = useMemo(
    () => session.tenants.find((tenant) => tenant.id === activeTenantId) ?? session.activeTenant,
    [activeTenantId, session.activeTenant, session.tenants],
  );

  return (
    <SessionContext.Provider value={{ session, activeTenant, setActiveTenantId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useCoreSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useCoreSession must be used inside SessionProvider");
  }

  return context;
}

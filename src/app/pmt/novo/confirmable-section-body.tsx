"use client";

import { CheckCircle2 } from "lucide-react";
import { type ReactNode, useState } from "react";

type ConfirmableSectionBodyProps = {
  children: ReactNode;
};

export function ConfirmableSectionBody({ children }: ConfirmableSectionBodyProps) {
  const [dirty, setDirty] = useState(false);
  const [confirmed, setConfirmed] = useState(true);

  function markDirty() {
    setDirty(true);
    setConfirmed(false);
  }

  function confirmSection() {
    setDirty(false);
    setConfirmed(true);
  }

  return (
    <div className="confirmable-section-body" onChange={markDirty} onInput={markDirty}>
      <div className={`section-save-state ${dirty ? "is-dirty" : ""}`}>
        <span>
          <CheckCircle2 size={14} />
          {confirmed ? "Alterações salvas" : "Alterações pendentes"}
        </span>
      </div>

      {children}

      <div className="catalog-inline-actions">
        <button className="secondary-button confirm-section-button" type="button" onClick={confirmSection} disabled={!dirty}>
          Confirmar cadastro
        </button>
      </div>
    </div>
  );
}

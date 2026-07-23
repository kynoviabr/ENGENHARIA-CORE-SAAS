"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export function ProjectContactFields() {
  const [contacts, setContacts] = useState([0]);

  function addContact() {
    setContacts((items) => [...items, (items.at(-1) ?? 0) + 1]);
  }

  function removeContact(id: number) {
    setContacts((items) => items.filter((item) => item !== id));
  }

  return (
    <div className="contact-list">
      {contacts.map((contactId, index) => (
        <div className="contact-row" key={contactId}>
          <label>
            Nome
            <input name={`contacts[${index}][name]`} required={index === 0} maxLength={100} placeholder="Nome do contato" />
          </label>
          <label>
            Cargo
            <input name={`contacts[${index}][role]`} maxLength={80} placeholder="Cargo / função" />
          </label>
          <label>
            E-mail
            <input name={`contacts[${index}][email]`} required={index === 0} type="email" maxLength={120} placeholder="nome@cliente.com.br" />
          </label>
          <label>
            Telefone
            <input name={`contacts[${index}][phone]`} required={index === 0} inputMode="tel" maxLength={30} placeholder="(00) 00000-0000" />
          </label>
          {contacts.length > 1 ? (
            <button type="button" className="action-button danger contact-remove" aria-label={`Remover contato ${index + 1}`} onClick={() => removeContact(contactId)}>
              <Trash2 size={15} />
            </button>
          ) : null}
        </div>
      ))}
      <button type="button" className="secondary-button contact-add" onClick={addContact}>
        <Plus size={16} />
        Adicionar contato
      </button>
    </div>
  );
}

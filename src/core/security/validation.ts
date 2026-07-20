const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function readRequiredText(formData: FormData, field: string, maxLength = 160): string {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    throw new Error(`Campo obrigatório ausente: ${field}`);
  }

  if (value.length > maxLength) {
    throw new Error(`Campo muito longo: ${field}`);
  }

  return value;
}

export function readOptionalText(formData: FormData, field: string, maxLength = 500): string | null {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    return null;
  }

  if (value.length > maxLength) {
    throw new Error(`Campo muito longo: ${field}`);
  }

  return value;
}

export function readRequiredEmail(formData: FormData, field: string): string {
  const value = readRequiredText(formData, field, 254).toLowerCase();

  if (!EMAIL_PATTERN.test(value)) {
    throw new Error(`E-mail inválido: ${field}`);
  }

  return value;
}

export function readOptionalHttpsUrl(formData: FormData, field: string): string | null {
  const value = readOptionalText(formData, field, 2048);

  if (!value) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`URL inválida: ${field}`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`URL deve usar HTTPS: ${field}`);
  }

  return url.toString();
}

export function readRequiredHexColor(formData: FormData, field: string): string {
  const value = readRequiredText(formData, field, 7);

  if (!HEX_COLOR_PATTERN.test(value)) {
    throw new Error(`Cor inválida: ${field}`);
  }

  return value.toUpperCase();
}

export function readRequiredDate(formData: FormData, field: string): string {
  const value = readRequiredText(formData, field, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))) {
    throw new Error(`Data inválida: ${field}`);
  }

  return value;
}

export function readOptionalDate(formData: FormData, field: string): string | null {
  const value = readOptionalText(formData, field, 10);

  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))) {
    throw new Error(`Data inválida: ${field}`);
  }

  return value;
}

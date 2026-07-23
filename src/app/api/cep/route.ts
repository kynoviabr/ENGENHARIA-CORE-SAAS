import { NextResponse } from "next/server";

interface ViaCepResponse {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cep = searchParams.get("cep")?.replace(/\D/g, "") ?? "";

  if (!/^\d{8}$/.test(cep)) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Não foi possível consultar o CEP." }, { status: 502 });
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro) {
    return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    street: data.logradouro ?? "",
    district: data.bairro ?? "",
    city: data.localidade ?? "",
    state: data.uf ?? "",
  });
}

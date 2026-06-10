import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/supabase-server";

/* Caracteres permitidos no código */
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
/* Tamanho máximo do código */
const CODE_LENGTH = 6;
/* Máximo de tentativas para gerar um código único */
const MAX_RETRIES = 5;

/* Função para gerar um código aleatório */
function generateCode(): string {
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }

  return code;
}

/* Rota para encurtar URLs */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /* Extrair url */
    const originalUrl = body.url;
    if (!originalUrl) {
      return NextResponse.json(
        { error: "O campo URL é obrigatório" },
        { status: 400 },
      );
    }

    /* Validar URL */
    const parsed = new URL(originalUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json(
        {
          error: "URL inválida",
        },
        { status: 400 },
      );
    }

    /* Criar cliente Supabase */
    const supabase = createServerClient();

    /* Attempt insertion, retrying on short_code collisions */
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const shortCode = generateCode();

      /* Inserir URL encurtada no banco de dados */
      const { data, error } = await supabase
        .from("links")
        .insert({ original_url: originalUrl, short_code: shortCode })
        .select("short_code")
        .single();

      if (error) {
        /* Captar erro de colisão de código curto (PostgreSQL unique_violation error code) */
        if (error.code === "23505") {
          continue; // Tentar outro código
        }

        /* Erro genérico do Supabase */
        console.error(error);
        return NextResponse.json(
          { error: "Ocorreu um erro ao salvar o código no banco de dados" },
          { status: 500 },
        );
      }

      /* Sucesso na inserção */
      return NextResponse.json(
        { short_code: data.short_code },
        { status: 201 },
      );
    }

    /* Não foi possível gerar um código único após várias tentativas */
    return NextResponse.json(
      {
        error:
          "Não foi possível gerar um código único. Tente novamente mais tarde...",
      },
      { status: 400 },
    );
  } catch (error) {
    /* Captar erro genérico */
    console.error(error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro ao processar a requisição",
      },
      { status: 500 },
    );
  }
}

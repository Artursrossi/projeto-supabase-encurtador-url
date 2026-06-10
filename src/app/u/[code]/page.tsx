import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/src/lib/supabase-server";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function RedirectPage({ params }: Props) {
  /* Extrair código da URL */
  const { code } = await params;

  /* Criar cliente Supabase do lado do servidor (Server component) */
  const supabase = createServerClient();

  /* Obter link original a partir do código */
  const { data, error } = await supabase
    .from("links")
    .select("id, original_url, clicks")
    .eq("short_code", code)
    .single();

  /* Retornar página não encontrada se não encontrar o link */
  if (error || !data) {
    notFound();
  }

  /* Incrementar cliques antes de redirecionar */
  await supabase
    .from("links")
    .update({ clicks: (data.clicks ?? 0) + 1 })
    .eq("id", data.id);

  /* 302 — redirecionamento temporário para que os navegadores não armazenem em cache o destino */
  redirect(data.original_url);
}

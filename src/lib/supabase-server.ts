import { createClient } from "@supabase/supabase-js";

/* Instância utilizada pelo lado do servidor (Server Components / NextJS API) */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

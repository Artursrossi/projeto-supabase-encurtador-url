import { createClient } from "@supabase/supabase-js";

/* Instância utilizada pelo lado do cliente (React Client Components) */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

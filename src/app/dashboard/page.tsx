"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { supabase } from "../../lib/supabase";
import { Spinner } from "../../components/Spinner";
import {
  SortableHeader,
  SortDirection,
  SortKey,
} from "@/src/components/SortableHeader";

/* Representação de um link encurtado no banco de dados */
interface LinkRow {
  id: string;
  original_url: string;
  short_code: string;
  clicks: number | null;
  created_at: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Estado dos filtros e ordenação */
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  /* Código do link copiado (para feedback visual) */
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  /* Buscar todos os links ao montar o componente */
  useEffect(() => {
    async function fetchLinks() {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("links")
        .select("id, original_url, short_code, clicks, created_at");

      /* Captar um erro inesperado */
      if (error) {
        console.error(error);
        setError("Não foi possível carregar os links. Tente novamente.");
        setIsLoading(false);
        return;
      }

      setLinks(data ?? []);
      setIsLoading(false);
    }

    fetchLinks();
  }, []);

  /* Alternar a coluna/direção de ordenação ao clicar no cabeçalho */
  function handleSort(key: SortKey) {
    /* Alternar o estado de ordenação da coluna atual (Toggle) */
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    /* Aplicar uma nova ordenação */
    setSortKey(key);
    setSortDirection("desc");
  }

  /* Copiar o link curto para a área de transferência */
  async function handleCopy(shortCode: string) {
    const { protocol, host } = window.location;
    await navigator.clipboard.writeText(`${protocol}//${host}/u/${shortCode}`);

    setCopiedCode(shortCode);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  /* Formatar a data de criação no padrão brasileiro */
  function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /* Aplicar filtro de busca e ordenação à lista de links */
  const visibleLinks = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = term
      ? links.filter(
          (link) =>
            link.short_code.toLowerCase().includes(term) ||
            link.original_url.toLowerCase().includes(term),
        )
      : links;

    const direction = sortDirection === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const comparison =
        sortKey === "clicks"
          ? (a.clicks || 0) - (b.clicks || 0)
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

      return comparison * direction;
    });
  }, [links, search, sortKey, sortDirection]);

  /* Métricas resumidas exibidas no topo */
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-16">
      {/* Efeito glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-150 h-150 rounded-full bg-green-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl flex flex-col gap-8">
        {/* Cabeçalho */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl overflow-hidden shadow-lg shadow-green-500/20 ring-1 ring-green-500/30 shrink-0">
              <Image
                src="/logo.png"
                alt="Logo do Encurtador de URLs"
                width={56}
                height={56}
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Painel de Links
              </h1>
              <p className="mt-0.5 text-sm text-neutral-400">
                Todos os links encurtados pela aplicação.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="shrink-0 self-start rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:brightness-110 active:scale-[0.98] sm:self-auto"
          >
            + Novo link
          </Link>
        </header>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
            <p className="text-xs font-medium text-neutral-400">
              Total de links
            </p>
            <p className="mt-1 text-2xl font-bold text-white">{links.length}</p>
          </div>
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
            <p className="text-xs font-medium text-neutral-400">
              Total de cliques
            </p>
            <p className="mt-1 text-2xl font-bold text-green-400">
              {totalClicks}
            </p>
          </div>
        </div>

        {/* Card principal: filtro + tabela */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
          {/* Barra de filtro */}
          <div className="p-5 border-b border-neutral-800">
            <div className="relative">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filtrar por código ou URL de destino…"
                autoComplete="off"
                spellCheck={false}
                className={[
                  "w-full rounded-xl bg-neutral-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500",
                  "border border-neutral-700 outline-none transition-all duration-200",
                  "focus:border-green-500 focus:ring-2 focus:ring-green-500/40 focus:ring-offset-2 focus:ring-offset-neutral-900",
                ].join(" ")}
              />
            </div>
          </div>

          {/* Conteúdo da tabela */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-neutral-400">
              <Spinner />
              Carregando links…
            </div>
          ) : error ? (
            <div className="py-20 text-center text-sm text-red-400">
              {error}
            </div>
          ) : visibleLinks.length === 0 ? (
            <div className="py-20 text-center text-sm text-neutral-400">
              {links.length === 0
                ? "Nenhum link encurtado ainda."
                : "Nenhum link corresponde ao filtro."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-5 py-3 font-medium">Código</th>
                    <th className="px-5 py-3 font-medium">URL de destino</th>
                    <SortableHeader
                      label="Cliques"
                      columnKey="clicks"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortableHeader
                      label="Criado em"
                      columnKey="created_at"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <th className="px-5 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {visibleLinks.map((link) => (
                    <tr
                      key={link.id}
                      className="transition-colors duration-150 hover:bg-neutral-800/40"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/u/${link.short_code}`}
                          target="_blank"
                          className="font-mono font-medium text-green-400 hover:text-green-300 transition-colors duration-150"
                        >
                          {link.short_code}
                        </Link>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <a
                          href={link.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={link.original_url}
                          className="block truncate text-neutral-300 hover:text-white transition-colors duration-150"
                        >
                          {link.original_url}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-200">
                          {link.clicks ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-neutral-400">
                        {formatDate(link.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopy(link.short_code)}
                          data-copied={copiedCode === link.short_code}
                          className={[
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                            "bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:cursor-pointer",
                            "data-[copied=true]:bg-green-500 data-[copied=true]:text-black data-[copied=true]:hover:bg-green-500",
                          ].join(" ")}
                        >
                          {copiedCode === link.short_code
                            ? "Copiado!"
                            : "Copiar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé com contagem */}
        {!isLoading && !error && visibleLinks.length > 0 && (
          <p className="text-center text-xs text-neutral-500">
            Exibindo {visibleLinks.length} de {links.length} link
            {links.length === 1 ? "" : "s"}.
          </p>
        )}
      </div>
    </main>
  );
}

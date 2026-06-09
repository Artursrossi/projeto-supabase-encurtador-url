"use client";

import { useState, useId } from "react";
import Image from "next/image";

import { Spinner } from "../components/Spinner";

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputId = useId();
  const errorId = useId();

  /* Função utilizada para validar a URL */
  function isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  /* Atualizar mudanças da input */
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUrl(event.target.value);

    if (error) setError(null);
    if (shortenedUrl) setShortenedUrl(null);
  }

  /* Enviar formulário */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const link = url.trim();

    /* Verificar se a URL existe */
    if (!link) {
      setError("Por favor, insira uma URL.");
      return;
    }

    /* Validar URL */
    const isValid = isValidUrl(link);
    if (!isValid) {
      setError("URL inválida. Inclua o protocolo (ex: https://exemplo.com).");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // TODO: Enviar link para a API de encurtamento
      setShortenedUrl(`https://dominio.com/exemplo`);
    } catch (error) {
      console.error(error);
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  /* Função utilizada para copiar o link gerado */
  async function handleCopy() {
    if (!shortenedUrl) return;

    /* Copiar link */
    await navigator.clipboard.writeText(shortenedUrl);

    /* Indicar que o link foi copiado */
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasError = error !== null;

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-green-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-xl flex flex-col items-center gap-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl overflow-hidden shadow-lg shadow-green-500/20 ring-1 ring-green-500/30">
            <Image
              src="/logo.png"
              alt="Logo do Encurtador de URLs"
              width={80}
              height={80}
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Encurtador de URLs
            </h1>
            <p className="mt-1.5 text-sm text-neutral-400">
              Cole uma URL longa e obtenha um link curto e compartilhável.
            </p>
          </div>
        </div>

        {/* Interaction card */}
        <div className="w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
          <form onSubmit={handleSubmit} noValidate>
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              URL de destino
            </label>

            <div className="relative">
              <input
                id={inputId}
                type="url"
                value={url}
                onChange={handleChange}
                placeholder="https://exemplo.com/pagina-muito-longa"
                data-error={hasError}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
                autoComplete="off"
                spellCheck={false}
                className={[
                  "w-full rounded-xl bg-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-500",
                  "border outline-none transition-all duration-200",
                  "focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900",
                  "border-neutral-700 focus:border-green-500 focus:ring-green-500/40",
                  "data-[error=true]:border-red-500 data-[error=true]:focus:border-red-500 data-[error=true]:focus:ring-red-500/40",
                ].join(" ")}
              />
            </div>

            {/* Error message */}
            <div
              id={errorId}
              role="alert"
              className="overflow-hidden transition-all duration-200 max-h-0 data-[error=true]:max-h-10 data-[error=true]:mt-2"
              data-error={hasError}
            >
              <p className="text-xs text-red-400">{error}</p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={[
                "mt-4 w-full rounded-xl py-3 px-6 text-sm font-semibold text-black",
                "bg-green-500 transition-all duration-200",
                "hover:brightness-110 active:scale-[0.98] hover:cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100",
              ].join(" ")}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Encurtando…
                </span>
              ) : (
                "Encurtar URL"
              )}
            </button>
          </form>

          {/* Result */}
          {shortenedUrl && (
            <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-xs font-medium text-neutral-400 mb-2">
                URL encurtada
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={shortenedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-sm font-medium text-green-400 hover:text-green-300 transition-colors duration-150"
                >
                  {shortenedUrl}
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  data-copied={copied}
                  className={[
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                    "bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:cursor-pointer",
                    "data-[copied=true]:bg-green-500 data-[copied=true]:text-black data-[copied=true]:hover:bg-green-500",
                  ].join(" ")}
                >
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

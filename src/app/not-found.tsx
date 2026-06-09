import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black text-green-500 leading-none">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">
        Link não encontrado
      </h1>
      <p className="mt-2 text-sm text-neutral-400">
        Este código de encurtamento não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-xl bg-green-500 px-6 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
      >
        Voltar ao início
      </Link>
    </main>
  );
}

# 🔗 Encurtador de URL

Um encurtador de URL construído com **Next.js** e **Supabase**. Ele recebe uma
URL longa, gera um código curto e aleatório para ela e redireciona quem acessa
o link curto de volta para o endereço original, registrando quantas vezes o
link foi clicado.

## Como Funciona

1. O usuário envia uma URL longa na página inicial.
2. A rota de API `POST /api/shorten` valida a URL, gera um código curto único
   e armazena o par na tabela `links`.
3. O link curto `/u/<código>` busca o código no Supabase, incrementa seu
   contador de cliques e redireciona para a URL original.

## Tecnologias

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Supabase](https://supabase.com) (PostgreSQL) para armazenamento
- [TailwindCSS](https://tailwindcss.com) para estilização

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/shorten/route.ts   # Rota de API que cria os códigos curtos
│   ├── u/[code]/page.tsx      # Tratador de redirecionamento dos links curtos
│   ├── page.tsx               # Página inicial
│   ├── not-found.tsx          # Página 404
│   └── layout.tsx             # Layout raiz
├── components/
│   └── Spinner.tsx            # Spinner de carregamento
└── lib/
    ├── supabase.ts            # Instância do Supabase no lado do cliente
    └── supabase-server.ts     # Instância do Supabase no lado do servidor
```

### Banco de Dados

O projeto espera uma tabela `links` no Supabase com, no mínimo, as seguintes colunas:

| Coluna         | Tipo   | Observações                             |
| -------------- | ------ | --------------------------------------- |
| `id`           | `uuid` | Chave primária                          |
| `original_url` | `text` | A URL completa sendo encurtada          |
| `short_code`   | `text` | Código curto único (usado na URL)       |
| `clicks`       | `int`  | Número de vezes que o link foi visitado |

> A coluna `short_code` deve ter uma restrição **única** (unique) para que as
> colisões sejam detectadas e uma nova tentativa seja feita automaticamente.

## Inicialização

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=url-do-seu-projeto-supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-do-supabase
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

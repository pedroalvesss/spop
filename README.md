# spop!

**Sistema de Pobreza Organizada do Pedro!** Controle financeiro pessoal, feito pro celular (PWA instalável) e confortável no computador.

> Finanças pessoais sem drama, com um pouco de deboche. Sério no que faz, leve no que diz.

## O que ele faz

- **Início:** saldo total com os centavos apagados, chips por conta, entrou e saiu no mês, insight do orçamento, próximas contas, últimos lançamentos e caixinhas.
- **Novo lançamento:** saída ou entrada, valor aceitando `1.234,56`, conta ou cartão e compra parcelada, que vira dívida sozinha.
- **Transações:** busca por descrição ou categoria, filtros, navegação por mês, agrupamento por dia e paginação.
- **Orçamento:** limite por categoria, com barra que fica âmbar a partir de 85% e vermelha quando estoura.
- **Contas a pagar:** marcar como paga com um toque (atualização otimista). Opcionalmente o pagamento vira lançamento.
- **Cartões:** fatura do ciclo atual, datas de fechamento e vencimento e limite usado já contando as parcelas futuras.
- **Dívidas:** uma pílula por parcela, "Pagar parcela" e previsão de quando você fica livre.
- **Metas (caixinhas):** guardar e resgatar com atalhos de valor. O que falta aparece em cafés.
- **Investimentos:** patrimônio, rendimento do mês (em pastéis) e alocação.
- **Relatórios:** entrou × saiu em 3, 6 ou 12 meses, média, mês mais salgado e gastos por categoria.
- **Ajustes:** liga e desliga abas, bancos e carteiras, categorias, dia do salário, notificações e "esconder valores ao abrir".
- **Olho no header:** esconde todo valor em dinheiro do app.
- **Banco conectado (Open Finance):** liga o Nubank (ou outro banco) pelo Meu Pluggy e o extrato e as compras no cartão entram sozinhos. Sincroniza ao abrir o app (no máximo 1x por hora) e no cron diário, sem duplicar e sem importar pagamento de fatura ou caixinha.
- **Notificações:** push (Web Push/VAPID) quando uma conta vence e quando uma categoria passa de 85% ou 100% do orçamento. Lembrete diário por e-mail (Resend) via Vercel Cron.

## Stack

| Camada      | Escolha                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| App         | Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript                                 |
| UI          | Tailwind CSS v4 com os tokens da marca, shadcn/ui (Radix) restilizado no sistema Nocturne, Phosphor Icons, Inter |
| Formulários | React Hook Form + Zod (os mesmos schemas validam no cliente e no servidor)                                       |
| Auth        | Auth.js v5 (Credentials + bcrypt, sessão JWT em cookie httpOnly)                                                 |
| Banco       | Postgres (Supabase) + Prisma 7 com driver adapter `pg`                                                           |
| E-mail      | Resend                                                                                                           |
| Push        | Web Push com VAPID (`web-push`) + service worker próprio                                                         |
| Testes      | Vitest + Testing Library (jsdom)                                                                                 |
| Qualidade   | ESLint, Prettier, Husky e lint-staged no pre-commit, Conventional Commits                                        |
| Deploy      | Vercel (com Vercel Cron)                                                                                         |

## Decisões que valem citar

- **Dinheiro sempre em centavos (inteiro).** Transação positiva é entrada e negativa é saída. Saldo da conta = saldo inicial + soma das transações.
- **Zero trust no cliente.** Leituras acontecem só em Server Components, pelos `services/` (todos com `import "server-only"`). O cliente recebe DTOs com os campos que a tela usa. Toda action confere se o registro é da pessoa logada.
- **Datas no fuso de São Paulo.** O servidor roda em UTC, então o "hoje" é calculado com `Intl` em `America/Sao_Paulo`.
- **Ocultar valores sem ida ao servidor.** `<Money>` e `<Private>` são client components que leem um contexto de UI. O servidor renderiza tudo e o olho só troca a exibição.
- **Alerta de orçamento só quando cruza a linha,** e depois da resposta (`after()`), pra não atrasar o modal.

## Rodando local

Requisitos: Node 24.

```bash
npm install
cp .env.example .env
npm run db:dev          # sobe um Postgres local (Prisma Postgres dev) em segundo plano
npx prisma migrate dev  # cria as tabelas
npm run db:seed         # conta demo: demo@spop.app / spop1234
npm run dev
```

No `.env` local, use a URL que o `prisma dev` imprime em `DATABASE_URL` e a porta seguinte (`51215`) em `SHADOW_DATABASE_URL`. Sem `RESEND_API_KEY`, os e-mails aparecem no console.

### Scripts

| Script                               | O que faz                              |
| ------------------------------------ | -------------------------------------- |
| `npm run dev`                        | servidor de desenvolvimento            |
| `npm test`                           | roda os testes uma vez                 |
| `npm run test:watch`                 | testes em modo watch                   |
| `npm run lint` / `npm run typecheck` | ESLint e TypeScript                    |
| `npm run db:migrate`                 | cria migration nova a partir do schema |
| `npm run db:seed`                    | recria a conta demo                    |

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Em produção:

- `DATABASE_URL`: pooler do Supabase (porta 6543, `?pgbouncer=true`)
- `DIRECT_URL`: conexão direta do Supabase (porta 5432), usada pelas migrations no build
- `AUTH_SECRET`: `npx auth secret`
- `APP_URL`: URL pública (links dos e-mails)
- `RESEND_API_KEY` e `EMAIL_FROM`: domínio verificado no Resend
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT`: `npx web-push generate-vapid-keys`
- `CRON_SECRET`: a Vercel envia no header do cron
- `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` (opcionais): aplicação no [dashboard da Pluggy](https://dashboard.pluggy.ai). Com o banco ligado no [Meu Pluggy](https://meu.pluggy.ai), o Item ID vai em Ajustes → Banco conectado

## Deploy

1. Crie um projeto no Supabase e copie as duas connection strings (pooler e direta).
2. Importe o repositório na Vercel e configure as variáveis acima.
3. O build roda `prisma migrate deploy && next build` (script `vercel-build`).
4. O cron de lembretes (`vercel.json`) roda todo dia às 8h de Brasília.

## Estrutura

```
app/
  (auth)/           login, registro, redefinir-senha
  (app)/            shell autenticado (sidebar, header, tab bar, modal de lançamento)
    (inicio)/       Início
    transacoes/ orcamento/ contas/ cartoes/ dividas/ metas/ investimentos/ relatorios/ ajustes/
      _components/ _hooks/ __tests__/ loading.tsx error.tsx
  api/              Auth.js e cron de lembretes
actions/            server actions (mutações), uma por arquivo
services/           leituras no banco (server-only), uma por arquivo
components/         componentes usados em mais de uma rota (ui/ = primitivos do design)
lib/                regras puras (dinheiro, datas, orçamento, fatura…) com testes
emails/             templates de e-mail (provisórios)
prisma/             schema, migrations e seed
```

---

Identidade visual, protótipo e textos feitos no Claude Design. Os textos seguem o manual da marca: informação primeiro, piada curta depois, sem emoji e nunca às custas de quem usa.

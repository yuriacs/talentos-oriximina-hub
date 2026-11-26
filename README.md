# Talentos Oriximiná Hub

O **Talentos Oriximiná Hub** é uma plataforma web moderna desenvolvida para conectar talentos locais da cidade de Oriximiná com oportunidades de mercado, empresas e colaboradores. A plataforma funciona como um diretório de profissionais, permitindo que usuários criem perfis detalhados, exibam seus portfólios, experiências e habilidades.

## 🚀 Tecnologias Utilizadas

O projeto foi construído com as tecnologias mais modernas do ecossistema JavaScript/TypeScript:

- **Frontend:** [React 18](https://reactjs.org/) com [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend:** API própria em [Node.js](https://nodejs.org/) + [Fastify](https://fastify.dev/) (`server/`)
- **Banco de dados:** [PostgreSQL 16](https://www.postgresql.org/), com regras de segurança por linha (RLS)
- **Implantação:** Docker Compose (Postgres + API + nginx)
- **Gerenciamento de Estado & Cache:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Formulários:** [React Hook Form](https://react-hook-form.com/) com validação [Zod](https://zod.dev/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gráficos:** [Recharts](https://recharts.org/) (Painel Administrativo)

## ✨ Funcionalidades Principais

### Para Talentos (Usuários)
- **Cadastro e Autenticação:** Cadastro com e-mail e senha (confirmação por e-mail institucional) e login com Google.
- **Perfil Profissional:** Criação de perfil detalhado incluindo bio, localização e contatos.
- **Portfólio e Currículo:** Seções para adicionar experiências profissionais, formação acadêmica, certificações e projetos.
- **Gestão de Habilidades:** Adição de competências técnicas e comportamentais.
- **Disponibilidade:** Definição de regime de trabalho (presencial, remoto, híbrido).
- **Privacidade:** Controle de visibilidade das informações de contato.

### Para Recrutadores e Visitantes
- **Exploração de Talentos:** Busca e filtragem de profissionais por categorias e habilidades.
- **Visualização de Perfil:** Visualização completa das competências e portfólio de um talento.
- **Contato Direto:** Sistema de mensagens integrado para facilitar a comunicação.

### Painel Administrativo
- **Dashboard:** Visão geral de métricas da plataforma (total de perfis, denúncias, etc.).
- **Gestão de Perfis:** Moderação e verificação de contas.
- **Sistema de Denúncias:** Gestão de reports feitos por usuários sobre perfis inapropriados.
- **Logs de Auditoria:** Registro de ações administrativas para segurança.

## 🔒 Proteção de Dados (LGPD)

A plataforma é um serviço público da Prefeitura de Oriximiná (SEMJU) e trata dados de jovens, inclusive dados sensíveis.
Leia [`docs/LGPD.md`](docs/LGPD.md) antes de mexer em cadastro, perfis, admin ou banco de dados. Constantes de privacidade
(versão dos termos, e-mail do encarregado, idade mínima) ficam em `src/lib/privacy.ts`.

## 🛠️ Como Executar o Projeto

Em produção, tudo sobe com Docker:

```bash
cp .env.example .env   # preencha senha do banco, endereço do site, SMTP e Google
docker compose up -d --build
```

Instalação no servidor, importação dos dados antigos do Supabase, backup e
desenvolvimento local estão em [`docs/OPERACAO.md`](docs/OPERACAO.md).

## 📁 Estrutura de Pastas

```text
db/migrations/      # Estrutura do banco (aplicada pela API ao iniciar)
server/             # API: login, sessões, e-mails, fotos e consultas ao banco
deploy/nginx.conf   # Servidor web do site
src/
├── components/     # Componentes reutilizáveis (UI, Layout, Home)
├── hooks/          # Hooks customizados (Auth, Profile, etc.)
├── lib/            # Cliente da API (api.ts), tipos do banco e utilitários
├── pages/          # Páginas da aplicação (incluindo subpasta admin)
├── types/          # Definições de tipos TypeScript
└── data/           # Dados mockados para testes e desenvolvimento
```


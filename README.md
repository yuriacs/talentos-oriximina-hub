# Talentos Oriximiná Hub

O **Talentos Oriximiná Hub** é uma plataforma web moderna desenvolvida para conectar talentos locais da cidade de Oriximiná com oportunidades de mercado, empresas e colaboradores. A plataforma funciona como um diretório de profissionais, permitindo que usuários criem perfis detalhados, exibam seus portfólios, experiências e habilidades.

## 🚀 Tecnologias Utilizadas

O projeto foi construído com as tecnologias mais modernas do ecossistema JavaScript/TypeScript:

- **Frontend:** [React 18](https://reactjs.org/) com [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Autenticação:** [Supabase](https://supabase.com/)
- **Gerenciamento de Estado & Cache:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Formulários:** [React Hook Form](https://react-hook-form.com/) com validação [Zod](https://zod.dev/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gráficos:** [Recharts](https://recharts.org/) (Painel Administrativo)

## ✨ Funcionalidades Principais

### Para Talentos (Usuários)
- **Cadastro e Autenticação:** Fluxo completo de login e registro via Supabase Auth.
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

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [pnpm](https://pnpm.io/) ou [npm](https://www.npmjs.com/)

### Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd talentos-oriximina-hub
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

5. Acesse a aplicação em `http://localhost:5173`.

## 📁 Estrutura de Pastas

```text
src/
├── components/     # Componentes reutilizáveis (UI, Layout, Home)
├── hooks/          # Hooks customizados (Auth, Profile, etc.)
├── integrations/   # Configuração e tipos do Supabase
├── lib/            # Utilitários e configurações de bibliotecas
├── pages/          # Páginas da aplicação (incluindo subpasta admin)
├── types/          # Definições de tipos TypeScript
└── data/           # Dados mockados para testes e desenvolvimento
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

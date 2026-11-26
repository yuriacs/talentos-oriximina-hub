# Operação — Observatório da Juventude

Referência técnica do sistema. **Para instalar numa VPS, siga o passo a passo
em [`DEPLOY.md`](DEPLOY.md).** Para as regras de proteção de dados, veja
[`LGPD.md`](LGPD.md).

## Como o sistema funciona

```
navegador ──HTTPS──> proxy da Prefeitura ──> web (nginx, porta 8080)
                                               ├── /          site (React)
                                               ├── /api/*  ─> api (Node/Fastify) ─> db (Postgres 16)
                                               └── /uploads/* fotos e logos (volume "uploads")
```

- **db**: Postgres 16. Os dados ficam no volume Docker `db-data`.
- **api** (`server/`): login, sessões, e-mails, fotos e todas as consultas.
  Ao iniciar, aplica sozinha as migrações de `db/migrations`.
- **web**: o site compilado, servido pelo nginx, que repassa `/api` e `/uploads` para a API.

A segurança dos dados fica no próprio banco. A API executa cada pedido como
`anon` (visitante) ou `authenticated` (logado), e as regras RLS das tabelas
decidem o que cada um vê. Toda tabela nova em `public` precisa de
`ENABLE ROW LEVEL SECURITY` e de regras próprias.

## Instalação, importação, configuração e backup

Tudo isso está passo a passo em [`DEPLOY.md`](DEPLOY.md):
instalação na VPS com HTTPS automático (passos 1 a 8), importação do backup
do Supabase (passo 9), e-mail e Google (passos 6 e 7), backup diário com
`deploy/backup.sh` e restauração (passo 11) e problemas comuns (passo 14).

## Tarefas comuns

- **Tornar alguém administrador:** a pessoa cria a conta no site; depois
  ```bash
  docker compose exec db psql -U observatorio -c \
    "INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = 'pessoa@oriximina.pa.gov.br' ON CONFLICT DO NOTHING;"
  ```
- **Atualizar o sistema:** veja o passo 12 do `DEPLOY.md`.
- **Ver erros:** `docker compose logs --tail 200 api`.
- **Encerrar todas as sessões** (ex.: suspeita de vazamento):
  `docker compose exec db psql -U observatorio -c "DELETE FROM auth.sessions;"`

## Desenvolvimento local

```bash
# Postgres local (ou: docker run -d -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine)
cd server && cp .env.example .env    # ajuste DATABASE_URL e use COOKIE_SECURE=false
npm install && npm run dev           # API em http://localhost:3000
cd .. && npm install && npm run dev  # site em http://localhost:5000 (repassa /api para a API)
```

Testes: `npm test` na raiz (site) e
`TEST_DATABASE_URL=postgres://postgres@localhost:5432/obs_test npm test` em `server/`
(esse banco e um `<nome>_email` são apagados e recriados a cada execução; os
testes de e-mail usam um servidor SMTP falso local).

# Operação — Observatório da Juventude

Como instalar, migrar do Supabase, fazer backup e manter o sistema no
servidor da Prefeitura. Para as regras de proteção de dados, veja
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

## 1. Instalar no servidor

Requisitos: Docker e Docker Compose, e um domínio com HTTPS (o proxy da
Prefeitura, ou Caddy/Traefik/nginx na frente) apontando para a porta `WEB_PORT`.

```bash
git clone https://github.com/yuriacs/talentos-oriximina-hub.git
cd talentos-oriximina-hub
cp .env.example .env
nano .env          # preencha POSTGRES_PASSWORD, APP_URL, SMTP e Google
docker compose up -d --build
docker compose logs -f api      # deve mostrar "API do Observatório ouvindo..."
```

## 2. Trazer os dados do Supabase

Use a pasta de backup gerada com `supabase db dump` (com `data.sql`) e as
fotos baixadas com `baixar-fotos.ps1` (subpasta `storage/`). Copie a pasta
para o servidor, por exemplo para `/srv/backup-supabase-2026-11-26`, e rode:

```bash
docker compose run --rm -v /srv/backup-supabase-2026-11-26:/backup:ro api \
  npx tsx scripts/import-supabase.ts /backup
```

Ele importa usuários (com o hash das senhas), perfis, empresas, pesquisa e
logs, copia as fotos e corrige os links delas. O comando recusa rodar em um
banco que já tenha usuários (use `--force` para completar uma importação).

Depois de conferir o site, **apague a pasta de backup do servidor** e guarde
uma cópia só em local seguro: ela contém dados pessoais e sensíveis.

### Contas sem senha

Das 38 contas do backup de 26/11/2026, 37 já estavam sem senha no Supabase,
porque as senhas se perderam na migração do Lovable em outubro. Essas pessoas
entram por **"Esqueceu a senha?"**, que depende do SMTP configurado. Sem
SMTP, um administrador gera uma senha temporária em **Admin → Usuários**.

## 3. Configurações (`.env`)

| Variável | Para quê |
|---|---|
| `POSTGRES_PASSWORD` | Senha do banco (só letras e números) |
| `APP_URL` | Endereço público, ex.: `https://observajuv.oriximina.pa.gov.br` |
| `WEB_PORT` | Porta local do site (o HTTPS fica no proxy) |
| `COOKIE_SECURE` | `true` em produção (exige HTTPS) |
| `SMTP_*` | E-mail institucional. Sem `SMTP_HOST`, o cadastro é confirmado na hora e não há recuperação de senha por e-mail |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login com Google. Sem eles, o botão some |

**Login com Google:** no Google Cloud Console, crie um "ID do cliente OAuth"
do tipo *Aplicativo da Web* e cadastre como URI de redirecionamento
autorizado `<APP_URL>/api/auth/google/callback`.

## 4. Backup

Banco (diário, por exemplo via cron do servidor):

```bash
docker compose exec -T db pg_dump -U observatorio -Fc observatorio > /srv/backups/obs-$(date +%F).dump
```

Fotos:

```bash
docker run --rm -v talentos-oriximina-hub_uploads:/u -v /srv/backups:/b alpine \
  tar czf /b/uploads-$(date +%F).tgz -C /u .
```

Restaurar o banco:

```bash
docker compose exec -T db pg_restore -U observatorio -d observatorio --clean --if-exists < obs-AAAA-MM-DD.dump
```

Mantenha poucas cópias (ex.: 7 diárias e 4 semanais), em local com acesso
restrito: elas guardam dados sensíveis.

## 5. Tarefas comuns

- **Tornar alguém administrador:** a pessoa cria a conta no site; depois
  ```bash
  docker compose exec db psql -U observatorio -c \
    "INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = 'pessoa@oriximina.pa.gov.br' ON CONFLICT DO NOTHING;"
  ```
- **Atualizar o sistema:** `git pull && docker compose up -d --build`.
- **Ver erros:** `docker compose logs --tail 200 api`.
- **Encerrar todas as sessões** (ex.: suspeita de vazamento):
  `docker compose exec db psql -U observatorio -c "DELETE FROM auth.sessions;"`

## 6. Desenvolvimento local

```bash
# Postgres local (ou: docker run -d -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine)
cd server && cp .env.example .env    # ajuste DATABASE_URL e use COOKIE_SECURE=false
npm install && npm run dev           # API em http://localhost:3000
cd .. && npm install && npm run dev  # site em http://localhost:5000 (repassa /api para a API)
```

Testes: `npm test` na raiz (site) e
`TEST_DATABASE_URL=postgres://postgres@localhost:5432/obs_test npm test` em `server/`
(esse banco é apagado e recriado a cada execução).

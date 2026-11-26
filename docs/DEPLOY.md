# Guia de implantação na VPS — Observatório da Juventude

Passo a passo para colocar o Observatório da Juventude (Prefeitura de
Oriximiná / SEMJU) no ar numa VPS. Ele parte de um servidor zerado.

Siga os passos **na ordem**. Cada passo termina com um **"Confira"**, que
diz como saber se deu certo antes de seguir.

> Os comandos começando com `$` são digitados no terminal da VPS (sem o `$`).
> Os que começam com `PS>` são digitados no PowerShell do seu computador Windows.

---

## Sumário

0. [Antes de começar: o que você precisa ter em mãos](#0-antes-de-começar)
1. [Acessar a VPS e deixá-la segura](#1-acessar-a-vps-e-deixá-la-segura)
2. [Instalar o Docker](#2-instalar-o-docker)
3. [Apontar o domínio para a VPS](#3-apontar-o-domínio-para-a-vps)
4. [Baixar o código](#4-baixar-o-código)
5. [Configurar o arquivo `.env`](#5-configurar-o-arquivo-env)
6. [Configurar o e-mail (Gmail)](#6-configurar-o-e-mail-gmail)
7. [Configurar o login com Google (opcional)](#7-configurar-o-login-com-google-opcional)
8. [Subir o sistema](#8-subir-o-sistema)
9. [Importar os dados antigos do Supabase](#9-importar-os-dados-antigos-do-supabase)
10. [Criar o primeiro administrador e testar](#10-criar-o-primeiro-administrador-e-testar)
11. [Backup automático](#11-backup-automático)
12. [Atualizar o sistema](#12-atualizar-o-sistema)
13. [Comandos do dia a dia](#13-comandos-do-dia-a-dia)
14. [Problemas comuns](#14-problemas-comuns)
15. [Segurança e LGPD: regras para quem opera](#15-segurança-e-lgpd-regras-para-quem-opera)
16. [Depois que tudo estiver no ar](#16-depois-que-tudo-estiver-no-ar)

---

## Como o sistema é montado

São quatro "caixas" (contêineres Docker) que sobem juntas com um único comando:

```
Internet ──HTTPS──> caddy (certificado automático) ──> web (nginx + site)
                                                          ├── /api/*     ──> api (Node.js) ──> db (Postgres 16)
                                                          └── /uploads/* ──> api (fotos guardadas no disco)
```

| Contêiner | O que faz | Onde guarda dados |
|---|---|---|
| `db` | Banco de dados Postgres 16 | volume `db-data` |
| `api` | Login, sessões, e-mails, fotos e consultas ao banco. Ao iniciar, atualiza a estrutura do banco sozinha | volume `uploads` (fotos e logos) |
| `web` | Entrega o site e repassa `/api` e `/uploads` para a API | — |
| `caddy` | Cuida do HTTPS: pede e renova o certificado gratuito do Let's Encrypt | volume `caddy-data` |

O banco **nunca** fica exposto na internet: só a API conversa com ele, por
uma rede interna do Docker.

---

## 0. Antes de começar

Junte tudo isto antes de abrir o terminal:

- [ ] **VPS** com **Ubuntu 24.04 LTS**, mínimo 1 vCPU, 2 GB de RAM e 20 GB de disco.
      Por causa da LGPD, prefira um provedor com **data center no Brasil**.
- [ ] **IP público** da VPS e acesso como `root` (ou usuário com `sudo`).
- [ ] Acesso ao painel de **DNS** do domínio `oriximina.pa.gov.br` (normalmente com a TI da Prefeitura).
- [ ] Acesso ao repositório **`yuriacs/talentos-oriximina-hub`** no GitHub.
- [ ] **Dados do e-mail (SMTP)**: endereço da conta e **senha de app** de 16 letras (passo 6).
- [ ] (Opcional) **Credenciais do Google** para o "Entrar com Google" (passo 7).
- [ ] A **pasta de backup do Supabase**, com o arquivo `data.sql` e a subpasta
      `storage/` (fotos). Ela tem dados pessoais e sensíveis: deve ser
      entregue em mãos ou por canal seguro, **nunca** por WhatsApp ou e-mail.

---

## 1. Acessar a VPS e deixá-la segura

### 1.1 Entrar na VPS

No Windows (PowerShell), troque `IP_DA_VPS` pelo IP real:

```powershell
PS> ssh root@IP_DA_VPS
```

Na primeira vez ele pergunta se confia no servidor: digite `yes`.

### 1.2 Atualizar o sistema e acertar o fuso horário

```bash
$ apt update && apt upgrade -y
$ timedatectl set-timezone America/Sao_Paulo
$ apt install -y git ufw fail2ban unattended-upgrades
$ dpkg-reconfigure -plow unattended-upgrades     # responda "Sim": instala correções de segurança sozinho
```

### 1.3 Criar um usuário para administrar (em vez de usar o root)

```bash
$ adduser observatorio            # crie uma senha forte quando pedir
$ usermod -aG sudo observatorio
```

### 1.4 Entrar com chave SSH em vez de senha (recomendado)

No **seu computador** (PowerShell), se ainda não tiver uma chave:

```powershell
PS> ssh-keygen -t ed25519          # aperte Enter em tudo
PS> type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh observatorio@IP_DA_VPS "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Teste em **outra janela** antes de continuar: `PS> ssh observatorio@IP_DA_VPS`
deve entrar **sem pedir senha**.

Só depois que isso funcionar, bloqueie o login por senha e o login direto do root:

```bash
$ sudo nano /etc/ssh/sshd_config.d/99-seguranca.conf
```

Cole as duas linhas abaixo, salve (Ctrl+O, Enter) e saia (Ctrl+X):

```
PasswordAuthentication no
PermitRootLogin no
```

```bash
$ sudo systemctl restart ssh
```

### 1.5 Firewall: liberar só SSH, HTTP e HTTPS

```bash
$ sudo ufw allow OpenSSH
$ sudo ufw allow 80/tcp
$ sudo ufw allow 443/tcp
$ sudo ufw allow 443/udp
$ sudo ufw enable                  # responda "y"
```

**Confira:** `sudo ufw status` mostra `OpenSSH`, `80/tcp`, `443/tcp` e `443/udp` como `ALLOW`.

> Daqui em diante, entre sempre como `observatorio` (`ssh observatorio@IP_DA_VPS`).

---

## 2. Instalar o Docker

```bash
$ curl -fsSL https://get.docker.com | sudo sh
$ sudo usermod -aG docker observatorio
$ exit                              # saia e entre de novo para valer a permissão
```

```powershell
PS> ssh observatorio@IP_DA_VPS
```

**Confira:**

```bash
$ docker --version            # Docker version 2x...
$ docker compose version      # Docker Compose version v2...
$ docker run --rm hello-world # deve mostrar "Hello from Docker!"
```

---

## 3. Apontar o domínio para a VPS

Peça à TI (ou faça no painel de DNS) um registro:

| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| `A` | `observajuv` | `IP_DA_VPS` | 300 |

Se o domínio hoje aponta para a Vercel (site antigo), este é o momento em que
o endereço passa a abrir o sistema novo. Combine o horário com a SEMJU.

**Confira** (pode levar de alguns minutos a algumas horas):

```bash
$ getent hosts observajuv.oriximina.pa.gov.br
```

Deve mostrar o **IP da VPS**. Não siga para o passo 8 antes disso: sem o DNS
certo, o certificado HTTPS não é emitido.

---

## 4. Baixar o código

```bash
$ sudo mkdir -p /opt/observatorio
$ sudo chown observatorio:observatorio /opt/observatorio
$ git clone https://github.com/yuriacs/talentos-oriximina-hub.git /opt/observatorio
$ cd /opt/observatorio
$ git checkout main
```

Se o repositório for **privado**, o `git clone` pede usuário e senha. Use o
seu usuário do GitHub e, como senha, um **token** (GitHub → Settings →
Developer settings → Personal access tokens → *Fine-grained*, com acesso de
leitura só a esse repositório).

> Se a versão nova ainda não estiver na `main`, use a branch indicada pelo
> responsável (ex.: `git checkout feat/postgres-proprio`).

**Confira:** `ls` mostra `docker-compose.yml`, `server`, `db`, `deploy`, `docs` e `src`.

---

## 5. Configurar o arquivo `.env`

O `.env` guarda as senhas e configurações. Ele fica **só na VPS**: nunca vai
para o GitHub nem para o WhatsApp.

```bash
$ cd /opt/observatorio
$ cp .env.example .env
$ chmod 600 .env
$ openssl rand -hex 24              # gera uma senha forte: copie o resultado
$ nano .env
```

Preencha assim (o que estiver em `MAIÚSCULAS` você troca):

```env
POSTGRES_PASSWORD=COLE_A_SENHA_GERADA_PELO_OPENSSL

APP_URL=https://observajuv.oriximina.pa.gov.br
SITE_DOMAIN=observajuv.oriximina.pa.gov.br

WEB_PORT=8080
WEB_BIND=127.0.0.1
COOKIE_SECURE=true

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=CONTA_QUE_ENVIA@...
SMTP_PASS=SENHADEAPPDE16LETRAS
SMTP_FROM=Observatório da Juventude <CONTA_QUE_ENVIA@...>

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Salve com Ctrl+O, Enter e saia com Ctrl+X.

| Campo | O que é | Cuidados |
|---|---|---|
| `POSTGRES_PASSWORD` | Senha do banco | Só letras e números. Anote num cofre de senhas: sem ela não se restaura backup. **Não troque depois de subir o sistema** (veja o passo 14) |
| `APP_URL` | Endereço do site | Com `https://`, sem `/` no fim. É usado nos links dos e-mails |
| `SITE_DOMAIN` | Só o domínio | Sem `https://`. É usado pelo certificado HTTPS |
| `WEB_PORT` / `WEB_BIND` | Porta interna do site | Deixe como está |
| `COOKIE_SECURE` | Login só por HTTPS | Sempre `true` em produção |
| `SMTP_*` | Envio de e-mails | Veja o passo 6. Se ficar vazio, o cadastro não pede confirmação e não existe "Esqueci a senha" |
| `GOOGLE_*` | Botão "Entrar com Google" | Veja o passo 7. Vazio = o botão não aparece |

**Confira:** `ls -l .env` mostra `-rw-------` (só o dono pode ler).

---

## 6. Configurar o e-mail (Gmail)

O sistema manda dois tipos de e-mail: **confirmação de cadastro** e
**redefinição de senha**. Ele usa o servidor do Gmail com uma **senha de app**.

1. Entre na conta que vai enviar os e-mails, de preferência uma conta só para
   o sistema, como `observatorio@oriximina.pa.gov.br` ou um Gmail criado para isso.
2. Ative a **verificação em duas etapas** em
   https://myaccount.google.com/signinoptions/twosv. Use SMS ou o app
   Google Authenticator, não só chave de segurança.
3. Crie a senha de app em https://myaccount.google.com/apppasswords. Dê o
   nome "Observatório" e copie as 16 letras, **sem espaços**.
4. Coloque no `.env`: `SMTP_USER` e o endereço dentro de `SMTP_FROM` = a conta;
   `SMTP_PASS` = as 16 letras.

Se a página de senhas de app disser *"A configuração que você está procurando
não está disponível para sua conta"*, veja o passo 14.

**Limites:** o Gmail envia até 500 e-mails por dia (Google Workspace: 2.000).
É mais que suficiente para cadastros e recuperação de senha.

> **Atenção:** se alguém trocar a senha normal dessa conta Google, a senha de
> app deixa de valer e os e-mails param. Nesse caso, gere uma nova senha de
> app e atualize o `.env` (passo 12, "mudei o .env").

---

## 7. Configurar o login com Google (opcional)

Pule este passo se não for usar o botão "Entrar com Google".

1. Acesse https://console.cloud.google.com com uma conta institucional e crie
   um projeto chamado "Observatorio da Juventude".
2. Vá em **APIs e serviços → Tela de consentimento OAuth** (ou "Google Auth Platform → Branding"):
   - Tipo de usuário: **Externo**.
   - Nome do app: `Observatório da Juventude`; e-mail de suporte: o da SEMJU.
   - Domínio autorizado: `oriximina.pa.gov.br`.
   - Links: página inicial `https://observajuv.oriximina.pa.gov.br`,
     política de privacidade `https://observajuv.oriximina.pa.gov.br/privacidade`,
     termos `https://observajuv.oriximina.pa.gov.br/termos`.
   - Escopos: apenas `openid`, `email` e `profile`, que não exigem verificação especial.
   - **Publique o app** (status "Em produção"). Em "Teste", só os e-mails cadastrados como testadores conseguem entrar.
3. Vá em **Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo: **Aplicativo da Web**.
   - Origens JavaScript autorizadas: `https://observajuv.oriximina.pa.gov.br`
   - URIs de redirecionamento autorizados:
     `https://observajuv.oriximina.pa.gov.br/api/auth/google/callback`
4. Copie o **ID do cliente** e a **Chave secreta do cliente** para
   `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `.env`.

---

## 8. Subir o sistema

```bash
$ cd /opt/observatorio
$ docker compose --profile https up -d --build
```

A primeira vez demora de 3 a 10 minutos, porque baixa as imagens e compila o site.

**Confira:**

```bash
$ docker compose --profile https ps
```

Os quatro (`db`, `api`, `web`, `caddy`) devem aparecer como `Up` (o `db` como `healthy`).

```bash
$ docker compose logs api | tail -20
```

As linhas esperadas são:

- `Aplicando migração ...` (só na primeira vez);
- `API do Observatório ouvindo em 0.0.0.0:3000`;
- `SMTP ok: e-mails saem de ...`. Se aparecer `ERRO NO SMTP`, veja o passo 14;
- `Login com Google desligado`, só se você pulou o passo 7.

```bash
$ docker compose logs caddy | grep -i certificate
```

O esperado é `certificate obtained successfully`.

Agora abra **https://observajuv.oriximina.pa.gov.br** no navegador: o site deve
carregar com o cadeado de HTTPS.

> **A Prefeitura já tem um proxy HTTPS próprio?** Então não use o Caddy: suba
> com `docker compose up -d --build` (sem `--profile https`) e peça à TI para
> apontar o proxy para `http://127.0.0.1:8080` desta máquina. Se o proxy estiver
> em **outra** máquina, use `WEB_BIND=0.0.0.0` no `.env` e libere a porta 8080
> **só para o IP do proxy**: `sudo ufw allow from IP_DO_PROXY to any port 8080`.

---

## 9. Importar os dados antigos do Supabase

Faça isto **uma vez só**, logo depois do passo 8 e antes de divulgar o site.

### 9.1 Copiar a pasta de backup para a VPS

No **seu computador** (PowerShell), ajuste o caminho da pasta:

```powershell
PS> scp -r "C:\Users\yurim\Downloads\Material impressão\backup-supabase-2026-11-26" observatorio@IP_DA_VPS:/tmp/backup-supabase
```

**Confira** na VPS: `ls /tmp/backup-supabase` mostra `data.sql` e a pasta `storage`.

### 9.2 Rodar a importação

```bash
$ cd /opt/observatorio
$ sudo chmod -R a+rX /tmp/backup-supabase
$ docker compose run --rm -v /tmp/backup-supabase:/backup:ro api npx tsx scripts/import-supabase.ts /backup
```

**Confira:** no fim aparece uma tabela parecida com esta:

| Tabela | Esperado (backup de 26/11/2026) |
|---|---|
| auth.users | 38 |
| public.profiles | 85 |
| public.skills | 96 |
| public.companies | 2 |
| public.survey_responses | 52 |

e a linha `Fotos copiadas de /backup/storage para /data/uploads`.

O aviso `47 perfis sem conta de login` é esperado: esses registros já estavam
assim no sistema antigo, e cabe à SEMJU decidir o que fazer com eles.

Se o comando disser que o banco **já tem usuários**, a importação já foi feita.
Não repita.

### 9.3 Apagar a cópia da VPS

```bash
$ sudo rm -rf /tmp/backup-supabase
```

### 9.4 Avisar sobre as senhas antigas

Na migração anterior (Lovable → Supabase, outubro de 2026), **37 das 38
contas ficaram sem senha**. Essas pessoas entram clicando em
**"Esqueceu a senha?"** na tela de login e recebem um link por e-mail.
A SEMJU pode avisar os jovens por seus canais. Quem não receber o e-mail pode
pedir ao administrador uma senha temporária (passo 13).

---

## 10. Criar o primeiro administrador e testar

### 10.1 Administrador

Se a conta do responsável já veio na importação, ela já é administradora.
Senão, crie a conta pelo site (Criar Perfil) e depois rode:

```bash
$ cd /opt/observatorio
$ docker compose exec db psql -U observatorio -c \
  "INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE lower(email) = lower('EMAIL@DA.PESSOA') ON CONFLICT DO NOTHING;"
```

Saia e entre de novo no site: aparece o menu **Admin**.

### 10.2 Teste de aceite (faça tudo com uma conta de teste)

- [ ] A página inicial e "Explorar Perfis" carregam e mostram os talentos publicados.
- [ ] Criar conta com um e-mail seu → chega o e-mail "Confirme seu e-mail" → o link abre o site já logado.
- [ ] Sair e entrar de novo com e-mail e senha.
- [ ] "Esqueceu a senha?" → chega o e-mail → o link permite criar nova senha.
- [ ] (Se configurou) "Continuar com Google" entra e volta para o site.
- [ ] Em "Meu Perfil": enviar uma foto, preencher, publicar e ver em "Explorar".
- [ ] Em "Privacidade e meus dados": baixar meus dados; tirar da vitrine.
- [ ] Como admin: Admin → Usuários lista as contas; Admin → Pesquisa mostra as 52 respostas.
- [ ] Excluir a conta de teste em "Privacidade e meus dados" e confirmar que não dá mais para entrar com ela.

---

## 11. Backup automático

O script `deploy/backup.sh` copia o banco e as fotos para `/srv/backups/observatorio`
e apaga cópias com mais de 14 dias.

```bash
$ sudo mkdir -p /srv/backups/observatorio
$ sudo chown observatorio:observatorio /srv/backups/observatorio
$ /opt/observatorio/deploy/backup.sh          # teste manual
$ ls -lh /srv/backups/observatorio            # deve ter banco-....dump e fotos-....tgz
```

Agende para todo dia às 3h:

```bash
$ crontab -e                                  # escolha o editor nano (1)
```

Adicione no fim do arquivo:

```
0 3 * * * /opt/observatorio/deploy/backup.sh >> /srv/backups/observatorio/backup.log 2>&1
```

**Importante:** um backup que fica só na própria VPS se perde junto com ela.
Copie periodicamente para um local **seguro e com acesso restrito** da
Prefeitura. Por exemplo, do seu computador:

```powershell
PS> scp -r observatorio@IP_DA_VPS:/srv/backups/observatorio "D:\Backups\Observatorio"
```

### Restaurar um backup (em caso de desastre)

```bash
$ cd /opt/observatorio
$ docker compose exec -T db pg_restore -U observatorio -d observatorio --clean --if-exists < /srv/backups/observatorio/banco-AAAA-MM-DD_HHMM.dump
$ docker run --rm -v observatorio_uploads:/u -v /srv/backups/observatorio:/b alpine sh -c "cd /u && tar xzf /b/fotos-AAAA-MM-DD_HHMM.tgz"
$ docker compose --profile https restart api
```

> O nome do volume das fotos é `<pasta>_uploads`. Com o código em
> `/opt/observatorio`, fica `observatorio_uploads`. Confira com `docker volume ls`.

---

## 12. Atualizar o sistema

Quando houver código novo no GitHub:

```bash
$ cd /opt/observatorio
$ /opt/observatorio/deploy/backup.sh          # sempre um backup antes
$ git pull
$ docker compose --profile https up -d --build
$ docker compose logs api | tail -20          # confira que subiu sem erro
```

Mudanças no banco (`db/migrations`) são aplicadas sozinhas quando a API reinicia.

**Mudei o `.env`** (ex.: nova senha de app do Gmail): basta
`docker compose --profile https up -d`. O Docker recria só o que mudou.

---

## 13. Comandos do dia a dia

Rode sempre dentro de `/opt/observatorio`.

| Para... | Comando |
|---|---|
| Ver se está tudo rodando | `docker compose --profile https ps` |
| Ver erros da API | `docker compose logs --tail 200 api` |
| Reiniciar tudo | `docker compose --profile https restart` |
| Parar tudo (o site sai do ar) | `docker compose --profile https down` |
| Ligar de novo | `docker compose --profile https up -d` |
| Tornar alguém admin | comando do passo 10.1 |
| Gerar senha temporária para alguém | pelo site: **Admin → Usuários → Redefinir senha** |
| Encerrar todas as sessões (ex.: suspeita de invasão) | `docker compose exec db psql -U observatorio -c "DELETE FROM auth.sessions;"` |
| Espaço em disco | `df -h /` e `docker system df` |
| Limpar imagens antigas | `docker image prune -f` |

> **Nunca rode `docker compose down -v`.** O `-v` apaga os volumes, ou seja,
> o banco e as fotos.

---

## 14. Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Site não abre / certificado inválido | DNS ainda não aponta para a VPS, ou portas 80/443 fechadas | `getent hosts observajuv.oriximina.pa.gov.br` deve dar o IP da VPS; `sudo ufw status`; libere 80/443 também no painel do provedor da VPS (alguns têm firewall próprio); depois `docker compose --profile https restart caddy` e veja `docker compose logs caddy` |
| Página "502 Bad Gateway" | API parada ou com erro | `docker compose logs --tail 100 api` |
| Log mostra `ERRO NO SMTP ... 535` ou `Username and Password not accepted` | Senha de app errada, com espaços, ou foi usada a senha normal | Gere nova senha de app (passo 6), cole sem espaços, `docker compose --profile https up -d` |
| Página de senhas de app diz "não está disponível para sua conta" | Verificação em duas etapas desligada, configurada só com chave de segurança, conta de organização com o recurso bloqueado pelo administrador, ou Proteção Avançada ativa | Ative a verificação em duas etapas por SMS/app; em conta da Prefeitura (Workspace), peça à TI para liberar senhas de app; senão use um Gmail criado só para o sistema |
| Cadastro dá "Não foi possível enviar o e-mail de confirmação" | Problema no SMTP ou limite diário do Gmail | Veja o log da API; a pessoa pode tentar de novo depois (a conta não fica criada pela metade) |
| Google mostra `redirect_uri_mismatch` | URI de redirecionamento diferente da cadastrada | No Google Cloud deve estar exatamente `https://observajuv.oriximina.pa.gov.br/api/auth/google/callback` |
| Google mostra "app não verificado" ou só alguns conseguem entrar | App OAuth em modo "Teste" | Publique o app (passo 7, item 2) |
| "Continuar com Google" não aparece | `GOOGLE_*` vazios no `.env` | Preencha e rode `docker compose --profile https up -d` |
| Jovem antigo diz que a senha não funciona | Conta veio sem senha da migração de outubro | Orientar a usar "Esqueceu a senha?" ou gerar senha temporária no Admin |
| Ninguém consegue entrar (o login "não segura") | `COOKIE_SECURE=true` acessando sem HTTPS, ou `APP_URL` errado | Acesse sempre pelo `https://`; confira `APP_URL` |
| API não sobe: `password authentication failed for user "observatorio"` | `POSTGRES_PASSWORD` foi trocado depois da primeira subida (o banco guarda a senha antiga) | Volte a senha antiga no `.env`. Para trocar de verdade: `docker compose exec db psql -U observatorio -c "ALTER USER observatorio PASSWORD 'NOVA';"`, depois atualize o `.env` e rode `up -d` |
| Fotos antigas aparecem quebradas | A pasta `storage/` não estava no backup importado | Rode o `baixar-fotos.ps1` no backup e repita a cópia das fotos: `docker compose run --rm -v /tmp/backup-supabase:/backup:ro api sh -c "cp -r /backup/storage/. /data/uploads/"` |
| Disco cheio | Backups ou imagens antigas acumulados | `df -h`, `docker image prune -f`, conferir `/srv/backups/observatorio` |

---

## 15. Segurança e LGPD: regras para quem opera

O sistema guarda dados pessoais de jovens, inclusive **dados sensíveis**
(raça/cor e deficiência). Quem opera o servidor deve:

- **Nunca** compartilhar o `.env`, os arquivos de backup ou exportações por
  WhatsApp, e-mail pessoal ou nuvem pessoal.
- **Nunca** abrir a porta do banco (5432) para a internet.
- Dar acesso SSH só a quem precisa, cada pessoa com **a própria chave**.
  Quando alguém deixar a função, remover a chave dela de `~/.ssh/authorized_keys`.
- Manter só os backups necessários (o script já apaga os com mais de 14 dias).
- Em caso de **suspeita de vazamento ou invasão**: encerrar as sessões
  (passo 13), trocar as senhas (`.env`, conta de e-mail, SSH), guardar os logs
  (`docker compose logs > incidente-AAAA-MM-DD.log`) e **avisar imediatamente**
  a SEMJU e o Encarregado de dados (semju@oriximina.pa.gov.br). A comunicação à
  ANPD e aos titulares tem prazo legal.
- Rever a lista de administradores a cada troca de equipe:
  ```bash
  $ docker compose exec db psql -U observatorio -c "SELECT u.email FROM user_roles r JOIN auth.users u ON u.id = r.user_id WHERE r.role = 'admin';"
  ```

Mais detalhes sobre o tratamento de dados estão em [`LGPD.md`](LGPD.md).

---

## 16. Depois que tudo estiver no ar

Depois de uma ou duas semanas de funcionamento sem problemas:

- [ ] **Excluir o projeto no Supabase** (Project Settings → General → Delete project).
- [ ] **Remover o site da Vercel** (o domínio já aponta para a VPS).
- [ ] Apagar cópias soltas do backup do Supabase (Downloads, e-mails, WhatsApp),
      mantendo uma única cópia guardada em local seguro, pelo prazo definido pela SEMJU.
- [ ] Registrar no processo/ofício da SEMJU a data da migração e onde estão os backups.

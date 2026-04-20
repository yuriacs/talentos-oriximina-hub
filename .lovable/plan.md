

## Objetivo
Permitir que você (admin) localize a usuária **Loyana Gama Da Silva**, veja o e-mail de cadastro e defina manualmente uma **senha temporária** para ela voltar a acessar a conta.

## Por que isso precisa de backend
Trocar a senha de outro usuário e ler o e-mail dele não pode ser feito pelo navegador com a chave pública — exige a *service role key* do backend. Faremos isso por uma **Edge Function** segura, chamada apenas por administradores autenticados.

## O que será construído

### 1. Edge Function `admin-user-management` (backend seguro)
Três ações, todas validando que o chamador é admin (via `has_role`):
- `list_users` — busca usuários por nome/e-mail e devolve `id`, `email`, `nome`, `created_at`, `last_sign_in_at`, `email_confirmed_at`.
- `reset_password` — recebe `user_id` e gera uma **senha temporária aleatória** (12 caracteres), aplica via `auth.admin.updateUserById` e devolve a senha em texto **uma única vez** para o admin copiar.
- `send_recovery_link` (bônus, opcional) — dispara um novo link oficial de recuperação por e-mail.

Toda ação é registrada em `admin_logs` com `action` (`admin_password_reset`, etc.) e `target_id`.

### 2. Nova página `/admin/usuarios` (Gerenciar Usuários)
Adicionada ao menu lateral do painel admin, ao lado de "Perfis":
- Campo de busca por nome ou e-mail.
- Lista cada usuário com: nome, e-mail, data de cadastro, último login, status (confirmado/pendente).
- Botões por usuário:
  - **Ver perfil** → leva ao perfil público.
  - **Definir senha temporária** → abre diálogo de confirmação; ao confirmar, mostra a senha gerada com botão "Copiar" e aviso de que ela só aparece uma vez.
  - **Reenviar link de recuperação** → envia o e-mail padrão de reset.

### 3. Atualização no `AdminProfiles`
Cada card de perfil ganha um atalho **"Gerenciar acesso"** que abre o mesmo diálogo de reset, já com o usuário pré-selecionado — útil para resolver casos como o da Loyana direto da lista de perfis.

## Fluxo para o caso da Loyana
1. Você entra em `/admin/usuarios`, busca por "Loyana".
2. Vê o e-mail cadastrado e o status da conta.
3. Clica em **Definir senha temporária**, confirma.
4. Copia a senha exibida e repassa à Loyana por um canal seguro.
5. Ela faz login com essa senha e troca por uma nova em `/meu-perfil` (ou recomendamos forçar troca no próximo login em iteração futura).

## Detalhes técnicos
- Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` (já existe nos secrets) e valida o JWT do chamador com `supabase.auth.getUser()` + `has_role(uid, 'admin')`.
- Sem nova tabela: usamos `auth.users` (via admin API) + `admin_logs` existente.
- Senha temporária: 12 caracteres com letras maiúsculas, minúsculas, números e símbolos.
- Rota protegida em `AdminLayout` (já redireciona não-admins).
- Sem mudanças no fluxo de cadastro do usuário final.

## Fora do escopo
- Não alteramos o fluxo público de "Recuperar senha" por e-mail (ele continua funcionando; o problema relatado anteriormente ficará para investigação separada nos templates de e-mail, se voltar a acontecer).
- Não exibimos hash de senha em nenhum lugar — apenas a senha temporária recém-gerada.


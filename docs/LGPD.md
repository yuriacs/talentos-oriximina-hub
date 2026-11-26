# Adequação à LGPD — Observatório da Juventude

Documento de apoio da SEMJU sobre como a plataforma trata dados pessoais
(Lei nº 13.709/2018). Serve de base para o Relatório de Impacto (RIPD) e
para a prestação de contas. Última revisão: 26/11/2026.

## 1. Papéis

| Papel | Quem |
|---|---|
| Controlador | Prefeitura Municipal de Oriximiná — SEMJU |
| Encarregado (canal) | semju@oriximina.pa.gov.br (`DPO_EMAIL` em `src/lib/privacy.ts`) |
| Operadores | Hospedagem: servidor da Prefeitura ou empresa contratada (banco Postgres, API e fotos). Google: login opcional e Google Forms da pesquisa |
| Titulares | Jovens com 18 anos ou mais, responsáveis por empresas, respondentes da pesquisa |

## 2. Inventário de dados

| Conjunto | Onde fica | Dados | Sensível? | Quem acessa | Base legal |
|---|---|---|---|---|---|
| Conta | `auth.users` | e-mail, senha (hash), nome, último login | Não | Titular, admins | Art. 7º, III |
| Perfil público | `profiles`, `skills`, `education`, `experiences`, `projects`, `certifications`, `languages`, `availability`, `soft_skills` | nome, foto, bio, formação, competências, links, vídeo | Não | Público, se publicado | Art. 7º, I (publicação) e III |
| Perfil socioeducacional | `profiles` | faixa etária, gênero, escolaridade, situação profissional, pretensão salarial, transporte, internet | Não | Titular, admins | Art. 7º, III |
| Dados sensíveis | `profiles.race_color`, `is_pcd`, `disability_type`, `accessibility_needs` | raça/cor, deficiência | **Sim** | Titular, admins (agregado no painel) | Art. 11, I (consentimento específico) |
| Contato | `profiles.whatsapp` | WhatsApp | Não | Conforme escolha do jovem | Art. 7º, I |
| Consentimentos | `consent_records` | documento, versão, data | Não | Titular, admins | Art. 8º, §2º |
| Empresas | `companies` | dados da empresa e do responsável | Não | Responsável, admins; público só nome/setor/logo | Art. 7º, III e V |
| Mensagens e denúncias | `messages`, `reports` | conteúdo | Não | Envolvidos, admins | Art. 7º, III |
| Auditoria | `admin_logs` | ação, admin, alvo | Não | Admins | Art. 7º, II e III |
| Pesquisa | `survey_responses` | respostas (sem nome), e-mail opcional | Contém raça, religião e deficiência | Admins; público só agregado (mín. 3) | Art. 7º, III; art. 11, II, "b" |

Não coletamos CPF, RG nem endereço residencial. A data de nascimento só é
usada no navegador para checar a idade mínima e **não é gravada**.

## 3. O que foi alterado nesta adequação

**Correções de segurança**
- `get_safe_profile_data` confiava no parâmetro `_requesting_user_id` enviado
  pelo navegador: quem soubesse o identificador interno (UUID) de um admin
  podia, sem login, ler raça/cor, deficiência e renda de qualquer perfil,
  inclusive rascunhos (confirmado em banco de teste). Agora usa `auth.uid()`.
- A mesma função devolvia perfis em rascunho ou bloqueados. Agora não devolve.
- WhatsApp com a opção "só para empresas" aparecia para qualquer pessoa
  logada. Agora só para empresas aprovadas, como diz a tela.
- Perfis ficavam órfãos quando a conta era apagada (FK removida em março).
  A FK com `ON DELETE CASCADE` voltou.
- Logs de auditoria eram apagados junto com o admin. Agora ficam.
- Senha temporária do admin passou a usar gerador criptográfico.

**Direitos do titular (Meu perfil → Privacidade e meus dados)**
- Baixar todos os meus dados (JSON): acesso e portabilidade.
- Tirar o perfil da vitrine. Antes o botão "Publicar" falhava porque a regra
  do banco não deixava o usuário mudar o status; agora há a função
  `set_my_profile_published`.
- Excluir minha conta: apaga perfil, empresa, fotos, logos e login.

**Consentimento**
- Aceite dos Termos/Política é gravado com versão e data (`consent_records`).
- Quem entra pelo Google ou já tinha conta recebe o pedido de aceite (e de
  confirmação de 18+) no primeiro acesso. Mudou a política? Troque
  `TERMS_VERSION` em `src/lib/privacy.ts` e todos aceitam de novo.
- Raça/cor e deficiência só podem ser gravados após consentimento específico
  (checado também no banco, por trigger). Revogar apaga os dados.

**Infraestrutura própria (26/11/2026)**
- Saída do Supabase: banco Postgres, API e fotos no servidor da Prefeitura,
  com regras RLS mantidas no banco e sessões em cookie `httpOnly`.
- Senhas em bcrypt, limite de tentativas de login, proteção contra CSRF,
  fotos gravadas só na pasta do próprio usuário.

**Minimização**
- A pesquisa não importa mais o nome dos respondentes; há botão no admin
  para apagar os nomes já importados.
- Fontes servidas pelo próprio site, sem Google Fonts.

**Documentos**
- Política de Privacidade reescrita (controlador, encarregado, bases legais
  por finalidade, operadores, transferência internacional, retenção, direitos,
  segurança, idade).
- Termos de Uso e Termo de Adesão das empresas alinhados (18+, obrigações de
  proteção de dados das empresas).

**Admin**
- Exportação completa de dados pede confirmação e fica registrada no log.
- Exportação CSV da pesquisa fica registrada no log.

## 4. Como publicar

O sistema não usa mais o Supabase: roda em Docker no servidor da
Prefeitura (Postgres + API + site). Instalação, importação dos dados do
Supabase e backup estão em [`OPERACAO.md`](OPERACAO.md). As migrações de
`db/migrations`, inclusive a desta adequação, são aplicadas pela API ao iniciar.

Depois de publicar, teste com uma conta de teste: cadastro, login com Google,
dados sensíveis, publicar e despublicar, baixar dados e excluir a conta.

## 5. Pendências para a Prefeitura (não resolvidas por código)

- [ ] Publicar ato (portaria/decreto) designando o Encarregado de dados e
      divulgar a identidade e o contato dele no site oficial (art. 41).
- [ ] Elaborar e aprovar o RIPD, já que há dados sensíveis (art. 38). Este
      documento serve de ponto de partida.
- [ ] Hospedar o servidor no Brasil e, se for de empresa contratada, firmar
      contrato com cláusulas de proteção de dados (operador, art. 39).
- [ ] Depois da migração, excluir o projeto do Supabase e a hospedagem na
      Vercel, e apagar cópias soltas dos backups (art. 16).
- [ ] Definir com o setor de arquivo os prazos de guarda de empresas e logs.
- [ ] Plano de resposta a incidentes: quem avisa a ANPD e os titulares e em
      quanto tempo (art. 48 e Resolução CD/ANPD nº 15/2024).
- [ ] Revisar quem é admin (`user_roles`) e remover acessos de quem saiu.
- [ ] Guardar exportações completas só em local seguro e apagá-las depois.
- [ ] Rever com a Procuradoria a pesquisa aplicada a jovens de 10 a 17 anos
      (art. 14): termo de assentimento e ciência dos responsáveis no formulário.
- [ ] Empresas aprovadas antes desta versão aceitaram o Termo antigo; pedir
      ciência do novo item 3 (proteção de dados).

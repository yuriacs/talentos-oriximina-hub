import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { DPO_EMAIL, MIN_AGE, TERMS_UPDATED_LABEL, TERMS_VERSION } from '@/lib/privacy';

const legalBases: [string, string][] = [
  ['Criar e manter sua conta e seu perfil profissional', 'Execução de políticas públicas previstas em lei (art. 7º, III, e art. 23 da LGPD; Leis Municipais nº 9.154/2017 e nº 9.637/2025)'],
  ['Mostrar seu perfil na vitrine pública e seu WhatsApp para empresas', 'Consentimento (art. 7º, I). A publicação e a exibição do contato são escolhas suas e podem ser desfeitas a qualquer momento'],
  ['Raça/cor e informações sobre deficiência (opcionais)', 'Consentimento específico e destacado (art. 11, I), dado em campo próprio na tela de perfil'],
  ['Indicadores e estatísticas para políticas de juventude', 'Execução de políticas públicas (art. 7º, III, e art. 11, II, “b”), sempre com dados agregados, sem identificar pessoas'],
  ['Gestão do programa “Empresa Amiga da Juventude” e concessão do Selo', 'Execução de políticas públicas (art. 7º, III; Lei Municipal nº 9.637/2025) e execução do Termo de Adesão (art. 7º, V)'],
  ['Segurança da plataforma, análise de denúncias e registros de auditoria', 'Cumprimento de obrigação legal e execução de políticas públicas (art. 7º, II e III)'],
  ['Avisos sobre novas pesquisas e projetos', 'Consentimento (art. 7º, I), apenas para quem informou o e-mail com esse fim'],
];

export default function PoliticaPrivacidade() {
  return (
    <Layout>
      <div className="container px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Política de <span className="gradient-text">Privacidade</span>
            </h1>
            <p className="text-muted-foreground">
              Versão {TERMS_VERSION} · Última atualização: {TERMS_UPDATED_LABEL}
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6 md:p-10 prose prose-sm md:prose-base max-w-none dark:prose-invert">
              <h2>Resumo</h2>
              <ul>
                <li>O Observatório da Juventude é um serviço público da Prefeitura de Oriximiná, gerido pela SEMJU.</li>
                <li>O Banco de Talentos é para pessoas com {MIN_AGE} anos ou mais.</li>
                <li>Seu perfil só aparece na vitrine se você publicar. Você pode tirar do ar quando quiser.</li>
                <li>Raça/cor e deficiência são opcionais, pedem autorização própria e nunca aparecem no perfil público.</li>
                <li>Não vendemos dados e não usamos rastreadores de publicidade.</li>
                <li>Em “Meu perfil” você baixa todos os seus dados ou exclui sua conta sozinho, na hora.</li>
              </ul>

              <h2>1. Quem é o responsável pelos seus dados</h2>
              <p>
                <strong>Controlador:</strong> Prefeitura Municipal de Oriximiná (PA), por meio da Secretaria Municipal da
                Juventude (SEMJU), que decide como e para que os dados são usados na plataforma{' '}
                <strong>Observatório da Juventude</strong> (“Plataforma”), que inclui o Banco de Talentos, o programa
                “Empresa Amiga da Juventude” e o painel público “Dados da Juventude”.
              </p>
              <p>
                <strong>Encarregado pelo tratamento de dados pessoais (art. 41 da LGPD):</strong> atendimento pelo e-mail{' '}
                <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>. É por esse canal que você exerce seus direitos, tira
                dúvidas ou comunica qualquer problema com seus dados.
              </p>

              <h2>2. Quais dados tratamos</h2>
              <h3>2.1. Jovens com conta no Banco de Talentos</h3>
              <ul>
                <li><strong>Conta:</strong> nome, e-mail e senha (guardada só em forma criptografada). Se você entrar com o Google, recebemos do Google seu nome e e-mail.</li>
                <li><strong>Idade:</strong> pedimos a data de nascimento no cadastro só para confirmar que você tem {MIN_AGE} anos ou mais. <strong>Ela não é guardada.</strong> No perfil você pode informar uma faixa etária.</li>
                <li><strong>Perfil profissional:</strong> foto, apresentação, objetivo, área, cidade, formação, experiências, cursos, competências, idiomas, projetos, links de portfólio e vídeo.</li>
                <li><strong>Perfil socioeducacional e preferências:</strong> faixa etária, gênero (opcional), escolaridade, tipo de instituição, situação profissional, pretensão salarial, turnos, disponibilidade para deslocamento, acesso a computador e internet, nível de habilidade digital e interesse em programas sociais.</li>
                <li><strong>Dados sensíveis (opcionais):</strong> raça/cor (autodeclaração, padrão IBGE), se é pessoa com deficiência, tipo de deficiência e necessidades de acessibilidade. Só são gravados depois da sua autorização específica.</li>
                <li><strong>Contato:</strong> WhatsApp (opcional), com exibição controlada por você.</li>
                <li><strong>Registros:</strong> data e versão dos documentos que você aceitou, denúncias que fizer e mensagens trocadas na Plataforma.</li>
              </ul>
              <p>Não pedimos CPF, RG nem endereço residencial.</p>

              <h3>2.2. Responsáveis por empresas</h3>
              <ul>
                <li>Dados da empresa: razão social, nome fantasia, CNPJ, endereço comercial, porte, setor, site, redes sociais e logomarca.</li>
                <li>Dados do responsável pelo cadastro: nome, cargo, e-mail e WhatsApp.</li>
                <li>Dados da adesão: modalidades de vaga, faixa salarial, turnos, ações de profissionalização e data de aceite do Termo de Adesão.</li>
              </ul>

              <h3>2.3. Pesquisa “Conhecendo as Juventudes”</h3>
              <p>
                As respostas do formulário da pesquisa (aplicado pela SEMJU no Google Forms) são importadas para a
                Plataforma <strong>sem o nome</strong> de quem respondeu. O e-mail só é mantido para quem pediu para ser
                avisado sobre novas pesquisas. Respostas abertas e e-mails são vistos apenas pela equipe da SEMJU. O
                painel público mostra somente totais agregados, e opções com menos de 3 respostas são agrupadas para
                que ninguém possa ser identificado.
              </p>

              <h3>2.4. Dados técnicos</h3>
              <p>
                Para manter você conectado, o site guarda um token de sessão no armazenamento do seu navegador. O
                provedor de banco de dados e autenticação registra dados técnicos de acesso (como endereço IP e
                horário de login) para segurança. Não usamos cookies de publicidade, ferramentas de análise de
                comportamento nem pixels de redes sociais.
              </p>

              <h2>3. Para que usamos e com qual base legal</h2>
              <div className="not-prose overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-muted/50">
                    <tr><th className="text-left p-2 border">Finalidade</th><th className="text-left p-2 border">Base legal (LGPD)</th></tr>
                  </thead>
                  <tbody>
                    {legalBases.map(([purpose, basis]) => (
                      <tr key={purpose}><td className="p-2 border align-top">{purpose}</td><td className="p-2 border align-top">{basis}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Não usamos seus dados para decisões automatizadas que afetem seus interesses, nem para fins diferentes
                dos descritos aqui.
              </p>

              <h2>4. Quem pode ver seus dados</h2>
              <ul>
                <li><strong>Qualquer visitante:</strong> somente perfis publicados por você, com nome, foto, apresentação, formação, competências, projetos, links e vídeo. O WhatsApp só aparece se você escolher “Para qualquer visitante”.</li>
                <li><strong>Empresas aprovadas no programa:</strong> o mesmo conteúdo público e, se você permitir, seu WhatsApp. Empresas nunca veem dados sensíveis nem socioeconômicos e se comprometem, no Termo de Adesão, a usar seus dados só para recrutamento.</li>
                <li><strong>Equipe da SEMJU:</strong> servidores designados como administradores acessam os cadastros para moderar perfis, aprovar empresas e produzir indicadores. Todo acesso administrativo exige login e ações relevantes ficam registradas.</li>
                <li><strong>Outros órgãos públicos:</strong> apenas dados agregados ou anonimizados, ou dados pessoais quando houver base legal e finalidade pública específica (art. 26 da LGPD).</li>
                <li><strong>Autoridades:</strong> quando houver obrigação legal ou ordem judicial.</li>
              </ul>
              <p><strong>A Plataforma não vende, aluga nem comercializa dados pessoais.</strong></p>

              <h2>5. Fornecedores e transferência internacional</h2>
              <p>A Plataforma usa serviços de terceiros que tratam dados em nome da Prefeitura (operadores):</p>
              <ul>
                <li><strong>Supabase:</strong> banco de dados, autenticação e armazenamento de fotos e logomarcas.</li>
                <li><strong>Vercel:</strong> hospedagem do site.</li>
                <li><strong>Google:</strong> login com conta Google (só se você escolher essa opção) e o formulário da pesquisa.</li>
              </ul>
              <p>
                Os servidores desses fornecedores podem estar fora do Brasil. Essas transferências internacionais se
                apoiam no art. 33 da LGPD e nas cláusulas de proteção de dados dos contratos desses fornecedores.
              </p>

              <h2>6. Por quanto tempo guardamos</h2>
              <ul>
                <li><strong>Conta e perfil:</strong> enquanto você mantiver a conta. Ao excluir a conta, os dados são apagados na hora do banco principal. Cópias de segurança do fornecedor são substituídas automaticamente em poucos dias.</li>
                <li><strong>Dados sensíveis:</strong> até você revogar a autorização, o que os apaga imediatamente.</li>
                <li><strong>Registro de aceites:</strong> enquanto a conta existir, para comprovar o consentimento (art. 8º, §2º).</li>
                <li><strong>Empresas:</strong> durante a adesão ao programa e a validade do Selo e, depois, pelo prazo exigido pelas regras de arquivo da administração pública.</li>
                <li><strong>Registros administrativos (auditoria):</strong> pelo tempo necessário à prestação de contas e à defesa da administração.</li>
                <li><strong>Pesquisa:</strong> respostas sem identificação são mantidas como série histórica. O e-mail é apagado a pedido.</li>
              </ul>

              <h2>7. Seus direitos</h2>
              <p>Pelo art. 18 da LGPD, você pode, a qualquer momento:</p>
              <ul>
                <li>confirmar se tratamos seus dados e <strong>acessá-los</strong>;</li>
                <li><strong>corrigir</strong> dados incompletos, inexatos ou desatualizados;</li>
                <li>pedir <strong>anonimização, bloqueio ou eliminação</strong> de dados desnecessários, excessivos ou tratados em desacordo com a LGPD;</li>
                <li>receber seus dados em formato aberto (<strong>portabilidade</strong>);</li>
                <li><strong>eliminar</strong> os dados tratados com base no seu consentimento e <strong>revogar o consentimento</strong>;</li>
                <li>saber com quem seus dados são compartilhados e quais as consequências de não dar consentimento;</li>
                <li><strong>peticionar</strong> à Autoridade Nacional de Proteção de Dados (ANPD).</li>
              </ul>
              <p>Boa parte disso você faz sozinho, em <Link to="/meu-perfil">Meu perfil</Link>:</p>
              <ul>
                <li><strong>Corrigir:</strong> edite qualquer etapa do perfil.</li>
                <li><strong>Acessar e portar:</strong> “Baixar meus dados” gera um arquivo com tudo o que temos sobre você.</li>
                <li><strong>Revogar:</strong> “Tirar meu perfil da vitrine” e “Revogar e apagar” dados sensíveis.</li>
                <li><strong>Excluir:</strong> “Excluir minha conta” apaga tudo de forma definitiva.</li>
              </ul>
              <p>
                Para os demais pedidos, escreva para <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>. Responderemos em
                até 15 dias (art. 19, II, da LGPD). Podemos pedir uma confirmação de identidade antes de atender.
              </p>

              <h2>8. Segurança</h2>
              <ul>
                <li>Conexão criptografada (HTTPS) e dados criptografados em repouso pelo fornecedor.</li>
                <li>Regras de acesso no próprio banco de dados (Row Level Security): cada pessoa só acessa os próprios dados, e as páginas públicas recebem apenas campos não sensíveis.</li>
                <li>Senhas guardadas apenas como hash criptográfico.</li>
                <li>Acesso administrativo restrito a servidores designados, com registro das ações.</li>
                <li>Em caso de incidente de segurança que possa causar risco ou dano relevante, comunicaremos a ANPD e as pessoas afetadas (art. 48 da LGPD).</li>
              </ul>

              <h2>9. Idade mínima</h2>
              <p>
                O Banco de Talentos é destinado a pessoas com {MIN_AGE} anos ou mais, o que é confirmado no cadastro.
                Se identificarmos uma conta de pessoa com menos de {MIN_AGE} anos, ela será excluída. Responsáveis
                que encontrarem dados de um menor podem pedir a exclusão pelo e-mail do Encarregado.
              </p>

              <h2>10. Mudanças nesta Política</h2>
              <p>
                Quando esta Política mudar de forma relevante, a versão e a data acima serão atualizadas e, no próximo
                acesso, pediremos que você leia e aceite a nova versão antes de continuar usando sua conta.
              </p>

              <h2>11. Contato</h2>
              <ul>
                <li><strong>Controlador:</strong> Prefeitura Municipal de Oriximiná — Secretaria Municipal da Juventude (SEMJU), Oriximiná, Pará</li>
                <li><strong>Encarregado (canal de atendimento):</strong> <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a></li>
                <li><strong>ANPD:</strong> <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer">www.gov.br/anpd</a></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

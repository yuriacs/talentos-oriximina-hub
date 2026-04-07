import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

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
              Última atualização: 07 de abril de 2026
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6 md:p-10 prose prose-sm md:prose-base max-w-none dark:prose-invert">
              <h2>1. Introdução</h2>
              <p>
                O <strong>Observatório da Juventude de Oriximiná</strong> ("Plataforma"), vinculado à Secretaria
                Municipal da Juventude (SEMJU) da Prefeitura Municipal de Oriximiná, Estado do Pará, valoriza
                a privacidade e a proteção dos dados pessoais dos seus usuários, em conformidade com a
                Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD) e demais normas aplicáveis.
              </p>
              <p>
                Esta Política descreve como coletamos, utilizamos, armazenamos e protegemos as informações
                fornecidas por jovens cadastrados e empresas participantes do programa "Empresa Amiga da Juventude"
                (Lei Municipal nº 9.637/2025).
              </p>

              <h2>2. Dados Coletados</h2>
              <h3>2.1. Dados de Jovens Cadastrados</h3>
              <ul>
                <li><strong>Dados de identificação:</strong> nome completo, faixa etária, gênero, raça/cor (autodeclaração IBGE) e cidade.</li>
                <li><strong>Dados de contato:</strong> e-mail e, opcionalmente, WhatsApp (com controle de visibilidade pelo usuário).</li>
                <li><strong>Dados acadêmicos e profissionais:</strong> formação, cursos, certificações, experiências, competências técnicas e socioemocionais, projetos e portfólio.</li>
                <li><strong>Dados socioeducacionais:</strong> situação profissional, nível de habilidade digital, acesso a computador e internet.</li>
                <li><strong>Dados de inclusão:</strong> condição de PcD, tipo de deficiência e necessidades de acessibilidade (fornecimento voluntário).</li>
                <li><strong>Dados de mídia:</strong> foto de perfil e, opcionalmente, vídeo de apresentação.</li>
              </ul>
              <p>
                <strong>Importante:</strong> A Plataforma <strong>não coleta e não exibe</strong> documentos pessoais como
                CPF, RG ou endereço completo, em conformidade com a LGPD e por questões de segurança.
              </p>

              <h3>2.2. Dados de Empresas</h3>
              <ul>
                <li><strong>Dados jurídicos:</strong> razão social, nome fantasia, CNPJ, porte e setor de atividade.</li>
                <li><strong>Dados de contato:</strong> e-mail, WhatsApp, endereço comercial, site e redes sociais.</li>
                <li><strong>Dados do responsável:</strong> nome e cargo do responsável pela inscrição.</li>
                <li><strong>Dados de adesão:</strong> ações de profissionalização, modalidades de vaga e termos aceitos.</li>
              </ul>

              <h2>3. Finalidade do Tratamento</h2>
              <p>Os dados pessoais são tratados para as seguintes finalidades:</p>
              <ul>
                <li>Criação e manutenção de perfis profissionais dos jovens na Plataforma.</li>
                <li>Conexão entre jovens e empresas para oportunidades de estágio, emprego e capacitação.</li>
                <li>Geração de estatísticas e indicadores para políticas públicas de juventude (dados anonimizados).</li>
                <li>Gestão do programa "Empresa Amiga da Juventude" e concessão do selo.</li>
                <li>Comunicação institucional sobre oportunidades e programas da SEMJU.</li>
                <li>Segurança e prevenção contra abusos na Plataforma.</li>
              </ul>

              <h2>4. Base Legal</h2>
              <p>O tratamento de dados pessoais é realizado com base nas seguintes hipóteses da LGPD:</p>
              <ul>
                <li><strong>Consentimento</strong> (art. 7º, I): obtido no momento do cadastro mediante aceite expresso dos Termos de Uso e desta Política.</li>
                <li><strong>Execução de políticas públicas</strong> (art. 7º, III): para fins de implementação de programas de juventude previstos em lei municipal.</li>
                <li><strong>Interesse legítimo</strong> (art. 7º, IX): para aprimoramento da Plataforma e geração de indicadores estatísticos.</li>
              </ul>

              <h2>5. Compartilhamento de Dados</h2>
              <p>Os dados poderão ser compartilhados nas seguintes hipóteses:</p>
              <ul>
                <li><strong>Perfis publicados:</strong> informações dos perfis com status "Publicado" são visíveis para qualquer visitante da Plataforma, respeitando as configurações de visibilidade de contato definidas pelo próprio jovem.</li>
                <li><strong>Empresas aprovadas:</strong> empresas com selo "Empresa Amiga da Juventude" podem acessar informações dos perfis publicados para fins de recrutamento.</li>
                <li><strong>Órgãos públicos:</strong> dados anonimizados podem ser compartilhados com órgãos da administração pública para fins de políticas de juventude.</li>
                <li><strong>Obrigação legal:</strong> quando exigido por lei ou determinação judicial.</li>
              </ul>
              <p>
                <strong>A Plataforma não vende, aluga ou comercializa dados pessoais em nenhuma circunstância.</strong>
              </p>

              <h2>6. Armazenamento e Segurança</h2>
              <ul>
                <li>Os dados são armazenados em servidores seguros com criptografia em trânsito (TLS/SSL) e em repouso.</li>
                <li>O acesso ao banco de dados é controlado por políticas de segurança em nível de linha (Row Level Security), garantindo que cada usuário acesse apenas seus próprios dados.</li>
                <li>Senhas são armazenadas com hash criptográfico e nunca em texto simples.</li>
                <li>A Plataforma emprega autenticação segura e controle de acesso baseado em papéis (RBAC).</li>
              </ul>

              <h2>7. Direitos do Titular</h2>
              <p>Em conformidade com a LGPD, o titular dos dados possui os seguintes direitos:</p>
              <ul>
                <li><strong>Acesso:</strong> solicitar informações sobre quais dados são tratados.</li>
                <li><strong>Correção:</strong> atualizar ou corrigir dados incompletos, inexatos ou desatualizados, diretamente na Plataforma.</li>
                <li><strong>Eliminação:</strong> solicitar a exclusão dos dados pessoais tratados com base no consentimento.</li>
                <li><strong>Portabilidade:</strong> solicitar a transferência dos dados a outro serviço (via exportação PDF).</li>
                <li><strong>Revogação do consentimento:</strong> retirar o consentimento a qualquer momento.</li>
                <li><strong>Informação:</strong> ser informado sobre entidades com as quais os dados são compartilhados.</li>
              </ul>
              <p>
                Para exercer seus direitos, entre em contato pelo e-mail:{' '}
                <strong>semju@oriximina.pa.gov.br</strong>.
              </p>

              <h2>8. Controle de Visibilidade</h2>
              <p>
                O jovem cadastrado possui controle sobre a visibilidade de suas informações de contato,
                podendo configurar as seguintes opções:
              </p>
              <ul>
                <li><strong>Apenas interno:</strong> contato visível somente para administradores.</li>
                <li><strong>E-mail para logados:</strong> e-mail visível para usuários autenticados.</li>
                <li><strong>WhatsApp para logados:</strong> WhatsApp visível para usuários autenticados.</li>
                <li><strong>Todos:</strong> informações visíveis para qualquer visitante.</li>
                <li><strong>Oculto:</strong> nenhuma informação de contato visível.</li>
              </ul>

              <h2>9. Cookies e Tecnologias de Rastreamento</h2>
              <p>
                A Plataforma utiliza cookies essenciais para manter a sessão de autenticação do usuário.
                Não utilizamos cookies de rastreamento publicitário ou de terceiros para fins de marketing.
              </p>

              <h2>10. Dados de Menores</h2>
              <p>
                A Plataforma pode ser utilizada por jovens a partir de 14 anos.
                Para menores de 18 anos, recomenda-se que o cadastro seja realizado com conhecimento
                e supervisão dos pais ou responsáveis legais, conforme previsto no art. 14 da LGPD.
              </p>

              <h2>11. Alterações desta Política</h2>
              <p>
                Esta Política pode ser atualizada periodicamente. Alterações significativas serão
                comunicadas através da Plataforma. A continuidade de uso após alterações implica
                concordância com a versão atualizada.
              </p>

              <h2>12. Contato</h2>
              <p>Para dúvidas ou solicitações sobre privacidade e proteção de dados:</p>
              <ul>
                <li><strong>Órgão responsável:</strong> Secretaria Municipal da Juventude (SEMJU)</li>
                <li><strong>Endereço:</strong> Prefeitura Municipal de Oriximiná — Pará, Brasil</li>
                <li><strong>E-mail:</strong> semju@oriximina.pa.gov.br</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TermosDeUso() {
  return (
    <Layout>
      <div className="container px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
              <FileText className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Termos de <span className="gradient-text">Uso</span>
            </h1>
            <p className="text-muted-foreground">
              Última atualização: 07 de abril de 2026
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6 md:p-10 prose prose-sm md:prose-base max-w-none dark:prose-invert">
              <h2>1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar a plataforma <strong>Observatório da Juventude</strong>
                ("Plataforma"), você concorda integralmente com estes Termos de Uso. Caso não concorde
                com alguma disposição, solicitamos que não utilize a Plataforma.
              </p>
              <p>
                A Plataforma é mantida pela <strong>Secretaria Municipal da Juventude (SEMJU)</strong> da
                Prefeitura Municipal de Oriximiná, Estado do Pará, e tem como objetivo promover
                o desenvolvimento profissional da juventude, em conformidade com as Leis Municipais
                nº 9.154/2017, nº 9.272/2019, nº 9.312/2019, nº 9.620/2025 e nº 9.637/2025.
              </p>

              <h2>2. Definições</h2>
              <ul>
                <li><strong>Usuário Jovem:</strong> pessoa física que se cadastra na Plataforma para criar seu perfil profissional.</li>
                <li><strong>Empresa Participante:</strong> pessoa jurídica cadastrada no programa "Empresa Amiga da Juventude".</li>
                <li><strong>Administrador:</strong> servidor público ou pessoa designada pela SEMJU para gerenciar a Plataforma.</li>
                <li><strong>Perfil:</strong> conjunto de informações profissionais do jovem cadastrado na Plataforma.</li>
              </ul>

              <h2>3. Cadastro e Conta</h2>
              <h3>3.1. Requisitos</h3>
              <ul>
                <li>O cadastro é gratuito e aberto a jovens residentes ou vinculados ao município de Oriximiná.</li>
                <li>O usuário deve fornecer informações verídicas e manter seus dados atualizados.</li>
                <li>É necessário um endereço de e-mail válido para criação da conta.</li>
                <li>Menores de 18 anos devem contar com ciência dos pais ou responsáveis legais.</li>
              </ul>

              <h3>3.2. Responsabilidade pela Conta</h3>
              <ul>
                <li>O usuário é responsável pela confidencialidade de suas credenciais de acesso.</li>
                <li>Qualquer atividade realizada através da conta será de responsabilidade do titular.</li>
                <li>O usuário deve notificar a SEMJU imediatamente em caso de uso não autorizado da conta.</li>
              </ul>

              <h2>4. Perfil Profissional</h2>
              <h3>4.1. Criação e Publicação</h3>
              <ul>
                <li>O usuário pode criar seu perfil profissional preenchendo informações sobre formação, competências, experiências e projetos.</li>
                <li>Perfis iniciam com status "Rascunho" e podem ser publicados pelo usuário quando desejar.</li>
                <li>Perfis publicados são visíveis publicamente na Plataforma.</li>
                <li>Perfis completos podem receber um selo de verificação pela administração.</li>
              </ul>

              <h3>4.2. Conteúdo do Perfil</h3>
              <p>O usuário se compromete a:</p>
              <ul>
                <li>Fornecer informações verdadeiras, precisas e atualizadas.</li>
                <li>Não incluir conteúdo ofensivo, discriminatório, ilegal ou que viole direitos de terceiros.</li>
                <li>Não utilizar fotos inadequadas ou que não representem o próprio usuário.</li>
                <li>Respeitar a propriedade intelectual ao descrever projetos e experiências.</li>
              </ul>

              <h2>5. Programa "Empresa Amiga da Juventude"</h2>
              <h3>5.1. Adesão</h3>
              <ul>
                <li>Empresas podem se cadastrar voluntariamente no programa, conforme Lei Municipal nº 9.637/2025.</li>
                <li>O cadastro requer aceite do Termo de Adesão e Compromisso específico do programa.</li>
                <li>A aprovação do cadastro e concessão do selo ficam a critério da SEMJU.</li>
              </ul>

              <h3>5.2. Obrigações das Empresas</h3>
              <ul>
                <li>Utilizar os dados dos jovens exclusivamente para fins de recrutamento e seleção.</li>
                <li>Não discriminar candidatos por raça, gênero, orientação sexual, deficiência ou origem social.</li>
                <li>Cumprir as legislações trabalhistas vigentes, especialmente no que se refere a estágio e menor aprendiz.</li>
                <li>Respeitar a privacidade dos jovens e não compartilhar seus dados com terceiros.</li>
              </ul>

              <h2>6. Uso Aceitável</h2>
              <p>É expressamente vedado ao usuário:</p>
              <ul>
                <li>Criar contas falsas ou com dados de terceiros.</li>
                <li>Utilizar a Plataforma para fins diferentes do desenvolvimento profissional.</li>
                <li>Enviar mensagens de spam, assédio ou conteúdo inadequado a outros usuários.</li>
                <li>Tentar acessar dados ou funcionalidades não autorizadas.</li>
                <li>Realizar scraping, cópia em massa ou uso automatizado da Plataforma.</li>
                <li>Utilizar a Plataforma para práticas ilegais ou contrárias à moral e aos bons costumes.</li>
              </ul>

              <h2>7. Denúncias e Moderação</h2>
              <ul>
                <li>Qualquer usuário pode denunciar perfis ou conteúdos que violem estes Termos.</li>
                <li>A administração analisará denúncias e poderá bloquear perfis que violem as regras.</li>
                <li>O usuário bloqueado será notificado e poderá solicitar revisão da decisão.</li>
              </ul>

              <h2>8. Propriedade Intelectual</h2>
              <ul>
                <li>A Plataforma, sua interface, design e funcionalidades são de propriedade da Prefeitura Municipal de Oriximiná.</li>
                <li>O conteúdo criado pelo usuário em seu perfil permanece de sua autoria e propriedade.</li>
                <li>Ao publicar conteúdo, o usuário concede à Plataforma licença não exclusiva para exibição na Plataforma.</li>
              </ul>

              <h2>9. Isenção de Responsabilidade</h2>
              <ul>
                <li>A Plataforma é um meio de conexão entre jovens e oportunidades — não garante emprego, estágio ou contratação.</li>
                <li>A SEMJU não se responsabiliza por interações ou acordos realizados entre jovens e empresas fora da Plataforma.</li>
                <li>A Plataforma é fornecida "como está", sem garantias de disponibilidade ininterrupta.</li>
              </ul>

              <h2>10. Suspensão e Encerramento</h2>
              <ul>
                <li>A SEMJU reserva-se o direito de suspender ou encerrar contas que violem estes Termos.</li>
                <li>O usuário pode solicitar a exclusão de sua conta e dados a qualquer momento.</li>
                <li>Dados anonimizados utilizados para estatísticas poderão ser mantidos mesmo após exclusão da conta.</li>
              </ul>

              <h2>11. Alterações dos Termos</h2>
              <p>
                Estes Termos podem ser atualizados periodicamente. Alterações significativas serão
                comunicadas através da Plataforma. A continuidade de uso após alterações implica
                concordância com a versão atualizada.
              </p>

              <h2>12. Legislação Aplicável</h2>
              <p>
                Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da
                Comarca de Oriximiná, Estado do Pará, para dirimir quaisquer questões
                decorrentes destes Termos.
              </p>

              <h2>13. Contato</h2>
              <p>Para dúvidas ou solicitações:</p>
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

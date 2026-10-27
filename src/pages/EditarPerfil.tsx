import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Check, AlertCircle, Trophy, Star, Award, FileDown, ArrowLeft, ArrowRight, Eye, Loader2, Rocket,
  User, GraduationCap, Wrench, Target, Accessibility, Send, Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { generateProfilePDF } from '@/lib/generateProfilePDF';
import { StepSaveProvider, useStepSaveController } from '@/components/profile/stepSave';
import BasicInfoForm from '@/components/profile/BasicInfoForm';
import SkillsForm from '@/components/profile/SkillsForm';
import ProjectsForm from '@/components/profile/ProjectsForm';
import EducationForm from '@/components/profile/EducationForm';
import ExperiencesForm from '@/components/profile/ExperiencesForm';
import AvailabilityForm from '@/components/profile/AvailabilityForm';
import SocioeducationalForm from '@/components/profile/SocioeducationalForm';
import ProfessionalStatusForm from '@/components/profile/ProfessionalStatusForm';
import WorkPreferencesForm from '@/components/profile/WorkPreferencesForm';
import MobilityForm from '@/components/profile/MobilityForm';
import InclusionForm from '@/components/profile/InclusionForm';
import ResourcesForm from '@/components/profile/ResourcesForm';
import PortfolioLinksForm from '@/components/profile/PortfolioLinksForm';

function computeScore(profile: any, skills: any[], projects: any[], availability: any[], softSkills: any[]) {
  let score = 0;
  if (profile.bio?.trim()) score += 5;
  if (profile.professional_objective?.trim()) score += 5;
  if (skills.length >= 5) score += 10;
  if (projects.length >= 1) score += 15;
  if (availability.length >= 1) score += 5;
  if (profile.area) score += 3;
  if (profile.age_range) score += 2;
  if (profile.education_level) score += 3;
  if (profile.employment_status) score += 3;
  if ((profile.desired_opportunity_types as any)?.length > 0) score += 3;
  if ((profile.interest_areas as any)?.length > 0) score += 3;
  if ((profile.available_shifts as any)?.length > 0) score += 2;
  if (softSkills.length >= 3) score += 5;
  if (profile.portfolio_url || profile.linkedin_url || profile.github_url) score += 10;
  if (profile.video_url) score += 20;
  if (profile.is_pcd !== null && profile.is_pcd !== undefined) score += 2;
  if (profile.has_computer !== null && profile.has_computer !== undefined) score += 2;
  if (profile.internet_access) score += 2;
  return Math.min(score, 100);
}

function getProfileLevel(score: number): { label: string; icon: typeof Star; color: string } {
  if (score >= 80) return { label: 'Completo', icon: Trophy, color: 'text-yellow-500' };
  if (score >= 50) return { label: 'Intermediário', icon: Award, color: 'text-blue-500' };
  return { label: 'Básico', icon: Star, color: 'text-muted-foreground' };
}

const STEPS = [
  { key: 'sobre', label: 'Sobre você', icon: User, hint: 'Foto, apresentação e contato.' },
  { key: 'perfil', label: 'Estudo e trabalho', icon: Briefcase, hint: 'Escolaridade e situação profissional.' },
  { key: 'formacao', label: 'Formação', icon: GraduationCap, hint: 'Cursos e experiências, inclusive voluntárias.' },
  { key: 'competencias', label: 'Competências', icon: Wrench, hint: 'O que você sabe fazer e o que já fez.' },
  { key: 'preferencias', label: 'Preferências', icon: Target, hint: 'Que tipo de oportunidade você procura.' },
  { key: 'inclusao', label: 'Inclusão', icon: Accessibility, hint: 'Opcional. Ajuda a SEMJU a planejar ações.' },
  { key: 'publicar', label: 'Publicar', icon: Send, hint: 'Confira o que falta e publique na vitrine.' },
] as const;

export default function EditarPerfil() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    profile, skills, education, experiences, projects, certifications, languages,
    availability,
    loading, updateProfile, addSkill, deleteSkill,
    addEducation, deleteEducation, addExperience, deleteExperience,
    addProject, deleteProject, toggleAvailability,
  } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const { api, hasChanges, saveAll } = useStepSaveController();
  const topRef = useRef<HTMLDivElement>(null);

  const stepIndex = Math.max(0, STEPS.findIndex(s => s.key === searchParams.get('etapa')));
  const step = STEPS[stepIndex];

  // Avisa antes de fechar a aba com alterações não salvas
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges()) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasChanges]);

  if (authLoading || loading) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></Layout>;
  }
  if (!user) return <Navigate to="/login?redirect=/meu-perfil" replace />;
  if (!profile) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Perfil não encontrado</p></div></Layout>;

  const p = profile as any;
  const score = computeScore(p, skills, projects, availability, []);
  const level = getProfileLevel(score);
  const LevelIcon = level.icon;
  const isPublished = profile.status === 'PUBLISHED';

  // `step`: onde completar o item (o checklist leva direto para lá)
  const checklist = [
    { label: 'Apresentação ("Sobre você")', done: !!profile.bio?.trim(), pts: 5, step: 'sobre', required: true },
    { label: 'Objetivo profissional', done: !!profile.professional_objective?.trim(), pts: 5, step: 'sobre', required: true },
    { label: '5 ou mais competências', done: skills.length >= 5, pts: 10, step: 'competencias', required: true },
    { label: '1 ou mais projetos', done: projects.length >= 1, pts: 15, step: 'competencias', required: true },
    { label: 'Disponibilidade', done: availability.length >= 1, pts: 5, step: 'preferencias', required: true },
    { label: 'Faixa etária e escolaridade', done: !!p.age_range && !!p.education_level, pts: 5, step: 'perfil', required: false },
    { label: 'Links ou portfólio', done: !!(p.portfolio_url || p.linkedin_url || p.github_url), pts: 10, step: 'competencias', required: false },
    { label: 'Vídeo de apresentação', done: !!p.video_url, pts: 20, step: 'competencias', required: false },
  ];
  const missingRequired = checklist.filter(c => c.required && !c.done);
  const canPublish = missingRequired.length === 0;

  const goTo = (key: string) => {
    setSearchParams({ etapa: key }, { replace: false });
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Salva o que mudou na etapa; só troca de etapa se tudo salvou. */
  const saveThenGo = async (key: string | null) => {
    setSaving(true);
    const { ok, saved } = await saveAll();
    setSaving(false);
    if (!ok) return;
    if (saved > 0) toast.success('Alterações salvas');
    if (key) goTo(key);
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    setSaving(true);
    const { ok } = await saveAll();
    if (ok) {
      const { error } = await updateProfile({ status: 'PUBLISHED', profile_completion: score } as any);
      if (error) toast.error('Não foi possível publicar. Tente novamente.');
      else toast.success('Perfil publicado! Agora as empresas podem te encontrar.');
    }
    setSaving(false);
  };

  const handleDownloadPDF = async () => {
    await generateProfilePDF({
      fullName: profile.full_name,
      area: p.area,
      city: profile.city,
      email: user?.email || null,
      whatsapp: profile.whatsapp,
      linkedinUrl: p.linkedin_url,
      githubUrl: p.github_url,
      portfolioUrl: p.portfolio_url,
      bio: profile.bio,
      professionalObjective: profile.professional_objective,
      photoUrl: profile.photo || null,
      skills: skills.map(s => ({ name: s.name, level: s.level, category: s.category })),
      softSkills: [],
      languages: languages.map(l => ({ name: l.name, level: l.level })),
      experiences: experiences.map(e => ({
        place: e.place, type: e.type, start_date: e.start_date,
        end_date: e.end_date, current: e.current, description: e.description,
      })),
      education: education.map(e => ({
        institution: e.institution, course: e.course, level: e.level,
        year: e.year, current: e.current,
      })),
      certifications: certifications.map(c => ({
        course: c.course, institution: c.institution,
        completed_at: c.completed_at, hours: c.hours,
      })),
    });
  };

  const prev = STEPS[stepIndex - 1];
  const next = STEPS[stepIndex + 1];

  return (
    <Layout>
      <div ref={topRef} className="container max-w-5xl px-4 py-6 sm:py-8 space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">Meu Perfil</h1>
              <Badge variant={isPublished ? 'default' : 'secondary'}>
                {isPublished ? 'Publicado' : profile.status === 'BLOCKED' ? 'Bloqueado' : 'Rascunho'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {isPublished ? 'Seu perfil está na vitrine. Mantenha-o atualizado.' : 'Complete as etapas e publique para aparecer na vitrine de talentos.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to={`/perfil/${profile.id}`}><Eye className="h-4 w-4" /> Ver como fica</Link>
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="gap-2">
              <FileDown className="h-4 w-4" /> Currículo em PDF
            </Button>
          </div>
        </div>

        {/* Pontuação */}
        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <LevelIcon className={cn('h-7 w-7 shrink-0', level.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <p className="font-semibold">{score} pontos <span className="text-xs font-normal text-muted-foreground">· nível {level.label}</span></p>
                {!isPublished && (
                  <span className="text-xs text-muted-foreground">
                    {canPublish ? 'Pronto para publicar' : `Faltam ${missingRequired.length} itens para publicar`}
                  </span>
                )}
              </div>
              <Progress value={score} className="h-2.5" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">
          {/* Etapas: lista lateral no computador, faixa rolável no celular */}
          <nav aria-label="Etapas do perfil" className="lg:sticky lg:top-24">
            <ol className="flex lg:flex-col gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = i === stepIndex;
                return (
                  <li key={s.key} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => saveThenGo(s.key)}
                      disabled={saving}
                      aria-current={active ? 'step' : undefined}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                        active ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[11px]', active ? 'bg-primary-foreground/20' : 'bg-background')}>{i + 1}</span>
                      <Icon className="h-4 w-4 hidden sm:block" />
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <StepSaveProvider api={api}>
            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="font-display text-xl font-semibold">{stepIndex + 1}. {step.label}</h2>
                <p className="text-sm text-muted-foreground">{step.hint}</p>
              </div>

              {step.key === 'sobre' && <BasicInfoForm profile={profile} onSave={updateProfile} />}
              {step.key === 'perfil' && (
                <>
                  <SocioeducationalForm profile={profile} onSave={updateProfile} />
                  <ProfessionalStatusForm profile={profile} onSave={updateProfile} />
                </>
              )}
              {step.key === 'formacao' && (
                <>
                  <EducationForm education={education} onAdd={addEducation} onDelete={deleteEducation} />
                  <ExperiencesForm experiences={experiences} onAdd={addExperience} onDelete={deleteExperience} />
                </>
              )}
              {step.key === 'competencias' && (
                <>
                  <SkillsForm skills={skills} onAdd={addSkill} onDelete={deleteSkill} />
                  <ProjectsForm projects={projects} onAdd={addProject} onDelete={deleteProject} />
                  <PortfolioLinksForm profile={profile} onSave={updateProfile} />
                </>
              )}
              {step.key === 'preferencias' && (
                <>
                  <WorkPreferencesForm profile={profile} onSave={updateProfile} />
                  <AvailabilityForm availability={availability} onToggle={toggleAvailability} />
                  <MobilityForm profile={profile} onSave={updateProfile} />
                </>
              )}
              {step.key === 'inclusao' && (
                <>
                  <InclusionForm profile={profile} onSave={updateProfile} />
                  <ResourcesForm profile={profile} onSave={updateProfile} />
                </>
              )}
              {step.key === 'publicar' && (
                <Card>
                  <CardContent className="py-6 space-y-5">
                    <div className="space-y-2">
                      {checklist.map(c => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => !c.done && goTo(c.step)}
                          disabled={c.done}
                          className="w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm enabled:hover:bg-muted"
                        >
                          {c.done ? <Check className="h-4 w-4 text-green-600 shrink-0" /> : <AlertCircle className={cn('h-4 w-4 shrink-0', c.required ? 'text-destructive' : 'text-muted-foreground')} />}
                          <span className={cn('flex-1', c.done ? 'text-foreground' : 'text-muted-foreground')}>
                            {c.label}
                            {!c.done && c.required && <span className="ml-2 text-xs text-destructive">obrigatório</span>}
                          </span>
                          <span className="text-xs text-muted-foreground">+{c.pts} pts</span>
                          {!c.done && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                        </button>
                      ))}
                    </div>
                    {isPublished ? (
                      <p className="flex items-center gap-2 text-sm text-green-700"><Check className="h-4 w-4" /> Seu perfil já está publicado na vitrine.</p>
                    ) : (
                      <div className="space-y-2">
                        <Button onClick={handlePublish} disabled={!canPublish || saving} size="lg" className="w-full sm:w-auto gap-2 gradient-bg hover:opacity-90">
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                          Publicar meu perfil
                        </Button>
                        {!canPublish && <p className="text-xs text-muted-foreground">Complete os itens obrigatórios acima para liberar a publicação.</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                {prev ? (
                  <Button type="button" variant="outline" onClick={() => saveThenGo(prev.key)} disabled={saving} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </Button>
                ) : <span className="hidden sm:block" />}
                {next ? (
                  <Button type="button" onClick={() => saveThenGo(next.key)} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Salvar e continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </StepSaveProvider>
        </div>
      </div>
    </Layout>
  );
}

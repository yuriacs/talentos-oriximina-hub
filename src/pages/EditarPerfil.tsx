import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, AlertCircle, Trophy, Star, Award, FileDown } from 'lucide-react';
import { generateProfilePDF } from '@/lib/generateProfilePDF';
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
import SoftSkillsForm from '@/components/profile/SoftSkillsForm';
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

export default function EditarPerfil() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    profile, skills, education, experiences, projects, certifications, languages,
    availability, softSkills,
    loading, updateProfile, addSkill, deleteSkill,
    addEducation, deleteEducation, addExperience, deleteExperience,
    addProject, deleteProject, toggleAvailability,
    addSoftSkill, updateSoftSkill, deleteSoftSkill,
  } = useProfile();

  if (authLoading || loading) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Carregando...</p></div></Layout>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Perfil não encontrado</p></div></Layout>;

  const p = profile as any;
  const score = computeScore(p, skills, projects, availability, softSkills);
  const level = getProfileLevel(score);
  const LevelIcon = level.icon;

  const checklist = [
    { label: 'Bio preenchida', done: !!profile.bio?.trim(), pts: 5 },
    { label: 'Objetivo profissional', done: !!profile.professional_objective?.trim(), pts: 5 },
    { label: '5+ competências', done: skills.length >= 5, pts: 10 },
    { label: '1+ projeto', done: projects.length >= 1, pts: 15 },
    { label: 'Disponibilidade definida', done: availability.length >= 1, pts: 5 },
    { label: 'Perfil socioeducacional', done: !!p.age_range && !!p.education_level, pts: 5 },
    { label: 'Soft skills (3+)', done: softSkills.length >= 3, pts: 5 },
    { label: 'Links/portfólio', done: !!(p.portfolio_url || p.linkedin_url || p.github_url), pts: 10 },
    { label: 'Vídeo de apresentação', done: !!p.video_url, pts: 20 },
  ];

  const canPublish = checklist.slice(0, 5).every(c => c.done);

  const handlePublish = async () => {
    if (!canPublish) return;
    await updateProfile({ status: 'PUBLISHED', profile_completion: score } as any);
  };

  const handleDownloadPDF = () => {
    generateProfilePDF({
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
      skills: skills.map(s => ({ name: s.name, level: s.level, category: s.category })),
      softSkills: softSkills.map(s => ({ name: s.name, rating: s.rating })),
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

  return (
    <Layout>
      <div className="container max-w-4xl px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">Preencha suas informações para publicar seu perfil</p>
          </div>
          <Badge variant={profile.status === 'PUBLISHED' ? 'default' : 'secondary'}>
            {profile.status === 'PUBLISHED' ? 'Publicado' : profile.status === 'BLOCKED' ? 'Bloqueado' : 'Rascunho'}
          </Badge>
        </div>

        {/* Score + Progress + Checklist */}
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <LevelIcon className={`h-6 w-6 ${level.color}`} />
                <div>
                  <p className="font-semibold text-lg">{score} pontos</p>
                  <p className="text-xs text-muted-foreground">Nível: {level.label}</p>
                </div>
              </div>
              <div className="flex-1">
                <Progress value={score} className="h-3" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {checklist.map(c => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  {c.done ? <Check className="h-4 w-4 text-green-500 shrink-0" /> : <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <span className={c.done ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
                  <span className="text-xs text-muted-foreground">+{c.pts}pts</span>
                </div>
              ))}
            </div>
            {canPublish && profile.status !== 'PUBLISHED' && (
              <button onClick={handlePublish} className="mt-4 text-sm font-medium text-primary hover:underline">
                ✨ Publicar perfil agora
              </button>
            )}
          </CardContent>
        </Card>

        {/* Section 1: Informações Básicas */}
        <BasicInfoForm profile={profile} onSave={updateProfile} />

        {/* Section 2: Perfil Socioeducacional */}
        <SocioeducationalForm profile={profile} onSave={updateProfile} />

        {/* Section 3: Situação Profissional */}
        <ProfessionalStatusForm profile={profile} onSave={updateProfile} />

        {/* Section 4: Preferências de Trabalho */}
        <WorkPreferencesForm profile={profile} onSave={updateProfile} />

        {/* Section 5: Disponibilidade e Mobilidade */}
        <MobilityForm profile={profile} onSave={updateProfile} />
        <AvailabilityForm availability={availability} onToggle={toggleAvailability} />

        {/* Section 6: Competências */}
        <SkillsForm skills={skills} onAdd={addSkill} onDelete={deleteSkill} />

        {/* Section 7: Soft Skills */}
        <SoftSkillsForm softSkills={softSkills} onAdd={addSoftSkill} onUpdate={updateSoftSkill} onDelete={deleteSoftSkill} />

        {/* Section 8: Projetos e Portfólio */}
        <ProjectsForm projects={projects} onAdd={addProject} onDelete={deleteProject} />
        <PortfolioLinksForm profile={profile} onSave={updateProfile} />

        {/* Section 9: Formação e Experiência */}
        <EducationForm education={education} onAdd={addEducation} onDelete={deleteEducation} />
        <ExperiencesForm experiences={experiences} onAdd={addExperience} onDelete={deleteExperience} />

        {/* Section 10: Inclusão e Acessibilidade */}
        <InclusionForm profile={profile} onSave={updateProfile} />

        {/* Section 11: Recursos Extras */}
        <ResourcesForm profile={profile} onSave={updateProfile} />
      </div>
    </Layout>
  );
}

import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SkillChip } from '@/components/ui/skill-chip';
import { availabilityLabels } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import {
  MapPin,
  Briefcase,
  MessageCircle,
  Share2,
  FileText,
  BadgeCheck,
  GraduationCap,
  FolderOpen,
  Award,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  User } from
'lucide-react';
import { toast } from 'sonner';

function extractFromBio(bio: string) {
  const emailMatch = bio.match(/Email:\s*([\w.-]+@[\w.-]+\.\w+)/i);
  const phoneMatch = bio.match(/Telefone:\s*([\d\s().-]+)/i);
  const ageMatch = bio.match(/Idade:\s*(\d+)\s*anos/i);
  return {
    email: emailMatch?.[1] || null,
    phone: phoneMatch?.[1]?.trim() || null,
    age: ageMatch?.[1] ? parseInt(ageMatch[1]) : null
  };
}

export default function Perfil() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchProfile() {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id || null;
      const { data: safeData } = await supabase.rpc('get_safe_profile_data', {
        _profile_id: id,
        _requesting_user_id: userId,
      });
      const p = safeData as any;
      if (!p) {setLoading(false);return;}
      setProfile(p);

      const [skillsRes, projectsRes, eduRes, expRes, certRes, availRes] = await Promise.all([
      supabase.from('skills').select('*').eq('profile_id', id),
      supabase.from('projects').select('*').eq('profile_id', id),
      supabase.from('education').select('*').eq('profile_id', id),
      supabase.from('experiences').select('*').eq('profile_id', id),
      supabase.from('certifications').select('*').eq('profile_id', id),
      supabase.from('availability').select('*').eq('profile_id', id)]
      );

      setSkills(skillsRes.data || []);
      setProjects(projectsRes.data || []);
      setEducation(eduRes.data || []);
      setExperiences(expRes.data || []);
      setCertifications(certRes.data || []);
      setAvailability((availRes.data || []).map((a) => a.type));
      setLoading(false);
    }
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>);

  }

  if (!profile) {
    return (
      <Layout>
        <div className="container px-4 md:px-6 py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Perfil não encontrado</h1>
          <p className="text-muted-foreground mb-6">O perfil que você está procurando não existe.</p>
          <Link to="/explorar">
            <Button>Voltar para Explorar</Button>
          </Link>
        </div>
      </Layout>);

  }

  const initials = profile.full_name.
  split(' ').
  map((n: string) => n[0]).
  slice(0, 2).
  join('').
  toUpperCase();

  const { email, phone, age } = extractFromBio(profile.bio || '');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência!');
  };

  const hardSkills = skills.filter((s) => s.category === 'HARD');
  const softSkills = skills.filter((s) => s.category === 'SOFT');

  return (
    <Layout>
      {/* Header with gradient */}
      <div className="min-h-[8rem] md:min-h-[10rem] lg:min-h-[11rem] gradient-hero-bg relative font-thin">
        <div className="container px-4 md:px-6 pt-24 md:pt-10 lg:pt-12">
          <Link to="/explorar" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </div>

      <div className="container px-4 md:px-6 mt-6 md:mt-8 lg:mt-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile header card */}
            <Card className="border-border/50 overflow-visible">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl -mt-16 md:-mt-20">
                    <AvatarImage src={profile.photo} alt={profile.full_name} />
                    <AvatarFallback className="gradient-bg text-primary-foreground text-3xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h1 className="font-display text-2xl md:text-3xl font-bold">
                            {profile.full_name}
                          </h1>
                          {profile.is_verified &&
                          <BadgeCheck className="h-6 w-6 text-primary" />
                          }
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {profile.professional_objective}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.city}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handleShare}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button className="gradient-bg hover:opacity-90 gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Enviar Mensagem
                        </Button>
                      </div>
                    </div>

                    {/* Contact info (email, phone, age) */}
                    {(email || phone || age) &&
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                        {age &&
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="h-4 w-4" />
                            {age} anos
                          </span>
                      }
                        {email &&
                      <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                            <Mail className="h-4 w-4" />
                            {email}
                          </a>
                      }
                        {phone &&
                      <a href={`tel:${phone.replace(/\D/g, '')}`} className="flex items-center gap-1.5 text-primary hover:underline">
                            <Phone className="h-4 w-4" />
                            {phone}
                          </a>
                      }
                      </div>
                    }

                    <p className="mt-4 text-muted-foreground">
                      {profile.bio}
                    </p>

                    {availability.length > 0 &&
                    <div className="flex flex-wrap gap-2 mt-4">
                        {availability.map((avail) =>
                      <Badge key={avail} variant="secondary">
                            {availabilityLabels[avail]}
                          </Badge>
                      )}
                      </div>
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            {projects.length > 0 &&
            <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    Projetos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {projects.map((project) =>
                <div key={project.id} className="border-b border-border/50 last:border-0 pb-6 last:pb-0">
                      <h3 className="font-display font-semibold text-lg mb-2">
                        {project.title}
                      </h3>
                      <div className="space-y-3 text-sm">
                        {project.problem &&
                    <div>
                            <span className="font-medium text-foreground">Problema: </span>
                            <span className="text-muted-foreground">{project.problem}</span>
                          </div>
                    }
                        {project.solution &&
                    <div>
                            <span className="font-medium text-foreground">Solução: </span>
                            <span className="text-muted-foreground">{project.solution}</span>
                          </div>
                    }
                        {project.results &&
                    <div>
                            <span className="font-medium text-foreground">Resultados: </span>
                            <span className="text-muted-foreground">{project.results}</span>
                          </div>
                    }
                        {project.technologies?.length > 0 &&
                    <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.technologies.map((tech: string) =>
                      <SkillChip key={tech} name={tech} size="sm" category="HARD" />
                      )}
                          </div>
                    }
                        {project.links?.length > 0 &&
                    <div className="flex gap-2 pt-2">
                            {project.links.map((link: string, i: number) =>
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                Ver projeto
                              </a>
                      )}
                          </div>
                    }
                      </div>
                    </div>
                )}
                </CardContent>
              </Card>
            }

            {/* Experience */}
            {experiences.length > 0 &&
            <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Experiências
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {experiences.map((exp) =>
                <div key={exp.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{exp.type}</h4>
                          {exp.current &&
                      <Badge variant="secondary" className="text-xs">Atual</Badge>
                      }
                        </div>
                        <p className="text-sm text-muted-foreground">{exp.place}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(exp.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                          {' - '}
                          {exp.current ? 'Presente' : exp.end_date && new Date(exp.end_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </p>
                        {exp.description && <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>}
                      </div>
                    </div>
                )}
                </CardContent>
              </Card>
            }
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {skills.length > 0 &&
            <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Award className="h-5 w-5 text-primary" />
                    Competências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hardSkills.length > 0 &&
                  <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Técnicas (Hard Skills)</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {hardSkills.map((skill) =>
                      <SkillChip key={skill.id} name={skill.name} category={skill.category} level={skill.level} showLevel size="sm" />
                      )}
                        </div>
                      </div>
                  }
                    {softSkills.length > 0 &&
                  <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Socioemocionais (Soft Skills)</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {softSkills.map((skill) =>
                      <SkillChip key={skill.id} name={skill.name} category={skill.category} level={skill.level} showLevel size="sm" />
                      )}
                        </div>
                      </div>
                  }
                  </div>
                </CardContent>
              </Card>
            }

            {/* Education */}
            {education.length > 0 &&
            <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Formação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.map((edu) =>
                <div key={edu.id}>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{edu.course}</h4>
                        {edu.current && <Badge variant="secondary" className="text-xs">Cursando</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">{edu.level} • {edu.year}</p>
                    </div>
                )}
                </CardContent>
              </Card>
            }

            {/* Certifications */}
            {certifications.length > 0 &&
            <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Award className="h-5 w-5 text-primary" />
                    Certificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {certifications.map((cert) =>
                <div key={cert.id}>
                      <h4 className="font-medium text-sm">{cert.course}</h4>
                      <p className="text-sm text-muted-foreground">{cert.institution}</p>
                      <p className="text-xs text-muted-foreground">
                        {cert.hours}h • {new Date(cert.completed_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                )}
                </CardContent>
              </Card>
            }
          </div>
        </div>
      </div>
    </Layout>);

}
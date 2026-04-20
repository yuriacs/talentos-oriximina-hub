import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProfileCard } from '@/components/ui/profile-card';
import { supabase } from '@/integrations/supabase/client';
import type { ProfileCardData } from '@/types';
import { ArrowRight, Loader2, Users } from 'lucide-react';

export function ProfilesPreview() {
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data: profilesData } = await supabase
        .rpc('get_public_profiles');

      if (!profilesData?.length) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      const profileIds = profilesData.map(p => p.id);

      const [skillsRes, availRes, projectsRes] = await Promise.all([
        supabase.from('skills').select('*').in('profile_id', profileIds),
        supabase.from('availability').select('*').in('profile_id', profileIds),
        supabase.from('projects').select('id, profile_id').in('profile_id', profileIds),
      ]);

      const cards: ProfileCardData[] = profilesData.map(p => {
        const pSkills = (skillsRes.data || []).filter(s => s.profile_id === p.id).map(s => ({
          id: s.id, profileId: s.profile_id, name: s.name, category: s.category as any, level: s.level as any,
        }));
        const pAvail = (availRes.data || []).filter(a => a.profile_id === p.id).map(a => a.type);
        const pCount = (projectsRes.data || []).filter(pr => pr.profile_id === p.id).length;

        return {
          id: p.id,
          fullName: p.full_name,
          photo: p.photo || undefined,
          bio: p.bio || '',
          city: p.city || 'Oriximiná',
          professionalObjective: p.professional_objective || '',
          skills: pSkills,
          isVerified: p.is_verified,
          projectCount: pCount,
          availability: pAvail,
          area: (p as any).area || '',
        };
      });

      setProfiles(cards);
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Conheça nossos{' '}
              <span className="gradient-text">Talentos</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Conheça os talentos de Oriximiná — jovens qualificados e prontos
              para contribuir com o mercado de trabalho.
            </p>
          </div>
          <Link to="/explorar">
            <Button variant="outline" className="gap-2">
              Ver Todos os Perfis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : profiles.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{profiles.length} perfis encontrados</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {profiles.map((profile, index) => (
                <div
                  key={profile.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProfileCard profile={profile} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Nenhum perfil publicado ainda</h3>
            <p className="text-muted-foreground">Os perfis aparecerão aqui quando forem publicados.</p>
          </div>
        )}
      </div>
    </section>
  );
}

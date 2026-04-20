import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SkillChip } from '@/components/ui/skill-chip';
import { availabilityLabels } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  SlidersHorizontal,
  X,
  Users,
  Filter,
  MapPin,
  Briefcase,
  FolderOpen,
  MessageCircle,
  BadgeCheck,
  Loader2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DBProfile {
  id: string;
  full_name: string;
  photo: string | null;
  bio: string | null;
  city: string | null;
  professional_objective: string | null;
  is_verified: boolean;
  area: string | null;
  profile_completion?: number | null;
}

interface DBSkill {
  id: string;
  profile_id: string;
  name: string;
  category: string;
  level: string;
}

interface DBAvailability {
  profile_id: string;
  type: string;
}

export default function Explorar() {
  const [profiles, setProfiles] = useState<DBProfile[]>([]);
  const [allSkills, setAllSkills] = useState<DBSkill[]>([]);
  const [allAvailability, setAllAvailability] = useState<DBAvailability[]>([]);
  const [allProjectCounts, setAllProjectCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: profilesData } = await supabase
        .rpc('get_public_profiles');

      const ids = (profilesData || []).map(p => p.id);
      setProfiles(profilesData || []);

      if (ids.length > 0) {
        const [skillsRes, availRes, projRes] = await Promise.all([
          supabase.from('skills').select('id, profile_id, name, category, level').in('profile_id', ids),
          supabase.from('availability').select('profile_id, type').in('profile_id', ids),
          supabase.from('projects').select('id, profile_id').in('profile_id', ids),
        ]);
        setAllSkills(skillsRes.data || []);
        setAllAvailability(availRes.data || []);
        const counts: Record<string, number> = {};
        (projRes.data || []).forEach(p => { counts[p.profile_id] = (counts[p.profile_id] || 0) + 1; });
        setAllProjectCounts(counts);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const areas = [...new Set(profiles.map(p => p.area || p.professional_objective).filter(Boolean))] as string[];

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = !searchQuery ||
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.bio || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.professional_objective || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      allSkills.filter(s => s.profile_id === profile.id).some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesArea = selectedArea === 'all' ||
      (profile.area || profile.professional_objective || '').toLowerCase().includes(selectedArea.toLowerCase());

    const profileAvail = allAvailability.filter(a => a.profile_id === profile.id).map(a => a.type);
    const matchesAvailability = selectedAvailability.length === 0 ||
      profileAvail.some(a => selectedAvailability.includes(a));

    const matchesVerified = !showVerifiedOnly || profile.is_verified;

    return matchesSearch && matchesArea && matchesAvailability && matchesVerified;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedArea('all');
    setSelectedAvailability([]);
    setShowVerifiedOnly(false);
  };

  const hasActiveFilters = searchQuery || selectedArea !== 'all' || selectedAvailability.length > 0 || showVerifiedOnly;

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Área de Atuação</Label>
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger><SelectValue placeholder="Todas as áreas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as áreas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area} value={area.toLowerCase()}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Disponibilidade</Label>
        <div className="space-y-2">
          {Object.entries(availabilityLabels).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={selectedAvailability.includes(key)}
                onCheckedChange={(checked) => {
                  setSelectedAvailability(
                    checked ? [...selectedAvailability, key] : selectedAvailability.filter((a) => a !== key)
                  );
                }}
              />
              <Label htmlFor={key} className="text-sm font-normal cursor-pointer">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="verified"
          checked={showVerifiedOnly}
          onCheckedChange={(checked) => setShowVerifiedOnly(checked as boolean)}
        />
        <Label htmlFor="verified" className="text-sm font-normal cursor-pointer">Apenas perfis verificados</Label>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />Limpar Filtros
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="border-b border-border bg-muted/30">
          <div className="container px-4 md:px-6 py-8 md:py-12">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Explorar <span className="gradient-text">Talentos</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Descubra jovens talentos de Oriximiná prontos para o mercado de trabalho.
              </p>
            </div>
          </div>
        </div>

        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />Filtros
                  </h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar</Button>
                  )}
                </div>
                <FiltersContent />
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, competência ou área..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2">
                      <SlidersHorizontal className="h-4 w-4" />Filtros
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1">
                          {[selectedArea !== 'all' ? 1 : 0, selectedAvailability.length, showVerifiedOnly ? 1 : 0].reduce((a, b) => a + b, 0)}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
                    <div className="mt-6"><FiltersContent /></div>
                  </SheetContent>
                </Sheet>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Busca: {searchQuery}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                    </Badge>
                  )}
                  {selectedArea !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      Área: {selectedArea}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedArea('all')} />
                    </Badge>
                  )}
                  {selectedAvailability.map((avail) => (
                    <Badge key={avail} variant="secondary" className="gap-1">
                      {availabilityLabels[avail]}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedAvailability(selectedAvailability.filter((a) => a !== avail))} />
                    </Badge>
                  ))}
                  {showVerifiedOnly && (
                    <Badge variant="secondary" className="gap-1">
                      Verificados
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setShowVerifiedOnly(false)} />
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{filteredProfiles.length} talentos encontrados</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProfiles.map((profile, index) => {
                    const profileSkills = allSkills.filter(s => s.profile_id === profile.id);
                    const profileAvail = allAvailability.filter(a => a.profile_id === profile.id).map(a => a.type);
                    const projectCount = allProjectCounts[profile.id] || 0;
                    const initials = profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

                    return (
                      <div key={profile.id} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                        <Card className="group card-hover overflow-hidden border-border/50 hover:border-primary/30">
                          <CardContent className="p-0">
                            <div className="h-20 gradient-hero-bg relative">
                              {profile.is_verified && (
                                <div className="absolute top-3 right-3">
                                  <Badge className="bg-background/90 text-primary border-0 gap-1">
                                    <BadgeCheck className="h-3 w-3" />Verificado
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="px-5 -mt-10 relative z-10">
                              <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                                <AvatarImage src={profile.photo || undefined} alt={profile.full_name} />
                                <AvatarFallback className="gradient-bg text-primary-foreground text-xl font-semibold">{initials}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="p-5 pt-3 space-y-4">
                              <div>
                                <h3 className="font-display text-lg font-semibold text-foreground">{profile.full_name}</h3>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  <span>{profile.professional_objective || profile.area || 'Não informado'}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{profile.city || 'Oriximiná'}</span>
                                </div>
                              </div>
                              {profile.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                              )}
                              {profileSkills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {profileSkills.slice(0, 4).map((skill) => (
                                    <SkillChip key={skill.id} name={skill.name} category={skill.category as any} size="sm" />
                                  ))}
                                  {profileSkills.length > 4 && (
                                    <span className="px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded-full">+{profileSkills.length - 4}</span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <FolderOpen className="h-4 w-4" />{projectCount} projetos
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  {profileAvail.slice(0, 2).map((avail) => (
                                    <Badge key={avail} variant="secondary" className="text-xs">{availabilityLabels[avail]}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Link to={`/perfil/${profile.id}`} className="flex-1">
                                  <Button variant="outline" className="w-full group-hover:border-primary/50">Ver Perfil</Button>
                                </Link>
                                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Nenhum perfil encontrado</h3>
                  <p className="text-muted-foreground mb-4">Tente ajustar os filtros ou buscar por outros termos.</p>
                  <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

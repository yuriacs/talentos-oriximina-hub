import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProfileCard } from '@/components/ui/profile-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockProfiles, availabilityLabels } from '@/data/mockData';
import {
  Search,
  SlidersHorizontal,
  X,
  Users,
  Filter,
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

const areas = [
  'Curso de Soldador',
];

export default function Explorar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const soldadorBaseProfiles = mockProfiles.filter((profile) =>
    profile.professionalObjective.toLowerCase().includes('curso de soldador')
  );

  const filteredProfiles = soldadorBaseProfiles.filter((profile) => {
    const matchesSearch =
      profile.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.professionalObjective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesArea =
      selectedArea === 'all' ||
      profile.professionalObjective.toLowerCase().includes(selectedArea.toLowerCase());

    const matchesAvailability =
      selectedAvailability.length === 0 ||
      profile.availability.some((a) => selectedAvailability.includes(a));

    const matchesVerified = !showVerifiedOnly || profile.isVerified;

    return matchesSearch && matchesArea && matchesAvailability && matchesVerified;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedArea('all');
    setSelectedAvailability([]);
    setShowVerifiedOnly(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedArea !== 'all' ||
    selectedAvailability.length > 0 ||
    showVerifiedOnly;

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Área de Atuação</Label>
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as áreas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as áreas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area} value={area.toLowerCase()}>
                {area}
              </SelectItem>
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
                    checked
                      ? [...selectedAvailability, key]
                      : selectedAvailability.filter((a) => a !== key)
                  );
                }}
              />
              <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                {label}
              </Label>
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
        <Label htmlFor="verified" className="text-sm font-normal cursor-pointer">
          Apenas perfis verificados
        </Label>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
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
                Participantes do Curso de Soldador da Escola de Governo de Oriximiná.
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
                    <Filter className="h-4 w-4" />
                    Filtros
                  </h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Limpar
                    </Button>
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
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1">
                          {[
                            selectedArea !== 'all' ? 1 : 0,
                            selectedAvailability.length,
                            showVerifiedOnly ? 1 : 0,
                          ].reduce((a, b) => a + b, 0)}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Busca: {searchQuery}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSearchQuery('')}
                      />
                    </Badge>
                  )}

                  {selectedArea !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      Área: {selectedArea}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedArea('all')}
                      />
                    </Badge>
                  )}

                  {selectedAvailability.map((avail) => (
                    <Badge key={avail} variant="secondary" className="gap-1">
                      {availabilityLabels[avail]}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setSelectedAvailability(
                            selectedAvailability.filter((a) => a !== avail)
                          )
                        }
                      />
                    </Badge>
                  ))}

                  {showVerifiedOnly && (
                    <Badge variant="secondary" className="gap-1">
                      Verificados
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setShowVerifiedOnly(false)}
                      />
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{filteredProfiles.length} participantes do Curso de Soldador</span>
              </div>

              {filteredProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProfiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProfileCard profile={profile} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Nenhum perfil encontrado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros ou buscar por outros termos.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
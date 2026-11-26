import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SkillChip } from './skill-chip';
import { ProfileCardData } from '@/types';
import { availabilityLabels } from '@/data/mockData';
import { 
  MapPin, 
  Briefcase, 
  FolderOpen, 
  MessageCircle, 
  BadgeCheck,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: ProfileCardData;
  variant?: 'default' | 'compact' | 'featured';
}

export function ProfileCard({ profile, variant = 'default' }: ProfileCardProps) {
  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (variant === 'compact') {
    return (
      <Card className="group card-hover overflow-hidden border-border/50 hover:border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/10">
              <AvatarImage src={profile.photo} alt={profile.fullName} />
              <AvatarFallback className="gradient-bg text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-foreground truncate">
                  {profile.fullName}
                </h3>
                {profile.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {profile.professionalObjective}
              </p>
            </div>
            <Link to={`/perfil/${profile.id}`}>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "group card-hover overflow-hidden border-border/50 hover:border-primary/30",
      variant === 'featured' && "ring-2 ring-primary/20"
    )}>
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="h-20 gradient-hero-bg relative">
          {profile.isVerified && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-background/90 text-primary border-0 gap-1">
                <BadgeCheck className="h-3 w-3" />
                Verificado
              </Badge>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="px-5 -mt-10 relative z-10">
          <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
            <AvatarImage src={profile.photo} alt={profile.fullName} />
            <AvatarFallback className="gradient-bg text-primary-foreground text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="p-5 pt-3 space-y-4">
          {/* Name and objective */}
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {profile.fullName}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{profile.professionalObjective}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{profile.city}</span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {profile.bio}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 4).map((skill) => (
              <SkillChip
                key={skill.id}
                name={skill.name}
                category={skill.category}
                size="sm"
              />
            ))}
            {profile.skills.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded-full">
                +{profile.skills.length - 4}
              </span>
            )}
          </div>

          {/* Stats and Availability */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FolderOpen className="h-4 w-4" />
                {profile.projectCount} projetos
              </span>
            </div>
            <div className="flex gap-1">
              {profile.availability.slice(0, 2).map((avail) => (
                <Badge key={avail} variant="secondary" className="text-xs">
                  {availabilityLabels[avail]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link to={`/perfil/${profile.id}`} className="flex-1">
              <Button variant="outline" className="w-full group-hover:border-primary/50">
                Ver Perfil
              </Button>
            </Link>
            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

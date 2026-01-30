import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurriculumConfig } from '@/lib/curriculum-config';
import { Building2, Globe, GraduationCap, Users } from 'lucide-react';

interface CurriculumCardProps {
  curriculum: CurriculumConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CurriculumCard({ curriculum, isSelected, onClick }: CurriculumCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary ${
        isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {curriculum.shortName}
              {curriculum.isInternational && (
                <Badge variant="secondary" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  International
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">{curriculum.name}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{curriculum.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{curriculum.regulatoryBody}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{curriculum.levels.length} education levels</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{curriculum.gradingScales.length} grading scale(s)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 pt-2">
          {curriculum.levels.slice(0, 3).map((level) => (
            <Badge key={level.id} variant="outline" className="text-xs">
              {level.name.split('(')[0].trim()}
            </Badge>
          ))}
          {curriculum.levels.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{curriculum.levels.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

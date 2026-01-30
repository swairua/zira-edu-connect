import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountryConfig } from '@/lib/country-config';
import { Calendar, DollarSign, GraduationCap, Globe, Phone, Building } from 'lucide-react';

interface CountryConfigCardProps {
  config: CountryConfig;
}

export function CountryConfigCard({ config }: CountryConfigCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{config.flag}</span>
          <div>
            <CardTitle>{config.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              {config.phoneCode}
              <span className="mx-1">•</span>
              <Globe className="h-3 w-3" />
              {config.timezone}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency */}
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Currency
          </h4>
          <div className="bg-muted rounded-lg p-3">
            <p className="font-medium">{config.currency.name}</p>
            <p className="text-sm text-muted-foreground">
              Symbol: {config.currency.symbol} • Code: {config.currency.code}
            </p>
          </div>
        </div>

        {/* Grading System */}
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Grading System: {config.gradingSystem.name}
          </h4>
          <div className="flex flex-wrap gap-1">
            {config.gradingSystem.grades.slice(0, 6).map((grade) => (
              <Badge key={grade.grade} variant="outline" className="text-xs">
                {grade.grade}: {grade.minScore}-{grade.maxScore}%
              </Badge>
            ))}
            {config.gradingSystem.grades.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{config.gradingSystem.grades.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Academic Calendar */}
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            Academic Calendar
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {config.academicCalendar.terms.map((term) => (
              <div key={term.name} className="bg-muted rounded-lg p-2 text-center">
                <p className="font-medium text-sm">{term.name}</p>
                <p className="text-xs text-muted-foreground">
                  Month {term.startMonth} - {term.endMonth}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Body */}
        {config.regulatoryBody && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-primary" />
              Regulatory Body
            </h4>
            <p className="text-sm text-muted-foreground">{config.regulatoryBody}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Calendar, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CALENDAR_TEMPLATES, generateAcademicYearFromTemplate, CalendarTemplate } from '@/config/onboardingTemplates';

interface CalendarTemplateSelectorProps {
  onApplyTemplate: (data: { 
    year: { name: string; startDate: string; endDate: string }; 
    terms: { name: string; startDate: string; endDate: string }[] 
  }) => void;
  isApplying?: boolean;
  existingYearsCount?: number;
}

export function CalendarTemplateSelector({ 
  onApplyTemplate, 
  isApplying = false,
  existingYearsCount = 0 
}: CalendarTemplateSelectorProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedTemplate, setSelectedTemplate] = useState<CalendarTemplate | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const handleApply = () => {
    if (!selectedTemplate) return;
    const data = generateAcademicYearFromTemplate(selectedTemplate, selectedYear);
    onApplyTemplate(data);
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Quick Setup</CardTitle>
        </div>
        <CardDescription>
          Select a template to automatically create your academic year and terms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Year Selection */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium min-w-[80px]">Start Year:</label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {CALENDAR_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplate(template)}
              className={`relative flex flex-col items-start p-4 rounded-lg border text-left transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/40 hover:bg-muted/50'
              }`}
            >
              {selectedTemplate?.id === template.id && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{template.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.terms.map((term, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {term.name}
                  </Badge>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Preview & Apply */}
        {selectedTemplate && (
          <div className="pt-3 border-t space-y-3">
            <div className="text-sm">
              <span className="font-medium">Preview: </span>
              <span className="text-muted-foreground">
                {selectedYear} Academic Year with {selectedTemplate.terms.length} {selectedTemplate.terms.length === 1 ? 'term' : 'terms'}
              </span>
            </div>
            <Button 
              onClick={handleApply} 
              disabled={isApplying}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isApplying ? 'Creating...' : `Create ${selectedYear} Academic Year`}
            </Button>
            {existingYearsCount > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                This will add to your existing {existingYearsCount} academic year(s)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

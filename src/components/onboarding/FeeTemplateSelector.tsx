import { useState } from 'react';
import { Check, Sparkles, DollarSign, School, Building, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FEE_TEMPLATES, FeeTemplate } from '@/config/onboardingTemplates';
import { formatCurrency } from '@/lib/utils';

interface FeeTemplateSelectorProps {
  onApplyTemplate: (template: FeeTemplate) => void;
  isApplying?: boolean;
  currency?: string;
}

const SCHOOL_TYPE_ICONS: Record<string, React.ReactNode> = {
  primary: <School className="h-4 w-4" />,
  'secondary-day': <Building className="h-4 w-4" />,
  'secondary-boarding': <Home className="h-4 w-4" />,
  all: <DollarSign className="h-4 w-4" />,
};

export function FeeTemplateSelector({ 
  onApplyTemplate, 
  isApplying = false,
  currency = 'KES'
}: FeeTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<FeeTemplate | null>(null);

  const handleApply = () => {
    if (!selectedTemplate) return;
    onApplyTemplate(selectedTemplate);
  };

  const getTemplateTotal = (template: FeeTemplate) => {
    return template.items
      .filter(item => item.is_mandatory)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Quick Setup - Fee Templates</CardTitle>
        </div>
        <CardDescription>
          Select a pre-configured fee structure based on your school type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {FEE_TEMPLATES.map((template) => (
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
                {SCHOOL_TYPE_ICONS[template.schoolType]}
                <span className="font-medium text-sm">{template.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {template.items.length} items
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ~{formatCurrency(getTemplateTotal(template), currency)}/term
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Preview & Apply */}
        {selectedTemplate && (
          <div className="pt-3 border-t space-y-3">
            <div className="text-sm font-medium">Fee Items Preview:</div>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {selectedTemplate.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-background"
                >
                  <div className="flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.is_mandatory && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                    {item.applicable_to && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {item.applicable_to.join(', ')}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">{formatCurrency(item.amount, currency)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">Total (Mandatory):</span>
              <span className="font-bold text-primary">
                {formatCurrency(getTemplateTotal(selectedTemplate), currency)}
              </span>
            </div>
            <Button 
              onClick={handleApply} 
              disabled={isApplying}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isApplying ? 'Applying...' : 'Apply Fee Template'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You can edit amounts and add more items after applying
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

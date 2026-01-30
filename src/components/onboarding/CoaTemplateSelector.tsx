import { useState } from 'react';
import { GraduationCap, School, Building2, Check, Loader2, Wrench, Church, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COA_TEMPLATES, CoaTemplate } from '@/config/chartOfAccountsTemplates';
import { cn } from '@/lib/utils';

const INSTITUTION_ICONS: Record<string, React.ElementType> = {
  primary: School,
  secondary: GraduationCap,
  university: Building2,
  tvet: Wrench,
  religious: Church,
  international: Globe,
  general: Building2,
};

interface CoaTemplateSelectorProps {
  onApplyTemplate: (template: CoaTemplate) => Promise<void>;
  isApplying: boolean;
  existingAccountsCount: number;
}

export function CoaTemplateSelector({ 
  onApplyTemplate, 
  isApplying, 
  existingAccountsCount 
}: CoaTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CoaTemplate | null>(null);

  const handleApply = async () => {
    if (!selectedTemplate) return;
    await onApplyTemplate(selectedTemplate);
  };

  // Count accounts by type for preview
  const getAccountStats = (template: CoaTemplate) => {
    const stats = {
      asset: 0,
      liability: 0,
      equity: 0,
      income: 0,
      expense: 0,
    };
    template.accounts.forEach(acc => {
      stats[acc.type]++;
    });
    return stats;
  };

  return (
    <div className="space-y-6">
      {/* Template Selection Description */}
      {existingAccountsCount > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
          Only new accounts will be added — your existing {existingAccountsCount} accounts will be preserved.
        </p>
      )}

      {/* Template Selection Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {COA_TEMPLATES.map((template) => {
          const Icon = INSTITUTION_ICONS[template.institutionType];
          const isSelected = selectedTemplate?.id === template.id;

          return (
            <Card
              key={template.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary/50',
                isSelected && 'ring-2 ring-primary border-primary'
              )}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {template.accounts.length} accounts
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Preview */}
      {selectedTemplate && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Preview: {selectedTemplate.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {Object.entries(getAccountStats(selectedTemplate)).map(([type, count]) => (
                <div key={type} className="text-center p-2 rounded-lg bg-background">
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">{type}</div>
                </div>
              ))}
            </div>
            
            <ScrollArea className="h-48 rounded border bg-background">
              <div className="p-2 space-y-1">
                {selectedTemplate.accounts
                  .filter(acc => !acc.parent) // Show only root accounts
                  .sort((a, b) => a.code.localeCompare(b.code))
                  .map((account) => {
                    const children = selectedTemplate.accounts.filter(
                      a => a.parent === account.code
                    );
                    return (
                      <div key={account.code} className="text-sm">
                        <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50">
                          <code className="text-xs text-muted-foreground w-12">
                            {account.code}
                          </code>
                          <span className="font-medium">{account.name}</span>
                          {children.length > 0 && (
                            <Badge variant="outline" className="text-xs ml-auto">
                              +{children.length} sub
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Apply Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleApply} 
          disabled={!selectedTemplate || isApplying}
          size="lg"
        >
          {isApplying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Applying Template...
            </>
          ) : (
            <>
              Apply {selectedTemplate?.name || 'Template'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
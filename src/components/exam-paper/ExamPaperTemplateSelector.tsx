import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, CheckCircle } from 'lucide-react';
import { EXAM_PAPER_TEMPLATES, ExamPaperTemplate } from '@/types/question-bank';
import { cn } from '@/lib/utils';

interface ExamPaperTemplateSelectorProps {
  selectedTemplate: string | null;
  onSelect: (template: ExamPaperTemplate) => void;
}

export function ExamPaperTemplateSelector({ 
  selectedTemplate, 
  onSelect 
}: ExamPaperTemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Choose a template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXAM_PAPER_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm",
              selectedTemplate === template.id && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => onSelect(template)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{template.label}</h4>
                {selectedTemplate === template.id && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {template.durationMinutes} min
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {template.totalMarks} marks
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {template.sections.length} section{template.sections.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

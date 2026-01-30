import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, BookOpen, Sparkles, Check, Pencil, X } from 'lucide-react';
import { CurriculumId } from '@/lib/curriculum-config';
import {
  CurriculumSubject,
  getCategoryColor,
  getCategoryLabel,
  SubjectCategory,
} from '@/lib/curriculum-subjects';
import {
  useCurriculumSubjects,
  useDefaultCurriculumLevel,
} from '@/hooks/useCurriculumSubjects';
import { useCreateSubject, useSubjects } from '@/hooks/useSubjects';
import { toast } from 'sonner';

interface SubjectProposalWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  curriculumId: CurriculumId;
  curriculumName: string;
  institutionType?: string;
}

interface EditedSubject {
  name: string;
  code: string;
  category: SubjectCategory;
}

const CATEGORY_OPTIONS: { value: SubjectCategory; label: string }[] = [
  { value: 'core', label: 'Core' },
  { value: 'language', label: 'Language' },
  { value: 'science', label: 'Science' },
  { value: 'humanities', label: 'Humanities' },
  { value: 'arts', label: 'Arts' },
  { value: 'technical', label: 'Technical' },
  { value: 'elective', label: 'Elective' },
];

export function SubjectProposalWizard({
  open,
  onOpenChange,
  institutionId,
  curriculumId,
  curriculumName,
  institutionType,
}: SubjectProposalWizardProps) {
  const defaultLevel = useDefaultCurriculumLevel(curriculumId, institutionType);
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(defaultLevel);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [subjectEdits, setSubjectEdits] = useState<Record<string, EditedSubject>>({});

  const { levels, recommendedSubjects, hasSubjectConfig } = useCurriculumSubjects(
    curriculumId,
    selectedLevel
  );
  const { data: existingSubjects = [] } = useSubjects(institutionId);
  const createSubject = useCreateSubject();

  // Initialize selected subjects when level changes
  useEffect(() => {
    if (recommendedSubjects.length > 0) {
      const existingCodes = new Set(existingSubjects.map((s) => s.code.toUpperCase()));
      const newSelections = new Set<string>();
      
      recommendedSubjects.forEach((subject) => {
        if (subject.isCompulsory && !existingCodes.has(subject.code.toUpperCase())) {
          newSelections.add(subject.code);
        }
      });
      
      setSelectedSubjects(newSelections);
    }
  }, [recommendedSubjects, existingSubjects]);

  const existingCodes = useMemo(
    () => new Set(existingSubjects.map((s) => s.code.toUpperCase())),
    [existingSubjects]
  );

  const toggleSubject = (code: string) => {
    setSelectedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(code)) {
        newSet.delete(code);
      } else {
        newSet.add(code);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const newSet = new Set<string>();
    recommendedSubjects.forEach((s) => {
      if (!existingCodes.has(s.code.toUpperCase())) {
        newSet.add(s.code);
      }
    });
    setSelectedSubjects(newSet);
  };

  const deselectAll = () => {
    setSelectedSubjects(new Set());
  };

  const startEditing = useCallback((subject: CurriculumSubject) => {
    setEditingCode(subject.code);
    if (!subjectEdits[subject.code]) {
      setSubjectEdits((prev) => ({
        ...prev,
        [subject.code]: {
          name: subject.name,
          code: subject.code,
          category: subject.category,
        },
      }));
    }
  }, [subjectEdits]);

  const cancelEditing = useCallback(() => {
    setEditingCode(null);
  }, []);

  const updateEdit = useCallback((originalCode: string, field: keyof EditedSubject, value: string) => {
    setSubjectEdits((prev) => ({
      ...prev,
      [originalCode]: {
        ...prev[originalCode],
        [field]: value,
      },
    }));
  }, []);

  const getSubjectData = useCallback((subject: CurriculumSubject): EditedSubject => {
    return subjectEdits[subject.code] || {
      name: subject.name,
      code: subject.code,
      category: subject.category,
    };
  }, [subjectEdits]);

  const handleCreate = async () => {
    if (selectedSubjects.size === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    setIsCreating(true);
    let successCount = 0;
    let errorCount = 0;

    for (const originalCode of selectedSubjects) {
      const subject = recommendedSubjects.find((s) => s.code === originalCode);
      if (!subject) continue;

      const subjectData = getSubjectData(subject);

      try {
        await createSubject.mutateAsync({
          institution_id: institutionId,
          name: subjectData.name,
          code: subjectData.code,
          category: subjectData.category,
        });
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setIsCreating(false);

    if (successCount > 0) {
      toast.success(`Created ${successCount} subjects successfully`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to create ${errorCount} subjects`);
    }

    onOpenChange(false);
  };

  const availableSubjects = recommendedSubjects.filter(
    (s) => !existingCodes.has(s.code.toUpperCase())
  );

  const alreadyConfigured = recommendedSubjects.filter((s) =>
    existingCodes.has(s.code.toUpperCase())
  );

  if (!hasSubjectConfig) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Subject Templates Available</DialogTitle>
            <DialogDescription>
              We don't have subject templates for {curriculumName} yet. You can add subjects manually.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Setup Subjects from {curriculumName}
          </DialogTitle>
          <DialogDescription>
            Select subjects based on curriculum requirements. Click the edit icon to customize before creating.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {levels.length > 1 && (
            <div className="space-y-2">
              <Label>Education Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.levelId} value={level.levelId}>
                      {level.levelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {alreadyConfigured.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {alreadyConfigured.length} subjects already configured
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {availableSubjects.length} subjects available to add
            </p>
            <div className="space-x-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-2 space-y-2">
            {availableSubjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>All curriculum subjects are already configured!</p>
              </div>
            ) : (
              availableSubjects.map((subject) => {
                const isEditing = editingCode === subject.code;
                const subjectData = getSubjectData(subject);
                const hasEdits = !!subjectEdits[subject.code];

                return (
                  <div
                    key={subject.code}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedSubjects.has(subject.code)
                        ? 'bg-primary/5 border-primary/30'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedSubjects.has(subject.code)}
                            onCheckedChange={() => toggleSubject(subject.code)}
                          />
                          <span className="text-sm font-medium text-muted-foreground">Editing subject</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-7 px-2"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pl-6">
                          <div className="space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={subjectData.name}
                              onChange={(e) => updateEdit(subject.code, 'name', e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Code</Label>
                            <Input
                              value={subjectData.code}
                              onChange={(e) => updateEdit(subject.code, 'code', e.target.value.toUpperCase())}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs">Category</Label>
                            <Select
                              value={subjectData.category}
                              onValueChange={(val) => updateEdit(subject.code, 'category', val)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORY_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedSubjects.has(subject.code)}
                          onCheckedChange={() => toggleSubject(subject.code)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {subjectData.name}
                            {hasEdits && <span className="text-xs text-muted-foreground ml-1">(edited)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{subjectData.code}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getCategoryColor(subjectData.category)}
                          >
                            {getCategoryLabel(subjectData.category)}
                          </Badge>
                          {subject.isCompulsory && (
                            <Badge variant="default" className="text-xs">
                              Required
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => startEditing(subject)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selectedSubjects.size} subjects selected
            </span>
            {selectedSubjects.size > 0 && (
              <span className="text-primary font-medium">
                Ready to create
              </span>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || selectedSubjects.size === 0}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create ${selectedSubjects.size} Subjects`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

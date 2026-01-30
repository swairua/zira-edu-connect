import { useState } from 'react';
import { Check, ChevronsUpDown, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCBCStrands, useCBCSubStrands, useCBCSubjects, useCBCLevels } from '@/hooks/useCBCStrands';
import { CBCLevel, CBCStrand, CBCSubStrand, cbcLevelLabels, subjectCodeLabels } from '@/types/cbc';

interface CBCStrandSelectorProps {
  subjectCode?: string;
  level?: CBCLevel;
  selectedStrandId?: string;
  selectedSubStrandId?: string;
  onStrandSelect?: (strand: CBCStrand | null) => void;
  onSubStrandSelect?: (subStrand: CBCSubStrand | null) => void;
  showSubStrands?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CBCStrandSelector({
  subjectCode,
  level,
  selectedStrandId,
  selectedSubStrandId,
  onStrandSelect,
  onSubStrandSelect,
  showSubStrands = true,
  disabled = false,
  className,
}: CBCStrandSelectorProps) {
  const [strandOpen, setStrandOpen] = useState(false);
  const [subStrandOpen, setSubStrandOpen] = useState(false);

  const { data: strands = [], isLoading: strandsLoading } = useCBCStrands(subjectCode, level);
  const { data: subStrands = [], isLoading: subStrandsLoading } = useCBCSubStrands(selectedStrandId);

  const selectedStrand = strands.find(s => s.id === selectedStrandId);
  const selectedSubStrand = subStrands.find(ss => ss.id === selectedSubStrandId);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Strand Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          Strand (Main Topic)
        </label>
        <Popover open={strandOpen} onOpenChange={setStrandOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={strandOpen}
              disabled={disabled || !subjectCode || !level}
              className="justify-between"
            >
              {selectedStrand ? (
                <span className="truncate">
                  {selectedStrand.strand_number}. {selectedStrand.name}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {!subjectCode || !level ? 'Select subject and level first' : 'Select strand...'}
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search strands..." />
              <CommandList>
                <CommandEmpty>No strands found.</CommandEmpty>
                <CommandGroup>
                  {strandsLoading ? (
                    <CommandItem disabled>Loading strands...</CommandItem>
                  ) : (
                    strands.map((strand) => (
                      <CommandItem
                        key={strand.id}
                        value={`${strand.strand_number}. ${strand.name}`}
                        onSelect={() => {
                          onStrandSelect?.(strand.id === selectedStrandId ? null : strand);
                          if (strand.id !== selectedStrandId) {
                            onSubStrandSelect?.(null);
                          }
                          setStrandOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedStrandId === strand.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {strand.strand_number}. {strand.name}
                          </span>
                          {strand.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {strand.description}
                            </span>
                          )}
                        </div>
                        {strand.suggested_time_allocation && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {strand.suggested_time_allocation}
                          </Badge>
                        )}
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Sub-Strand Selector */}
      {showSubStrands && selectedStrandId && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            Sub-Strand (Sub-topic)
          </label>
          <Popover open={subStrandOpen} onOpenChange={setSubStrandOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={subStrandOpen}
                disabled={disabled || !selectedStrandId}
                className="justify-between"
              >
                {selectedSubStrand ? (
                  <span className="truncate">
                    {selectedStrand?.strand_number}.{selectedSubStrand.sub_strand_number}. {selectedSubStrand.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select sub-strand...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search sub-strands..." />
                <CommandList>
                  <CommandEmpty>No sub-strands found.</CommandEmpty>
                  <CommandGroup>
                    {subStrandsLoading ? (
                      <CommandItem disabled>Loading sub-strands...</CommandItem>
                    ) : (
                      subStrands.map((subStrand) => (
                        <CommandItem
                          key={subStrand.id}
                          value={`${subStrand.sub_strand_number}. ${subStrand.name}`}
                          onSelect={() => {
                            onSubStrandSelect?.(subStrand.id === selectedSubStrandId ? null : subStrand);
                            setSubStrandOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedSubStrandId === subStrand.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex flex-col flex-1">
                            <span className="font-medium">
                              {selectedStrand?.strand_number}.{subStrand.sub_strand_number}. {subStrand.name}
                            </span>
                            {subStrand.specific_learning_outcomes.length > 0 && (
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {subStrand.specific_learning_outcomes.length} learning outcomes
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            {subStrand.core_competencies.slice(0, 2).map((comp) => (
                              <Badge key={comp} variant="outline" className="text-[10px] px-1">
                                {comp.substring(0, 3).toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Selected Sub-Strand Details */}
      {selectedSubStrand && showSubStrands && (
        <div className="p-3 bg-muted/50 rounded-lg border text-sm space-y-2">
          <div>
            <span className="font-medium text-muted-foreground">Learning Outcomes:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {(selectedSubStrand.specific_learning_outcomes as string[]).slice(0, 3).map((outcome, i) => (
                <li key={i} className="text-xs">{outcome}</li>
              ))}
              {(selectedSubStrand.specific_learning_outcomes as string[]).length > 3 && (
                <li className="text-xs text-muted-foreground italic">
                  +{(selectedSubStrand.specific_learning_outcomes as string[]).length - 3} more...
                </li>
              )}
            </ul>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedSubStrand.core_competencies.map((comp) => (
              <Badge key={comp} variant="secondary" className="text-xs">
                {comp.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for forms
interface CBCStrandSelectProps {
  subjectCode: string;
  level: CBCLevel;
  value?: string; // sub_strand_id
  onChange: (subStrandId: string | null) => void;
  disabled?: boolean;
}

export function CBCStrandSelect({
  subjectCode,
  level,
  value,
  onChange,
  disabled,
}: CBCStrandSelectProps) {
  const [strandId, setStrandId] = useState<string>();
  
  return (
    <CBCStrandSelector
      subjectCode={subjectCode}
      level={level}
      selectedStrandId={strandId}
      selectedSubStrandId={value}
      onStrandSelect={(strand) => setStrandId(strand?.id)}
      onSubStrandSelect={(subStrand) => onChange(subStrand?.id || null)}
      disabled={disabled}
    />
  );
}

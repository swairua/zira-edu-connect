import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, Info, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  IMPORT_DEFINITIONS, 
  type ImportDefinition, 
  type ColumnDefinition 
} from '@/config/importColumnDefinitions';

interface DynamicLookupData {
  classes?: Array<{ name: string; level: string; stream?: string }>;
  subjects?: Array<{ code: string; name: string }>;
  students?: Array<{ admission_number: string }>;
}

interface ImportColumnReferenceProps {
  importType: string;
  dynamicData?: DynamicLookupData;
  compact?: boolean;
}

export function ImportColumnReference({ 
  importType, 
  dynamicData,
  compact = false 
}: ImportColumnReferenceProps) {
  const [isOpen, setIsOpen] = React.useState(!compact);
  const [showDynamicData, setShowDynamicData] = React.useState(false);

  const definition = IMPORT_DEFINITIONS[importType];
  
  if (!definition) {
    return null;
  }

  const requiredColumns = definition.columns.filter(c => c.required);
  const optionalColumns = definition.columns.filter(c => !c.required);

  // Format dynamic lookup data for display
  const formattedDynamicData = useMemo(() => {
    const data: Record<string, string[]> = {};
    
    if (dynamicData?.classes) {
      data.classes = dynamicData.classes.map(c => 
        c.stream ? `${c.level} ${c.stream}` : c.name
      ).slice(0, 20);
    }
    
    if (dynamicData?.subjects) {
      data.subjects = dynamicData.subjects.map(s => 
        `${s.code} (${s.name})`
      ).slice(0, 20);
    }

    if (dynamicData?.students) {
      data.students = dynamicData.students.map(s => s.admission_number).slice(0, 20);
    }
    
    return data;
  }, [dynamicData]);

  const hasLookupColumns = definition.columns.some(c => c.lookupKey);
  const hasDynamicData = Object.keys(formattedDynamicData).length > 0;

  return (
    <div className="space-y-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-muted/50 p-3 text-sm font-medium hover:bg-muted/80 transition-colors">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span>Column Reference Guide</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {requiredColumns.length} Required
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {optionalColumns.length} Optional
            </Badge>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-3">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[140px] font-semibold">Column Name</TableHead>
                  <TableHead className="w-[80px] text-center">Required</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[180px]">Valid Options / Format</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Required columns first */}
                {requiredColumns.map((column) => (
                  <ColumnRow 
                    key={column.name} 
                    column={column} 
                    dynamicData={formattedDynamicData}
                  />
                ))}
                {/* Optional columns */}
                {optionalColumns.map((column) => (
                  <ColumnRow 
                    key={column.name} 
                    column={column} 
                    dynamicData={formattedDynamicData}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Dynamic data display for lookup fields */}
      {hasLookupColumns && hasDynamicData && (
        <Collapsible open={showDynamicData} onOpenChange={setShowDynamicData}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-3 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Database className="h-4 w-4" />
              <span>Available Values in Your System</span>
            </div>
            {showDynamicData ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3 space-y-3">
            {formattedDynamicData.classes && formattedDynamicData.classes.length > 0 && (
              <DynamicDataSection 
                title="Available Class Names"
                items={formattedDynamicData.classes}
                total={dynamicData?.classes?.length}
              />
            )}
            
            {formattedDynamicData.subjects && formattedDynamicData.subjects.length > 0 && (
              <DynamicDataSection 
                title="Available Subject Codes"
                items={formattedDynamicData.subjects}
                total={dynamicData?.subjects?.length}
              />
            )}

            {formattedDynamicData.students && formattedDynamicData.students.length > 0 && (
              <DynamicDataSection 
                title="Sample Student Admission Numbers"
                items={formattedDynamicData.students}
                total={dynamicData?.students?.length}
              />
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function ColumnRow({ 
  column, 
  dynamicData 
}: { 
  column: ColumnDefinition;
  dynamicData: Record<string, string[]>;
}) {
  const getValidOptionsDisplay = () => {
    // For list types with predefined options
    if (column.options && column.options.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {column.options.map((opt) => (
            <Badge key={opt} variant="outline" className="text-xs font-mono">
              {opt}
            </Badge>
          ))}
        </div>
      );
    }

    // For lookup types, show indicator
    if (column.lookupKey) {
      const lookupData = dynamicData[column.lookupKey];
      if (lookupData && lookupData.length > 0) {
        return (
          <span className="text-xs text-blue-600 dark:text-blue-400">
            See "Available Values" below
          </span>
        );
      }
      return (
        <span className="text-xs text-muted-foreground italic">
          From your {column.lookupKey}
        </span>
      );
    }

    // For date types
    if (column.format) {
      return (
        <Badge variant="secondary" className="text-xs font-mono">
          {column.format}
        </Badge>
      );
    }

    // For other types, show example
    if (column.example) {
      return (
        <span className="text-xs text-muted-foreground font-mono">
          e.g., {column.example}
        </span>
      );
    }

    return <span className="text-xs text-muted-foreground">—</span>;
  };

  return (
    <TableRow className={cn(column.required && "bg-red-50/50 dark:bg-red-950/20")}>
      <TableCell className="font-mono text-xs font-medium">
        {column.name}
      </TableCell>
      <TableCell className="text-center">
        {column.required ? (
          <Badge variant="destructive" className="text-xs">Yes</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">No</Badge>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {column.description}
      </TableCell>
      <TableCell>
        {getValidOptionsDisplay()}
      </TableCell>
    </TableRow>
  );
}

function DynamicDataSection({ 
  title, 
  items,
  total 
}: { 
  title: string; 
  items: string[];
  total?: number;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        {title}
        {total && total > items.length && (
          <span className="text-xs text-muted-foreground">
            (showing {items.length} of {total})
          </span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <Badge key={index} variant="outline" className="text-xs font-mono bg-background">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

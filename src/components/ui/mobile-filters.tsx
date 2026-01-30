import * as React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MobileFiltersProps {
  children: React.ReactNode;
  /** Number of active filters to show as badge */
  activeFilterCount?: number;
  /** Title for the filter sheet */
  title?: string;
  /** Callback when filters are applied */
  onApply?: () => void;
  /** Callback when filters are cleared */
  onClear?: () => void;
  /** Additional className for the trigger button */
  triggerClassName?: string;
  /** Always show as sheet regardless of screen size */
  forceSheet?: boolean;
}

export function MobileFilters({
  children,
  activeFilterCount = 0,
  title = "Filters",
  onApply,
  onClear,
  triggerClassName,
  forceSheet = false,
}: MobileFiltersProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const handleApply = () => {
    onApply?.();
    setOpen(false);
  };

  // Desktop: render children inline
  if (!isMobile && !forceSheet) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {children}
        {activeFilterCount > 0 && onClear && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8">
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  // Mobile: render as sheet
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("relative", triggerClassName)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            {title}
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} active
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 overflow-y-auto max-h-[60vh] pb-4">
          {children}
        </div>

        <SheetFooter className="flex-row gap-2 pt-4 border-t">
          {onClear && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
            >
              Clear All
            </Button>
          )}
          <SheetClose asChild>
            <Button className="flex-1" onClick={handleApply}>
              Apply Filters
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface MobileFilterGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileFilterGroup({ label, children, className }: MobileFilterGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

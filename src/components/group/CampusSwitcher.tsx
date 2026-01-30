import { useState, useMemo } from 'react';
import { Building2, ChevronDown, Check, Globe, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGroup } from '@/contexts/GroupContext';
import { cn } from '@/lib/utils';

export function CampusSwitcher() {
  const { 
    group, 
    campuses, 
    activeCampus, 
    setActiveCampus,
    isGroupUser,
    isLoading 
  } = useGroup();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const showSearch = campuses.length >= 5;

  const filteredCampuses = useMemo(() => {
    if (!search) return campuses;
    const term = search.toLowerCase();
    return campuses.filter(
      c => c.name.toLowerCase().includes(term) || 
           c.code.toLowerCase().includes(term)
    );
  }, [campuses, search]);

  // Don't render if not a group user
  if (!isGroupUser || !group) {
    return null;
  }

  const handleSelect = (campusId: string | null) => {
    setActiveCampus(campusId);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 max-w-[200px]"
          disabled={isLoading}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {activeCampus?.name ?? 'All Campuses'}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] p-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{group.name}</span>
        </div>

        {/* Search (only for 5+ campuses) */}
        {showSearch && (
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campuses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
        )}

        <ScrollArea className={cn(campuses.length > 6 ? "h-[280px]" : "")}>
          <div className="p-1">
            {/* All Campuses Option */}
            <button
              onClick={() => handleSelect(null)}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer',
                !activeCampus && 'bg-accent'
              )}
            >
              <Building2 className="h-4 w-4" />
              <span className="flex-1 text-left">All Campuses</span>
              <Badge variant="secondary" className="text-[10px] px-1.5">
                {campuses.length}
              </Badge>
              {!activeCampus && <Check className="h-4 w-4" />}
            </button>

            <div className="my-1 border-t" />

            {/* Individual Campuses */}
            {filteredCampuses.map((campus) => (
              <button
                key={campus.id}
                onClick={() => handleSelect(campus.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer',
                  activeCampus?.id === campus.id && 'bg-accent'
                )}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">{campus.name}</span>
                {campus.is_headquarters && (
                  <Badge variant="secondary" className="text-[10px] px-1">
                    HQ
                  </Badge>
                )}
                {activeCampus?.id === campus.id && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))}

            {filteredCampuses.length === 0 && search && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No campuses match "{search}"
              </div>
            )}
            
            {campuses.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No campuses in this group
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

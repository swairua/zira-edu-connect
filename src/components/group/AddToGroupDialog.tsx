import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Building2, Network } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Institution = Tables<'institutions'>;
type InstitutionGroup = Tables<'institution_groups'>;

interface AddToGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institution: Institution | null;
}

export function AddToGroupDialog({ open, onOpenChange, institution }: AddToGroupDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<InstitutionGroup | null>(null);
  const [campusCode, setCampusCode] = useState('');
  const [isHeadquarters, setIsHeadquarters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['available-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_groups')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as InstitutionGroup[];
    },
    enabled: open,
  });

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter(
      group => group.name.toLowerCase().includes(query) || 
               group.code.toLowerCase().includes(query)
    );
  }, [groups, searchQuery]);

  const handleSelectGroup = (group: InstitutionGroup) => {
    setSelectedGroup(group);
    setCampusCode(institution?.code || '');
  };

  const handleAddToGroup = async () => {
    if (!selectedGroup || !institution) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('institutions')
        .update({
          group_id: selectedGroup.id,
          campus_code: campusCode.trim().toUpperCase() || null,
          is_headquarters: isHeadquarters,
        })
        .eq('id', institution.id);
      
      if (error) throw error;
      
      handleClose();
      // Trigger a page refresh to show updated data
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to add institution to group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedGroup(null);
    setCampusCode('');
    setIsHeadquarters(false);
    setSearchQuery('');
    onOpenChange(false);
  };

  if (!institution) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Add to School Group
          </DialogTitle>
          <DialogDescription>
            Add "{institution.name}" to an existing school group.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {!selectedGroup ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Group List */}
              <ScrollArea className="h-64 rounded-md border">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {groups.length === 0
                      ? 'No school groups exist yet. Create one first.'
                      : 'No groups match your search'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleSelectGroup(group)}
                        className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{group.name}</p>
                              <p className="text-sm text-muted-foreground">{group.code}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{group.primary_country}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Group */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedGroup.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedGroup.code}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGroup(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Campus Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campus-code">Campus Code</Label>
                  <Input
                    id="campus-code"
                    value={campusCode}
                    onChange={(e) => setCampusCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MAIN, WEST, EAST"
                  />
                  <p className="text-xs text-muted-foreground">
                    A short code to identify this campus within the group
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-headquarters"
                    checked={isHeadquarters}
                    onCheckedChange={(checked) => setIsHeadquarters(checked === true)}
                  />
                  <label
                    htmlFor="is-headquarters"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Set as headquarters
                  </label>
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToGroup}
            disabled={!selectedGroup || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Group'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

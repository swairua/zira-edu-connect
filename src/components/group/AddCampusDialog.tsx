import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useGroupCampuses } from '@/hooks/useGroupCampuses';
import { Loader2, Search, Building2, MapPin, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Institution = Tables<'institutions'>;

interface AddCampusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export function AddCampusDialog({ open, onOpenChange, groupId }: AddCampusDialogProps) {
  const { addCampusToGroup } = useGroupCampuses(groupId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [campusCode, setCampusCode] = useState('');
  const [isHeadquarters, setIsHeadquarters] = useState(false);

  // Fetch institutions that are not part of any group
  const { data: availableInstitutions = [], isLoading } = useQuery({
    queryKey: ['available-institutions-for-group'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .is('group_id', null)
        .order('name');
      
      if (error) throw error;
      return data as Institution[];
    },
    enabled: open,
  });

  const filteredInstitutions = useMemo(() => {
    if (!searchQuery) return availableInstitutions;
    const query = searchQuery.toLowerCase();
    return availableInstitutions.filter(
      inst => inst.name.toLowerCase().includes(query) || 
              inst.code.toLowerCase().includes(query)
    );
  }, [availableInstitutions, searchQuery]);

  const handleSelectInstitution = (institution: Institution) => {
    setSelectedInstitution(institution);
    setCampusCode(institution.code);
  };

  const handleAddCampus = async () => {
    if (!selectedInstitution) return;

    try {
      await addCampusToGroup.mutateAsync({
        institution_id: selectedInstitution.id,
        campus_code: campusCode.trim().toUpperCase(),
        is_headquarters: isHeadquarters,
      });
      
      // Reset form
      setSelectedInstitution(null);
      setCampusCode('');
      setIsHeadquarters(false);
      setSearchQuery('');
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setSelectedInstitution(null);
    setCampusCode('');
    setIsHeadquarters(false);
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Add Campus to Group
          </DialogTitle>
          <DialogDescription>
            Add an existing institution as a campus in this group.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Institution</TabsTrigger>
            <TabsTrigger value="new" disabled>
              Create New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4">
            {!selectedInstitution ? (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search institutions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Institution List */}
                <ScrollArea className="h-64 rounded-md border">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredInstitutions.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {availableInstitutions.length === 0
                        ? 'All institutions are already in groups'
                        : 'No institutions match your search'}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredInstitutions.map((institution) => (
                        <button
                          key={institution.id}
                          onClick={() => handleSelectInstitution(institution)}
                          className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{institution.name}</p>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span>{institution.code}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {institution.country}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {institution.student_count}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <>
                {/* Selected Institution */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedInstitution.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedInstitution.code}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInstitution(null)}
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
              </>
            )}
          </TabsContent>

          <TabsContent value="new">
            <div className="py-8 text-center text-muted-foreground">
              <p>Create new institution as campus</p>
              <p className="text-sm">Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddCampus}
            disabled={!selectedInstitution || addCampusToGroup.isPending}
          >
            {addCampusToGroup.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Campus'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

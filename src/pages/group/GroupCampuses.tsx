import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Plus, Search, MoreVertical, Star, Trash2, Settings, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useGroup } from '@/contexts/GroupContext';
import { useGroupCampuses } from '@/hooks/useGroupCampuses';
import { AddCampusDialog } from '@/components/group/AddCampusDialog';
import { toast } from 'sonner';

const PAGE_SIZE = 9;

export default function GroupCampuses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { group, groupId } = useGroup();
  const { campuses, isLoading, addCampusToGroup, updateCampus, removeCampusFromGroup } = useGroupCampuses(groupId ?? undefined);
  const [search, setSearch] = useState('');
  const [editingCampus, setEditingCampus] = useState<string | null>(null);
  const [campusCode, setCampusCode] = useState('');
  const [addCampusDialogOpen, setAddCampusDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const autoAddProcessedRef = useRef(false);

  // Handle addInstitution URL parameter (auto-add institution as HQ)
  const institutionToAdd = searchParams.get('addInstitution');
  
  useEffect(() => {
    if (institutionToAdd && groupId && !autoAddProcessedRef.current) {
      autoAddProcessedRef.current = true;
      addCampusToGroup.mutateAsync({
        institution_id: institutionToAdd,
        is_headquarters: true,
      }).then(() => {
        toast.success('Institution added as headquarters');
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('addInstitution');
        setSearchParams(newParams, { replace: true });
      }).catch((error) => {
        toast.error(`Failed to add institution: ${error.message}`);
        autoAddProcessedRef.current = false;
      });
    }
  }, [institutionToAdd, groupId, addCampusToGroup, searchParams, setSearchParams]);

  const filteredCampuses = useMemo(() => {
    if (!search) return campuses;
    const term = search.toLowerCase();
    return campuses.filter(
      c => c.name.toLowerCase().includes(term) ||
           c.code.toLowerCase().includes(term)
    );
  }, [campuses, search]);

  // Pagination
  const totalPages = Math.ceil(filteredCampuses.length / PAGE_SIZE);
  const paginatedCampuses = filteredCampuses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSetHeadquarters = async (institutionId: string) => {
    const currentHQ = campuses.find(c => c.is_headquarters);
    if (currentHQ) {
      await updateCampus.mutateAsync({
        institution_id: currentHQ.id,
        is_headquarters: false,
      });
    }
    await updateCampus.mutateAsync({
      institution_id: institutionId,
      is_headquarters: true,
    });
  };

  const handleUpdateCampusCode = async () => {
    if (!editingCampus) return;
    await updateCampus.mutateAsync({
      institution_id: editingCampus,
      campus_code: campusCode,
    });
    setEditingCampus(null);
    setCampusCode('');
  };

  const handleRemoveCampus = async (institutionId: string) => {
    if (confirm('Remove this campus from the group? The institution will remain but will no longer be part of this group.')) {
      await removeCampusFromGroup.mutateAsync(institutionId);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Campuses" subtitle="Loading...">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const CampusActions = ({ campusId, isHQ }: { campusId: string; isHQ?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            const campus = campuses.find(c => c.id === campusId);
            setEditingCampus(campusId);
            setCampusCode(campus?.campus_code || '');
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Edit Campus Code
        </DropdownMenuItem>
        {!isHQ && (
          <DropdownMenuItem onClick={() => handleSetHeadquarters(campusId)}>
            <Star className="mr-2 h-4 w-4" />
            Set as Headquarters
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => handleRemoveCampus(campusId)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove from Group
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DashboardLayout 
      title="Campuses" 
      subtitle={`Manage ${campuses.length} institutions in ${group?.name ?? 'your group'}`}
    >
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campuses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {/* View Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setAddCampusDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Campus
            </Button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedCampuses.map((campus) => (
              <Card key={campus.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-base">{campus.name}</CardTitle>
                        <CardDescription>
                          {campus.campus_code || campus.code}
                        </CardDescription>
                      </div>
                    </div>
                    <CampusActions campusId={campus.id} isHQ={campus.is_headquarters} />
                  </div>
                  {campus.is_headquarters && (
                    <Badge className="absolute top-2 right-12">
                      Headquarters
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Students</span>
                      <p className="font-semibold">{campus.student_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Staff</span>
                      <p className="font-semibold">{campus.staff_count.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={campus.status === 'active' ? 'default' : 'secondary'}>
                      {campus.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campus</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCampuses.map((campus) => (
                    <TableRow key={campus.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {campus.name}
                          {campus.is_headquarters && (
                            <Badge variant="default" className="text-[10px]">HQ</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {campus.campus_code || campus.code}
                      </TableCell>
                      <TableCell className="text-right">{campus.student_count.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{campus.staff_count.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={campus.status === 'active' ? 'default' : 'secondary'}>
                          {campus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <CampusActions campusId={campus.id} isHQ={campus.is_headquarters} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredCampuses.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Campuses Found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {search 
                  ? 'No campuses match your search criteria.'
                  : 'Add your first campus to start managing your multi-campus network.'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, filteredCampuses.length)} of {filteredCampuses.length} campuses
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    className="w-8"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Campus Code Dialog */}
      <Dialog open={!!editingCampus} onOpenChange={() => setEditingCampus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campus Code</DialogTitle>
            <DialogDescription>
              Set a unique code for this campus within the group.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="campus-code">Campus Code</Label>
            <Input
              id="campus-code"
              value={campusCode}
              onChange={(e) => setCampusCode(e.target.value)}
              placeholder="e.g., MAIN, BRANCH-1"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCampus(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCampusCode} disabled={updateCampus.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Campus Dialog */}
      {groupId && (
        <AddCampusDialog
          open={addCampusDialogOpen}
          onOpenChange={setAddCampusDialogOpen}
          groupId={groupId}
        />
      )}
    </DashboardLayout>
  );
}

import { useState, useMemo } from 'react';
import {
  Tags,
  Plus,
  Search,
  Edit,
  Repeat,
  Building2,
  Users2,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useVoteheads, useCreateVotehead, useUpdateVotehead, Votehead } from '@/hooks/useAccounting';
import { useOwnershipType, PUBLIC_SCHOOL_VOTEHEADS, PRIVATE_SCHOOL_VOTEHEADS } from '@/hooks/useOwnershipType';
import { cn } from '@/lib/utils';

const CATEGORY_CONFIG = {
  recurrent: { label: 'Recurrent', icon: Repeat, color: 'bg-blue-100 text-blue-700' },
  capital: { label: 'Capital', icon: Building2, color: 'bg-green-100 text-green-700' },
  personal_emolument: { label: 'Personal Emolument', icon: Users2, color: 'bg-purple-100 text-purple-700' },
  development: { label: 'Development', icon: TrendingUp, color: 'bg-orange-100 text-orange-700' },
};

const INITIAL_FORM = {
  code: '',
  name: '',
  category: 'recurrent' as Votehead['category'],
  description: '',
  requires_approval_above: null as number | null,
  is_active: true,
};

interface VoteheadsManagerProps {
  institutionId: string | null;
}

export function VoteheadsManager({ institutionId }: VoteheadsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVotehead, setEditingVotehead] = useState<Votehead | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const { data: voteheads = [], isLoading } = useVoteheads(institutionId);
  const createVotehead = useCreateVotehead();
  const updateVotehead = useUpdateVotehead();
  const { isPublicSchool, isPrivateSchool } = useOwnershipType();

  // Get voteheads templates based on ownership type
  const standardVoteheads = useMemo(() => {
    if (isPublicSchool) return PUBLIC_SCHOOL_VOTEHEADS;
    if (isPrivateSchool) return PRIVATE_SCHOOL_VOTEHEADS;
    // Default to showing both for undefined ownership
    return [...PUBLIC_SCHOOL_VOTEHEADS, ...PRIVATE_SCHOOL_VOTEHEADS];
  }, [isPublicSchool, isPrivateSchool]);

  const filteredVoteheads = voteheads.filter((vh) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      vh.code.toLowerCase().includes(search) ||
      vh.name.toLowerCase().includes(search)
    );
  });

  const handleOpenDialog = (votehead?: Votehead) => {
    if (votehead) {
      setEditingVotehead(votehead);
      setFormData({
        code: votehead.code,
        name: votehead.name,
        category: votehead.category,
        description: votehead.description || '',
        requires_approval_above: votehead.requires_approval_above,
        is_active: votehead.is_active,
      });
    } else {
      setEditingVotehead(null);
      setFormData(INITIAL_FORM);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!institutionId) return;

    if (editingVotehead) {
      await updateVotehead.mutateAsync({ id: editingVotehead.id, ...formData });
    } else {
      await createVotehead.mutateAsync({ ...formData, institution_id: institutionId });
    }
    setDialogOpen(false);
  };

  const handleAddStandard = async (standard: typeof standardVoteheads[0]) => {
    if (!institutionId) return;
    
    // Check if already exists
    if (voteheads.some((vh) => vh.code === standard.code)) {
      return;
    }

    await createVotehead.mutateAsync({
      institution_id: institutionId,
      code: standard.code,
      name: standard.name,
      category: standard.category as Votehead['category'],
      description: null,
      requires_approval_above: null,
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const count = voteheads.filter((vh) => vh.category === key).length;
          const CategoryIcon = config.icon;
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4" />
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Add Standard Voteheads */}
      {voteheads.length < 5 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Quick Setup: Add Standard Voteheads</CardTitle>
            <CardDescription>
              {isPublicSchool ? 'Add common Kenya MoE voteheads to get started quickly' : 'Add common fee categories for your school'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {standardVoteheads.map((standard) => {
                const exists = voteheads.some((vh) => vh.code === standard.code);
                return (
                  <Button
                    key={standard.code}
                    variant={exists ? 'secondary' : 'outline'}
                    size="sm"
                    disabled={exists || createVotehead.isPending}
                    onClick={() => handleAddStandard(standard)}
                  >
                    {exists ? '✓' : '+'} {standard.code}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voteheads List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Voteheads
              </CardTitle>
              <CardDescription>
                Define expenditure categories for budget tracking
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Votehead
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search voteheads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 max-w-md"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Approval Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        {Array(6)
                          .fill(0)
                          .map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                ) : filteredVoteheads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No voteheads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVoteheads.map((vh) => {
                    const categoryConfig = CATEGORY_CONFIG[vh.category];
                    return (
                      <TableRow key={vh.id} className={cn(!vh.is_active && 'opacity-60')}>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-0.5 rounded font-mono font-bold">
                            {vh.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vh.name}</p>
                            {vh.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                                {vh.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={categoryConfig.color}>{categoryConfig.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {vh.requires_approval_above ? (
                            <span className="text-sm">
                              Above KES {vh.requires_approval_above.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={vh.is_active ? 'default' : 'secondary'}>
                            {vh.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(vh)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVotehead ? 'Edit Votehead' : 'Add New Votehead'}</DialogTitle>
            <DialogDescription>
              {editingVotehead ? 'Update votehead details' : 'Create a new expenditure category'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="RMI"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((f) => ({ ...f, category: v as Votehead['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder="Repairs, Maintenance & Improvement"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Approval Required Above (KES)</Label>
              <Input
                id="threshold"
                type="number"
                value={formData.requires_approval_above || ''}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    requires_approval_above: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                placeholder="e.g., 50000"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty if no approval threshold is required
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description of this votehead..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((f) => ({ ...f, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.code || !formData.name || createVotehead.isPending || updateVotehead.isPending}
            >
              {editingVotehead ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

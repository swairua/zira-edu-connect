import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InstitutionFilters } from '@/components/institutions/InstitutionFilters';
import { InstitutionTable } from '@/components/institutions/InstitutionTable';
import { InstitutionLifecycleDialog } from '@/components/institutions/InstitutionLifecycleDialog';
import { EditInstitutionDialog } from '@/components/institutions/EditInstitutionDialog';
import { CreateGroupDialog } from '@/components/group/CreateGroupDialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Plus, Download, Loader2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type Institution = Tables<'institutions'>;

export default function Institutions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ownershipFilter, setOwnershipFilter] = useState('all');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [lifecycleDialogOpen, setLifecycleDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredInstitutions = useMemo(() => {
    return institutions.filter((institution) => {
      const matchesSearch =
        institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || institution.status === statusFilter;
      const matchesCountry = countryFilter === 'all' || institution.country === countryFilter;
      const matchesType = typeFilter === 'all' || institution.type === typeFilter;
      const matchesOwnership = ownershipFilter === 'all' || institution.ownership_type === ownershipFilter;

      return matchesSearch && matchesStatus && matchesCountry && matchesType && matchesOwnership;
    });
  }, [institutions, searchQuery, statusFilter, countryFilter, typeFilter, ownershipFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCountryFilter('all');
    setTypeFilter('all');
    setOwnershipFilter('all');
  };

  const handleLifecycleClick = (institution: Institution) => {
    setSelectedInstitution(institution);
    setLifecycleDialogOpen(true);
  };

  const handleEditClick = (institution: Institution) => {
    setEditingInstitution(institution);
    setEditDialogOpen(true);
  };

  return (
    <DashboardLayout
      title="Institutions"
      subtitle={`Managing ${institutions.length} institutions across Africa`}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="gradient" asChild>
              <Link to="/institutions/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Institution
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setCreateGroupDialogOpen(true)}>
              <Building2 className="mr-2 h-4 w-4" />
              Create School Group
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <InstitutionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          countryFilter={countryFilter}
          onCountryChange={setCountryFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          ownershipFilter={ownershipFilter}
          onOwnershipChange={setOwnershipFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Results Summary */}
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : `Showing ${filteredInstitutions.length} of ${institutions.length} institutions`}
        </p>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <InstitutionTable 
            institutions={filteredInstitutions} 
            onLifecycleClick={handleLifecycleClick}
            onEditClick={handleEditClick}
          />
        )}

        {/* Lifecycle Dialog */}
        <InstitutionLifecycleDialog
          institution={selectedInstitution}
          open={lifecycleDialogOpen}
          onOpenChange={setLifecycleDialogOpen}
        />

        {/* Edit Dialog */}
        <EditInstitutionDialog
          institution={editingInstitution}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />

        {/* Create Group Dialog */}
        <CreateGroupDialog
          open={createGroupDialogOpen}
          onOpenChange={setCreateGroupDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}

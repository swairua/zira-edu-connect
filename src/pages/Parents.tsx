import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, Upload, Phone, Mail, UserCheck, RefreshCw } from 'lucide-react';
import { ParentImportDialog } from '@/components/imports/ParentImportDialog';
import { BulkParentUpdateDialog } from '@/components/parents/BulkParentUpdateDialog';
import { PermissionGate } from '@/components/auth/PermissionGate';

interface Parent {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  relationship_type: string | null;
  occupation: string | null;
  address: string | null;
  created_at: string;
  student_count?: number;
}

export default function Parents() {
  const { institution } = useInstitution();
  const [search, setSearch] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const { data: parents, isLoading, refetch } = useQuery({
    queryKey: ['parents', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      // Fetch parents with student count
      const { data: parentsData, error } = await supabase
        .from('parents')
        .select(`
          *,
          student_parents(count)
        `)
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (parentsData || []).map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        phone: p.phone,
        email: p.email,
        relationship_type: p.relationship_type,
        occupation: p.occupation,
        address: p.address,
        created_at: p.created_at,
        student_count: p.student_parents?.[0]?.count || 0,
      })) as Parent[];
    },
    enabled: !!institution?.id,
  });

  const filteredParents = useMemo(() => {
    if (!parents) return [];
    if (!search.trim()) return parents;
    
    const searchLower = search.toLowerCase();
    return parents.filter(parent => 
      parent.first_name.toLowerCase().includes(searchLower) ||
      parent.last_name.toLowerCase().includes(searchLower) ||
      parent.phone.includes(search) ||
      parent.email?.toLowerCase().includes(searchLower)
    );
  }, [parents, search]);

  const stats = useMemo(() => {
    if (!parents) return { total: 0, withEmail: 0, avgStudents: 0 };
    const withEmail = parents.filter(p => p.email).length;
    const totalStudents = parents.reduce((sum, p) => sum + (p.student_count || 0), 0);
    return {
      total: parents.length,
      withEmail,
      avgStudents: parents.length > 0 ? (totalStudents / parents.length).toFixed(1) : '0',
    };
  }, [parents]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <DashboardLayout title="Parent Management" subtitle="Manage parents and guardians linked to students">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Parent Management</h1>
            <p className="text-muted-foreground">
              Manage parents and guardians linked to students
            </p>
          </div>
          <div className="flex gap-2">
            <PermissionGate domain="students" action="create">
              <Button variant="outline" onClick={() => setIsUpdateOpen(true)} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Bulk Update
              </Button>
              <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Import
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Email</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withEmail}</div>
              <p className="text-xs text-muted-foreground">
                Can receive email notifications
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Students</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgStudents}</div>
              <p className="text-xs text-muted-foreground">
                Students per parent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <CardTitle>Parent Directory</CardTitle>
            <CardDescription>
              Search and manage all parents in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredParents.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No parents found</h3>
                <p className="text-sm text-muted-foreground">
                  {search ? 'Try adjusting your search.' : 'Import parents or add them from student profiles.'}
                </p>
                {!search && (
                  <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsImportOpen(true)}>
                    <Upload className="h-4 w-4" />
                    Import Parents
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parent</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParents.map((parent) => (
                      <TableRow key={parent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(parent.first_name, parent.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {parent.first_name} {parent.last_name}
                              </div>
                              {parent.occupation && (
                                <div className="text-xs text-muted-foreground">
                                  {parent.occupation}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {parent.phone}
                            </div>
                            {parent.email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {parent.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {parent.relationship_type && (
                            <Badge variant="secondary" className="capitalize">
                              {parent.relationship_type}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {parent.student_count} {parent.student_count === 1 ? 'student' : 'students'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Dialog */}
      {institution?.id && (
        <ParentImportDialog
          open={isImportOpen}
          onOpenChange={(open) => {
            setIsImportOpen(open);
            if (!open) refetch();
          }}
          institutionId={institution.id}
        />
      )}

      {/* Update Dialog */}
      {institution?.id && parents && (
        <BulkParentUpdateDialog
          open={isUpdateOpen}
          onOpenChange={(open) => {
            setIsUpdateOpen(open);
            if (!open) refetch();
          }}
          institutionId={institution.id}
          parents={parents}
          institutionName={institution.name}
        />
      )}
    </DashboardLayout>
  );
}

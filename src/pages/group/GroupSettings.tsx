import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Building2, MessageSquare, BarChart3, Calendar, Users, X, Pencil, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useGroup } from '@/contexts/GroupContext';
import { useSharedServices } from '@/hooks/useSharedServices';
import { SharedServiceType, GROUP_ROLE_PERMISSIONS } from '@/types/group';
import { EditGroupDialog } from '@/components/group/EditGroupDialog';

const SERVICE_ICONS: Record<SharedServiceType, React.ReactNode> = {
  finance: <Building2 className="h-5 w-5" />,
  messaging: <MessageSquare className="h-5 w-5" />,
  reporting: <BarChart3 className="h-5 w-5" />,
  fee_structure: <Globe className="h-5 w-5" />,
  academic_calendar: <Calendar className="h-5 w-5" />,
  staff_management: <Users className="h-5 w-5" />,
};

const ALL_SERVICES: SharedServiceType[] = [
  'finance',
  'messaging',
  'reporting',
  'fee_structure',
  'academic_calendar',
  'staff_management',
];

const QUICK_LINKS = [
  { label: 'Manage Campuses', href: '/group/campuses', icon: Building2 },
  { label: 'Group Users', href: '/group/users', icon: Users },
  { label: 'Group Reports', href: '/group/reports', icon: BarChart3 },
];

export default function GroupSettings() {
  const { group, groupId, groupRole } = useGroup();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { 
    isLoading, 
    getServiceStatus, 
    updateService, 
    SERVICE_LABELS, 
    SERVICE_DESCRIPTIONS 
  } = useSharedServices(groupId ?? undefined);

  const permissions = groupRole ? GROUP_ROLE_PERMISSIONS[groupRole] : null;
  const canManage = permissions?.canManageSettings ?? false;

  const handleToggleService = async (serviceType: SharedServiceType, isCentralized: boolean) => {
    await updateService.mutateAsync({
      service_type: serviceType,
      is_centralized: isCentralized,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Group Settings" subtitle="Loading...">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout title="Group Settings" subtitle="No group selected">
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Group Selected</h3>
            <p className="text-muted-foreground mb-4">
              You need to select or create a group to view settings.
            </p>
            <Button asChild>
              <Link to="/group">Go to Group Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Group Settings" 
      subtitle={`Configure shared services for ${group.name}`}
    >
      <div className="space-y-6">
        {/* Group Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Group Information
              </CardTitle>
            </div>
            {canManage && (
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Group Name</Label>
              <p className="font-medium">{group.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Group Code</Label>
              <p className="font-medium">{group.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Primary Country</Label>
              <p className="font-medium">{group.primary_country}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Subscription Plan</Label>
              <p className="font-medium capitalize">{group.subscription_plan}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to other group management pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {QUICK_LINKS.map((link) => (
                <Button
                  key={link.href}
                  variant="outline"
                  className="justify-between h-auto py-3"
                  asChild
                >
                  <Link to={link.href}>
                    <span className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shared Services */}
        <Card>
          <CardHeader>
            <CardTitle>Shared Services Configuration</CardTitle>
            <CardDescription>
              Control which services are centralized at the group level vs. managed independently by each campus.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {ALL_SERVICES.map((serviceType) => {
              const status = getServiceStatus(serviceType);
              const description = SERVICE_DESCRIPTIONS[serviceType];

              return (
                <div key={serviceType} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    {SERVICE_ICONS[serviceType]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{SERVICE_LABELS[serviceType]}</h4>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`service-${serviceType}`} className="text-sm text-muted-foreground">
                          {status.isCentralized ? 'Centralized' : 'Independent'}
                        </Label>
                        <Switch
                          id={`service-${serviceType}`}
                          checked={status.isCentralized}
                          onCheckedChange={(checked) => handleToggleService(serviceType, checked)}
                          disabled={!canManage || updateService.isPending}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {status.isCentralized ? description.centralized : description.independent}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Permissions Notice */}
        {!canManage && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardContent className="flex items-center gap-3 py-4">
              <X className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Only Group Owners can modify group settings. Contact your group administrator for changes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Group Dialog */}
      {group && (
        <EditGroupDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          group={group}
        />
      )}
    </DashboardLayout>
  );
}

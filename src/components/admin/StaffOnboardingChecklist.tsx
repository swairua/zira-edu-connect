import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  UserPlus,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStaffOnboarding, type StaffOnboardingItem } from '@/hooks/useStaffOnboarding';
import { cn } from '@/lib/utils';

interface StaffOnboardingChecklistProps {
  institutionId: string;
  maxItems?: number;
  showStats?: boolean;
}

function StaffOnboardingRow({ staff }: { staff: StaffOnboardingItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const checklistItems = [
    { label: 'Profile Complete', done: staff.profileComplete, icon: UserCheck },
    { label: 'Login Account', done: staff.hasLogin, icon: Key },
    { label: 'Role Assigned', done: staff.hasRoles, icon: Shield },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium",
            staff.overallProgress === 100 
              ? "bg-success/10 text-success" 
              : staff.overallProgress >= 50 
                ? "bg-warning/10 text-warning"
                : "bg-destructive/10 text-destructive"
          )}>
            {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{staff.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {staff.employeeNumber} • {staff.department || 'No department'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Progress value={staff.overallProgress} className="w-20 h-2" />
            <span className="text-xs text-muted-foreground w-8">{staff.overallProgress}%</span>
          </div>
          {staff.overallProgress === 100 ? (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              Complete
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              Pending
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="border-t bg-muted/30 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {checklistItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md text-sm",
                    item.done ? "text-success" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    item.done ? "bg-success text-white" : "border border-muted-foreground/30"
                  )}>
                    {item.done ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3 opacity-50" />
                    )}
                  </div>
                  <span className={cn(item.done && "line-through opacity-70")}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
          {staff.overallProgress < 100 && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              {!staff.hasLogin && (
                <Button asChild size="sm" variant="outline">
                  <Link to={`/staff/${staff.id}/invite`}>
                    <Mail className="h-4 w-4 mr-1" />
                    Send Invite
                  </Link>
                </Button>
              )}
              <Button asChild size="sm" variant="outline">
                <Link to={`/staff?id=${staff.id}`}>
                  Edit Profile
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StaffOnboardingChecklist({ 
  institutionId, 
  maxItems = 10,
  showStats = true 
}: StaffOnboardingChecklistProps) {
  const { staffList, stats, isLoading } = useStaffOnboarding(institutionId);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredStaff = useMemo(() => {
    let result = staffList;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.employeeNumber.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query)
      );
    }

    // Sort by progress (incomplete first)
    result = [...result].sort((a, b) => a.overallProgress - b.overallProgress);

    return showAll ? result : result.slice(0, maxItems);
  }, [staffList, searchQuery, showAll, maxItems]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const overallProgress = stats.totalStaff > 0 
    ? Math.round((stats.fullyOnboarded / stats.totalStaff) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Onboarding
            </CardTitle>
            <CardDescription>
              Track individual staff member setup completion
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/staff">
              <UserPlus className="h-4 w-4 mr-1" />
              Add Staff
            </Link>
          </Button>
        </div>

        {showStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold">{stats.totalStaff}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-info">{stats.withLogins}</p>
              <p className="text-xs text-muted-foreground">With Logins</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-warning">{stats.withRoles}</p>
              <p className="text-xs text-muted-foreground">Roles Assigned</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-success">{stats.fullyOnboarded}</p>
              <p className="text-xs text-muted-foreground">Fully Setup</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          <Progress value={overallProgress} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground">
            {overallProgress}% complete
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {staffList.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {filteredStaff.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No staff found matching your search' : 'No staff members yet'}
            </p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link to="/staff">Add First Staff Member</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStaff.map(staff => (
              <StaffOnboardingRow key={staff.id} staff={staff} />
            ))}
          </div>
        )}

        {!showAll && staffList.length > maxItems && !searchQuery && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowAll(true)}
          >
            Show {staffList.length - maxItems} more staff
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

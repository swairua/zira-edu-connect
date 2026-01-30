import { ParentLayout } from '@/components/parent/ParentLayout';
import { FeeBalanceCard } from '@/components/parent/FeeBalanceCard';
import { RecentPaymentsList } from '@/components/parent/RecentPaymentsList';
import { AnnouncementCard } from '@/components/parent/AnnouncementCard';
import { NoStudentLinked } from '@/components/parent/NoStudentLinked';
import { ErrorCard } from '@/components/parent/ErrorCard';
import { useParent } from '@/contexts/ParentContext';
import { 
  useStudentFeeBalance, 
  useStudentPaymentsForParent, 
  useParentAnnouncements 
} from '@/hooks/useParentData';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { CreditCard, GraduationCap, CalendarDays, UserCheck, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import type { Payment, Announcement } from '@/types/parent';

export default function ParentDashboard() {
  const { selectedStudent, parentProfile, isLoading: parentLoading } = useParent();
  
  const { 
    data: feeBalance, 
    isLoading: feeLoading,
    error: feeError,
    refetch: refetchFee,
  } = useStudentFeeBalance(
    selectedStudent?.id || null,
    selectedStudent?.institution_id || null
  );
  
  const { 
    data: payments = [], 
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useStudentPaymentsForParent(selectedStudent?.id || null);
  
  const { 
    data: announcements = [], 
    isLoading: announcementsLoading,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useParentAnnouncements(parentProfile?.institution_id || null);

  const {
    attendance,
    recentGrades,
    upcomingEvents,
    isLoadingAttendance,
  } = useParentDashboard(selectedStudent?.id || null, parentProfile?.institution_id || null);

  const isRefreshing = feeLoading || paymentsLoading || announcementsLoading || isLoadingAttendance;

  const handleRefresh = () => {
    refetchFee();
    refetchPayments();
    refetchAnnouncements();
  };

  const getInitials = () => {
    if (!selectedStudent) return 'S';
    return `${selectedStudent.first_name[0]}${selectedStudent.last_name[0]}`.toUpperCase();
  };

  // Show no student linked message
  if (!parentLoading && !selectedStudent) {
    return (
      <ParentLayout title="Home">
        <div className="p-4">
          <NoStudentLinked />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout 
      title="Home" 
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-4 p-4">
        {/* Student Card */}
        {parentLoading ? (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </CardContent>
          </Card>
        ) : selectedStudent ? (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-14 w-14">
                <AvatarImage 
                  src={selectedStudent.photo_url || undefined} 
                  alt={`${selectedStudent.first_name}'s photo`}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold truncate">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedStudent.class_name || 'Class not assigned'} • {selectedStudent.admission_number}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Fee Balance Card - Primary Value */}
        {feeError ? (
          <ErrorCard 
            title="Couldn't load fees" 
            message="We couldn't load your fee balance. Please try again."
            onRetry={() => refetchFee()}
          />
        ) : (
          <FeeBalanceCard
            balance={feeBalance?.balance ?? null}
            totalInvoiced={feeBalance?.totalInvoiced ?? 0}
            totalPaid={feeBalance?.totalPaid ?? 0}
            isPaid={feeBalance?.isPaid ?? false}
            isLoading={feeLoading}
          />
        )}

        {/* Attendance & Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <UserCheck className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">
                {isLoadingAttendance ? <Skeleton className="h-8 w-16 mx-auto" /> : `${attendance?.rate?.toFixed(0) || 0}%`}
              </p>
              <p className="text-xs text-muted-foreground">Attendance This Term</p>
              {attendance && (
                <p className="text-xs text-muted-foreground mt-1">
                  {attendance.present}/{attendance.total} days
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">
                {isLoadingAttendance ? <Skeleton className="h-8 w-16 mx-auto" /> : recentGrades.length}
              </p>
              <p className="text-xs text-muted-foreground">Recent Grades</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Grades */}
        {recentGrades.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Recent Grades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentGrades.slice(0, 3).map((grade, idx) => {
                const percentage = grade.totalMarks > 0 ? Math.round((grade.marks / grade.totalMarks) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{grade.subjectName}</p>
                      <p className="text-xs text-muted-foreground">{grade.assessmentName}</p>
                    </div>
                    <Badge variant={percentage >= 50 ? 'default' : 'destructive'}>
                      {grade.marks}/{grade.totalMarks} ({percentage}%)
                    </Badge>
                  </div>
                );
              })}
              <Button asChild variant="link" size="sm" className="p-0 h-auto">
                <Link to="/parent/results">View All Results →</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events/Exams */}
        {upcomingEvents.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.type}</p>
                  </div>
                  <Badge variant="outline">
                    {format(new Date(event.date), 'MMM d')}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link to="/parent/fees" aria-label="View fee details">
              <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">View Fees</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link to="/parent/results" aria-label="View exam results">
              <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">View Results</span>
            </Link>
          </Button>
        </div>

        {/* Recent Payments */}
        {paymentsError ? (
          <ErrorCard 
            title="Couldn't load payments" 
            message="We couldn't load payment history."
            onRetry={() => refetchPayments()}
          />
        ) : (
          <RecentPaymentsList
            payments={payments as Payment[]}
            isLoading={paymentsLoading}
            limit={3}
          />
        )}

        {/* Announcements */}
        {announcementsError ? (
          <ErrorCard 
            title="Couldn't load notices" 
            message="We couldn't load announcements."
            onRetry={() => refetchAnnouncements()}
          />
        ) : (
          <AnnouncementCard
            announcements={announcements as Announcement[]}
            isLoading={announcementsLoading}
            limit={3}
          />
        )}
      </div>
    </ParentLayout>
  );
}

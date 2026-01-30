import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useStudent } from '@/hooks/useStudents';
import { useStudentInvoices } from '@/hooks/useInvoices';
import { useStudentPaymentHistory } from '@/hooks/useStudentPayments';
import { StudentParentsCard } from '@/components/students/StudentParentsCard';
import { InviteStudentDialog } from '@/components/students/InviteStudentDialog';
import { GenerateStudentPinDialog } from '@/components/students/GenerateStudentPinDialog';
import {
  ArrowLeft,
  Edit,
  User,
  GraduationCap,
  Wallet,
  Users,
  FileText,
  Key,
  Send,
  CheckCircle,
  RefreshCw,
  Shield,
  MessageSquare,
  AlertCircle,
  Mail,
  Bed,
} from 'lucide-react';
import { StudentBoardingCard } from '@/components/hostel/StudentBoardingCard';
import { useStudentParents } from '@/hooks/useStudentParents';
import { format } from 'date-fns';

// Portal Access Section Component
interface PortalAccessSectionProps {
  student: any;
  hasPinAccess: boolean;
  hasPortalAccess: boolean;
  onShowPinDialog: () => void;
  onShowInviteDialog: () => void;
}

function PortalAccessSection({ 
  student, 
  hasPinAccess, 
  hasPortalAccess, 
  onShowPinDialog, 
  onShowInviteDialog 
}: PortalAccessSectionProps) {
  const { data: parents } = useStudentParents(student?.id);
  const primaryParent = parents?.find(p => p.is_primary) || parents?.[0];
  const hasLinkedParent = !!primaryParent;

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    return phone.slice(0, 4) + '******' + phone.slice(-2);
  };

  return (
    <div className="space-y-4">
      {/* OTP Login - Primary Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            OTP Login
            <Badge variant="default" className="ml-2">Recommended</Badge>
          </CardTitle>
          <CardDescription>
            Student logs in using their parent's phone number. An OTP code is sent via SMS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasLinkedParent ? (
            <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-700 dark:text-green-400">OTP Login Available</h4>
                <p className="text-sm text-muted-foreground">
                  Parent: {primaryParent.parent.first_name} {primaryParent.parent.last_name} ({maskPhone(primaryParent.parent.phone)})
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-amber-700 dark:text-amber-400">No Parent Linked</h4>
                <p className="text-sm text-muted-foreground">
                  Link a parent to enable OTP login. Go to the Parents tab.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup PIN Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Backup PIN Access
            <Badge variant="outline" className="ml-2">Backup</Badge>
          </CardTitle>
          <CardDescription>
            For offline access or when SMS is unavailable. Uses Institution Code + Admission Number + PIN.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPinAccess ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-700 dark:text-green-400">PIN Access Active</h4>
                  <p className="text-sm text-muted-foreground">
                    Student can log in using Institution Code + Admission Number + PIN
                  </p>
                  {student?.pin_expires_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      PIN expires: {format(new Date(student.pin_expires_at), 'dd MMM yyyy, HH:mm')}
                    </p>
                  )}
                </div>
              </div>
              <PermissionGate domain="students" action="edit">
                <Button variant="outline" onClick={onShowPinDialog} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset PIN
                </Button>
              </PermissionGate>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-muted p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Key className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">PIN Access Not Enabled</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate a backup PIN for offline access or when OTP is unavailable.
                  </p>
                </div>
              </div>
              <PermissionGate domain="students" action="edit">
                <Button variant="outline" onClick={onShowPinDialog} className="gap-2">
                  <Key className="h-4 w-4" />
                  Generate Backup PIN
                </Button>
              </PermissionGate>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Login - Optional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Login
            <Badge variant="secondary" className="ml-2">Optional</Badge>
          </CardTitle>
          <CardDescription>
            For students who have email addresses. Uses standard email/password login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPortalAccess ? (
            <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-400">Email Access Active</h4>
                <p className="text-sm text-muted-foreground">
                  This student has an email account linked and can log in with email/password.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-muted p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">No Email Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Send an invitation to the student's email to create an account.
                  </p>
                </div>
              </div>
              <PermissionGate domain="students" action="edit">
                <Button variant="outline" onClick={onShowInviteDialog} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Email Invitation
                </Button>
              </PermissionGate>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: student, isLoading, refetch } = useStudent(id || null);
  const { data: invoices = [] } = useStudentInvoices(id || null);
  const { data: payments = [] } = useStudentPaymentHistory(id || null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const hasPortalAccess = !!student?.user_id;
  const hasPinAccess = !!student?.portal_enabled;

  if (isLoading) {
    return (
      <DashboardLayout title="Student Profile">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout title="Student Not Found">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold">Student not found</h2>
          <Button onClick={() => navigate('/students')} className="mt-4">
            Back to Students
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalPaid = payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);
  const balance = totalInvoiced - totalPaid;

  return (
    <DashboardLayout title="Student Profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {student.first_name} {student.middle_name || ''} {student.last_name}
                </h1>
                <Badge
                  variant={student.status === 'active' ? 'default' : 'secondary'}
                >
                  {student.status || 'active'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {student.admission_number} • {student.class?.name || 'No class assigned'}
              </p>
            </div>
          </div>
          <PermissionGate domain="students" action="edit">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </PermissionGate>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoiced</p>
                  <p className="text-2xl font-bold">KES {totalInvoiced.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Wallet className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">KES {totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${balance > 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
                  <Wallet className={`h-6 w-6 ${balance > 0 ? 'text-destructive' : 'text-success'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className={`text-2xl font-bold ${balance > 0 ? 'text-destructive' : 'text-success'}`}>
                    KES {balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="portal" className="gap-2">
              <Key className="h-4 w-4" />
              Portal Access
            </TabsTrigger>
            <TabsTrigger value="parents" className="gap-2">
              <Users className="h-4 w-4" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="academics" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Academics
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2">
              <Wallet className="h-4 w-4" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="boarding" className="gap-2">
              <Bed className="h-4 w-4" />
              Boarding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                    <dd className="mt-1 text-sm">
                      {student.first_name} {student.middle_name || ''} {student.last_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Admission Number</dt>
                    <dd className="mt-1 text-sm">{student.admission_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                    <dd className="mt-1 text-sm">
                      {student.date_of_birth
                        ? format(new Date(student.date_of_birth), 'dd MMMM yyyy')
                        : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                    <dd className="mt-1 text-sm capitalize">{student.gender || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Nationality</dt>
                    <dd className="mt-1 text-sm">{student.nationality || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Admission Date</dt>
                    <dd className="mt-1 text-sm">
                      {student.admission_date
                        ? format(new Date(student.admission_date), 'dd MMMM yyyy')
                        : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Class</dt>
                    <dd className="mt-1 text-sm">{student.class?.name || 'Not assigned'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="mt-1">
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status || 'active'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portal">
            <PortalAccessSection 
              student={student}
              hasPinAccess={hasPinAccess}
              hasPortalAccess={hasPortalAccess}
              onShowPinDialog={() => setShowPinDialog(true)}
              onShowInviteDialog={() => setShowInviteDialog(true)}
            />
          </TabsContent>

          <TabsContent value="parents">
            <StudentParentsCard
              studentId={student.id}
              studentName={`${student.first_name} ${student.last_name}`}
              institutionId={student.institution_id}
            />
          </TabsContent>

          <TabsContent value="academics">
            <Card>
              <CardHeader>
                <CardTitle>Academic Records</CardTitle>
                <CardDescription>View academic performance and attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No academic records yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Academic records will appear here once exams are conducted
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance">
            <div className="space-y-4">
              {/* Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>{invoices.length} invoice(s) found</CardDescription>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No invoices found for this student
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">{invoice.invoice_number}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {format(new Date(invoice.due_date), 'dd MMM yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              KES {invoice.total_amount.toLocaleString()}
                            </p>
                            <Badge
                              variant={
                                invoice.status === 'paid'
                                  ? 'default'
                                  : invoice.status === 'cancelled'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>{payments.length} payment(s) found</CardDescription>
                </CardHeader>
                <CardContent>
                  {payments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No payments found for this student
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">{payment.receipt_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(payment.payment_date), 'dd MMM yyyy')} •{' '}
                              {payment.payment_method}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              KES {payment.amount.toLocaleString()}
                            </p>
                            <Badge
                              variant={
                                payment.status === 'confirmed'
                                  ? 'default'
                                  : payment.status === 'reversed'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="boarding">
            <StudentBoardingCard
              studentId={student.id}
              institutionId={student.institution_id}
              boardingStatus={student.boarding_status}
            />
          </TabsContent>
        </Tabs>

        {/* Invite Student Dialog */}
        <InviteStudentDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          studentId={student.id}
          studentName={`${student.first_name} ${student.last_name}`}
          onSuccess={() => refetch()}
        />

        {/* Generate PIN Dialog */}
        <GenerateStudentPinDialog
          open={showPinDialog}
          onOpenChange={setShowPinDialog}
          studentId={student.id}
          studentName={`${student.first_name} ${student.last_name}`}
          onSuccess={() => refetch()}
        />
      </div>
    </DashboardLayout>
  );
}

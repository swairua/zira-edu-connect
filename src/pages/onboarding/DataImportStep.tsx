import { useState, useMemo } from 'react';
import { Users, UserPlus, UserCheck, Briefcase, GraduationCap, Wallet, CreditCard, Calendar, ChevronDown, RotateCcw, Upload, History, CheckCircle, Banknote, FileDown } from 'lucide-react';
import { downloadOnboardingGuide } from '@/lib/pdf/onboarding-guide-pdf';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { hasAnyRole, ADMIN_DASHBOARD_ROLES, FINANCE_ROLES, ACADEMIC_ROLES, HR_ROLES } from '@/lib/roles';
import { useDataImports } from '@/hooks/useDataImports';
import { useStudents } from '@/hooks/useStudents';
import { RoleAwareStepCard } from '@/components/onboarding/RoleAwareStepCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BulkStudentImportDialog } from '@/components/students/BulkStudentImportDialog';
import { ParentImportDialog } from '@/components/imports/ParentImportDialog';
import { StaffImportDialog } from '@/components/imports/StaffImportDialog';
import { OpeningBalancesDialog } from '@/components/imports/OpeningBalancesDialog';
import { HistoricalGradesImportDialog } from '@/components/imports/HistoricalGradesImportDialog';
import { HistoricalPaymentsImportDialog } from '@/components/imports/HistoricalPaymentsImportDialog';
import { HistoricalAttendanceImportDialog } from '@/components/imports/HistoricalAttendanceImportDialog';

export function DataImportStep() {
  const { institutionId } = useInstitution();
  const { isStepCompleted } = useOnboarding();
  const { userRoles } = useAuth();
  const { imports, getImportStats, rollbackImport } = useDataImports();
  const studentsQuery = useStudents(institutionId || '');

  const [studentImportOpen, setStudentImportOpen] = useState(false);
  const [parentImportOpen, setParentImportOpen] = useState(false);
  const [staffImportOpen, setStaffImportOpen] = useState(false);
  const [balancesImportOpen, setBalancesImportOpen] = useState(false);
  const [historicalGradesOpen, setHistoricalGradesOpen] = useState(false);
  const [historicalPaymentsOpen, setHistoricalPaymentsOpen] = useState(false);
  const [historicalAttendanceOpen, setHistoricalAttendanceOpen] = useState(false);
  const [coreDataOpen, setCoreDataOpen] = useState(true);
  const [financialOpen, setFinancialOpen] = useState(true);
  const [historicalOpen, setHistoricalOpen] = useState(false);

  // Determine which sections to show based on role
  const isAdmin = hasAnyRole(userRoles, ADMIN_DASHBOARD_ROLES);
  const isFinanceRole = hasAnyRole(userRoles, FINANCE_ROLES);
  const isAcademicRole = hasAnyRole(userRoles, ACADEMIC_ROLES);
  const isHrRole = hasAnyRole(userRoles, HR_ROLES);

  // Show sections based on role
  const showCoreData = isAdmin || isHrRole;
  const showFinancial = isAdmin || isFinanceRole;
  const showHistorical = isAdmin || isAcademicRole;

  const stats = getImportStats();
  const existingAdmissionNumbers = studentsQuery.data?.map(s => s.admission_number) || [];

  const coreDataImports = [
    { 
      key: 'students' as const, 
      label: 'Students', 
      icon: Users, 
      description: 'Import student records from CSV',
      onImport: () => setStudentImportOpen(true),
    },
    { 
      key: 'parents' as const, 
      label: 'Parents', 
      icon: UserCheck, 
      description: 'Import parent/guardian information',
      onImport: () => setParentImportOpen(true),
    },
    { 
      key: 'staff' as const, 
      label: 'Staff', 
      icon: Briefcase, 
      description: 'Import staff and teacher records',
      onImport: () => setStaffImportOpen(true),
    },
  ];

  const financialImports = [
    { 
      key: 'opening_balances' as const, 
      label: 'Opening Balances', 
      icon: Wallet, 
      description: 'Import fee balances from previous system',
      onImport: () => setBalancesImportOpen(true),
    },
    { 
      key: 'historical_payments' as const, 
      label: 'Historical Payments', 
      icon: Banknote, 
      description: 'Import past payment transactions for audit trails',
      onImport: () => setHistoricalPaymentsOpen(true),
    },
  ];

  const historicalImports = [
    { 
      key: 'historical_grades' as const, 
      label: 'Historical Grades', 
      icon: GraduationCap, 
      description: 'Import exam results from previous years',
      onImport: () => setHistoricalGradesOpen(true),
    },
    { 
      key: 'historical_attendance' as const, 
      label: 'Historical Attendance', 
      icon: Calendar, 
      description: 'Import attendance records from previous terms',
      onImport: () => setHistoricalAttendanceOpen(true),
    },
  ];

  const renderImportCard = ({ key, label, icon: Icon, description, onImport }: {
    key: keyof ReturnType<typeof getImportStats>;
    label: string;
    icon: React.ElementType;
    description: string;
    onImport: () => void;
  }) => {
    const typeStats = stats[key];
    const recentImport = imports?.find(i => i.import_type === key && i.status === 'completed');
    
    return (
      <Card key={key}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
            {typeStats.completed > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {typeStats.completed} imported
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            {recentImport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => rollbackImport.mutate(recentImport.id)}
                disabled={rollbackImport.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Rollback
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <RoleAwareStepCard
        stepId="data_import"
        title="Data Migration"
        description="Import existing data from your previous system. You can skip this step and add records manually later."
        isCompleted={isStepCompleted('data_import')}
      >
        <div className="space-y-6">
          {/* Download Guide Button */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50">
            <div>
              <h4 className="font-medium text-sm">Data Preparation Guide</h4>
              <p className="text-xs text-muted-foreground">
                Download our comprehensive PDF guide for preparing your data files
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadOnboardingGuide}>
              <FileDown className="h-4 w-4 mr-2" />
              Download Guide (PDF)
            </Button>
          </div>
          {/* Core Data Section - Admins and HR */}
          {showCoreData && (
            <Collapsible open={coreDataOpen} onOpenChange={setCoreDataOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">Core Data</CardTitle>
                          <CardDescription>Essential records for your institution</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${coreDataOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid gap-4 md:grid-cols-3">
                      {coreDataImports.map(renderImportCard)}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Financial Baseline Section - Admins and Finance */}
          {showFinancial && (
            <Collapsible open={financialOpen} onOpenChange={setFinancialOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">Financial Baseline</CardTitle>
                          <CardDescription>Fee balances and payment history</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${financialOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid gap-4 md:grid-cols-2">
                      {financialImports.map(renderImportCard)}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Historical Records Section - Admins and Academic */}
          {showHistorical && (
            <Collapsible open={historicalOpen} onOpenChange={setHistoricalOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">Historical Records</CardTitle>
                          <CardDescription>Past academic performance (optional)</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Optional</Badge>
                        <ChevronDown className={`h-5 w-5 transition-transform ${historicalOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm text-muted-foreground">
                      💡 Import historical grades to maintain student performance history and generate comprehensive report cards.
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {historicalImports.map(renderImportCard)}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Financial Baseline Section */}
          <Collapsible open={financialOpen} onOpenChange={setFinancialOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">Financial Baseline</CardTitle>
                        <CardDescription>Fee balances and payment history</CardDescription>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${financialOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid gap-4 md:grid-cols-2">
                    {financialImports.map(renderImportCard)}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Historical Records Section */}
          <Collapsible open={historicalOpen} onOpenChange={setHistoricalOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">Historical Records</CardTitle>
                        <CardDescription>Past academic performance (optional)</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Optional</Badge>
                      <ChevronDown className={`h-5 w-5 transition-transform ${historicalOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm text-muted-foreground">
                    💡 Import historical grades to maintain student performance history and generate comprehensive report cards.
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {historicalImports.map(renderImportCard)}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 You can skip this step and add records manually from the respective pages after going live.
          </p>
        </div>
      </RoleAwareStepCard>

      {institutionId && (
        <>
          <BulkStudentImportDialog
            open={studentImportOpen}
            onOpenChange={setStudentImportOpen}
            institutionId={institutionId}
            existingAdmissionNumbers={existingAdmissionNumbers}
          />
          <ParentImportDialog
            open={parentImportOpen}
            onOpenChange={setParentImportOpen}
            institutionId={institutionId}
          />
          <StaffImportDialog
            open={staffImportOpen}
            onOpenChange={setStaffImportOpen}
            institutionId={institutionId}
          />
          <OpeningBalancesDialog
            open={balancesImportOpen}
            onOpenChange={setBalancesImportOpen}
            institutionId={institutionId}
          />
          <HistoricalGradesImportDialog
            open={historicalGradesOpen}
            onOpenChange={setHistoricalGradesOpen}
            institutionId={institutionId}
          />
        <HistoricalPaymentsImportDialog
          open={historicalPaymentsOpen}
          onOpenChange={setHistoricalPaymentsOpen}
          institutionId={institutionId}
        />
        <HistoricalAttendanceImportDialog
          open={historicalAttendanceOpen}
          onOpenChange={setHistoricalAttendanceOpen}
          institutionId={institutionId}
        />
      </>
    )}
  </>
  );
}

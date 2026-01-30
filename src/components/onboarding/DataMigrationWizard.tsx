import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  Wallet, 
  GraduationCap, 
  Calendar,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
  Clock,
  Database
} from 'lucide-react';
import { type ImportType } from '@/hooks/useDataImports';

interface ImportStats {
  students: { total: number; completed: number; failed: number };
  parents: { total: number; completed: number; failed: number };
  staff: { total: number; completed: number; failed: number };
  opening_balances: { total: number; completed: number; failed: number };
  historical_grades: { total: number; completed: number; failed: number };
  historical_payments: { total: number; completed: number; failed: number };
  historical_attendance: { total: number; completed: number; failed: number };
}

interface DataMigrationWizardProps {
  onStartImport: (importType: ImportType) => void;
  importStats: ImportStats;
  hasStudents?: boolean;
  hasSubjects?: boolean;
  hasClasses?: boolean;
}

interface ImportCategory {
  title: string;
  description: string;
  items: ImportItem[];
}

interface ImportItem {
  key: ImportType;
  label: string;
  icon: React.ElementType;
  description: string;
  dependencies: ImportType[];
  dependencyLabels?: string[];
}

const IMPORT_CATEGORIES: ImportCategory[] = [
  {
    title: 'Core Data',
    description: 'Essential records that other imports depend on',
    items: [
      {
        key: 'students',
        label: 'Students',
        icon: Users,
        description: 'Student profiles and enrollment data',
        dependencies: [],
      },
      {
        key: 'parents',
        label: 'Parents',
        icon: UserPlus,
        description: 'Parent/guardian contacts and student links',
        dependencies: [],
        dependencyLabels: ['Recommended: Import students first for linking'],
      },
      {
        key: 'staff',
        label: 'Staff',
        icon: Briefcase,
        description: 'Teachers and administrative staff',
        dependencies: [],
      },
    ],
  },
  {
    title: 'Financial Baseline',
    description: 'Carry forward balances from your previous system',
    items: [
      {
        key: 'opening_balances',
        label: 'Opening Balances',
        icon: Wallet,
        description: 'Student fee balances as of migration date',
        dependencies: ['students'],
      },
      {
        key: 'historical_payments',
        label: 'Historical Payments',
        icon: CreditCard,
        description: 'Past payment transactions for records',
        dependencies: ['students'],
      },
    ],
  },
  {
    title: 'Historical Records',
    description: 'Academic history from previous terms/years',
    items: [
      {
        key: 'historical_grades',
        label: 'Historical Grades',
        icon: GraduationCap,
        description: 'Past exam results and academic performance',
        dependencies: ['students'],
        dependencyLabels: ['Requires: Students, Subjects configured'],
      },
      {
        key: 'historical_attendance',
        label: 'Historical Attendance',
        icon: Calendar,
        description: 'Past attendance records',
        dependencies: ['students'],
        dependencyLabels: ['Requires: Students, Classes configured'],
      },
    ],
  },
];

const PRE_MIGRATION_CHECKLIST = [
  { id: 'students-csv', label: 'Prepare student data CSV file with admission numbers' },
  { id: 'parents-csv', label: 'Export parent/guardian contact list from old system' },
  { id: 'staff-csv', label: 'Prepare staff list with employee numbers and roles' },
  { id: 'balances', label: 'Calculate opening fee balances as of migration date' },
  { id: 'grades', label: 'Export historical grades/exam results' },
  { id: 'attendance', label: 'Export attendance records (if needed)' },
];

export function DataMigrationWizard({
  onStartImport,
  importStats,
  hasStudents = false,
  hasSubjects = false,
  hasClasses = false,
}: DataMigrationWizardProps) {
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set());

  const toggleCheckItem = (id: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCheckedItems(newSet);
  };

  const getItemStatus = (item: ImportItem): 'ready' | 'blocked' | 'completed' | 'partial' => {
    const stats = importStats[item.key];
    
    if (stats.completed > 0 && stats.failed === 0) {
      return 'completed';
    }
    
    if (stats.completed > 0) {
      return 'partial';
    }

    // Check dependencies
    const dependenciesMet = item.dependencies.every(dep => {
      const depStats = importStats[dep];
      return depStats.completed > 0;
    });

    // Special checks for historical imports
    if (item.key === 'historical_grades' && (!hasStudents || !hasSubjects)) {
      return 'blocked';
    }
    if (item.key === 'historical_attendance' && (!hasStudents || !hasClasses)) {
      return 'blocked';
    }
    if (['opening_balances', 'historical_payments'].includes(item.key) && !hasStudents) {
      return 'blocked';
    }

    if (!dependenciesMet && item.dependencies.length > 0) {
      return 'blocked';
    }

    return 'ready';
  };

  const getCategoryProgress = (category: ImportCategory) => {
    const completed = category.items.filter(item => {
      const stats = importStats[item.key];
      return stats.completed > 0;
    }).length;
    return { completed, total: category.items.length };
  };

  const getTotalProgress = () => {
    const allItems = IMPORT_CATEGORIES.flatMap(c => c.items);
    const completed = allItems.filter(item => importStats[item.key].completed > 0).length;
    return Math.round((completed / allItems.length) * 100);
  };

  const getBlockedWarnings = (): string[] => {
    const warnings: string[] = [];
    
    if (!hasStudents) {
      const dependentImports = ['Opening Balances', 'Historical Payments', 'Historical Grades', 'Historical Attendance'];
      warnings.push(`Import students first to enable: ${dependentImports.join(', ')}`);
    }
    
    if (hasStudents && !hasSubjects) {
      warnings.push('Configure subjects in Academic Settings to enable Historical Grades import');
    }
    
    if (hasStudents && !hasClasses) {
      warnings.push('Configure classes in Academic Settings to enable Historical Attendance import');
    }

    return warnings;
  };

  const warnings = getBlockedWarnings();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Data Migration Progress</CardTitle>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {getTotalProgress()}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={getTotalProgress()} className="h-3" />
        </CardContent>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc ml-4 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Pre-Migration Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Pre-Migration Checklist</CardTitle>
          </div>
          <CardDescription>
            Prepare these items before starting the import process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRE_MIGRATION_CHECKLIST.map(item => (
              <div key={item.id} className="flex items-start gap-2">
                <Checkbox
                  id={item.id}
                  checked={checkedItems.has(item.id)}
                  onCheckedChange={() => toggleCheckItem(item.id)}
                />
                <label
                  htmlFor={item.id}
                  className={`text-sm cursor-pointer ${
                    checkedItems.has(item.id) ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import Categories */}
      {IMPORT_CATEGORIES.map(category => {
        const progress = getCategoryProgress(category);
        
        return (
          <Card key={category.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
                <Badge variant={progress.completed === progress.total ? 'default' : 'secondary'}>
                  {progress.completed}/{progress.total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.items.map(item => {
                  const status = getItemStatus(item);
                  const stats = importStats[item.key];
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        status === 'completed' ? 'bg-green-500/5 border-green-500/20' :
                        status === 'partial' ? 'bg-yellow-500/5 border-yellow-500/20' :
                        status === 'blocked' ? 'bg-muted/50 border-muted' :
                        'bg-background border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          status === 'completed' ? 'bg-green-500/10 text-green-600' :
                          status === 'blocked' ? 'bg-muted text-muted-foreground' :
                          'bg-primary/10 text-primary'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          {item.dependencyLabels && status === 'blocked' && (
                            <p className="text-xs text-amber-600 mt-1">
                              {item.dependencyLabels[0]}
                            </p>
                          )}
                          {stats.completed > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              {stats.completed} records imported
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {status === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {status === 'partial' && (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        {(status === 'ready' || status === 'partial') && (
                          <Button
                            size="sm"
                            variant={status === 'partial' ? 'outline' : 'default'}
                            onClick={() => onStartImport(item.key)}
                          >
                            {status === 'partial' ? 'Continue' : 'Import'}
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                        {status === 'blocked' && (
                          <Badge variant="outline" className="text-muted-foreground">
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

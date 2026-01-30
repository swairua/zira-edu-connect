import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Receipt, 
  FileText, 
  Users, 
  Settings, 
  CreditCard,
  TrendingUp,
  Building2,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function FinanceQuickActionsWidget() {
  const actions = [
    { to: '/portal/receipts/new', icon: Receipt, label: 'Record Payment' },
    { to: '/portal/invoices', icon: FileText, label: 'View Invoices' },
    { to: '/portal/student-accounts', icon: Users, label: 'Student Accounts' },
    { to: '/portal/bank-accounts', icon: Building2, label: 'Bank Accounts' },
    { to: '/portal/reports/daily-collection', icon: TrendingUp, label: 'Daily Report' },
    { to: '/portal/fee-structure', icon: ClipboardList, label: 'Fee Structure' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

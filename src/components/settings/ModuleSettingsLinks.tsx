import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Wallet, 
  BookOpen, 
  Bus, 
  MessageSquare,
  Shield,
  ChevronRight,
  GraduationCap,
  Building,
  Package,
  UtensilsCrossed,
  Hash,
  HardDrive
} from 'lucide-react';

const moduleLinks = [
  { name: 'Admission Numbers', path: '/settings/admission-numbers', icon: Hash, description: 'Configure auto-generation format' },
  { name: 'Data Backup', path: '/settings/backups', icon: HardDrive, description: 'Create and manage data backups' },
  { name: 'Security Settings', path: '/security', icon: Shield, description: 'Manage roles and permissions' },
  { name: 'Payroll Settings', path: '/hr/payroll/settings', icon: Wallet, description: 'Configure payroll and deductions' },
  { name: 'Academic Settings', path: '/academics/settings', icon: GraduationCap, description: 'Grading and assessment config' },
  { name: 'Library Settings', path: '/library/settings', icon: BookOpen, description: 'Loan periods and fines' },
  { name: 'Transport Policies', path: '/transport/settings', icon: Bus, description: 'Routes and fee policies' },
  { name: 'Hostel Settings', path: '/hostel/settings', icon: Building, description: 'Room allocation and policies' },
  { name: 'Inventory Settings', path: '/inventory/settings', icon: Package, description: 'Stock and procurement rules' },
  { name: 'Cafeteria Settings', path: '/cafeteria/settings', icon: UtensilsCrossed, description: 'Menu and meal policies' },
  { name: 'Message Templates', path: '/communication/templates', icon: MessageSquare, description: 'SMS and email templates' },
];

export function ModuleSettingsLinks() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Module Settings</CardTitle>
            <CardDescription>Configure settings for specific modules</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {moduleLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-auto py-3"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">{link.name}</p>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

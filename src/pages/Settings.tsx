import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { useInstitution } from '@/contexts/InstitutionContext';
import { countryConfigs, type CountryCode } from '@/lib/country-config';
import { FinanceSettingsCard } from '@/components/settings/FinanceSettingsCard';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { NotificationSettingsCard } from '@/components/settings/NotificationSettingsCard';
import { ProfileEditCard } from '@/components/settings/ProfileEditCard';
import { ModuleSettingsLinks } from '@/components/settings/ModuleSettingsLinks';
import { CurriculumSettingsCard } from '@/components/settings/CurriculumSettingsCard';
import { InstitutionBrandingCard } from '@/components/settings/InstitutionBrandingCard';
import { SubscriptionSettingsCard } from '@/components/settings/SubscriptionSettingsCard';
import { PlanComparisonDialog } from '@/components/settings/PlanComparisonDialog';
import { ModuleMarketplace } from '@/components/settings/ModuleMarketplace';
import { InstitutionModuleSettings } from '@/components/settings/InstitutionModuleSettings';
import { InstitutionSmsCreditsCard } from '@/components/settings/InstitutionSmsCreditsCard';
import { InstitutionNotificationSettings } from '@/components/settings/InstitutionNotificationSettings';
import { 
  Building2, 
  Globe, 
  Bell, 
  User,
  Mail,
  Wallet,
  Settings as SettingsIcon,
  Crown,
  Package,
  MessageSquare,
  FileDown,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadOnboardingGuide } from '@/lib/pdf/onboarding-guide-pdf';

export default function Settings() {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showModuleMarketplace, setShowModuleMarketplace] = useState(false);
  const { institution, institutionId } = useInstitution();
  const countryConfig = institution?.country ? countryConfigs[institution.country as CountryCode] : null;

  return (
    <DashboardLayout title="Settings" subtitle="Manage your preferences">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and institution preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          {/*
            TabsList in shadcn ships with a fixed height (h-10). When we allow wrapping,
            extra rows can get clipped. Force auto height so all tabs remain accessible.
          */}
          <ScrollableTabsList>
            <TabsTrigger value="general" className="gap-2 px-3 py-2">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">General</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2 px-3 py-2">
              <User className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Account</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2 px-3 py-2">
              <Wallet className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Finance</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2 px-3 py-2">
              <Crown className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2 px-3 py-2">
              <Package className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Modules</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="gap-2 px-3 py-2">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Communication</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 px-3 py-2">
              <Bell className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2 px-3 py-2">
              <SettingsIcon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Advanced</span>
            </TabsTrigger>
          </ScrollableTabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            {/* Help & Resources - Prominent at top */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Help & Resources</CardTitle>
                    <CardDescription>Documentation and guides</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Onboarding Guide</p>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive guide for data preparation and bulk imports
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadOnboardingGuide}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum Settings - Full Width */}
            <CurriculumSettingsCard />
            
            {/* School Branding - Full Width */}
            <InstitutionBrandingCard />
            
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Institution Profile */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Institution Profile</CardTitle>
                      <CardDescription>Your institution details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institution Name</Label>
                    <Input value={institution?.name || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Institution Code</Label>
                    <Input value={institution?.code || ''} disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Input value={institution?.type || ''} disabled className="capitalize" />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Input value={institution?.status || ''} disabled className="capitalize" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contact support to update institution details
                  </p>
                </CardContent>
              </Card>

              {/* Regional Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Regional Settings</CardTitle>
                      <CardDescription>Country-specific configuration</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <span className="text-xl">{countryConfig?.flag}</span>
                      <span>{countryConfig?.name || institution?.country}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Input value={countryConfig?.currency.code || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Input value={countryConfig?.timezone || ''} disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Grading System</Label>
                    <Input value={countryConfig?.gradingSystem.name || ''} disabled />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>Institution contact details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={institution?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={institution?.phone || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={institution?.address || ''} disabled />
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ProfileEditCard />
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>Manage your account security</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Update your account password
                      </p>
                    </div>
                    <ChangePasswordDialog />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance">
            {institutionId && (
              <FinanceSettingsCard institutionId={institutionId} />
            )}
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <SubscriptionSettingsCard 
                onUpgrade={() => setShowUpgradeDialog(true)}
                onViewModules={() => setShowModuleMarketplace(true)}
              />
            </div>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <InstitutionModuleSettings />
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <InstitutionSmsCreditsCard />
            <InstitutionNotificationSettings />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettingsCard />
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ModuleSettingsLinks />
            </div>
          </TabsContent>
        </Tabs>

        {/* Upgrade Dialog */}
        <PlanComparisonDialog 
          open={showUpgradeDialog} 
          onOpenChange={setShowUpgradeDialog} 
        />

        {/* Module Marketplace Dialog */}
        <ModuleMarketplace 
          open={showModuleMarketplace} 
          onOpenChange={setShowModuleMarketplace} 
        />
      </div>
    </DashboardLayout>
  );
}

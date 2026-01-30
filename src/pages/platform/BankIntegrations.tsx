import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useBankIntegrations,
  useToggleBankIntegration,
  useUpdateBankIntegration,
  useBankIntegrationStats,
  type BankIntegration,
} from '@/hooks/useBankIntegrations';
import {
  Building2,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Shield,
  Key,
  Globe,
  Activity,
} from 'lucide-react';

const healthStatusConfig = {
  healthy: { color: 'bg-green-500', icon: CheckCircle2, label: 'Healthy' },
  degraded: { color: 'bg-yellow-500', icon: AlertTriangle, label: 'Degraded' },
  down: { color: 'bg-red-500', icon: XCircle, label: 'Down' },
  unknown: { color: 'bg-gray-400', icon: HelpCircle, label: 'Unknown' },
};

const providerTypeLabels = {
  bank_api: 'Bank API',
  mobile_money: 'Mobile Money',
  card_processor: 'Card Processor',
};

function BankIntegrationCard({ integration }: { integration: BankIntegration }) {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const toggleMutation = useToggleBankIntegration();
  const updateMutation = useUpdateBankIntegration();
  const { data: stats } = useBankIntegrationStats(integration.id);

  const healthConfig = healthStatusConfig[integration.health_status];
  const HealthIcon = healthConfig.icon;

  const [credentials, setCredentials] = useState<Record<string, string>>({
    api_key: '',
    api_secret: '',
    shortcode: '',
    passkey: '',
    ...Object.fromEntries(
      Object.entries(integration.credentials || {}).map(([k, v]) => [k, typeof v === 'string' ? v : ''])
    ),
  });

  const [environment, setEnvironment] = useState(integration.environment);

  const handleSaveConfig = async () => {
    await updateMutation.mutateAsync({
      id: integration.id,
      credentials,
      environment,
    });
    setConfigDialogOpen(false);
  };

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{integration.bank_name}</CardTitle>
                <CardDescription className="text-xs">
                  {providerTypeLabels[integration.provider_type]} • {integration.bank_code}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={integration.environment === 'production' ? 'default' : 'secondary'}>
                {integration.environment}
              </Badge>
              <Switch
                checked={integration.is_active}
                onCheckedChange={(checked) =>
                  toggleMutation.mutate({ id: integration.id, is_active: checked })
                }
                disabled={toggleMutation.isPending}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${healthConfig.color}`} />
              <span className="text-sm font-medium">{healthConfig.label}</span>
            </div>
          </div>

          {/* Connected Institutions */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Connected Schools</span>
            <span className="text-sm font-medium">
              {stats?.enabledCount || 0} / {stats?.connectedCount || 0}
            </span>
          </div>

          {/* Supported Countries */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Countries</span>
            <div className="flex gap-1">
              {integration.supported_countries.slice(0, 4).map((country) => (
                <Badge key={country} variant="outline" className="text-xs">
                  {country}
                </Badge>
              ))}
              {integration.supported_countries.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{integration.supported_countries.length - 4}
                </Badge>
              )}
            </div>
          </div>

          {/* Last Health Check */}
          {integration.last_health_check && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Check</span>
              <span className="text-xs text-muted-foreground">
                {new Date(integration.last_health_check).toLocaleString()}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setConfigDialogOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/platform/integration-health?bank=${integration.bank_code}`}>
                <Activity className="mr-2 h-4 w-4" />
                Health
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure {integration.bank_name}</DialogTitle>
            <DialogDescription>
              Update API credentials and webhook settings. Credentials are encrypted at rest.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Environment */}
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={environment} onValueChange={(v) => setEnvironment(v as 'sandbox' | 'production')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                  <SelectItem value="production">Production (Live)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* API Credentials based on provider type */}
            {integration.provider_type === 'mobile_money' && integration.bank_code === 'mpesa' && (
              <>
                <div className="space-y-2">
                  <Label>Consumer Key</Label>
                  <Input
                    type="password"
                    placeholder="Enter consumer key"
                    value={credentials.api_key}
                    onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Consumer Secret</Label>
                  <Input
                    type="password"
                    placeholder="Enter consumer secret"
                    value={credentials.api_secret}
                    onChange={(e) => setCredentials({ ...credentials, api_secret: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shortcode</Label>
                  <Input
                    placeholder="e.g., 174379"
                    value={credentials.shortcode}
                    onChange={(e) => setCredentials({ ...credentials, shortcode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passkey</Label>
                  <Input
                    type="password"
                    placeholder="Enter passkey"
                    value={credentials.passkey}
                    onChange={(e) => setCredentials({ ...credentials, passkey: e.target.value })}
                  />
                </div>
              </>
            )}

            {integration.provider_type === 'bank_api' && (
              <>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="Enter API key"
                    value={credentials.api_key}
                    onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    placeholder="Enter API secret"
                    value={credentials.api_secret}
                    onChange={(e) => setCredentials({ ...credentials, api_secret: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Base URL</Label>
                  <Input
                    placeholder="https://api.bank.com/v1"
                    value={integration.api_base_url || ''}
                    disabled
                  />
                </div>
              </>
            )}

            {/* Security Notice */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <div className="flex gap-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Security Notice</p>
                  <p className="text-yellow-700">
                    Credentials are encrypted and stored securely. They are never exposed to schools.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function BankIntegrations() {
  const { data: integrations, isLoading } = useBankIntegrations();

  const activeIntegrations = integrations?.filter((i) => i.is_active) || [];
  const inactiveIntegrations = integrations?.filter((i) => !i.is_active) || [];

  return (
    <DashboardLayout
      title="Bank Integrations"
      subtitle="Manage platform-level bank and payment gateway integrations"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{integrations?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Integrations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeIntegrations.length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {integrations?.filter((i) => i.health_status === 'healthy').length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Healthy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Globe className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {integrations?.filter((i) => i.environment === 'production').length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Production</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Integrations */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Active Integrations</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeIntegrations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No active integrations. Enable a bank below to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeIntegrations.map((integration) => (
                <BankIntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          )}
        </div>

        {/* Inactive Integrations */}
        {inactiveIntegrations.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-muted-foreground">Available Integrations</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveIntegrations.map((integration) => (
                <BankIntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

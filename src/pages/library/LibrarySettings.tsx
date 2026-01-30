import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsBackHeader } from '@/components/settings/SettingsBackHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLibrarySettings } from '@/hooks/useLibrarySettings';
import { usePermissions } from '@/hooks/usePermissions';
import { BookOpen, DollarSign, RotateCcw } from 'lucide-react';

export default function LibrarySettings() {
  const { settings, isLoading, saveSettings } = useLibrarySettings();
  const { can } = usePermissions();
  const canEdit = can('library', 'approve');

  const [formData, setFormData] = useState({
    max_books_per_student: 3,
    loan_period_days: 14,
    overdue_penalty_per_day: 10,
    lost_book_penalty: 500,
    damaged_book_penalty: 200,
    renewal_allowed: true,
    max_renewals: 1,
    grace_period_days: 0,
    currency: 'KES',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        max_books_per_student: settings.max_books_per_student,
        loan_period_days: settings.loan_period_days,
        overdue_penalty_per_day: settings.overdue_penalty_per_day,
        lost_book_penalty: settings.lost_book_penalty,
        damaged_book_penalty: settings.damaged_book_penalty,
        renewal_allowed: settings.renewal_allowed,
        max_renewals: settings.max_renewals,
        grace_period_days: settings.grace_period_days,
        currency: settings.currency,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings.mutateAsync(formData);
  };

  return (
    <DashboardLayout title="Library Settings">
      <div className="space-y-6 max-w-3xl">
        <SettingsBackHeader 
          title="Library Settings" 
          description="Configure borrowing rules and penalties" 
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Borrowing Limits
            </CardTitle>
            <CardDescription>Set limits for book borrowing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="max-books">Max Books Per Student</Label>
                <Input
                  id="max-books"
                  type="number"
                  min={1}
                  max={20}
                  value={formData.max_books_per_student}
                  onChange={(e) =>
                    setFormData({ ...formData, max_books_per_student: parseInt(e.target.value) || 1 })
                  }
                  disabled={!canEdit}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum books a student can borrow at once
                </p>
              </div>
              <div>
                <Label htmlFor="loan-period">Loan Period (Days)</Label>
                <Input
                  id="loan-period"
                  type="number"
                  min={1}
                  max={90}
                  value={formData.loan_period_days}
                  onChange={(e) =>
                    setFormData({ ...formData, loan_period_days: parseInt(e.target.value) || 14 })
                  }
                  disabled={!canEdit}
                />
                <p className="text-xs text-muted-foreground mt-1">Default borrowing period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Renewals
            </CardTitle>
            <CardDescription>Configure loan renewal options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Renewals</Label>
                <p className="text-sm text-muted-foreground">
                  Students can extend their loan period
                </p>
              </div>
              <Switch
                checked={formData.renewal_allowed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, renewal_allowed: checked })
                }
                disabled={!canEdit}
              />
            </div>

            {formData.renewal_allowed && (
              <div>
                <Label htmlFor="max-renewals">Maximum Renewals</Label>
                <Input
                  id="max-renewals"
                  type="number"
                  min={1}
                  max={5}
                  value={formData.max_renewals}
                  onChange={(e) =>
                    setFormData({ ...formData, max_renewals: parseInt(e.target.value) || 1 })
                  }
                  disabled={!canEdit}
                  className="w-32"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Penalties
            </CardTitle>
            <CardDescription>Configure fine amounts for late returns and damages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="grace-period">Grace Period (Days)</Label>
              <Input
                id="grace-period"
                type="number"
                min={0}
                max={14}
                value={formData.grace_period_days}
                onChange={(e) =>
                  setFormData({ ...formData, grace_period_days: parseInt(e.target.value) || 0 })
                }
                disabled={!canEdit}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Days after due date before penalties apply
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="overdue-penalty">Overdue Penalty/Day ({formData.currency})</Label>
                <Input
                  id="overdue-penalty"
                  type="number"
                  min={0}
                  value={formData.overdue_penalty_per_day}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      overdue_penalty_per_day: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="lost-penalty">Lost Book Penalty ({formData.currency})</Label>
                <Input
                  id="lost-penalty"
                  type="number"
                  min={0}
                  value={formData.lost_book_penalty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lost_book_penalty: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="damaged-penalty">Damaged Book Penalty ({formData.currency})</Label>
                <Input
                  id="damaged-penalty"
                  type="number"
                  min={0}
                  value={formData.damaged_book_penalty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      damaged_book_penalty: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!canEdit}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saveSettings.isPending}>
              {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

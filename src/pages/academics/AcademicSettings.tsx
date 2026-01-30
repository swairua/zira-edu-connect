import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface AcademicSettingsData {
  default_grading_scale: string;
  pass_threshold: number;
  show_rank_on_report: boolean;
  show_teacher_comments: boolean;
  allow_grade_editing: boolean;
  report_card_format: string;
}

export default function AcademicSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AcademicSettingsData>({
    default_grading_scale: 'percentage',
    pass_threshold: 40,
    show_rank_on_report: true,
    show_teacher_comments: true,
    allow_grade_editing: false,
    report_card_format: 'standard',
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Settings saved",
        description: "Academic settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Academic Settings" subtitle="Configure grading and report card settings">
        <SettingsBackHeader title="Academic Settings" description="Configure grading and report card settings" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Academic Settings" subtitle="Configure grading and report card settings">
      <SettingsBackHeader title="Academic Settings" description="Configure grading and report card settings" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Grading Configuration</CardTitle>
            <CardDescription>Set default grading scales and pass thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grading_scale">Default Grading Scale</Label>
                <Select
                  value={settings.default_grading_scale}
                  onValueChange={(value) => setSettings({ ...settings, default_grading_scale: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (0-100)</SelectItem>
                    <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                    <SelectItem value="cbc">CBC Standards</SelectItem>
                    <SelectItem value="points">Points System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass_threshold">Pass Threshold (%)</Label>
                <Input
                  id="pass_threshold"
                  type="number"
                  min={0}
                  max={100}
                  value={settings.pass_threshold}
                  onChange={(e) => setSettings({ ...settings, pass_threshold: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Grade Editing</Label>
                <p className="text-sm text-muted-foreground">Allow teachers to edit grades after submission</p>
              </div>
              <Switch
                checked={settings.allow_grade_editing}
                onCheckedChange={(checked) => setSettings({ ...settings, allow_grade_editing: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Card Settings</CardTitle>
            <CardDescription>Configure how report cards are generated and displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report_format">Report Card Format</Label>
              <Select
                value={settings.report_card_format}
                onValueChange={(value) => setSettings({ ...settings, report_card_format: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Format</SelectItem>
                  <SelectItem value="detailed">Detailed with Analytics</SelectItem>
                  <SelectItem value="cbc">CBC Competency Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Class Rank</Label>
                <p className="text-sm text-muted-foreground">Display student ranking on report cards</p>
              </div>
              <Switch
                checked={settings.show_rank_on_report}
                onCheckedChange={(checked) => setSettings({ ...settings, show_rank_on_report: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Teacher Comments</Label>
                <p className="text-sm text-muted-foreground">Include teacher remarks on report cards</p>
              </div>
              <Switch
                checked={settings.show_teacher_comments}
                onCheckedChange={(checked) => setSettings({ ...settings, show_teacher_comments: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

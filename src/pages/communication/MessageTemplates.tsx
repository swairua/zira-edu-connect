import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsBackHeader } from '@/components/settings/SettingsBackHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, MoreHorizontal, Pencil, Trash2, FileText, Copy, Check, Sparkles, Download } from 'lucide-react';
import { useMessageTemplates, type MessageTemplate } from '@/hooks/useCommunication';
import { MessageTemplateDialog } from '@/components/communication/MessageTemplateDialog';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample templates following best practices for educational institutions
const SAMPLE_TEMPLATES = [
  {
    name: 'Fee Reminder - Friendly',
    category: 'fee_reminder',
    content: 'Dear {parent_name}, this is a friendly reminder that {student_name} has an outstanding balance of {balance}. Please make payment before {due_date}. Thank you - {school_name}',
    variables: ['{parent_name}', '{student_name}', '{balance}', '{due_date}', '{school_name}'],
  },
  {
    name: 'Fee Reminder - Urgent',
    category: 'fee_reminder',
    content: 'URGENT: Dear {parent_name}, {student_name} ({class_name}) has an overdue balance of {balance}. Kindly settle this immediately to avoid service interruption. Contact accounts office for queries. - {school_name}',
    variables: ['{parent_name}', '{student_name}', '{class_name}', '{balance}', '{school_name}'],
  },
  {
    name: 'Payment Received',
    category: 'payment_confirmation',
    content: 'Dear {parent_name}, we confirm receipt of {amount} for {student_name}. New balance: {balance}. Thank you for your prompt payment. - {school_name}',
    variables: ['{parent_name}', '{amount}', '{student_name}', '{balance}', '{school_name}'],
  },
  {
    name: 'Term Opening Notice',
    category: 'announcement',
    content: 'Dear {parent_name}, school reopens on {due_date}. Please ensure {student_name} reports with all required materials. Welcome back! - {school_name}',
    variables: ['{parent_name}', '{due_date}', '{student_name}', '{school_name}'],
  },
  {
    name: 'Meeting Invitation',
    category: 'general',
    content: 'Dear {parent_name}, you are invited to a parent-teacher meeting for {class_name} on {due_date}. Your attendance is important for {student_name}\'s progress. - {school_name}',
    variables: ['{parent_name}', '{class_name}', '{due_date}', '{student_name}', '{school_name}'],
  },
  {
    name: 'Exam Results Ready',
    category: 'announcement',
    content: 'Dear {parent_name}, exam results for {student_name} ({class_name}) are now available. Log in to the parent portal to view the report card. - {school_name}',
    variables: ['{parent_name}', '{student_name}', '{class_name}', '{school_name}'],
  },
  {
    name: 'Absence Notification',
    category: 'general',
    content: 'Dear {parent_name}, {student_name} was absent from school today. Please inform us of the reason. Consistent attendance is vital for learning. - {school_name}',
    variables: ['{parent_name}', '{student_name}', '{school_name}'],
  },
  {
    name: 'Fee Structure Update',
    category: 'fee_reminder',
    content: 'Dear {parent_name}, the fee structure for next term has been updated. Total fees: {amount}. Early payment discount available until {due_date}. - {school_name}',
    variables: ['{parent_name}', '{amount}', '{due_date}', '{school_name}'],
  },
];

export default function MessageTemplates() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<MessageTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addingSample, setAddingSample] = useState<string | null>(null);
  
  const { templates, isLoading, deleteTemplate, updateTemplate, createTemplate } = useMessageTemplates();

  // Check which sample templates are already added (by name match)
  const existingTemplateNames = new Set(templates.map(t => t.name.toLowerCase()));
  
  const handleAddSampleTemplate = async (sample: typeof SAMPLE_TEMPLATES[0]) => {
    setAddingSample(sample.name);
    try {
      await createTemplate.mutateAsync({
        name: sample.name,
        category: sample.category,
        content: sample.content,
        variables: sample.variables,
      });
      toast.success(`"${sample.name}" template added`);
    } catch (error) {
      toast.error('Failed to add template');
    } finally {
      setAddingSample(null);
    }
  };

  const handleAddAllSamples = async () => {
    const templatesToAdd = SAMPLE_TEMPLATES.filter(
      s => !existingTemplateNames.has(s.name.toLowerCase())
    );
    
    if (templatesToAdd.length === 0) {
      toast.info('All sample templates are already added');
      return;
    }

    setAddingSample('all');
    try {
      for (const sample of templatesToAdd) {
        await createTemplate.mutateAsync({
          name: sample.name,
          category: sample.category,
          content: sample.content,
          variables: sample.variables,
        });
      }
      toast.success(`Added ${templatesToAdd.length} templates`);
    } catch (error) {
      toast.error('Failed to add some templates');
    } finally {
      setAddingSample(null);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTemplate.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Template copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      fee_reminder: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      payment_confirmation: 'bg-green-500/10 text-green-600 border-green-500/20',
      general: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      announcement: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    };
    return (
      <Badge className={colors[category] || ''} variant="outline">
        {category.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Message Templates">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SettingsBackHeader 
            title="Message Templates" 
            description="Create reusable SMS templates for common messages" 
          />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {templates.filter(t => t.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(templates.map(t => t.category)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="my-templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-templates">My Templates</TabsTrigger>
            <TabsTrigger value="sample-templates">
              <Sparkles className="mr-2 h-4 w-4" />
              Sample Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-templates">
            {/* Templates Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="max-w-[300px]">Content Preview</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : templates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                          <p className="text-muted-foreground">No templates yet</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Start from scratch or use our sample templates
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => setDialogOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Create New
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div className="font-medium">{template.name}</div>
                            {template.variables.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{getCategoryBadge(template.category)}</TableCell>
                          <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                            {template.content}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={template.is_active}
                              onCheckedChange={(checked) => 
                                updateTemplate.mutate({ id: template.id, is_active: checked })
                              }
                              disabled={updateTemplate.isPending}
                            />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(template.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopy(template.content, template.id)}
                                title="Copy"
                              >
                                {copiedId === template.id ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditTemplate(template)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setDeleteId(template.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sample-templates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Sample Templates
                    </CardTitle>
                    <CardDescription>
                      Pre-built templates following best practices. Add them to your collection and customize as needed.
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleAddAllSamples}
                    disabled={addingSample === 'all'}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {addingSample === 'all' ? 'Adding...' : 'Add All Templates'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {SAMPLE_TEMPLATES.map((sample) => {
                    const isAdded = existingTemplateNames.has(sample.name.toLowerCase());
                    return (
                      <Card key={sample.name} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-sm font-medium">{sample.name}</CardTitle>
                              <div className="mt-1">{getCategoryBadge(sample.category)}</div>
                            </div>
                            {isAdded ? (
                              <Badge variant="secondary" className="shrink-0">
                                <Check className="mr-1 h-3 w-3" />
                                Added
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddSampleTemplate(sample)}
                                disabled={addingSample === sample.name}
                              >
                                {addingSample === sample.name ? 'Adding...' : 'Add'}
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {sample.content}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {sample.variables.map((v) => (
                              <Badge key={v} variant="outline" className="font-mono text-xs">
                                {v}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Variable Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Available Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                '{student_name}',
                '{parent_name}',
                '{amount}',
                '{balance}',
                '{due_date}',
                '{class_name}',
                '{school_name}',
              ].map((variable) => (
                <Badge key={variable} variant="secondary" className="font-mono text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use these variables in your templates. They will be replaced with actual values when sending.
            </p>
          </CardContent>
        </Card>
      </div>

      <MessageTemplateDialog 
        open={dialogOpen || !!editTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setEditTemplate(null);
          }
        }}
        template={editTemplate}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

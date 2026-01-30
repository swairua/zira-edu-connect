import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInstitutionUsers } from '@/hooks/useInstitutionUsers';
import { ArrowLeft, Loader2, Mail, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface InviteUserFormProps {
  institutionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const INSTITUTION_ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: 'institution_owner', label: 'Institution Owner', description: 'Full control over the institution' },
  { value: 'institution_admin', label: 'School Admin', description: 'Manage school operations' },
  { value: 'finance_officer', label: 'Finance Officer', description: 'Handle fee collection and finances' },
  { value: 'academic_director', label: 'Academic Director', description: 'Manage curriculum and academics' },
  { value: 'teacher', label: 'Teacher', description: 'Access teaching and grading features' },
  { value: 'ict_admin', label: 'ICT Admin', description: 'Manage technical aspects' },
  { value: 'hr_manager', label: 'HR Manager', description: 'Handle staff management' },
  { value: 'accountant', label: 'Accountant', description: 'Financial reporting and accounting' },
];

export function InviteUserForm({ institutionId, onSuccess, onCancel }: InviteUserFormProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<AppRole>('institution_admin');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  const { createUser, isCreating } = useInstitutionUsers(institutionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createUser(
      {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        institutionId,
        sendWelcomeEmail,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  const isValid = email.trim() && firstName.trim() && lastName.trim() && role;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b">
        <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">Add New User</h3>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="john.doe@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {INSTITUTION_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  <div className="flex flex-col">
                    <span>{r.label}</span>
                    <span className="text-xs text-muted-foreground">{r.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="sendEmail" className="text-base">Send Welcome Email</Label>
            <p className="text-sm text-muted-foreground">
              Send login credentials to the user's email
            </p>
          </div>
          <Switch
            id="sendEmail"
            checked={sendWelcomeEmail}
            onCheckedChange={setSendWelcomeEmail}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || isCreating} className="flex-1">
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create User'
          )}
        </Button>
      </div>
    </form>
  );
}

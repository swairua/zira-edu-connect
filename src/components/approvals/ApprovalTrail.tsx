import { format } from 'date-fns';
import { CheckCircle, Clock, XCircle, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ApprovalStep {
  label: string;
  status: 'completed' | 'pending' | 'current' | 'rejected' | 'skipped';
  user?: string;
  timestamp?: string;
  role?: string;
}

interface ApprovalTrailProps {
  steps: ApprovalStep[];
  className?: string;
  compact?: boolean;
}

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    dotColor: 'bg-green-500',
  },
  pending: {
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    dotColor: 'bg-muted-foreground/40',
  },
  current: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    dotColor: 'bg-orange-500',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    dotColor: 'bg-red-500',
  },
  skipped: {
    icon: Clock,
    color: 'text-muted-foreground/50',
    bgColor: 'bg-muted/50',
    dotColor: 'bg-muted-foreground/20',
  },
};

export function ApprovalTrail({ steps, className, compact = false }: ApprovalTrailProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {steps.map((step, index) => {
          const config = STATUS_CONFIG[step.status];
          return (
            <div key={index} className="flex items-center">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  config.dotColor
                )}
                title={`${step.label}: ${step.status}`}
              />
              {index < steps.length - 1 && (
                <div className="h-px w-3 bg-border" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {steps.map((step, index) => {
        const config = STATUS_CONFIG[step.status];
        const Icon = config.icon;
        
        return (
          <div key={index} className="flex items-start gap-3">
            <div className={cn('flex-shrink-0 mt-0.5')}>
              <div className={cn('h-2 w-2 rounded-full', config.dotColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={cn('text-sm font-medium', config.color)}>
                  {step.label}
                </span>
                {step.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(step.timestamp), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              {(step.user || step.role) && (
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  {step.user && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {step.user}
                    </span>
                  )}
                  {step.role && !step.user && (
                    <span>Awaiting: {step.role}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper to build voucher approval steps based on approval levels
export function buildVoucherApprovalSteps(
  voucher: {
    status: string;
    created_at: string;
    checked_at?: string | null;
    checked_by?: string | null;
    approved_at?: string | null;
    approved_by?: string | null;
    secondary_approved_at?: string | null;
    secondary_approved_by?: string | null;
    paid_at?: string | null;
    paid_by?: string | null;
  },
  approvalLevels: 1 | 2 | 3 = 2
): ApprovalStep[] {
  const steps: ApprovalStep[] = [];
  
  // Step 1: Created
  steps.push({
    label: 'Created',
    status: 'completed',
    timestamp: voucher.created_at,
  });
  
  // Step 2: Checked (if levels >= 2)
  if (approvalLevels >= 2) {
    if (voucher.checked_at) {
      steps.push({
        label: 'Checked',
        status: 'completed',
        timestamp: voucher.checked_at,
      });
    } else if (voucher.status === 'pending_check') {
      steps.push({
        label: 'Pending Check',
        status: 'current',
        role: 'Finance Officer / Accountant',
      });
    } else if (voucher.status === 'draft') {
      steps.push({
        label: 'Check',
        status: 'pending',
        role: 'Finance Officer',
      });
    }
  }
  
  // Step 3: Approved (Level 1)
  if (voucher.approved_at) {
    steps.push({
      label: approvalLevels === 3 ? 'Approved (Level 1)' : 'Approved',
      status: 'completed',
      timestamp: voucher.approved_at,
    });
  } else if (voucher.status === 'pending_approval') {
    steps.push({
      label: approvalLevels === 3 ? 'Pending Approval (Level 1)' : 'Pending Approval',
      status: 'current',
      role: 'Bursar / Admin',
    });
  } else if (!voucher.approved_at && voucher.status !== 'rejected' && voucher.status !== 'cancelled') {
    if (voucher.checked_at || approvalLevels === 1) {
      steps.push({
        label: 'Approval',
        status: 'pending',
        role: 'Bursar',
      });
    }
  }
  
  // Step 4: Secondary Approval (if levels === 3)
  if (approvalLevels === 3) {
    if (voucher.secondary_approved_at) {
      steps.push({
        label: 'Approved (Level 2)',
        status: 'completed',
        timestamp: voucher.secondary_approved_at,
      });
    } else if (voucher.status === 'pending_secondary_approval') {
      steps.push({
        label: 'Pending Final Approval',
        status: 'current',
        role: 'Principal / Owner',
      });
    } else if (voucher.approved_at && voucher.status !== 'rejected' && voucher.status !== 'cancelled' && voucher.status !== 'paid') {
      steps.push({
        label: 'Final Approval',
        status: 'pending',
        role: 'Principal',
      });
    }
  }
  
  // Step 5: Paid
  if (voucher.paid_at) {
    steps.push({
      label: 'Paid',
      status: 'completed',
      timestamp: voucher.paid_at,
    });
  } else if (
    voucher.status === 'approved' || 
    (approvalLevels === 3 && voucher.secondary_approved_at)
  ) {
    steps.push({
      label: 'Payment',
      status: 'current',
      role: 'Bursar',
    });
  }
  
  // Handle rejected status
  if (voucher.status === 'rejected') {
    steps.push({
      label: 'Rejected',
      status: 'rejected',
    });
  }
  
  return steps;
}

// Helper to build adjustment approval steps
export function buildAdjustmentApprovalSteps(
  adjustment: {
    status: string;
    created_at: string;
    approved_at?: string | null;
    approved_by?: string | null;
    secondary_approved_at?: string | null;
    secondary_approved_by?: string | null;
    requires_secondary_approval?: boolean;
  }
): ApprovalStep[] {
  const steps: ApprovalStep[] = [];
  
  // Step 1: Created/Requested
  steps.push({
    label: 'Requested',
    status: 'completed',
    timestamp: adjustment.created_at,
  });
  
  // Step 2: Primary Approval
  if (adjustment.approved_at) {
    steps.push({
      label: adjustment.requires_secondary_approval ? 'Approved (Level 1)' : 'Approved',
      status: 'completed',
      timestamp: adjustment.approved_at,
    });
  } else if (adjustment.status === 'pending') {
    steps.push({
      label: 'Pending Approval',
      status: 'current',
      role: 'Finance Admin',
    });
  }
  
  // Step 3: Secondary Approval (if required)
  if (adjustment.requires_secondary_approval) {
    if (adjustment.secondary_approved_at) {
      steps.push({
        label: 'Final Approval',
        status: 'completed',
        timestamp: adjustment.secondary_approved_at,
      });
    } else if (adjustment.approved_at && adjustment.status !== 'rejected') {
      steps.push({
        label: 'Pending Final Approval',
        status: 'current',
        role: 'Senior Admin',
      });
    }
  }
  
  // Handle rejected/cancelled
  if (adjustment.status === 'rejected') {
    steps.push({
      label: 'Rejected',
      status: 'rejected',
    });
  }
  
  return steps;
}

// Helper to build leave approval steps
export function buildLeaveApprovalSteps(
  request: {
    status: string;
    created_at: string;
    approved_at?: string | null;
    approved_by?: string | null;
  }
): ApprovalStep[] {
  const steps: ApprovalStep[] = [];
  
  steps.push({
    label: 'Submitted',
    status: 'completed',
    timestamp: request.created_at,
  });
  
  if (request.approved_at) {
    steps.push({
      label: 'Approved',
      status: 'completed',
      timestamp: request.approved_at,
    });
  } else if (request.status === 'pending') {
    steps.push({
      label: 'Pending Approval',
      status: 'current',
      role: 'Line Manager / HR',
    });
  } else if (request.status === 'rejected') {
    steps.push({
      label: 'Rejected',
      status: 'rejected',
    });
  }
  
  return steps;
}

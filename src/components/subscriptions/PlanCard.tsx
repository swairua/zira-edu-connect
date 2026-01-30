import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Pencil, Power, PowerOff, Building2 } from 'lucide-react';
import { SubscriptionPlan, useInstitutionCountByPlan } from '@/hooks/useSubscriptionPlans';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onToggleActive: (plan: SubscriptionPlan) => void;
  isHighlighted?: boolean;
}

const formatPrice = (price: number, showCurrency = true) => {
  if (price === 0) return 'Custom';
  return showCurrency ? `KES ${price.toLocaleString()}` : price.toLocaleString();
};

const calculateMonthlyEquivalent = (yearlyPrice: number) => {
  return Math.round(yearlyPrice / 12);
};

export function PlanCard({ plan, onEdit, onToggleActive, isHighlighted = false }: PlanCardProps) {
  const { data: institutionCount = 0 } = useInstitutionCountByPlan(plan.id);

  return (
    <Card
      variant={isHighlighted ? 'interactive' : 'elevated'}
      className={`relative ${isHighlighted ? 'border-primary/50 ring-2 ring-primary/20' : ''} ${!plan.is_active ? 'opacity-60' : ''}`}
    >
      {!plan.is_active && (
        <Badge variant="secondary" className="absolute -top-2 right-4">
          Inactive
        </Badge>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">{plan.name}</CardTitle>
          {isHighlighted && (
            <Badge variant="default" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Popular
            </Badge>
          )}
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold">
              {formatPrice(plan.price_yearly)}
            </span>
            {plan.price_yearly > 0 && (
              <span className="text-sm text-muted-foreground">/year</span>
            )}
          </div>
          {plan.price_yearly > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              ~KES {calculateMonthlyEquivalent(plan.price_yearly).toLocaleString()}/month equivalent
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">
            {plan.max_students === -1 ? 'Unlimited' : `Up to ${plan.max_students.toLocaleString()}`} students
          </p>
          <p className="text-sm font-medium">
            {plan.max_staff === -1 ? 'Unlimited' : `Up to ${plan.max_staff.toLocaleString()}`} staff
          </p>
        </div>

        {institutionCount > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{institutionCount} institution{institutionCount !== 1 ? 's' : ''} using this plan</span>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Features
          </p>
          <ul className="space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={() => onEdit(plan)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant={plan.is_active ? 'ghost' : 'default'}
            size="sm"
            className="gap-1"
            onClick={() => onToggleActive(plan)}
          >
            {plan.is_active ? (
              <>
                <PowerOff className="h-3.5 w-3.5" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="h-3.5 w-3.5" />
                Activate
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

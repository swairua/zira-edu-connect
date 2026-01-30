import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Send } from 'lucide-react';
import { format, differenceInBusinessDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { MyLeaveBalance, SubmitLeaveRequest } from '@/hooks/useMyLeave';

interface LeaveType {
  id: string;
  name: string;
  days_allowed: number;
  requires_approval: boolean;
}

interface LeaveRequestFormProps {
  leaveTypes: LeaveType[];
  balances: MyLeaveBalance[];
  onSubmit: (request: SubmitLeaveRequest) => void;
  isPending: boolean;
}

export function LeaveRequestForm({
  leaveTypes,
  balances,
  onSubmit,
  isPending,
}: LeaveRequestFormProps) {
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [halfDay, setHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'morning' | 'afternoon'>('morning');
  const [reason, setReason] = useState('');

  const selectedBalance = useMemo(() => {
    return balances.find(b => b.leave_type_id === leaveTypeId);
  }, [balances, leaveTypeId]);

  const remainingDays = useMemo(() => {
    if (!selectedBalance) return 0;
    const total = selectedBalance.entitled_days + selectedBalance.carried_days;
    return total - selectedBalance.used_days;
  }, [selectedBalance]);

  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    if (halfDay) return 0.5;
    // Add 1 because differenceInBusinessDays is exclusive
    return differenceInBusinessDays(addDays(endDate, 1), startDate);
  }, [startDate, endDate, halfDay]);

  const isValid = leaveTypeId && startDate && endDate && calculatedDays > 0 && calculatedDays <= remainingDays;

  const handleSubmit = () => {
    if (!isValid || !startDate || !endDate) return;
    
    onSubmit({
      leave_type_id: leaveTypeId,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      days: calculatedDays,
      half_day: halfDay,
      half_day_period: halfDay ? halfDayPeriod : undefined,
      reason: reason || undefined,
    });

    // Reset form
    setLeaveTypeId('');
    setStartDate(undefined);
    setEndDate(undefined);
    setHalfDay(false);
    setReason('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Leave</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="leaveType">Leave Type</Label>
          <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              {leaveTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedBalance && (
            <p className="text-sm text-muted-foreground">
              Available: {remainingDays} days
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    if (!endDate || (date && endDate < date)) {
                      setEndDate(date);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < (startDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="halfDay"
            checked={halfDay}
            onCheckedChange={(checked) => setHalfDay(checked === true)}
          />
          <Label htmlFor="halfDay" className="text-sm font-normal">
            Half day only
          </Label>
          {halfDay && (
            <Select
              value={halfDayPeriod}
              onValueChange={(v) => setHalfDayPeriod(v as 'morning' | 'afternoon')}
            >
              <SelectTrigger className="w-32 ml-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {calculatedDays > 0 && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">
              Duration: {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
            </p>
            {calculatedDays > remainingDays && (
              <p className="text-sm text-destructive">
                Exceeds available balance ({remainingDays} days)
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a reason for your leave request..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || isPending}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
      </CardContent>
    </Card>
  );
}

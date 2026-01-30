import { cn } from '@/lib/utils';
import type { TimeSlot, TimetableEntry } from '@/types/timetable';
import { Plus } from 'lucide-react';

interface Day {
  value: number;
  label: string;
}

interface TimetableGridProps {
  days: Day[];
  timeSlots: TimeSlot[];
  entries: TimetableEntry[];
  onCellClick: (dayOfWeek: number, timeSlotId: string) => void;
}

export function TimetableGrid({ days, timeSlots, entries, onCellClick }: TimetableGridProps) {
  const getEntry = (dayOfWeek: number, timeSlotId: string) => {
    return entries.find(e => e.day_of_week === dayOfWeek && e.time_slot_id === timeSlotId);
  };

  // Check if a slot is blocked by a double period from the previous slot
  const isBlockedByDoublePeriod = (dayOfWeek: number, timeSlotId: string): boolean => {
    const slotIndex = timeSlots.findIndex(s => s.id === timeSlotId);
    if (slotIndex <= 0) return false;
    
    const previousSlot = timeSlots[slotIndex - 1];
    const previousEntry = getEntry(dayOfWeek, previousSlot.id);
    return previousEntry?.is_double_period ?? false;
  };

  const getTeacherName = (entry: TimetableEntry): string => {
    if (entry.teacher) {
      return `${entry.teacher.first_name} ${entry.teacher.last_name}`;
    }
    return '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border bg-muted/50 p-2 text-left text-sm font-medium w-24">
              Time
            </th>
            {days.map((day) => (
              <th key={day.value} className="border bg-muted/50 p-2 text-center text-sm font-medium min-w-[140px]">
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot, slotIndex) => (
            <tr key={slot.id}>
              <td className="border bg-muted/30 p-2 text-sm">
                <div className="font-medium">{slot.name}</div>
                <div className="text-xs text-muted-foreground">
                  {slot.start_time} - {slot.end_time}
                </div>
              </td>
              {days.map((day) => {
                const entry = getEntry(day.value, slot.id);
                const blocked = isBlockedByDoublePeriod(day.value, slot.id);
                
                // If this slot is blocked by a double period, show continuation indicator
                if (blocked) {
                  return (
                    <td
                      key={`${day.value}-${slot.id}`}
                      className="border p-1 bg-primary/5"
                    >
                      <div className="p-2 rounded bg-primary/10 border border-primary/20 border-t-0 border-dashed min-h-[60px] flex items-center justify-center">
                        <span className="text-xs text-muted-foreground italic">
                          (continued)
                        </span>
                      </div>
                    </td>
                  );
                }

                return (
                  <td
                    key={`${day.value}-${slot.id}`}
                    className={cn(
                      'border p-1 cursor-pointer transition-colors hover:bg-muted/50',
                      entry ? 'bg-primary/5' : 'bg-background'
                    )}
                    onClick={() => onCellClick(day.value, slot.id)}
                  >
                    {entry ? (
                      <div className={cn(
                        "p-2 rounded bg-primary/10 border border-primary/20",
                        entry.is_double_period && "min-h-[120px]",
                        !entry.is_double_period && "min-h-[60px]"
                      )}>
                        <div className="font-medium text-sm truncate">
                          {entry.subject?.name || 'Subject'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {getTeacherName(entry)}
                        </div>
                        {entry.room?.name && (
                          <div className="text-xs text-muted-foreground truncate">
                            {entry.room.name}
                          </div>
                        )}
                        {entry.is_double_period && (
                          <div className="mt-1">
                            <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded">
                              Double Period
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center min-h-[60px] text-muted-foreground/50 hover:text-muted-foreground">
                        <Plus className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

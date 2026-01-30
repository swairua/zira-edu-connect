import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Smile, Meh, Frown } from 'lucide-react';
import { DiaryEntry, Mood, EntryType } from '@/types/diary';
import { format } from 'date-fns';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
}

const MOOD_OPTIONS: { value: Mood; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'happy', label: 'Happy', icon: Smile },
  { value: 'excited', label: 'Excited', icon: Smile },
  { value: 'okay', label: 'Okay', icon: Meh },
  { value: 'tired', label: 'Tired', icon: Meh },
  { value: 'upset', label: 'Upset', icon: Frown },
];

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: 'daily_report', label: 'Daily Report' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'concern', label: 'Concern' },
  { value: 'behavior', label: 'Behavior Note' },
  { value: 'health', label: 'Health Update' },
];

const getMoodIcon = (mood?: Mood) => {
  const option = MOOD_OPTIONS.find(m => m.value === mood);
  if (!option) return null;
  const Icon = option.icon;
  return <Icon className="h-5 w-5" />;
};

const getEntryTypeBadge = (type: EntryType) => {
  const colors: Record<EntryType, string> = {
    daily_report: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    achievement: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    concern: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    behavior: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    health: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };
  return <Badge className={colors[type]}>{ENTRY_TYPES.find(e => e.value === type)?.label}</Badge>;
};

export function DiaryEntryCard({ entry }: DiaryEntryCardProps) {
  return (
    <Card className={entry.is_flagged ? 'border-red-300 dark:border-red-800' : ''}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold">
                {entry.student?.first_name} {entry.student?.last_name}
              </span>
              <Badge variant="outline">{entry.student?.class?.name}</Badge>
              {getEntryTypeBadge(entry.entry_type as EntryType)}
              {entry.is_flagged && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>

            {entry.mood && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                {getMoodIcon(entry.mood as Mood)}
                <span className="capitalize">{entry.mood}</span>
              </div>
            )}

            {entry.teacher_comment && (
              <p className="text-sm mb-2">{entry.teacher_comment}</p>
            )}

            {entry.learning_highlights && (
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Highlights:</strong> {entry.learning_highlights}
              </p>
            )}

            {entry.activities && entry.activities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.activities.map((activity, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {activity}
                  </Badge>
                ))}
              </div>
            )}

            {/* Parent Response */}
            {entry.parent_comment && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Parent's Response:</p>
                <p className="text-sm text-green-800 dark:text-green-200">{entry.parent_comment}</p>
              </div>
            )}

            <div className="mt-3 text-xs text-muted-foreground flex gap-4 flex-wrap">
              <span>{format(new Date(entry.entry_date), 'MMM d, yyyy')}</span>
              {entry.parent_acknowledged_at ? (
                <span className="text-green-600 dark:text-green-400">
                  ✓ Acknowledged on {format(new Date(entry.parent_acknowledged_at), 'MMM d, h:mm a')}
                </span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400">Pending acknowledgment</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

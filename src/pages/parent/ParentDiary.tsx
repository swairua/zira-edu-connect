import { useState } from 'react';
import { ParentLayout } from '@/components/parent/ParentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, AlertTriangle, Smile, Meh, Frown, CheckCircle } from 'lucide-react';
import { useStudentDiaryEntries, useUpdateDiaryEntry } from '@/hooks/useStudentDiary';
import { useParent } from '@/contexts/ParentContext';
import { Mood, EntryType } from '@/types/diary';
import { format } from 'date-fns';

const MOOD_ICONS: Record<Mood, React.ComponentType<{ className?: string }>> = {
  happy: Smile,
  excited: Smile,
  okay: Meh,
  tired: Meh,
  upset: Frown,
};

const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  daily_report: 'Daily Report',
  achievement: 'Achievement',
  concern: 'Concern',
  behavior: 'Behavior Note',
  health: 'Health Update',
};

export default function ParentDiary() {
  const { selectedStudent } = useParent();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const selectedStudentId = selectedStudent?.id;

  const { data: entries = [], isLoading } = useStudentDiaryEntries(selectedStudentId || '');
  const updateEntry = useUpdateDiaryEntry();

  const handleAcknowledge = async (entryId: string) => {
    await updateEntry.mutateAsync({
      id: entryId,
      parent_acknowledged_at: new Date().toISOString(),
      parent_comment: replyText[entryId] || undefined,
    });
    setReplyText(prev => ({ ...prev, [entryId]: '' }));
  };

  const getMoodIcon = (mood?: string) => {
    if (!mood) return null;
    const Icon = MOOD_ICONS[mood as Mood];
    if (!Icon) return null;
    return <Icon className="h-5 w-5" />;
  };

  const getEntryTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      daily_report: 'bg-blue-100 text-blue-800',
      achievement: 'bg-green-100 text-green-800',
      concern: 'bg-red-100 text-red-800',
      behavior: 'bg-yellow-100 text-yellow-800',
      health: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={colors[type] || 'bg-gray-100'}>
        {ENTRY_TYPE_LABELS[type as EntryType] || type}
      </Badge>
    );
  };

  if (!selectedStudentId) {
    return (
      <ParentLayout title="Student Diary">
        <div className="p-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Please select a child to view their diary</p>
            </CardContent>
          </Card>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout title="Student Diary">
      <div className="space-y-4 p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{entries.length}</div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {entries.filter(e => !e.parent_acknowledged_at).length}
              </div>
              <p className="text-sm text-muted-foreground">Needs Response</p>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No diary entries yet</h3>
              <p className="text-muted-foreground">Your child's teacher will share updates here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <Card
                key={entry.id}
                className={`${entry.is_flagged ? 'border-red-300 bg-red-50/50' : ''} ${!entry.parent_acknowledged_at ? 'border-l-4 border-l-primary' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getEntryTypeBadge(entry.entry_type)}
                      {entry.is_flagged && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Needs Attention
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.entry_date), 'EEEE, MMM d, yyyy')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mood */}
                    {entry.mood && (
                      <div className="flex items-center gap-2">
                        {getMoodIcon(entry.mood)}
                        <span className="text-sm capitalize">{entry.mood} today</span>
                      </div>
                    )}

                    {/* Meals */}
                    {entry.meals && Object.values(entry.meals).some(Boolean) && (
                      <div className="text-sm">
                        <strong>Meals:</strong>{' '}
                        {Object.entries(entry.meals)
                          .filter(([_, eaten]) => eaten)
                          .map(([meal]) => meal)
                          .join(', ')}
                      </div>
                    )}

                    {/* Activities */}
                    {entry.activities && entry.activities.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-1">Activities:</div>
                        <div className="flex flex-wrap gap-1">
                          {entry.activities.map((activity, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Learning Highlights */}
                    {entry.learning_highlights && (
                      <div className="text-sm">
                        <strong>Learning Highlights:</strong> {entry.learning_highlights}
                      </div>
                    )}

                    {/* Teacher Comment */}
                    {entry.teacher_comment && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">Teacher's Note:</div>
                        <p className="text-sm">{entry.teacher_comment}</p>
                        {entry.creator && (
                          <p className="text-xs text-muted-foreground mt-2">
                            — {entry.creator.first_name} {entry.creator.last_name}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Parent Comment */}
                    {entry.parent_comment && (
                      <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                        <div className="text-sm font-medium mb-1">Your Response:</div>
                        <p className="text-sm">{entry.parent_comment}</p>
                      </div>
                    )}

                    {/* Acknowledgment Section */}
                    {entry.parent_acknowledged_at ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Acknowledged on {format(new Date(entry.parent_acknowledged_at), 'MMM d, h:mm a')}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2 border-t">
                        <Textarea
                          value={replyText[entry.id] || ''}
                          onChange={(e) => setReplyText(prev => ({
                            ...prev,
                            [entry.id]: e.target.value,
                          }))}
                          placeholder="Add a reply (optional)..."
                          rows={2}
                        />
                        <Button
                          onClick={() => handleAcknowledge(entry.id)}
                          disabled={updateEntry.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {updateEntry.isPending ? 'Acknowledging...' : 'Acknowledge'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}

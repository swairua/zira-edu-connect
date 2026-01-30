import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, BookOpen, Clock, Building } from 'lucide-react';
import { useTimetables } from '@/hooks/useTimetables';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useRooms } from '@/hooks/useRooms';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { TimetableEntry, DayOfWeek } from '@/types/timetable';

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

export default function RoomScheduleView() {
  const { data: timetables, isLoading: loadingTimetables } = useTimetables();
  const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots();
  const { data: rooms, isLoading: loadingRooms } = useRooms();

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>('');

  // Get published timetable
  const publishedTimetable = useMemo(() => {
    if (!timetables) return null;
    if (selectedTimetableId) {
      return timetables.find(t => t.id === selectedTimetableId) || null;
    }
    return timetables.find(t => t.status === 'published') || timetables[0] || null;
  }, [timetables, selectedTimetableId]);

  // Fetch entries for selected room
  const { data: roomEntries, isLoading: loadingEntries } = useQuery({
    queryKey: ['room-schedule', publishedTimetable?.id, selectedRoomId],
    queryFn: async () => {
      if (!publishedTimetable?.id || !selectedRoomId) return [];
      
      const { data, error } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          class:classes(name, level, stream),
          subject:subjects(name, code),
          teacher:staff(first_name, last_name),
          time_slot:time_slots(*)
        `)
        .eq('timetable_id', publishedTimetable.id)
        .eq('room_id', selectedRoomId);

      if (error) throw error;
      return data as TimetableEntry[];
    },
    enabled: !!publishedTimetable?.id && !!selectedRoomId,
  });

  // Filter to lesson slots only
  const lessonSlots = useMemo(() => {
    if (!timeSlots) return [];
    return timeSlots
      .filter(s => s.slot_type === 'lesson' && s.is_active)
      .sort((a, b) => a.sequence_order - b.sequence_order);
  }, [timeSlots]);

  // Filter active rooms
  const activeRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter(r => r.is_active).sort((a, b) => a.name.localeCompare(b.name));
  }, [rooms]);

  // Get entry for specific day and time slot
  const getEntry = (dayOfWeek: DayOfWeek, timeSlotId: string): TimetableEntry | undefined => {
    if (!roomEntries) return undefined;
    return roomEntries.find(
      e => e.day_of_week === dayOfWeek && e.time_slot_id === timeSlotId
    );
  };

  // Calculate utilization
  const utilization = useMemo(() => {
    if (!roomEntries || !lessonSlots) return 0;
    const totalSlots = lessonSlots.length * DAYS.length;
    if (totalSlots === 0) return 0;
    return Math.round((roomEntries.length / totalSlots) * 100);
  }, [roomEntries, lessonSlots]);

  const selectedRoom = activeRooms.find(r => r.id === selectedRoomId);
  const isLoading = loadingTimetables || loadingSlots || loadingRooms;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/timetable">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Room Schedule View</h1>
            <p className="text-sm text-muted-foreground">
              View room utilization and availability
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Room Selector */}
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm font-medium mb-2 block">Select Room</label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a room..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="p-2 text-center text-muted-foreground">Loading...</div>
                  ) : (
                    activeRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                        {room.building && (
                          <span className="text-muted-foreground ml-2">
                            ({room.building})
                          </span>
                        )}
                        {room.capacity && (
                          <span className="text-muted-foreground ml-1">
                            • {room.capacity} seats
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Timetable Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Timetable</label>
              <Select
                value={selectedTimetableId || publishedTimetable?.id || ''}
                onValueChange={setSelectedTimetableId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timetable" />
                </SelectTrigger>
                <SelectContent>
                  {timetables?.map((tt) => (
                    <SelectItem key={tt.id} value={tt.id}>
                      {tt.name} {tt.status === 'published' && '✓'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Info & Schedule */}
      {!selectedRoomId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a room to view its schedule</p>
          </CardContent>
        </Card>
      ) : loadingEntries ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <>
          {/* Room Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{selectedRoom?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedRoom?.building || 'No building'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{selectedRoom?.capacity || '—'}</div>
                    <div className="text-sm text-muted-foreground">Capacity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{roomEntries?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Sessions/Week</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{utilization}%</div>
                    <div className="text-sm text-muted-foreground">Utilization</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Schedule Grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {selectedRoom?.name} Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lessonSlots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No time slots configured. Set up periods first.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-3 text-left font-medium w-24">Time</th>
                        {DAYS.map((day) => (
                          <th key={day.value} className="border p-3 text-center font-medium">
                            {day.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lessonSlots.map((slot) => (
                        <tr key={slot.id} className="hover:bg-muted/30">
                          <td className="border p-3 text-sm bg-muted/20">
                            <div className="font-medium">{slot.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                            </div>
                          </td>
                          {DAYS.map((day) => {
                            const entry = getEntry(day.value, slot.id);
                            return (
                              <td key={day.value} className="border p-2">
                                {entry ? (
                                  <div className="p-2 rounded bg-primary/10 text-sm">
                                    <div className="font-medium truncate">
                                      {entry.class?.name}
                                      {entry.class?.stream && ` (${entry.class.stream})`}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {entry.subject?.name}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                      <Users className="h-3 w-3" />
                                      {entry.teacher?.first_name?.charAt(0)}.{' '}
                                      {entry.teacher?.last_name}
                                    </div>
                                    {entry.is_double_period && (
                                      <Badge variant="secondary" className="mt-1 text-xs">
                                        Double
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-16 flex items-center justify-center text-green-600 text-xs font-medium">
                                    Available
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
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil } from 'lucide-react';

interface AttendanceRecord {
  id?: string;
  staff_id: string;
  status: string;
  check_in?: string;
  check_out?: string;
  notes?: string;
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
    department?: string;
  };
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onUpdateStatus: (staffId: string, status: string) => void;
  onEdit: (record: AttendanceRecord) => void;
  isUpdating?: boolean;
}

const statusColors: Record<string, string> = {
  present: 'bg-green-500/10 text-green-700 border-green-200',
  absent: 'bg-red-500/10 text-red-700 border-red-200',
  late: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  half_day: 'bg-orange-500/10 text-orange-700 border-orange-200',
  on_leave: 'bg-blue-500/10 text-blue-700 border-blue-200',
};

export function AttendanceTable({ records, onUpdateStatus, onEdit, isUpdating }: AttendanceTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No attendance records for this date
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.staff_id}>
                <TableCell className="font-medium">
                  {record.staff?.first_name} {record.staff?.last_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {record.staff?.department || '-'}
                </TableCell>
                <TableCell>
                  <Select
                    value={record.status}
                    onValueChange={(value) => onUpdateStatus(record.staff_id, value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{record.check_in || '-'}</TableCell>
                <TableCell>{record.check_out || '-'}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {record.notes || '-'}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

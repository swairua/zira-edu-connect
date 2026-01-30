import { useParent, LinkedStudent } from '@/contexts/ParentContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StudentSelector() {
  const { linkedStudents, selectedStudent, setSelectedStudent } = useParent();

  if (linkedStudents.length <= 1) {
    return null;
  }

  const getInitials = (student: LinkedStudent) => {
    return `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          {selectedStudent && (
            <>
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedStudent.photo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(selectedStudent)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[100px] truncate text-sm font-medium">
                {selectedStudent.first_name}
              </span>
            </>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {linkedStudents.map((student) => (
          <DropdownMenuItem
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="flex items-center gap-3 py-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={student.photo_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(student)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {student.first_name} {student.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {student.class_name || student.admission_number}
              </p>
            </div>
            {selectedStudent?.id === student.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

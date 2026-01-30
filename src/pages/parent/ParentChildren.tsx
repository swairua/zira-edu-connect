import { useParent } from '@/contexts/ParentContext';
import { ParentLayout } from '@/components/parent/ParentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, GraduationCap, BookOpen } from 'lucide-react';

export default function ParentChildren() {
  const { linkedStudents, selectedStudent, setSelectedStudent } = useParent();

  const getFullName = (student: typeof linkedStudents[0]) => {
    return [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(' ');
  };

  const getInitials = (student: typeof linkedStudents[0]) => {
    return `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <ParentLayout title="My Children" showStudentSelector={false}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Children</h2>
          <p className="text-muted-foreground">
            View and manage your linked students
          </p>
        </div>

        {linkedStudents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No linked students found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {linkedStudents.map((student) => {
              const isSelected = selectedStudent?.id === student.id;
              const fullName = getFullName(student);
              
              return (
                <Card
                  key={student.id}
                  className={`relative cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Selected
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={student.photo_url || undefined} alt={fullName} />
                        <AvatarFallback className="text-lg">
                          {getInitials(student)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{fullName}</CardTitle>
                        <CardDescription>
                          {student.admission_number || 'No admission number'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{student.class_name || 'Not assigned to class'}</span>
                    </div>
                    
                    {student.status && (
                      <Badge 
                        variant={student.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {student.status}
                      </Badge>
                    )}
                    
                    <div className="pt-2">
                      <Button
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                      >
                        {isSelected ? 'Currently Viewing' : 'View Dashboard'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}

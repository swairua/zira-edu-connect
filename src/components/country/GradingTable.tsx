import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GradingScale } from '@/lib/curriculum-config';

interface GradingTableProps {
  gradingScale: GradingScale;
}

export function GradingTable({ gradingScale }: GradingTableProps) {
  const getGradeColor = (index: number, total: number): string => {
    const ratio = index / total;
    if (ratio < 0.2) return 'bg-green-500/10 text-green-700 border-green-500/20';
    if (ratio < 0.4) return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    if (ratio < 0.6) return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    if (ratio < 0.8) return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    return 'bg-red-500/10 text-red-700 border-red-500/20';
  };

  const hasPoints = gradingScale.grades.some((g) => g.points !== undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-medium">{gradingScale.name}</h4>
        <Badge variant="outline" className="text-xs capitalize">
          {gradingScale.type}
        </Badge>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grade</TableHead>
              <TableHead>Score Range</TableHead>
              {hasPoints && <TableHead>Points</TableHead>}
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gradingScale.grades.map((grade, index) => (
              <TableRow key={grade.grade}>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getGradeColor(index, gradingScale.grades.length)}
                  >
                    {grade.grade}
                  </Badge>
                </TableCell>
                <TableCell>
                  {grade.minScore}% - {grade.maxScore}%
                </TableCell>
                {hasPoints && (
                  <TableCell>{grade.points ?? '-'}</TableCell>
                )}
                <TableCell className="text-muted-foreground">
                  {grade.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

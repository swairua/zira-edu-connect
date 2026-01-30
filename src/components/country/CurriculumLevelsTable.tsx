import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CurriculumConfig } from '@/lib/curriculum-config';

interface CurriculumLevelsTableProps {
  curriculum: CurriculumConfig;
}

export function CurriculumLevelsTable({ curriculum }: CurriculumLevelsTableProps) {
  const getGradingScaleName = (scaleId: string): string => {
    const scale = curriculum.gradingScales.find((s) => s.id === scaleId);
    return scale?.name || scaleId;
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Level</TableHead>
            <TableHead>Age Range</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Grading Scale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {curriculum.levels.map((level) => (
            <TableRow key={level.id}>
              <TableCell className="font-medium">{level.name}</TableCell>
              <TableCell>{level.ageRange || '-'}</TableCell>
              <TableCell>{level.duration || '-'}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {getGradingScaleName(level.gradingScaleId)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

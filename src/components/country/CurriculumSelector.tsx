import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Flag } from 'lucide-react';
import { CurriculumId } from '@/lib/curriculum-config';
import { CountryCode } from '@/lib/country-config';
import { useCurriculaByCountry } from '@/hooks/useCurriculum';

interface CurriculumSelectorProps {
  value: CurriculumId | undefined;
  onValueChange: (value: CurriculumId) => void;
  countryCode: CountryCode;
  disabled?: boolean;
  placeholder?: string;
}

export function CurriculumSelector({
  value,
  onValueChange,
  countryCode,
  disabled,
  placeholder = 'Select curriculum',
}: CurriculumSelectorProps) {
  const { nationalCurricula, internationalCurricula } = useCurriculaByCountry(countryCode);

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as CurriculumId)} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {nationalCurricula.length > 0 && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2">
              <Flag className="h-3 w-3" />
              National Curricula
            </SelectLabel>
            {nationalCurricula.map((curriculum) => (
              <SelectItem key={curriculum.id} value={curriculum.id}>
                <div className="flex items-center gap-2">
                  <span>{curriculum.shortName}</span>
                  <span className="text-muted-foreground text-xs">- {curriculum.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        <SelectGroup>
          <SelectLabel className="flex items-center gap-2">
            <Globe className="h-3 w-3" />
            International Curricula
          </SelectLabel>
          {internationalCurricula.map((curriculum) => (
            <SelectItem key={curriculum.id} value={curriculum.id}>
              <div className="flex items-center gap-2">
                <span>{curriculum.shortName}</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1">
                  International
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

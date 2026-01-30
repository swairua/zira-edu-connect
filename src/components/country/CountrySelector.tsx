import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllCountries, CountryCode } from '@/lib/country-config';

interface CountrySelectorProps {
  value: CountryCode;
  onValueChange: (value: CountryCode) => void;
  disabled?: boolean;
}

export function CountrySelector({ value, onValueChange, disabled }: CountrySelectorProps) {
  const countries = getAllCountries();

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
              <span className="text-muted-foreground text-xs">({country.currency.code})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

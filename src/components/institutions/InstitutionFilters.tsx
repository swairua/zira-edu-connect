import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X, Landmark, Lock } from 'lucide-react';
import { countryOptions } from '@/lib/mock-data';

interface InstitutionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  countryFilter: string;
  onCountryChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  ownershipFilter: string;
  onOwnershipChange: (value: string) => void;
  onClearFilters: () => void;
}

export function InstitutionFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  countryFilter,
  onCountryChange,
  typeFilter,
  onTypeChange,
  ownershipFilter,
  onOwnershipChange,
  onClearFilters,
}: InstitutionFiltersProps) {
  const hasFilters = searchQuery || statusFilter !== 'all' || countryFilter !== 'all' || typeFilter !== 'all' || ownershipFilter !== 'all';

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search institutions by name, code, or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={countryFilter} onValueChange={onCountryChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countryOptions.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.flag} {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="primary">Primary School</SelectItem>
            <SelectItem value="secondary">Secondary School</SelectItem>
            <SelectItem value="tvet">TVET</SelectItem>
            <SelectItem value="college">College</SelectItem>
            <SelectItem value="university">University</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ownershipFilter} onValueChange={onOwnershipChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Ownership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ownership</SelectItem>
            <SelectItem value="public">
              <div className="flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-info" />
                <span>Public</span>
              </div>
            </SelectItem>
            <SelectItem value="private">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-secondary" />
                <span>Private</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}

        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

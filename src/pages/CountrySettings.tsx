import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CountrySelector } from '@/components/country/CountrySelector';
import { CountryConfigCard } from '@/components/country/CountryConfigCard';
import { GradingTable } from '@/components/country/GradingTable';
import { CurriculumCard } from '@/components/country/CurriculumCard';
import { CurriculumLevelsTable } from '@/components/country/CurriculumLevelsTable';
import { useCountryConfig, CountryCode } from '@/hooks/useCountryConfig';
import { useCurriculaByCountry, useCurriculum } from '@/hooks/useCurriculum';
import { CurriculumId } from '@/lib/curriculum-config';
import { Globe, GraduationCap, Calendar, DollarSign, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CountrySettings() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('KE');
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumId>('ke_cbc');
  const { config, formatCurrency, getCurrentTerm, getAcademicYear, allCountries } = useCountryConfig(selectedCountry);
  const { allCurricula, nationalCurricula, internationalCurricula, defaultCurriculum } = useCurriculaByCountry(selectedCountry);
  const { curriculum, gradingScales } = useCurriculum(selectedCurriculum);
  const [selectedScale, setSelectedScale] = useState<string>('');

  // Update curriculum when country changes
  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    const newDefault = country === 'KE' ? 'ke_cbc' : 
                       country === 'UG' ? 'ug_uce' : 
                       country === 'TZ' ? 'tz_csee' :
                       country === 'RW' ? 'rw_cbc' :
                       country === 'NG' ? 'ng_waec' :
                       country === 'GH' ? 'gh_bece' :
                       'za_caps';
    setSelectedCurriculum(newDefault as CurriculumId);
    setSelectedScale('');
  };

  return (
    <DashboardLayout title="Country Configuration" subtitle="Multi-country support settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Country Configuration</h1>
            <p className="text-muted-foreground">
              Multi-country support for curricula, grading systems, and academic calendars
            </p>
          </div>
          <div className="w-full md:w-64">
            <CountrySelector
              value={selectedCountry}
              onValueChange={handleCountryChange}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-semibold flex items-center gap-2">
                    {config.flag} {config.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-semibold">{formatCurrency(10000)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Term</p>
                  <p className="font-semibold">{getCurrentTerm()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Curricula</p>
                  <p className="font-semibold">{allCurricula.length} available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="curricula" className="space-y-4">
          <TabsList>
            <TabsTrigger value="curricula">Curricula</TabsTrigger>
            <TabsTrigger value="grading">Grading Systems</TabsTrigger>
            <TabsTrigger value="overview">Country Overview</TabsTrigger>
            <TabsTrigger value="all">All Countries</TabsTrigger>
          </TabsList>

          <TabsContent value="curricula" className="space-y-6">
            {/* National Curricula */}
            {nationalCurricula.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">National Curricula</h3>
                  <Badge variant="outline">{config.name}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {nationalCurricula.map((curr) => (
                    <CurriculumCard
                      key={curr.id}
                      curriculum={curr}
                      isSelected={selectedCurriculum === curr.id}
                      onClick={() => {
                        setSelectedCurriculum(curr.id);
                        setSelectedScale('');
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* International Curricula */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">International Curricula</h3>
                <Badge variant="secondary">Available in all countries</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {internationalCurricula.map((curr) => (
                  <CurriculumCard
                    key={curr.id}
                    curriculum={curr}
                    isSelected={selectedCurriculum === curr.id}
                    onClick={() => {
                      setSelectedCurriculum(curr.id);
                      setSelectedScale('');
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Selected Curriculum Details */}
            {curriculum && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {curriculum.shortName} - Education Levels
                  </CardTitle>
                  <CardDescription>
                    Progression and grading for {curriculum.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CurriculumLevelsTable curriculum={curriculum} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="grading" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Grading Scales</CardTitle>
                    <CardDescription>
                      Select a curriculum and grading scale to view details
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedCurriculum}
                      onValueChange={(v) => {
                        setSelectedCurriculum(v as CurriculumId);
                        setSelectedScale('');
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select curriculum" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCurricula.map((curr) => (
                          <SelectItem key={curr.id} value={curr.id}>
                            {curr.shortName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {gradingScales.length > 1 && (
                      <Select
                        value={selectedScale || gradingScales[0]?.id}
                        onValueChange={setSelectedScale}
                      >
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Select scale" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradingScales.map((scale) => (
                            <SelectItem key={scale.id} value={scale.id}>
                              {scale.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {curriculum && (
                  <GradingTable
                    gradingScale={
                      selectedScale
                        ? gradingScales.find((s) => s.id === selectedScale) || gradingScales[0]
                        : gradingScales[0]
                    }
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <CountryConfigCard config={config} />
          </TabsContent>

          <TabsContent value="all">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allCountries.map((country) => (
                <Card 
                  key={country.code}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedCountry === country.code ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleCountryChange(country.code)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{country.flag}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{country.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {country.currency.code} • {country.academicCalendar.terms.length} terms
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {country.gradingSystem.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

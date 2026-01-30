import { useState } from 'react';
import { Search, BookOpen, Layers, ChevronRight } from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCBCStrands, useCBCSubStrands } from '@/hooks/useCBCStrands';
import { cbcLevelLabels, cbcCompetencyLabels, cbcValueLabels, CBCLevel } from '@/types/cbc';
import { Loader2 } from 'lucide-react';

const SUBJECT_OPTIONS: { code: string; label: string }[] = [
  { code: 'MATH', label: 'Mathematics' },
  { code: 'ENG', label: 'English' },
  { code: 'KIS', label: 'Kiswahili' },
  { code: 'SCI', label: 'Science & Technology' },
  { code: 'SST', label: 'Social Studies' },
  { code: 'CRE', label: 'Christian Religious Education' },
  { code: 'IRE', label: 'Islamic Religious Education' },
  { code: 'ART', label: 'Creative Arts' },
  { code: 'AGRI', label: 'Agriculture' },
  { code: 'HE', label: 'Home Science' },
  { code: 'PE', label: 'Physical Education' },
];

const LEVEL_OPTIONS: { value: CBCLevel; label: string }[] = [
  { value: 'pp1', label: 'PP1' },
  { value: 'pp2', label: 'PP2' },
  { value: 'grade_1', label: 'Grade 1' },
  { value: 'grade_2', label: 'Grade 2' },
  { value: 'grade_3', label: 'Grade 3' },
  { value: 'grade_4', label: 'Grade 4' },
  { value: 'grade_5', label: 'Grade 5' },
  { value: 'grade_6', label: 'Grade 6' },
  { value: 'grade_7', label: 'Grade 7' },
  { value: 'grade_8', label: 'Grade 8' },
  { value: 'grade_9', label: 'Grade 9' },
];

export default function CBCCurriculum() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CBCLevel>('grade_4');
  const [selectedSubject, setSelectedSubject] = useState<string>('MATH');
  const [selectedStrandId, setSelectedStrandId] = useState<string | null>(null);

  const { data: strands = [], isLoading: strandsLoading } = useCBCStrands(
    selectedSubject,
    selectedLevel
  );

  const { data: subStrands = [], isLoading: subStrandsLoading } = useCBCSubStrands(
    selectedStrandId || undefined
  );

  const filteredStrands = strands.filter(strand =>
    strand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalLayout 
      title="CBC Curriculum" 
      subtitle="Explore strands, sub-strands, and learning outcomes"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search strands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Level Tabs */}
        <Tabs value={selectedLevel} onValueChange={(val) => setSelectedLevel(val as CBCLevel)}>
          <TabsList className="flex-wrap h-auto gap-1">
            {LEVEL_OPTIONS.map((level) => (
              <TabsTrigger key={level.value} value={level.value} className="text-xs md:text-sm">
                {level.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedLevel} className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Subject List */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Subjects</CardTitle>
                  <CardDescription>Select a learning area</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-1 p-2">
                      {SUBJECT_OPTIONS.map((subject) => (
                        <button
                          key={subject.code}
                          onClick={() => {
                            setSelectedSubject(subject.code);
                            setSelectedStrandId(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedSubject === subject.code
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <span>{subject.label}</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Strands List */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Strands
                  </CardTitle>
                  <CardDescription>
                    {SUBJECT_OPTIONS.find(s => s.code === selectedSubject)?.label} - {cbcLevelLabels[selectedLevel]}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {strandsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredStrands.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No strands found for this subject/level
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-1 p-2">
                        {filteredStrands.map((strand) => (
                          <button
                            key={strand.id}
                            onClick={() => setSelectedStrandId(strand.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              selectedStrandId === strand.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <div className="font-medium">
                              {strand.strand_number}. {strand.name}
                            </div>
                            {strand.description && (
                              <p className={`text-xs mt-1 line-clamp-2 ${
                                selectedStrandId === strand.id
                                  ? 'text-primary-foreground/80'
                                  : 'text-muted-foreground'
                              }`}>
                                {strand.description}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Sub-strands Detail */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Sub-strands & Outcomes</CardTitle>
                  <CardDescription>
                    {selectedStrandId ? 'Learning details' : 'Select a strand to view'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {!selectedStrandId ? (
                    <div className="text-center py-12 px-4">
                      <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Select a strand to view sub-strands
                      </p>
                    </div>
                  ) : subStrandsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : subStrands.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No sub-strands found
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <Accordion type="multiple" className="px-2 pb-2">
                        {subStrands.map((subStrand) => (
                          <AccordionItem key={subStrand.id} value={subStrand.id}>
                            <AccordionTrigger className="text-sm px-2">
                              <span className="text-left">
                                {subStrand.sub_strand_number}. {subStrand.name}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 space-y-3">
                              {/* Learning Outcomes */}
                              {subStrand.specific_learning_outcomes && subStrand.specific_learning_outcomes.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                                    Learning Outcomes
                                  </h4>
                                  <ul className="text-xs space-y-1">
                                    {subStrand.specific_learning_outcomes.map((outcome, i) => (
                                      <li key={i} className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        {outcome}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Core Competencies */}
                              {subStrand.core_competencies && subStrand.core_competencies.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                                    Core Competencies
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {subStrand.core_competencies.map((comp) => (
                                      <Badge key={comp} variant="secondary" className="text-xs">
                                        {cbcCompetencyLabels[comp] || comp}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Values */}
                              {subStrand.values && subStrand.values.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                                    Values
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {subStrand.values.map((value) => (
                                      <Badge key={value} variant="outline" className="text-xs">
                                        {cbcValueLabels[value] || value}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Key Inquiry Questions */}
                              {subStrand.key_inquiry_questions && subStrand.key_inquiry_questions.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                                    Key Questions
                                  </h4>
                                  <ul className="text-xs space-y-1 italic">
                                    {subStrand.key_inquiry_questions.map((q, i) => (
                                      <li key={i}>{q}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}

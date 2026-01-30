import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, Loader2 } from 'lucide-react';
import { ExamPaperSection } from '@/types/question-bank';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
interface PaperQuestion {
  id: string;
  question_id: string;
  section_index: number;
  question_order: number;
  marks_override: number | null;
  question?: {
    id: string;
    question_text: string;
    question_type: string;
    options?: { label: string; text: string; is_correct: boolean }[];
    marks: number;
    difficulty: string;
  };
}

interface ExamPaperPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paper: {
    title: string;
    instructions?: string;
    duration_minutes: number;
    total_marks: number;
    sections: ExamPaperSection[];
    subject?: { name: string; code?: string };
    exam?: { name: string };
    questions?: PaperQuestion[];
  } | null;
}

export function ExamPaperPreviewDialog({
  open,
  onOpenChange,
  paper,
}: ExamPaperPreviewDialogProps) {
  const { institutionId } = useInstitution();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fetch institution details for branding
  const { data: institution } = useQuery({
    queryKey: ['institution-branding', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data, error } = await supabase
        .from('institutions')
        .select('name, logo_url, address, phone, email, motto, code')
        .eq('id', institutionId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!institutionId && open,
  });

  if (!paper) return null;

  const handlePrint = () => {
    window.print();
  };

  // Add page header and footer to PDF
  const addPageMeta = (pdf: jsPDF, pageNum: number, totalPages: number) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Header
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(`${institution?.name || 'School'} - ${paper?.title || 'Exam Paper'}`, pageWidth / 2, 8, { align: 'center' });
    
    // Footer with page numbers
    pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
    
    // Add total marks reminder on last page
    if (pageNum === totalPages) {
      pdf.setFontSize(8);
      pdf.text(`Total Marks: ${paper?.total_marks || 0}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('exam-paper-preview');
    if (!element) {
      toast.error('Could not find exam paper content');
      return;
    }

    setIsGeneratingPdf(true);
    toast.info('Generating PDF...');

    try {
      // Add PDF render mode class for compact styling
      element.classList.add('pdf-render-mode');
      
      // Store original styles
      const scrollContainer = element.parentElement;
      const originalOverflow = scrollContainer?.style.overflow;
      const originalHeight = scrollContainer?.style.height;
      const originalMaxHeight = scrollContainer?.style.maxHeight;
      
      // Temporarily expand the container to show all content
      if (scrollContainer) {
        scrollContainer.style.overflow = 'visible';
        scrollContainer.style.height = 'auto';
        scrollContainer.style.maxHeight = 'none';
      }

      // Wait for layout to settle with PDF mode styles applied
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2, // Reduced from 2.5 for better quality without distortion
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Remove PDF render mode class
      element.classList.remove('pdf-render-mode');
      
      // Restore original styles
      if (scrollContainer) {
        scrollContainer.style.overflow = originalOverflow || '';
        scrollContainer.style.height = originalHeight || '';
        scrollContainer.style.maxHeight = originalMaxHeight || '';
      }

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const marginTop = 12; // Space for header
      const marginBottom = 14; // Space for footer
      const pageContentHeight = pdfHeight - marginTop - marginBottom;
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scaling to fit width
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      
      // Calculate total pages needed
      const totalPages = Math.ceil(scaledHeight / pageContentHeight);
      
      // Create PDF with multiple pages if needed
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let yOffset = 0;
      let pageNumber = 1;

      while (yOffset < scaledHeight) {
        if (pageNumber > 1) {
          pdf.addPage();
        }

        // Calculate source rectangle for this page
        const sourceY = (yOffset / ratio);
        const sourceHeight = Math.min((pageContentHeight / ratio), imgHeight - sourceY);
        
        // Create a canvas for this page section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY, imgWidth, sourceHeight,
            0, 0, imgWidth, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          const pageScaledHeight = sourceHeight * ratio;
          
          pdf.addImage(pageImgData, 'PNG', 0, marginTop, pdfWidth, pageScaledHeight);
        }

        // Add page headers and footers
        addPageMeta(pdf, pageNumber, totalPages);

        yOffset += pageContentHeight;
        pageNumber++;
      }

      // Generate filename
      const sanitizedTitle = paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_exam_paper.pdf`;
      
      pdf.save(filename);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      // Ensure PDF mode class is removed on error
      element.classList.remove('pdf-render-mode');
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try printing instead.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Group questions by section
  const questionsBySection = paper.questions?.reduce((acc, q) => {
    const sectionIndex = q.section_index ?? 0;
    if (!acc[sectionIndex]) acc[sectionIndex] = [];
    acc[sectionIndex].push(q);
    return acc;
  }, {} as Record<number, PaperQuestion[]>) || {};

  // Sort questions within each section by order
  Object.keys(questionsBySection).forEach((key) => {
    questionsBySection[parseInt(key)].sort((a, b) => a.question_order - b.question_order);
  });

  const totalAddedMarks = paper.questions?.reduce(
    (sum, q) => sum + (q.marks_override || q.question?.marks || 0),
    0
  ) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col print:max-w-none print:max-h-none print:h-auto print:overflow-visible print:block">
        <DialogHeader className="print:hidden">
          <DialogTitle>Paper Preview</DialogTitle>
          <DialogDescription>
            Preview your exam paper before printing. Review questions, marks allocation, and formatting.
          </DialogDescription>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
              {isGeneratingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto print:overflow-visible print:max-h-none">
          <div className="p-6 bg-white print:p-0" id="exam-paper-preview">
            {/* Professional Branded Header */}
            <div className="border-2 border-foreground mb-6 print:mb-4 institution-header print:block">
              {/* Institution Info Row with Enhanced Branding */}
              <div className="flex items-center gap-4 p-4 border-b-2 border-foreground bg-muted/20 print:bg-transparent">
                {institution?.logo_url && (
                  <img 
                    src={institution.logo_url} 
                    alt="Institution Logo" 
                    className="h-16 w-16 object-contain print:h-14 print:w-14"
                  />
                )}
                <div className="flex-1 text-center">
                  <h1 className="text-2xl font-extrabold uppercase tracking-widest print:text-xl text-foreground">
                    {institution?.name || 'School Name'}
                  </h1>
                  {institution?.address && (
                    <p className="text-sm text-muted-foreground print:text-xs mt-1">
                      {institution.address}
                    </p>
                  )}
                  {(institution?.phone || institution?.email) && (
                    <p className="text-sm text-muted-foreground print:text-xs">
                      {[institution?.phone && `Tel: ${institution.phone}`, institution?.email && `Email: ${institution.email}`].filter(Boolean).join(' | ')}
                    </p>
                  )}
                  {institution?.motto && (
                    <p className="text-sm italic font-semibold mt-1 print:text-xs text-primary print:text-foreground">
                      "{institution.motto}"
                    </p>
                  )}
                </div>
                {institution?.logo_url && (
                  <img 
                    src={institution.logo_url} 
                    alt="Institution Logo" 
                    className="h-16 w-16 object-contain print:h-14 print:w-14"
                  />
                )}
              </div>

              {/* Exam Info Row - Icons replaced with text for cleaner PDF */}
              <div className="p-4 border-b-2 border-foreground">
                <h2 className="text-xl font-bold text-center mb-3 print:text-lg uppercase tracking-wide">
                  {paper.title}
                </h2>
                <div className="flex justify-center gap-8 text-sm print:text-xs">
                  {paper.subject && (
                    <span>
                      <strong>Subject:</strong> {paper.subject.name}
                    </span>
                  )}
                  <span>
                    <strong>Duration:</strong> {paper.duration_minutes} minutes
                  </span>
                  <span>
                    <strong>Total Marks:</strong> {paper.total_marks}
                  </span>
                </div>
                {paper.exam && (
                  <div className="text-center mt-2">
                    <Badge variant="outline" className="print:border-foreground font-semibold">
                      {paper.exam.name}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Student Info Row with Date Field */}
              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm print:text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Name:</span>
                  <span className="flex-1 border-b-2 border-dashed border-muted-foreground print:border-foreground min-w-[150px]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Adm No:</span>
                  <span className="flex-1 border-b-2 border-dashed border-muted-foreground print:border-foreground min-w-[100px]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Class:</span>
                  <span className="flex-1 border-b-2 border-dashed border-muted-foreground print:border-foreground min-w-[100px]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Date:</span>
                  <span className="flex-1 border-b-2 border-dashed border-muted-foreground print:border-foreground min-w-[100px]" />
                </div>
              </div>
            </div>

            {/* Instructions */}
            {paper.instructions && (
              <div className="mb-6 p-4 bg-muted/30 rounded-lg border print:bg-transparent print:rounded-none print:border-foreground print:mb-4">
                <h3 className="font-semibold mb-2 text-sm uppercase">Instructions:</h3>
                <p className="text-sm whitespace-pre-wrap print:text-xs">{paper.instructions}</p>
              </div>
            )}

            {/* Progress Info - Hidden on Print and PDF */}
            <div className="mb-4 p-3 bg-primary/5 rounded-lg flex justify-between items-center print:hidden pdf-hidden">
              <span className="text-sm">
                Questions added: <strong>{paper.questions?.length || 0}</strong>
              </span>
              <span className="text-sm">
                Marks allocated: <strong>{totalAddedMarks}</strong> / {paper.total_marks}
              </span>
            </div>

            {/* Sections and Questions */}
            {paper.sections.map((section, sectionIndex) => {
              const sectionQuestions = questionsBySection[sectionIndex] || [];
              const sectionMarks = sectionQuestions.reduce(
                (sum, q) => sum + (q.marks_override || q.question?.marks || 0),
                0
              );

              return (
                <div key={sectionIndex} className="mb-8 print:mb-6 print:break-inside-avoid">
                  {/* Section Header with decorative accent */}
                  <div className="flex justify-between items-center mb-4 print:mb-3 pb-2 border-b-2 border-primary print:border-foreground">
                    <h2 className="text-lg font-bold print:text-base uppercase tracking-wide">{section.name}</h2>
                    <span className="px-3 py-1 bg-muted text-sm font-semibold rounded print:bg-transparent print:border print:border-foreground print:text-xs">
                      {sectionMarks} / {section.marks} marks
                    </span>
                  </div>
                  
                  {section.instructions && (
                    <p className="text-sm text-muted-foreground mb-4 italic print:text-xs print:mb-2">
                      {section.instructions}
                    </p>
                  )}

                  {sectionQuestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg print:hidden">
                      No questions added to this section yet
                    </div>
                  ) : (
                    <div className="space-y-6 print:space-y-4">
                      {sectionQuestions.map((pq, qIndex) => {
                        const question = pq.question;
                        if (!question) return null;

                        const marks = pq.marks_override || question.marks;

                        return (
                          <div key={pq.id} className="border-b pb-4 last:border-b-0 print:pb-2 print:break-inside-avoid">
                            <div className="flex gap-3">
                              <span className="font-semibold text-primary min-w-[2rem] print:text-foreground">
                                {qIndex + 1}.
                              </span>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2 print:mb-1">
                                  <p className="flex-1 print:text-sm">{question.question_text}</p>
                                  <span className="text-sm text-muted-foreground ml-4 font-medium print:text-xs print:text-foreground">
                                    ({marks} mark{marks !== 1 ? 's' : ''})
                                  </span>
                                </div>

                                {/* Multiple Choice Options - 2 Column Grid with Answer Circles */}
                                {question.question_type === 'multiple_choice' && question.options && (
                                  <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 pl-4 print:mt-2 print:gap-x-6 print:gap-y-1">
                                    {question.options.map((opt, optIndex) => (
                                      <div key={optIndex} className="flex items-start gap-2 print:text-sm">
                                        <span className="font-medium shrink-0">
                                          ({opt.label})
                                        </span>
                                        <span className="flex-1">{opt.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Short Answer - Dotted line with professional styling */}
                                {(question.question_type === 'short_answer' || 
                                  question.question_type === 'fill_blank') && (
                                  <div className="mt-4 print:mt-3">
                                    <div className="border-b-2 border-dotted border-muted-foreground print:border-foreground w-full h-8 print:h-6" />
                                  </div>
                                )}

                                {/* Long Answer / Essay - Multiple ruled lines */}
                                {(question.question_type === 'long_answer' || 
                                  question.question_type === 'essay') && (
                                  <div className="mt-4 print:mt-3">
                                    {Array.from({ length: Math.max(5, Math.ceil(marks / 2)) }).map((_, line) => (
                                      <div
                                        key={line}
                                        className="border-b border-muted-foreground/50 print:border-foreground/40 w-full h-7 print:h-6"
                                      />
                                    ))}
                                  </div>
                                )}

                                {question.question_type === 'true_false' && (
                                  <div className="mt-3 flex gap-8 pl-4 print:mt-2 print:text-sm">
                                    <span className="flex items-center gap-2">
                                      <span className="w-5 h-5 border-2 border-foreground rounded print:w-4 print:h-4" /> 
                                      True
                                    </span>
                                    <span className="flex items-center gap-2">
                                      <span className="w-5 h-5 border-2 border-foreground rounded print:w-4 print:h-4" /> 
                                      False
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Footer with Total Marks */}
            <div className="mt-8 pt-4 border-t-2 border-foreground print:mt-6 print:pt-3">
              <div className="text-center">
                <p className="font-bold text-sm print:text-xs">— End of Paper —</p>
                <p className="mt-2 text-sm font-semibold print:text-xs">
                  Total Marks: {paper.total_marks}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Paper
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

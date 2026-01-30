import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
  STUDENT_IMPORT_DEFINITION,
  PARENT_IMPORT_DEFINITION,
  STAFF_IMPORT_DEFINITION,
  OPENING_BALANCES_IMPORT_DEFINITION,
  HISTORICAL_PAYMENTS_IMPORT_DEFINITION,
  HISTORICAL_GRADES_IMPORT_DEFINITION,
  HISTORICAL_ATTENDANCE_IMPORT_DEFINITION,
  type ImportDefinition,
} from '@/config/importColumnDefinitions';

// Brand colors
const TEAL_600: [number, number, number] = [13, 148, 136];
const TEAL_700: [number, number, number] = [15, 118, 110];
const GRAY_900: [number, number, number] = [17, 24, 39];
const GRAY_700: [number, number, number] = [55, 65, 81];
const GRAY_500: [number, number, number] = [107, 114, 128];
const WHITE: [number, number, number] = [255, 255, 255];

// Page settings
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

let totalPages = 0;

function addPageHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...TEAL_600);
  doc.rect(0, 0, PAGE_WIDTH, 15, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('ZIRA EDUSUITE', MARGIN, 10);
  
  doc.setFont('helvetica', 'normal');
  doc.text(title, PAGE_WIDTH - MARGIN, 10, { align: 'right' });
}

function addPageFooter(doc: jsPDF, pageNum: number) {
  const footerY = PAGE_HEIGHT - 15;
  
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_500);
  doc.text(`Page ${pageNum}`, PAGE_WIDTH / 2, footerY, { align: 'center' });
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy')}`, PAGE_WIDTH - MARGIN, footerY, { align: 'right' });
}

function addNewPage(doc: jsPDF, title: string): number {
  doc.addPage();
  totalPages++;
  addPageHeader(doc, title);
  return 25; // Starting Y position after header
}

function addSectionTitle(doc: jsPDF, title: string, yPos: number): number {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_700);
  doc.text(title, MARGIN, yPos);
  return yPos + 10;
}

function addSubsectionTitle(doc: jsPDF, title: string, yPos: number): number {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY_900);
  doc.text(title, MARGIN, yPos);
  return yPos + 8;
}

function addParagraph(doc: jsPDF, text: string, yPos: number, indent = 0): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_700);
  
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent);
  doc.text(lines, MARGIN + indent, yPos);
  return yPos + (lines.length * 5) + 3;
}

function addBulletPoint(doc: jsPDF, text: string, yPos: number, bullet = '•'): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_700);
  
  doc.text(bullet, MARGIN + 5, yPos);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 15);
  doc.text(lines, MARGIN + 12, yPos);
  return yPos + (lines.length * 5) + 2;
}

function addCheckboxItem(doc: jsPDF, text: string, yPos: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_700);
  
  // Draw checkbox
  doc.setDrawColor(...GRAY_500);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN + 5, yPos - 3.5, 4, 4);
  
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 15);
  doc.text(lines, MARGIN + 14, yPos);
  return yPos + (lines.length * 5) + 3;
}

function addColumnTable(doc: jsPDF, definition: ImportDefinition, yPos: number): number {
  const tableData = definition.columns.map(col => [
    col.name,
    col.required ? 'Yes' : 'No',
    col.type,
    col.description + (col.format ? ` (${col.format})` : ''),
    col.example || '-',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Column', 'Required', 'Type', 'Description', 'Example']],
    body: tableData,
    headStyles: {
      fillColor: TEAL_600,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: GRAY_700,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 15 },
      3: { cellWidth: 70 },
      4: { cellWidth: 35 },
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_WIDTH,
  });

  return (doc as any).lastAutoTable.finalY + 8;
}

function addCoverPage(doc: jsPDF): void {
  totalPages++;
  
  // Gradient-like header
  doc.setFillColor(...TEAL_600);
  doc.rect(0, 0, PAGE_WIDTH, 120, 'F');
  
  // Title
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('ZIRA EDUSUITE', PAGE_WIDTH / 2, 50, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'normal');
  doc.text('School Onboarding &', PAGE_WIDTH / 2, 70, { align: 'center' });
  doc.text('Data Migration Guide', PAGE_WIDTH / 2, 82, { align: 'center' });
  
  // Version badge
  doc.setFontSize(10);
  doc.text(`Version 1.0 • ${format(new Date(), 'MMMM yyyy')}`, PAGE_WIDTH / 2, 105, { align: 'center' });
  
  // Description box
  let yPos = 140;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(MARGIN, yPos - 5, CONTENT_WIDTH, 45, 3, 3, 'F');
  
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY_900);
  doc.text('What is this guide?', MARGIN + 10, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_700);
  const desc = 'This comprehensive guide helps your data preparation team organize and format data for bulk imports into Zira EduSuite. Follow the specifications carefully to ensure a smooth migration from your previous system.';
  const descLines = doc.splitTextToSize(desc, CONTENT_WIDTH - 20);
  doc.text(descLines, MARGIN + 10, yPos);
  
  // Quick stats
  yPos = 200;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY_900);
  doc.text('Data Types Covered:', MARGIN, yPos);
  
  const dataTypes = [
    '• Students & Classes',
    '• Parents & Guardians',
    '• Staff & Teachers',
    '• Opening Balances',
    '• Historical Payments',
    '• Historical Grades',
    '• Historical Attendance',
  ];
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_700);
  dataTypes.forEach(item => {
    doc.text(item, MARGIN + 5, yPos);
    yPos += 6;
  });
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(...GRAY_500);
  doc.text('Prepared for data preparation teams • Print-friendly format', PAGE_WIDTH / 2, PAGE_HEIGHT - 25, { align: 'center' });
}

function addTableOfContents(doc: jsPDF): void {
  let yPos = addNewPage(doc, 'Table of Contents');
  
  yPos = addSectionTitle(doc, 'Table of Contents', yPos);
  yPos += 5;
  
  const tocItems = [
    { title: '1. Pre-Onboarding Checklist', page: 3 },
    { title: '2. Data Preparation Overview', page: 4 },
    { title: '3. Student Data Requirements', page: 5 },
    { title: '4. Parent Data Requirements', page: 6 },
    { title: '5. Staff Data Requirements', page: 7 },
    { title: '6. Opening Balances', page: 8 },
    { title: '7. Historical Payments', page: 9 },
    { title: '8. Historical Grades', page: 10 },
    { title: '9. Historical Attendance', page: 11 },
    { title: '10. Best Practices', page: 12 },
    { title: '11. Quick Reference Card', page: 13 },
  ];
  
  doc.setFontSize(11);
  tocItems.forEach(item => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_900);
    doc.text(item.title, MARGIN + 5, yPos);
    
    // Dotted line
    const textWidth = doc.getTextWidth(item.title);
    const pageNumWidth = doc.getTextWidth(item.page.toString());
    const dotsStart = MARGIN + 5 + textWidth + 5;
    const dotsEnd = PAGE_WIDTH - MARGIN - pageNumWidth - 5;
    
    doc.setTextColor(...GRAY_500);
    let dotX = dotsStart;
    while (dotX < dotsEnd) {
      doc.text('.', dotX, yPos);
      dotX += 2;
    }
    
    doc.setTextColor(...GRAY_700);
    doc.text(item.page.toString(), PAGE_WIDTH - MARGIN, yPos, { align: 'right' });
    
    yPos += 10;
  });
  
  // Note
  yPos += 10;
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, 25, 2, 2, 'F');
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('💡 Important Note', MARGIN + 5, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  const noteText = 'All CSV files must be saved in UTF-8 encoding. Use YYYY-MM-DD format for all dates.';
  doc.text(noteText, MARGIN + 5, yPos);
}

function addPreOnboardingChecklist(doc: jsPDF): void {
  let yPos = addNewPage(doc, 'Pre-Onboarding Checklist');
  
  yPos = addSectionTitle(doc, '1. Pre-Onboarding Checklist', yPos);
  yPos = addParagraph(doc, 'Complete these items before starting your data migration:', yPos);
  yPos += 5;
  
  // Institution Information
  yPos = addSubsectionTitle(doc, 'Institution Information', yPos);
  yPos = addCheckboxItem(doc, 'Institution name and official address', yPos);
  yPos = addCheckboxItem(doc, 'Contact email and phone number', yPos);
  yPos = addCheckboxItem(doc, 'Institution type (primary, secondary, etc.)', yPos);
  yPos = addCheckboxItem(doc, 'Country and timezone settings', yPos);
  yPos = addCheckboxItem(doc, 'School logo (PNG or JPG, recommended 200x200px)', yPos);
  yPos += 5;
  
  // Academic Structure
  yPos = addSubsectionTitle(doc, 'Academic Structure', yPos);
  yPos = addCheckboxItem(doc, 'Define academic year dates (start and end)', yPos);
  yPos = addCheckboxItem(doc, 'Define term/semester structure and dates', yPos);
  yPos = addCheckboxItem(doc, 'List all classes/grades (e.g., Grade 1, Grade 2, Form 1)', yPos);
  yPos = addCheckboxItem(doc, 'List all streams if applicable (e.g., A, B, East, West)', yPos);
  yPos = addCheckboxItem(doc, 'List all subjects with codes (e.g., MATH, ENG, SCI)', yPos);
  yPos += 5;
  
  // Fee Structure
  yPos = addSubsectionTitle(doc, 'Fee Structure Preparation', yPos);
  yPos = addCheckboxItem(doc, 'Define fee categories (tuition, transport, lunch, etc.)', yPos);
  yPos = addCheckboxItem(doc, 'Set fee amounts per class/term', yPos);
  yPos = addCheckboxItem(doc, 'Identify students with outstanding balances', yPos);
  yPos = addCheckboxItem(doc, 'Gather historical payment records (if importing)', yPos);
  yPos += 5;
  
  // Data Preparation
  yPos = addSubsectionTitle(doc, 'Data Files Preparation', yPos);
  yPos = addCheckboxItem(doc, 'Export student list from previous system', yPos);
  yPos = addCheckboxItem(doc, 'Export parent/guardian contact information', yPos);
  yPos = addCheckboxItem(doc, 'Export staff and teacher records', yPos);
  yPos = addCheckboxItem(doc, 'Calculate opening balances per student', yPos);
  yPos = addCheckboxItem(doc, 'Verify all phone numbers include country code', yPos);
}

function addDataOverview(doc: jsPDF): void {
  let yPos = addNewPage(doc, 'Data Preparation Overview');
  
  yPos = addSectionTitle(doc, '2. Data Preparation Overview', yPos);
  yPos = addParagraph(doc, 'Follow this import order to ensure all dependencies are properly linked:', yPos);
  yPos += 5;
  
  // Import order diagram
  const steps = [
    { num: '1', title: 'Academic Setup', desc: 'Configure classes, subjects, and terms via the setup wizard' },
    { num: '2', title: 'Students', desc: 'Import student records with class assignments' },
    { num: '3', title: 'Parents', desc: 'Import parents and link to students via admission numbers' },
    { num: '4', title: 'Staff', desc: 'Import staff with subject and class teacher assignments' },
    { num: '5', title: 'Opening Balances', desc: 'Import fee balances from your cutover date' },
    { num: '6', title: 'Historical Data', desc: 'Optional: Import grades, payments, and attendance' },
  ];
  
  steps.forEach((step, index) => {
    // Step box
    doc.setFillColor(...TEAL_600);
    doc.circle(MARGIN + 10, yPos + 3, 6, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(step.num, MARGIN + 10, yPos + 5, { align: 'center' });
    
    // Arrow
    if (index < steps.length - 1) {
      doc.setDrawColor(...TEAL_600);
      doc.setLineWidth(0.5);
      doc.line(MARGIN + 10, yPos + 10, MARGIN + 10, yPos + 20);
    }
    
    // Content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY_900);
    doc.text(step.title, MARGIN + 22, yPos + 3);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_700);
    doc.text(step.desc, MARGIN + 22, yPos + 10);
    
    yPos += 25;
  });
  
  // Key dependencies note
  yPos += 10;
  doc.setFillColor(209, 250, 229);
  doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, 35, 2, 2, 'F');
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text('🔗 Key Dependencies', MARGIN + 5, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const deps = [
    '• Parents link to Students via admission_number',
    '• Staff link to Classes and Subjects via class names and subject codes',
    '• All financial imports require existing student records',
  ];
  deps.forEach(dep => {
    doc.text(dep, MARGIN + 5, yPos);
    yPos += 6;
  });
}

function addImportSection(doc: jsPDF, definition: ImportDefinition, sectionNum: number, title: string, additionalNotes?: string[]): void {
  let yPos = addNewPage(doc, title);
  
  yPos = addSectionTitle(doc, `${sectionNum}. ${title}`, yPos);
  yPos = addParagraph(doc, definition.description, yPos);
  yPos += 3;
  
  // Column specifications
  yPos = addSubsectionTitle(doc, 'Column Specifications', yPos);
  yPos = addColumnTable(doc, definition, yPos);
  
  // Check if we need to add notes and if there's space
  if (additionalNotes && additionalNotes.length > 0) {
    if (yPos > PAGE_HEIGHT - 60) {
      yPos = addNewPage(doc, title);
    }
    
    yPos = addSubsectionTitle(doc, 'Important Notes', yPos);
    additionalNotes.forEach(note => {
      yPos = addBulletPoint(doc, note, yPos);
    });
  }
  
  // Sample CSV
  if (yPos > PAGE_HEIGHT - 50) {
    yPos = addNewPage(doc, title);
  }
  
  yPos += 5;
  yPos = addSubsectionTitle(doc, 'Sample CSV Format', yPos);
  
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, 20, 2, 2, 'F');
  
  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  doc.setTextColor(...GRAY_700);
  
  // Header row
  const headers = definition.columns.slice(0, 5).map(c => c.name).join(',');
  doc.text(headers + (definition.columns.length > 5 ? ',...' : ''), MARGIN + 3, yPos + 6);
  
  // Example row
  const examples = definition.columns.slice(0, 5).map(c => c.example || '').join(',');
  doc.text(examples + (definition.columns.length > 5 ? ',...' : ''), MARGIN + 3, yPos + 13);
}

function addBestPractices(doc: jsPDF): void {
  let yPos = addNewPage(doc, 'Best Practices');
  
  yPos = addSectionTitle(doc, '10. Best Practices', yPos);
  yPos += 5;
  
  // File Encoding
  yPos = addSubsectionTitle(doc, 'File Encoding & Format', yPos);
  yPos = addBulletPoint(doc, 'Save all CSV files with UTF-8 encoding (important for special characters)', yPos);
  yPos = addBulletPoint(doc, 'Use comma (,) as the delimiter, not semicolon or tab', yPos);
  yPos = addBulletPoint(doc, 'Remove any BOM (Byte Order Mark) from files', yPos);
  yPos = addBulletPoint(doc, 'Ensure no trailing commas at the end of rows', yPos);
  yPos += 5;
  
  // Date Formats
  yPos = addSubsectionTitle(doc, 'Date Formats', yPos);
  yPos = addBulletPoint(doc, 'Use YYYY-MM-DD format (e.g., 2024-01-15)', yPos);
  yPos = addBulletPoint(doc, 'Avoid regional formats like DD/MM/YYYY or MM/DD/YYYY', yPos);
  yPos = addBulletPoint(doc, 'Ensure dates are not formatted as numbers in Excel', yPos);
  yPos += 5;
  
  // Phone Numbers
  yPos = addSubsectionTitle(doc, 'Phone Number Formats', yPos);
  yPos = addBulletPoint(doc, 'Include country code (e.g., +254712345678)', yPos);
  yPos = addBulletPoint(doc, 'Remove spaces, dashes, and parentheses', yPos);
  yPos = addBulletPoint(doc, 'Ensure phone numbers are stored as text, not numbers', yPos);
  yPos += 5;
  
  // Common Errors
  yPos = addSubsectionTitle(doc, 'Common Errors to Avoid', yPos);
  
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, 50, 2, 2, 'F');
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setTextColor(153, 27, 27);
  const errors = [
    '❌ Duplicate admission numbers or employee numbers',
    '❌ Missing required fields (empty cells in required columns)',
    '❌ Invalid class names that don\'t match system records',
    '❌ Incorrect date formats causing parsing errors',
    '❌ Phone numbers without country codes',
    '❌ Using incorrect case for enum values (e.g., "Male" instead of "male")',
  ];
  errors.forEach(error => {
    doc.text(error, MARGIN + 5, yPos);
    yPos += 7;
  });
}

function addQuickReferenceCard(doc: jsPDF): void {
  let yPos = addNewPage(doc, 'Quick Reference Card');
  
  yPos = addSectionTitle(doc, '11. Quick Reference Card', yPos);
  yPos = addParagraph(doc, 'Keep this page handy for quick lookups during data preparation.', yPos);
  yPos += 5;
  
  // Unique Identifiers
  yPos = addSubsectionTitle(doc, 'Unique Identifiers', yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Data Type', 'Unique ID Field', 'Notes']],
    body: [
      ['Students', 'admission_number', 'Auto-generated if left blank'],
      ['Parents', 'phone', 'Must include country code'],
      ['Staff', 'employee_number', 'Required for all staff'],
    ],
    headStyles: {
      fillColor: TEAL_600,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: GRAY_700,
    },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_WIDTH,
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Import Order
  yPos = addSubsectionTitle(doc, 'Recommended Import Order', yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Order', 'Import Type', 'Dependencies']],
    body: [
      ['1', 'Academic Setup', 'None (use wizard)'],
      ['2', 'Students', 'Classes must exist'],
      ['3', 'Parents', 'Students must exist'],
      ['4', 'Staff', 'Classes & subjects must exist'],
      ['5', 'Opening Balances', 'Students must exist'],
      ['6', 'Historical Payments', 'Students must exist'],
      ['7', 'Historical Grades', 'Students & subjects must exist'],
      ['8', 'Historical Attendance', 'Students & classes must exist'],
    ],
    headStyles: {
      fillColor: TEAL_600,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: GRAY_700,
    },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_WIDTH,
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Quick Format Reference
  yPos = addSubsectionTitle(doc, 'Format Quick Reference', yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Type', 'Format', 'Example']],
    body: [
      ['Date', 'YYYY-MM-DD', '2024-01-15'],
      ['Phone', '+[country][number]', '+254712345678'],
      ['Email', 'valid@email.com', 'parent@email.com'],
      ['Gender', 'lowercase', 'male, female, other'],
      ['List items', 'semicolon-separated', 'MATH;ENG;SCI'],
      ['Currency', 'number only', '15000'],
    ],
    headStyles: {
      fillColor: TEAL_600,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: GRAY_700,
    },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_WIDTH,
  });
}

function addPageNumbers(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addPageFooter(doc, i);
  }
}

export function downloadOnboardingGuide(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  totalPages = 0;
  
  // Cover Page
  addCoverPage(doc);
  
  // Table of Contents
  addTableOfContents(doc);
  
  // Pre-Onboarding Checklist
  addPreOnboardingChecklist(doc);
  
  // Data Preparation Overview
  addDataOverview(doc);
  
  // Student Data
  addImportSection(doc, STUDENT_IMPORT_DEFINITION, 3, 'Student Data Requirements', [
    'Students can be imported without a class assignment initially',
    'Parent information can be included to auto-create parent records',
    'Admission numbers are auto-generated if left blank',
  ]);
  
  // Parent Data
  addImportSection(doc, PARENT_IMPORT_DEFINITION, 4, 'Parent Data Requirements', [
    'Phone number is the unique identifier for parents',
    'Use semicolons to link multiple students: "STU001;STU002"',
    'Parents can also be created during student import',
  ]);
  
  // Staff Data
  addImportSection(doc, STAFF_IMPORT_DEFINITION, 5, 'Staff Data Requirements', [
    'Employee number must be unique across all staff',
    'Subject codes must match existing subjects in the system',
    'Use semicolons for multiple subjects: "MATH;ENG;SCI"',
    'Class teacher assignment requires exact class name match',
  ]);
  
  // Opening Balances
  addImportSection(doc, OPENING_BALANCES_IMPORT_DEFINITION, 6, 'Opening Balances', [
    'Import balances as of your system cutover date',
    'Use positive amounts for money owed by students',
    'Use negative amounts for credits/overpayments',
    'This should be done AFTER importing all students',
  ]);
  
  // Historical Payments
  addImportSection(doc, HISTORICAL_PAYMENTS_IMPORT_DEFINITION, 7, 'Historical Payments', [
    'Import payments from before your cutover date',
    'Useful for maintaining complete payment audit trails',
    'Transaction references help with M-PESA reconciliation',
  ]);
  
  // Historical Grades
  addImportSection(doc, HISTORICAL_GRADES_IMPORT_DEFINITION, 8, 'Historical Grades', [
    'Import grades from previous academic years',
    'Subject codes must match your system subjects',
    'Grades can be auto-calculated from marks if not provided',
  ]);
  
  // Historical Attendance
  addImportSection(doc, HISTORICAL_ATTENDANCE_IMPORT_DEFINITION, 9, 'Historical Attendance', [
    'Import attendance records from previous terms',
    'Valid statuses: present, absent, late, excused',
    'Optional - only import if tracking historical attendance is important',
  ]);
  
  // Best Practices
  addBestPractices(doc);
  
  // Quick Reference Card
  addQuickReferenceCard(doc);
  
  // Add page numbers to all pages
  addPageNumbers(doc);
  
  // Save
  const date = format(new Date(), 'yyyy-MM-dd');
  doc.save(`Zira-EduSuite-Onboarding-Guide-${date}.pdf`);
}

export function generateOnboardingGuidePDFBlob(): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  totalPages = 0;
  
  addCoverPage(doc);
  addTableOfContents(doc);
  addPreOnboardingChecklist(doc);
  addDataOverview(doc);
  addImportSection(doc, STUDENT_IMPORT_DEFINITION, 3, 'Student Data Requirements');
  addImportSection(doc, PARENT_IMPORT_DEFINITION, 4, 'Parent Data Requirements');
  addImportSection(doc, STAFF_IMPORT_DEFINITION, 5, 'Staff Data Requirements');
  addImportSection(doc, OPENING_BALANCES_IMPORT_DEFINITION, 6, 'Opening Balances');
  addImportSection(doc, HISTORICAL_PAYMENTS_IMPORT_DEFINITION, 7, 'Historical Payments');
  addImportSection(doc, HISTORICAL_GRADES_IMPORT_DEFINITION, 8, 'Historical Grades');
  addImportSection(doc, HISTORICAL_ATTENDANCE_IMPORT_DEFINITION, 9, 'Historical Attendance');
  addBestPractices(doc);
  addQuickReferenceCard(doc);
  addPageNumbers(doc);
  
  return doc.output('blob');
}

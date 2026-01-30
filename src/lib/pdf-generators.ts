import { format } from 'date-fns';

// Week Block Timetable PDF types
interface WeekBlockPDFData {
  timetableName: string;
  institutionName: string;
  classes: Array<{ id: string; name: string; stream?: string }>;
  timeSlots: Array<{ id: string; name: string; start_time: string; end_time: string; slot_type: string }>;
  days: Array<{ value: number; label: string }>;
  getEntry: (classId: string, dayOfWeek: number, slotId: string) => {
    subject?: { name: string } | null;
    teacher?: { first_name: string; last_name: string; employee_number?: string } | null;
  } | undefined;
  levelFilter?: string;
}

export function generateWeekBlockTimetablePDF({
  timetableName,
  institutionName,
  classes,
  timeSlots,
  days,
  getEntry,
  levelFilter
}: WeekBlockPDFData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getNumericCode = (empNumber?: string): string => {
    if (!empNumber) return '';
    const num = empNumber.replace(/\D/g, '');
    return num.slice(-2).padStart(2, '0');
  };

  const getSlotStyle = (slotType: string) => {
    switch (slotType) {
      case 'break': return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', label: 'Break' };
      case 'lunch': return { bg: '#ffedd5', border: '#f97316', text: '#9a3412', label: 'Lunch' };
      case 'assembly': return { bg: '#f3e8ff', border: '#a855f7', text: '#7c3aed', label: 'Assembly' };
      case 'prep': return { bg: '#d1fae5', border: '#10b981', text: '#065f46', label: 'Prep Time' };
      default: return null;
    }
  };

  const getClassName = (cls: { name: string; stream?: string }): string => {
    return cls.stream ? `${cls.name} ${cls.stream}` : cls.name;
  };

  // Build day headers
  const dayHeaders = days.map(day => 
    `<th style="background: #1e40af; color: white; padding: 10px 6px; font-size: 11px; font-weight: 600; border: 1px solid #1e3a8a; text-align: center; min-width: 140px;">${day.label}</th>`
  ).join('');

  // Build rows - one per time slot
  const tableRows = timeSlots.map(slot => {
    const slotStyle = getSlotStyle(slot.slot_type);
    
    // Non-lesson slot (break, lunch, etc.)
    if (slotStyle) {
      const nonLessonCells = days.map(() => 
        `<td style="padding: 6px; border: 1px solid #d1d5db; background: ${slotStyle.bg}; text-align: center;">
          <span style="font-size: 11px; font-weight: 600; color: ${slotStyle.text};">${slotStyle.label}</span>
        </td>`
      ).join('');

      return `
        <tr>
          <td style="padding: 8px 6px; border: 1px solid #d1d5db; background: ${slotStyle.bg}; vertical-align: middle; white-space: nowrap;">
            <div style="font-weight: 600; font-size: 10px; color: ${slotStyle.text};">${slot.name}</div>
            <div style="font-size: 9px; color: ${slotStyle.text}; opacity: 0.8;">${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}</div>
          </td>
          ${nonLessonCells}
        </tr>
      `;
    }

    // Lesson slot - show all classes
    const dayCells = days.map(day => {
      const classEntries = classes.map(cls => {
        const entry = getEntry(cls.id, day.value, slot.id);
        if (!entry) return null;

        const teacherCode = entry.teacher?.employee_number 
          ? `${getInitials(entry.teacher.first_name, entry.teacher.last_name)}-${getNumericCode(entry.teacher.employee_number)}`
          : entry.teacher ? getInitials(entry.teacher.first_name, entry.teacher.last_name) : '';

        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 3px 6px; margin: 2px 0; background: #f0fdf4; border-left: 2px solid #22c55e; border-radius: 2px; font-size: 9px;">
            <span style="font-weight: 600; color: #374151;">${getClassName(cls)}</span>
            <span style="color: #059669;">${entry.subject?.name?.substring(0, 8) || '-'}</span>
            <span style="color: #6b7280; font-size: 8px;">${teacherCode}</span>
          </div>
        `;
      }).filter(Boolean).join('');

      return `
        <td style="padding: 4px; border: 1px solid #d1d5db; vertical-align: top; background: #fafafa;">
          ${classEntries || '<div style="text-align: center; color: #9ca3af; font-size: 10px; padding: 8px;">—</div>'}
        </td>
      `;
    }).join('');

    return `
      <tr>
        <td style="padding: 8px 6px; border: 1px solid #d1d5db; background: #f1f5f9; vertical-align: middle; white-space: nowrap;">
          <div style="font-weight: 600; font-size: 10px; color: #1e293b;">${slot.name}</div>
          <div style="font-size: 9px; color: #64748b;">${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}</div>
        </td>
        ${dayCells}
      </tr>
    `;
  }).join('');

  const levelLabel = levelFilter && levelFilter !== 'all' ? ` (${levelFilter})` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Week Block Timetable - ${timetableName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: landscape; margin: 10mm; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        body { 
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
          background: white; 
          padding: 15px;
          color: #1e293b;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }
        .header-left h1 {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2px;
        }
        .header-left p {
          font-size: 11px;
          color: #6b7280;
        }
        .header-right {
          text-align: right;
        }
        .header-right .timetable-name {
          font-size: 14px;
          font-weight: 700;
          color: #1e40af;
        }
        .header-right .level-filter {
          font-size: 10px;
          color: #6b7280;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 10px;
        }
        .legend {
          display: flex;
          gap: 20px;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          color: #4b5563;
        }
        .legend-color {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          border: 1px solid;
        }
        .footer {
          margin-top: 12px;
          text-align: center;
          font-size: 9px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <h1>${institutionName}</h1>
          <p>Week Block Timetable Overview</p>
        </div>
        <div class="header-right">
          <div class="timetable-name">${timetableName}${levelLabel}</div>
          <div class="level-filter">${classes.length} Classes • ${timeSlots.filter(s => s.slot_type === 'lesson').length} Periods/Day</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="background: #1e40af; color: white; padding: 10px 6px; font-size: 11px; font-weight: 600; border: 1px solid #1e3a8a; text-align: left; width: 90px;">Time</th>
            ${dayHeaders}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color" style="background: #f0fdf4; border-color: #22c55e;"></div>
          <span>Lesson</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #fef3c7; border-color: #f59e0b;"></div>
          <span>Break</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #ffedd5; border-color: #f97316;"></div>
          <span>Lunch</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #f3e8ff; border-color: #a855f7;"></div>
          <span>Assembly</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #d1fae5; border-color: #10b981;"></div>
          <span>Prep Time</span>
        </div>
        <span style="margin-left: auto; font-size: 9px; color: #6b7280;">Format: Class | Subject | Teacher Code (Initials-EmpNo)</span>
      </div>
      
      <div class="footer">
        Generated on ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')} • ${institutionName}
      </div>
      
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// Timetable PDF types
interface TimetableEntry {
  subject?: { name: string } | null;
  teacher?: { first_name: string; last_name: string } | null;
  room?: { name: string } | null;
}

interface TimetablePDFData {
  timetable: { name: string; timetable_type: string };
  className: string;
  classLevel: string;
  timeSlots: Array<{ id: string; name: string; start_time: string; end_time: string }>;
  days: Array<{ value: number; label: string; short: string }>;
  entries: Map<string, TimetableEntry>;
  institutionName: string;
}

export function generateTimetablePDF({ 
  timetable, 
  className, 
  classLevel, 
  timeSlots, 
  days, 
  entries, 
  institutionName 
}: TimetablePDFData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Build table header
  const headerCells = days.map(day => 
    `<th style="background: #f1f5f9; padding: 12px 8px; font-size: 13px; font-weight: 600; border: 1px solid #d1d5db; text-align: center; color: #1e293b;">${day.label}</th>`
  ).join('');

  // Build table rows
  const tableRows = timeSlots.map(slot => {
    const dayCells = days.map(day => {
      const entry = entries.get(`${day.value}-${slot.id}`);
      if (!entry) {
        return `<td style="padding: 8px; border: 1px solid #d1d5db; background: #fafafa; text-align: center; color: #9ca3af; font-size: 12px;">—</td>`;
      }
      
      const subjectName = entry.subject?.name || 'No Subject';
      const teacherName = entry.teacher 
        ? `${entry.teacher.first_name} ${entry.teacher.last_name}` 
        : '';
      const roomName = entry.room?.name || '';

      return `
        <td style="padding: 0; border: 1px solid #d1d5db; vertical-align: top;">
          <div style="background: #f0fdf4; margin: 4px; padding: 8px; border-radius: 6px; border-left: 3px solid #22c55e;">
            <div style="font-weight: 600; font-size: 13px; color: #111827; margin-bottom: 4px;">${subjectName}</div>
            ${teacherName ? `<div style="font-size: 11px; color: #374151;">${teacherName}</div>` : ''}
            ${roomName ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px;">📍 ${roomName}</div>` : ''}
          </div>
        </td>
      `;
    }).join('');

    return `
      <tr>
        <td style="padding: 10px; border: 1px solid #d1d5db; background: #f8fafc; vertical-align: middle; white-space: nowrap;">
          <div style="font-weight: 600; font-size: 12px; color: #1e293b;">${slot.name}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}</div>
        </td>
        ${dayCells}
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${className} - Timetable</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: landscape; margin: 1cm; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        body { 
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
          background: white; 
          padding: 20px;
          color: #1e293b;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #1e293b;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header-left h1 {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }
        .header-left p {
          font-size: 13px;
          color: #6b7280;
        }
        .header-right {
          text-align: right;
        }
        .header-right .class-name {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
        }
        .header-right .class-level {
          font-size: 12px;
          color: #6b7280;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .footer {
          margin-top: 15px;
          text-align: center;
          font-size: 10px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <h1>${institutionName}</h1>
          <p>${timetable.name} • ${timetable.timetable_type.charAt(0).toUpperCase() + timetable.timetable_type.slice(1)} Timetable</p>
        </div>
        <div class="header-right">
          <div class="class-name">${className}</div>
          <div class="class-level">${classLevel}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="background: #f1f5f9; padding: 12px 8px; font-size: 13px; font-weight: 600; border: 1px solid #d1d5db; text-align: left; width: 100px; color: #1e293b;">Time</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <div class="footer">
        Generated on ${format(new Date(), 'MMMM d, yyyy')} • ${institutionName}
      </div>
      
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

interface InvoicePDFData {
  invoice: any;
  institution: any;
  lines: any[];
}

interface ReceiptPDFData {
  invoice: any;
  institution: any;
  payments: any[];
  totalPaid: number;
}

interface ReportCardPDFData {
  student: any;
  exam: {
    name: string;
    term?: { name: string } | null;
    academic_year?: { name: string } | null;
    max_marks?: number;
  };
  scores: { 
    subject: string; 
    marks: number; 
    maxMarks?: number;
    grade: string; 
    points?: number;
    remarks?: string;
  }[];
  classRank?: number;
  totalStudents?: number;
  average: number;
  totalMarks?: number;
  totalMaxMarks?: number;
  institution: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
    motto?: string;
  };
  classTeacher?: string;
  principalRemarks?: string;
  gradingScale?: {
    name: string;
    grades: { grade: string; min_score: number; max_score: number; description?: string }[];
  };
}

export function generateInvoicePDF({ invoice, institution, lines }: InvoicePDFData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const lineRows = lines.map(line => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${line.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${line.quantity || 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(line.unit_amount || 0).toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${(line.total_amount || 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
        .invoice-container { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .logo-section h1 { font-size: 28px; color: #2563eb; font-weight: 700; }
        .logo-section p { color: #6b7280; font-size: 14px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 32px; color: #111827; text-transform: uppercase; letter-spacing: 2px; }
        .invoice-title .invoice-number { font-size: 16px; color: #6b7280; margin-top: 5px; }
        .billing-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .billing-box { flex: 1; }
        .billing-box h3 { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 10px; letter-spacing: 1px; }
        .billing-box p { font-size: 14px; margin-bottom: 4px; }
        .billing-box .name { font-weight: 600; font-size: 16px; color: #111827; }
        .invoice-details { background: #f9fafb; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px; }
        .invoice-details-row { display: flex; justify-content: space-between; }
        .invoice-details-item { text-align: center; }
        .invoice-details-item label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .invoice-details-item span { display: block; font-weight: 600; font-size: 14px; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        thead { background: #2563eb; color: white; }
        th { padding: 14px 12px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
        td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: right; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
        .totals-box { width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .totals-row.total { border-bottom: none; background: #2563eb; color: white; padding: 15px; margin: 10px -10px -10px; border-radius: 0 0 8px 8px; }
        .totals-row.total span { font-size: 18px; font-weight: 700; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .status-draft { background: #e5e7eb; color: #374151; }
        .status-posted { background: #fef3c7; color: #92400e; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        @media print {
          body { padding: 20px; }
          .invoice-container { max-width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo-section">
            <h1>${institution?.name || 'School Name'}</h1>
            <p>${institution?.address || ''}</p>
            <p>${institution?.phone || ''} | ${institution?.email || ''}</p>
          </div>
          <div class="invoice-title">
            <h2>Invoice</h2>
            <p class="invoice-number">${invoice.invoice_number}</p>
            <span class="status-badge status-${invoice.status || 'draft'}">${invoice.status || 'Draft'}</span>
          </div>
        </div>

        <div class="billing-section">
          <div class="billing-box">
            <h3>Bill To</h3>
            <p class="name">${invoice.student?.first_name || ''} ${invoice.student?.last_name || ''}</p>
            <p>Adm No: ${invoice.student?.admission_number || '-'}</p>
            <p>Class: ${invoice.student?.class?.name || '-'}</p>
            <p>Guardian: ${invoice.student?.guardian_name || '-'}</p>
            <p>Phone: ${invoice.student?.guardian_phone || '-'}</p>
          </div>
          <div class="billing-box" style="text-align: right;">
            <h3>Invoice Details</h3>
            <p><strong>Date:</strong> ${format(new Date(invoice.created_at || new Date()), 'dd MMM yyyy')}</p>
            <p><strong>Due Date:</strong> ${format(new Date(invoice.due_date), 'dd MMM yyyy')}</p>
            <p><strong>Term:</strong> ${invoice.term?.name || '-'}</p>
            <p><strong>Academic Year:</strong> ${invoice.academic_year?.name || '-'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineRows}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>${invoice.currency || 'KES'} ${invoice.total_amount.toLocaleString()}</span>
            </div>
            <div class="totals-row total">
              <span>Total Due</span>
              <span>${invoice.currency || 'KES'} ${invoice.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="margin-top: 10px;">This is a computer-generated invoice. No signature required.</p>
          <p style="margin-top: 5px;">Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}</p>
        </div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function generateReceiptPDF({ invoice, institution, payments, totalPaid }: ReceiptPDFData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const paymentRows = payments.map(payment => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${payment.receipt_number}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${format(new Date(payment.payment_date), 'dd MMM yyyy')}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">${payment.payment_method}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${payment.reference_number || '-'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${(payment.amount || 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const balance = invoice.total_amount - totalPaid;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
        .receipt-container { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #059669; padding-bottom: 20px; }
        .logo-section h1 { font-size: 28px; color: #059669; font-weight: 700; }
        .logo-section p { color: #6b7280; font-size: 14px; }
        .receipt-title { text-align: right; }
        .receipt-title h2 { font-size: 32px; color: #111827; text-transform: uppercase; letter-spacing: 2px; }
        .receipt-title p { font-size: 14px; color: #6b7280; margin-top: 5px; }
        .billing-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .billing-box { flex: 1; }
        .billing-box h3 { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 10px; letter-spacing: 1px; }
        .billing-box p { font-size: 14px; margin-bottom: 4px; }
        .billing-box .name { font-weight: 600; font-size: 16px; color: #111827; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        thead { background: #059669; color: white; }
        th { padding: 14px 12px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        th:last-child { text-align: right; }
        td:last-child { text-align: right; }
        .summary { display: flex; justify-content: flex-end; margin-bottom: 40px; }
        .summary-box { width: 300px; background: #f9fafb; border-radius: 8px; padding: 20px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .summary-row.total { border-top: 2px solid #059669; margin-top: 10px; padding-top: 15px; }
        .summary-row.total span { font-size: 18px; font-weight: 700; color: #059669; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        .paid-stamp { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg); font-size: 80px; color: rgba(5, 150, 105, 0.1); font-weight: 900; pointer-events: none; }
        @media print {
          body { padding: 20px; }
          .receipt-container { max-width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container" style="position: relative;">
        ${balance <= 0 ? '<div class="paid-stamp">PAID</div>' : ''}
        
        <div class="header">
          <div class="logo-section">
            <h1>${institution?.name || 'School Name'}</h1>
            <p>${institution?.address || ''}</p>
            <p>${institution?.phone || ''} | ${institution?.email || ''}</p>
          </div>
          <div class="receipt-title">
            <h2>Payment Receipt</h2>
            <p>Invoice: ${invoice.invoice_number}</p>
          </div>
        </div>

        <div class="billing-section">
          <div class="billing-box">
            <h3>Received From</h3>
            <p class="name">${invoice.student?.first_name || ''} ${invoice.student?.last_name || ''}</p>
            <p>Adm No: ${invoice.student?.admission_number || '-'}</p>
            <p>Class: ${invoice.student?.class?.name || '-'}</p>
            <p>Guardian: ${invoice.student?.guardian_name || '-'}</p>
          </div>
          <div class="billing-box" style="text-align: right;">
            <h3>Receipt Date</h3>
            <p style="font-size: 18px; font-weight: 600;">${format(new Date(), 'dd MMM yyyy')}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Date</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-box">
            <div class="summary-row">
              <span>Invoice Total</span>
              <span>${invoice.currency || 'KES'} ${invoice.total_amount.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Total Paid</span>
              <span style="color: #059669;">${invoice.currency || 'KES'} ${totalPaid.toLocaleString()}</span>
            </div>
            <div class="summary-row total">
              <span>Balance</span>
              <span style="color: ${balance > 0 ? '#dc2626' : '#059669'};">${invoice.currency || 'KES'} ${balance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your payment!</p>
          <p style="margin-top: 10px;">This is an official receipt. Keep it for your records.</p>
          <p style="margin-top: 5px;">Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}</p>
        </div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function generateReportCardPDF({
  student,
  exam,
  scores,
  classRank,
  totalStudents,
  average,
  totalMarks: propTotalMarks,
  totalMaxMarks: propTotalMaxMarks,
  institution,
  classTeacher,
  principalRemarks,
  gradingScale,
}: ReportCardPDFData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  // Get grade color - supports both CBC rubrics and traditional letter grades
  const getGradeColor = (grade: string) => {
    const g = grade?.toUpperCase() || '';
    // CBC Rubric colors
    if (g.startsWith('EE')) return '#059669'; // Green - Exceeding Expectations
    if (g.startsWith('ME')) return '#0284c7'; // Blue - Meeting Expectations
    if (g.startsWith('AE')) return '#ca8a04'; // Yellow - Approaching Expectations
    if (g.startsWith('BE')) return '#dc2626'; // Red - Below Expectations
    // KCSE/Standard letter grades
    if (g === 'A' || g === 'A+') return '#059669';
    if (g === 'A-' || g === 'B+') return '#0d9488';
    if (g === 'B' || g === 'B-') return '#0284c7';
    if (g === 'C+' || g === 'C') return '#ca8a04';
    if (g === 'C-' || g === 'D+') return '#ea580c';
    if (g === 'D' || g === 'D-') return '#dc2626';
    if (g === 'E' || g === 'F') return '#991b1b';
    return '#6b7280';
  };

  const defaultMaxMarks = exam?.max_marks || 100;
  const calculatedTotalMarks = propTotalMarks ?? scores.reduce((sum, s) => sum + (s.marks || 0), 0);
  const calculatedTotalMaxMarks = propTotalMaxMarks ?? scores.reduce((sum, s) => sum + (s.maxMarks || defaultMaxMarks), 0);
  
  // Determine if we need compact mode for many subjects
  const isCompactMode = scores.length > 12;
  const tableFontSize = isCompactMode ? '12px' : '14px';
  const tablePadding = isCompactMode ? '8px 12px' : '12px 16px';

  // Build score rows with max marks column
  const scoreRows = scores.map((score, index) => {
    const maxMarks = score.maxMarks || defaultMaxMarks;
    const percentage = maxMarks > 0 ? ((score.marks / maxMarks) * 100).toFixed(0) : '0';
    return `
      <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
        <td style="padding: ${tablePadding}; border-bottom: 1px solid #e5e7eb; font-size: ${tableFontSize};">${score.subject}</td>
        <td style="padding: ${tablePadding}; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600; font-size: ${tableFontSize};">${score.marks}</td>
        <td style="padding: ${tablePadding}; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: ${tableFontSize};">${maxMarks}</td>
        <td style="padding: ${tablePadding}; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: ${tableFontSize};">${percentage}%</td>
        <td style="padding: ${tablePadding}; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <span style="display: inline-block; padding: 3px 10px; border-radius: 16px; font-weight: 600; font-size: 12px; color: white; background: ${getGradeColor(score.grade)};">${score.grade}</span>
        </td>
        ${score.points !== undefined ? `<td style="padding: ${tablePadding}; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600; font-size: ${tableFontSize};">${score.points}</td>` : ''}
        <td style="padding: ${tablePadding}; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: ${isCompactMode ? '11px' : '13px'};">${score.remarks || '-'}</td>
      </tr>
    `;
  }).join('');

  // Totals row
  const totalPoints = scores.reduce((sum, s) => sum + (s.points || 0), 0);
  const hasPoints = scores.some(s => s.points !== undefined);
  const totalsRow = `
    <tr style="background: #1e3a5f; color: white; font-weight: 600;">
      <td style="padding: ${tablePadding}; font-size: ${tableFontSize};">TOTAL</td>
      <td style="padding: ${tablePadding}; text-align: center; font-size: ${tableFontSize};">${calculatedTotalMarks}</td>
      <td style="padding: ${tablePadding}; text-align: center; font-size: ${tableFontSize};">${calculatedTotalMaxMarks}</td>
      <td style="padding: ${tablePadding}; text-align: center; font-size: ${tableFontSize};">${calculatedTotalMaxMarks > 0 ? ((calculatedTotalMarks / calculatedTotalMaxMarks) * 100).toFixed(1) : 0}%</td>
      <td style="padding: ${tablePadding}; text-align: center;">-</td>
      ${hasPoints ? `<td style="padding: ${tablePadding}; text-align: center; font-size: ${tableFontSize};">${totalPoints}</td>` : ''}
      <td style="padding: ${tablePadding};">-</td>
    </tr>
  `;

  // Calculate overall grade using the curriculum-specific grading scale
  const getOverallGradeFromScale = (avg: number): { grade: string; description: string } => {
    if (gradingScale?.grades) {
      // Find matching grade from the curriculum's grading scale
      const matchingGrade = gradingScale.grades.find(
        g => avg >= g.min_score && avg <= g.max_score
      );
      if (matchingGrade) {
        return { 
          grade: matchingGrade.grade, 
          description: matchingGrade.description || '' 
        };
      }
    }
    // Fallback to KCSE-style letter grades if no grading scale provided
    if (avg >= 80) return { grade: 'A', description: 'Excellent' };
    if (avg >= 70) return { grade: 'B', description: 'Good' };
    if (avg >= 60) return { grade: 'C', description: 'Average' };
    if (avg >= 50) return { grade: 'D', description: 'Below Average' };
    return { grade: 'E', description: 'Needs Improvement' };
  };

  const overallGradeResult = getOverallGradeFromScale(average);
  const overallGrade = overallGradeResult.grade;
  const overallGradeDescription = overallGradeResult.description;

  // Build grading scale legend if provided
  const gradingScaleLegend = gradingScale ? `
    <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <h4 style="font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; letter-spacing: 1px;">Grading Scale: ${gradingScale.name}</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${gradingScale.grades.slice(0, 8).map(g => `
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 11px; color: white; background: ${getGradeColor(g.grade)};">${g.grade}</span>
            <span style="font-size: 11px; color: #64748b;">${g.min_score}-${g.max_score}%</span>
            ${g.description ? `<span style="font-size: 10px; color: #94a3b8;">(${g.description})</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  // School logo section
  const logoSection = institution?.logo_url 
    ? `<img src="${institution.logo_url}" alt="School Logo" style="height: 80px; width: 80px; object-fit: contain; border-radius: 8px; background: white; padding: 5px;" />`
    : `<div style="height: 80px; width: 80px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 36px; font-weight: 700;">${(institution?.name || 'S').charAt(0)}</span>
       </div>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Card - ${student.first_name} ${student.last_name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', 'Georgia', 'Times New Roman', serif; 
          padding: 20px; 
          color: #1f2937; 
          line-height: 1.5; 
          background: #fff; 
        }
        .report-card { 
          max-width: 850px; 
          margin: 0 auto; 
          border: 3px solid #1e3a5f; 
          border-radius: 4px;
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%); 
          color: white; 
          padding: 25px 30px; 
        }
        .header-top {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 15px;
        }
        .header-info {
          flex: 1;
        }
        .header-info h1 { 
          font-size: 26px; 
          font-weight: 700; 
          margin-bottom: 4px; 
          letter-spacing: 1px; 
          text-transform: uppercase; 
        }
        .header-info .motto {
          font-style: italic;
          font-size: 13px;
          opacity: 0.9;
          margin-bottom: 4px;
        }
        .header-info .contact { 
          font-size: 12px; 
          opacity: 0.85; 
        }
        .exam-banner {
          background: rgba(0,0,0,0.2);
          padding: 12px 20px;
          border-radius: 6px;
          text-align: center;
          margin-top: 10px;
        }
        .exam-banner h2 { 
          font-size: 18px; 
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .exam-banner p {
          font-size: 12px;
          opacity: 0.9;
          margin-top: 4px;
        }
        .content { padding: 25px 30px; }
        .student-info { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 25px; 
          padding: 18px 20px; 
          background: #f8fafc; 
          border-radius: 8px; 
          border-left: 4px solid #2563eb; 
        }
        .student-info-section { flex: 1; }
        .student-info-section h3 { 
          font-size: 10px; 
          text-transform: uppercase; 
          color: #64748b; 
          letter-spacing: 1px; 
          margin-bottom: 8px; 
          font-weight: 600;
        }
        .student-info-section p { 
          font-size: 13px; 
          margin-bottom: 3px; 
        }
        .student-info-section .value { 
          font-weight: 600; 
          color: #111827; 
        }
        .student-info-section .name-value {
          font-size: 16px;
          font-weight: 700;
          color: #1e3a5f;
        }
        .scores-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px; 
          border-radius: 8px; 
          overflow: hidden; 
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
        }
        .scores-table thead { background: #1e3a5f; color: white; }
        .scores-table th { 
          padding: ${tablePadding}; 
          text-align: left; 
          font-weight: 600; 
          font-size: 11px; 
          text-transform: uppercase; 
          letter-spacing: 0.5px; 
        }
        .scores-table th:nth-child(2), 
        .scores-table th:nth-child(3), 
        .scores-table th:nth-child(4),
        .scores-table th:nth-child(5),
        .scores-table th:nth-child(6) { text-align: center; }
        .summary-section { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          gap: 15px; 
          margin-bottom: 25px; 
        }
        .summary-box { 
          padding: 18px 15px; 
          border-radius: 10px; 
          text-align: center; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .summary-box.rank { background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); }
        .summary-box.total { background: linear-gradient(135deg, #e0e7ff 0%, #818cf8 100%); }
        .summary-box.average { background: linear-gradient(135deg, #dbeafe 0%, #60a5fa 100%); }
        .summary-box.grade { background: linear-gradient(135deg, #d1fae5 0%, #34d399 100%); }
        .summary-box h4 { 
          font-size: 10px; 
          text-transform: uppercase; 
          color: #374151; 
          margin-bottom: 6px; 
          letter-spacing: 1px; 
          font-weight: 600;
        }
        .summary-box .value { 
          font-size: 28px; 
          font-weight: 700; 
          color: #111827; 
        }
        .summary-box .sub-value {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }
        .remarks-section { 
          background: #f9fafb; 
          padding: 16px 20px; 
          border-radius: 8px; 
          margin-bottom: 15px; 
          border: 1px solid #e5e7eb;
        }
        .remarks-section h4 { 
          font-size: 11px; 
          text-transform: uppercase; 
          color: #64748b; 
          margin-bottom: 8px; 
          letter-spacing: 1px; 
          font-weight: 600;
        }
        .remarks-section p { 
          font-size: 13px; 
          color: #374151; 
          min-height: 30px; 
          line-height: 1.6;
        }
        .signatures { 
          display: flex; 
          justify-content: space-between; 
          margin-top: 35px; 
          padding-top: 20px; 
        }
        .signature-box { 
          text-align: center; 
          width: 180px; 
        }
        .signature-line { 
          border-top: 1px solid #374151; 
          margin-bottom: 6px; 
        }
        .signature-box p { 
          font-size: 11px; 
          color: #6b7280; 
        }
        .signature-box .date {
          font-size: 10px;
          color: #9ca3af;
          margin-top: 3px;
        }
        .footer { 
          text-align: center; 
          padding: 12px; 
          background: #f3f4f6; 
          font-size: 10px; 
          color: #6b7280; 
          border-top: 1px solid #e5e7eb; 
        }
        @media print {
          body { padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .report-card { border: 2px solid #1e3a5f; max-width: 100%; }
          @page { margin: 0.5cm; }
        }
      </style>
    </head>
    <body>
      <div class="report-card">
        <div class="header">
          <div class="header-top">
            ${logoSection}
            <div class="header-info">
              <h1>${institution?.name || 'School Name'}</h1>
              ${institution?.motto ? `<p class="motto">"${institution.motto}"</p>` : ''}
              <p class="contact">${[institution?.address, institution?.phone, institution?.email].filter(Boolean).join(' | ')}</p>
            </div>
          </div>
          <div class="exam-banner">
            <h2>${exam?.name || 'Examination'} Report Card</h2>
            <p>${exam?.term?.name ? `${exam.term.name} • ` : ''}${exam?.academic_year?.name || new Date().getFullYear()}</p>
          </div>
        </div>

        <div class="content">
          <div class="student-info">
            <div class="student-info-section">
              <h3>Student Details</h3>
              <p><span class="name-value">${student.first_name} ${student.last_name}</span></p>
              <p>Adm No: <span class="value">${student.admission_number || '-'}</span></p>
              <p>Class: <span class="value">${student.class?.name || student.className || '-'}</span></p>
            </div>
            <div class="student-info-section" style="text-align: right;">
              <h3>Report Details</h3>
              <p>Subjects: <span class="value">${scores.length}</span></p>
              <p>Max per Subject: <span class="value">${defaultMaxMarks}</span></p>
              <p>Date Issued: <span class="value">${format(new Date(), 'dd MMM yyyy')}</span></p>
            </div>
          </div>

          <table class="scores-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th style="text-align: center;">Marks</th>
                <th style="text-align: center;">Max</th>
                <th style="text-align: center;">%</th>
                <th style="text-align: center;">Grade</th>
                ${hasPoints ? '<th style="text-align: center;">Points</th>' : ''}
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${scoreRows}
              ${totalsRow}
            </tbody>
          </table>

          <div class="summary-section">
            ${classRank ? `
              <div class="summary-box rank">
                <h4>Class Rank</h4>
                <div class="value">${classRank}</div>
                <div class="sub-value">out of ${totalStudents || '-'} students</div>
              </div>
            ` : ''}
            <div class="summary-box total">
              <h4>Total Marks</h4>
              <div class="value">${calculatedTotalMarks}</div>
              <div class="sub-value">out of ${calculatedTotalMaxMarks}</div>
            </div>
            <div class="summary-box average">
              <h4>Average</h4>
              <div class="value">${average.toFixed(1)}%</div>
              <div class="sub-value">overall percentage</div>
            </div>
            <div class="summary-box grade">
              <h4>Overall Grade</h4>
              <div class="value">${overallGrade}</div>
              <div class="sub-value">${overallGradeDescription}</div>
            </div>
          </div>

          ${gradingScaleLegend}

          <div class="remarks-section" style="margin-top: 20px;">
            <h4>Class Teacher's Remarks</h4>
            <p>${classTeacher || getAutoRemarks(average)}</p>
          </div>

          <div class="remarks-section">
            <h4>Principal's Remarks</h4>
            <p>${principalRemarks || 'Keep up the good work!'}</p>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Class Teacher</p>
              <p class="date">Date: ___________</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Principal</p>
              <p class="date">Date: ___________</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Parent/Guardian</p>
              <p class="date">Date: ___________</p>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This is an official academic report issued by ${institution?.name || 'the institution'}. | Generated on ${format(new Date(), 'dd MMMM yyyy, HH:mm')}</p>
        </div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function getAutoRemarks(average: number): string {
  if (average >= 80) return 'Excellent performance! Keep up the outstanding work. You are a role model for others.';
  if (average >= 70) return 'Very good performance. Continue to strive for excellence and maintain your dedication.';
  if (average >= 60) return 'Good performance. With more effort and focus, even better results are achievable.';
  if (average >= 50) return 'Satisfactory performance. More dedication and consistent study habits are needed.';
  if (average >= 40) return 'Below average. Extra effort, remedial classes, and parental support are required.';
  return 'Needs significant improvement. Intensive support and close monitoring recommended.';
}

function getGradeDescription(grade: string): string {
  const g = grade?.toUpperCase() || '';
  // CBC Rubric descriptions
  if (g === 'EE1') return 'Highly Exceeding Expectations';
  if (g === 'EE2' || g === 'EE') return 'Exceeding Expectations';
  if (g === 'ME1') return 'Strongly Meeting Expectations';
  if (g === 'ME2' || g === 'ME') return 'Meeting Expectations';
  if (g === 'AE1') return 'Approaching Expectations';
  if (g === 'AE2' || g === 'AE') return 'Nearly Approaching Expectations';
  if (g === 'BE1') return 'Below Expectations';
  if (g === 'BE2' || g === 'BE') return 'Significantly Below Expectations';
  // KCSE/Standard letter grades
  if (g === 'A' || g === 'A+') return 'Excellent';
  if (g === 'A-' || g === 'B+') return 'Very Good';
  if (g === 'B' || g === 'B-') return 'Good';
  if (g === 'C+' || g === 'C') return 'Average';
  if (g === 'C-' || g === 'D+') return 'Below Average';
  if (g === 'D' || g === 'D-') return 'Poor';
  if (g === 'E' || g === 'F') return 'Fail';
  return '';
}

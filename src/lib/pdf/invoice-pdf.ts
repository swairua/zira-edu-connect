import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface InvoiceData {
  invoice: {
    id: string;
    invoice_number: string;
    status: string;
    total_amount: number;
    currency?: string;
    due_date: string;
    created_at: string;
    student?: {
      first_name: string;
      last_name: string;
      admission_number: string;
      guardian_name?: string;
      guardian_phone?: string;
      class?: { name: string };
    };
    academic_year?: { name: string };
    term?: { name: string };
  };
  institution: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
  lines: Array<{
    description: string;
    quantity?: number;
    unit_amount?: number;
    total_amount: number;
  }>;
}

interface ReceiptData {
  invoice: InvoiceData['invoice'];
  institution: InvoiceData['institution'];
  payments: Array<{
    receipt_number: string;
    payment_date: string;
    payment_method: string;
    transaction_reference?: string;
    amount: number;
  }>;
  totalPaid: number;
}

interface FeeStatementData {
  student: {
    first_name: string;
    last_name: string;
    admission_number: string;
    class?: { name: string };
  };
  institution: InvoiceData['institution'];
  period: { start: Date; end: Date };
  openingBalance: number;
  transactions: Array<{
    date: string;
    description: string;
    type: 'invoice' | 'payment' | 'adjustment';
    debit?: number;
    credit?: number;
    balance: number;
  }>;
  closingBalance: number;
}

// Helper to add institution header
function addInstitutionHeader(doc: jsPDF, institution: InvoiceData['institution'], title: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Institution name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // Blue
  doc.text(institution.name || 'School Name', 20, 25);
  
  // Contact info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128); // Gray
  let yPos = 32;
  if (institution.address) {
    doc.text(institution.address, 20, yPos);
    yPos += 5;
  }
  const contactLine = [institution.phone, institution.email].filter(Boolean).join(' | ');
  if (contactLine) {
    doc.text(contactLine, 20, yPos);
  }
  
  // Document title on right
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(title, pageWidth - 20, 25, { align: 'right' });
  
  // Separator line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.8);
  doc.line(20, 45, pageWidth - 20, 45);
  
  return 50; // Return next Y position
}

export function generateInvoicePDFBlob(data: InvoiceData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { invoice, institution, lines } = data;
  const currency = invoice.currency || 'KES';
  
  let yPos = addInstitutionHeader(doc, institution, 'INVOICE');
  
  // Invoice number and status
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(invoice.invoice_number, pageWidth - 20, 32, { align: 'right' });
  
  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    draft: [229, 231, 235],
    posted: [254, 243, 199],
    paid: [209, 250, 229],
    cancelled: [254, 226, 226],
    partially_paid: [254, 243, 199],
  };
  const statusTextColors: Record<string, [number, number, number]> = {
    draft: [55, 65, 81],
    posted: [146, 64, 14],
    paid: [6, 95, 70],
    cancelled: [153, 27, 27],
    partially_paid: [146, 64, 14],
  };
  const bgColor = statusColors[invoice.status] || statusColors.draft;
  const textColor = statusTextColors[invoice.status] || statusTextColors.draft;
  
  doc.setFillColor(...bgColor);
  doc.roundedRect(pageWidth - 50, 35, 30, 7, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...textColor);
  doc.text(invoice.status.toUpperCase(), pageWidth - 35, 40, { align: 'center' });
  
  // Bill To section
  yPos += 5;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('BILL TO', 20, yPos);
  
  yPos += 6;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`${invoice.student?.first_name || ''} ${invoice.student?.last_name || ''}`, 20, yPos);
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Adm No: ${invoice.student?.admission_number || '-'}`, 20, yPos);
  
  yPos += 5;
  doc.text(`Class: ${invoice.student?.class?.name || '-'}`, 20, yPos);
  
  if (invoice.student?.guardian_name) {
    yPos += 5;
    doc.text(`Guardian: ${invoice.student.guardian_name}`, 20, yPos);
  }
  
  // Invoice details on right
  let rightY = 55;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('INVOICE DETAILS', pageWidth - 20, rightY, { align: 'right' });
  
  rightY += 6;
  doc.setTextColor(75, 85, 99);
  doc.text(`Date: ${format(new Date(invoice.created_at || new Date()), 'dd MMM yyyy')}`, pageWidth - 20, rightY, { align: 'right' });
  
  rightY += 5;
  doc.text(`Due: ${format(new Date(invoice.due_date), 'dd MMM yyyy')}`, pageWidth - 20, rightY, { align: 'right' });
  
  if (invoice.term?.name) {
    rightY += 5;
    doc.text(`Term: ${invoice.term.name}`, pageWidth - 20, rightY, { align: 'right' });
  }
  
  if (invoice.academic_year?.name) {
    rightY += 5;
    doc.text(`Year: ${invoice.academic_year.name}`, pageWidth - 20, rightY, { align: 'right' });
  }
  
  // Items table
  yPos = Math.max(yPos, rightY) + 15;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: lines.map(line => [
      line.description,
      (line.quantity || 1).toString(),
      `${currency} ${(line.unit_amount || 0).toLocaleString()}`,
      `${currency} ${line.total_amount.toLocaleString()}`,
    ]),
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [55, 65, 81],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'right', cellWidth: 40 },
      3: { halign: 'right', cellWidth: 40, fontStyle: 'bold' },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Total section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(pageWidth - 90, finalY, 70, 25, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Total Due', pageWidth - 85, finalY + 10);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(`${currency} ${invoice.total_amount.toLocaleString()}`, pageWidth - 25, finalY + 18, { align: 'right' });
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text('This is a computer-generated invoice. No signature required.', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth / 2, footerY + 5, { align: 'center' });
  
  return doc.output('blob');
}

export function downloadInvoicePDF(data: InvoiceData, filename?: string): void {
  const blob = generateInvoicePDFBlob(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `Invoice-${data.invoice.invoice_number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateReceiptPDFBlob(data: ReceiptData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { invoice, institution, payments, totalPaid } = data;
  const currency = invoice.currency || 'KES';
  const balance = invoice.total_amount - totalPaid;
  
  let yPos = addInstitutionHeader(doc, institution, 'RECEIPT');
  
  // Change header color for receipt
  doc.setDrawColor(5, 150, 105); // Green
  doc.setLineWidth(0.8);
  doc.line(20, 45, pageWidth - 20, 45);
  
  // Reference invoice
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`For Invoice: ${invoice.invoice_number}`, pageWidth - 20, 32, { align: 'right' });
  
  // Paid stamp if fully paid
  if (balance <= 0) {
    doc.setFontSize(50);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105, 0.15);
    doc.text('PAID', pageWidth / 2, 140, { align: 'center', angle: -30 });
  }
  
  // Student info
  yPos += 5;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('RECEIVED FROM', 20, yPos);
  
  yPos += 6;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`${invoice.student?.first_name || ''} ${invoice.student?.last_name || ''}`, 20, yPos);
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Adm No: ${invoice.student?.admission_number || '-'}`, 20, yPos);
  
  yPos += 5;
  doc.text(`Class: ${invoice.student?.class?.name || '-'}`, 20, yPos);
  
  // Payments table
  yPos += 15;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Receipt No.', 'Date', 'Method', 'Reference', 'Amount']],
    body: payments.map(p => [
      p.receipt_number,
      format(new Date(p.payment_date), 'dd MMM yyyy'),
      p.payment_method,
      p.transaction_reference || '-',
      `${currency} ${p.amount.toLocaleString()}`,
    ]),
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [55, 65, 81],
    },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(pageWidth - 100, finalY, 80, 40, 3, 3, 'F');
  
  let summaryY = finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text('Invoice Total:', pageWidth - 95, summaryY);
  doc.text(`${currency} ${invoice.total_amount.toLocaleString()}`, pageWidth - 25, summaryY, { align: 'right' });
  
  summaryY += 8;
  doc.text('Amount Paid:', pageWidth - 95, summaryY);
  doc.setTextColor(5, 150, 105);
  doc.text(`${currency} ${totalPaid.toLocaleString()}`, pageWidth - 25, summaryY, { align: 'right' });
  
  summaryY += 10;
  doc.setLineWidth(0.5);
  doc.setDrawColor(5, 150, 105);
  doc.line(pageWidth - 95, summaryY - 3, pageWidth - 25, summaryY - 3);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(balance > 0 ? 220 : 5, balance > 0 ? 38 : 150, balance > 0 ? 38 : 105);
  doc.text('Balance:', pageWidth - 95, summaryY + 3);
  doc.text(`${currency} ${balance.toLocaleString()}`, pageWidth - 25, summaryY + 3, { align: 'right' });
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for your payment!', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth / 2, footerY + 5, { align: 'center' });
  
  return doc.output('blob');
}

export function downloadReceiptPDF(data: ReceiptData, filename?: string): void {
  const blob = generateReceiptPDFBlob(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `Receipt-${data.invoice.invoice_number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateFeeStatementPDFBlob(data: FeeStatementData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { student, institution, period, openingBalance, transactions, closingBalance } = data;
  
  let yPos = addInstitutionHeader(doc, institution, 'FEE STATEMENT');
  
  // Period info
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Period: ${format(period.start, 'dd MMM yyyy')} - ${format(period.end, 'dd MMM yyyy')}`,
    pageWidth - 20, 32, { align: 'right' }
  );
  
  // Student info
  yPos += 5;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('STATEMENT FOR', 20, yPos);
  
  yPos += 6;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`${student.first_name} ${student.last_name}`, 20, yPos);
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Adm No: ${student.admission_number}`, 20, yPos);
  
  if (student.class?.name) {
    yPos += 5;
    doc.text(`Class: ${student.class.name}`, 20, yPos);
  }
  
  // Opening balance
  yPos += 10;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, yPos, pageWidth - 40, 12, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Opening Balance:', 25, yPos + 8);
  doc.text(`KES ${openingBalance.toLocaleString()}`, pageWidth - 25, yPos + 8, { align: 'right' });
  
  // Transactions table
  yPos += 20;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Description', 'Debit', 'Credit', 'Balance']],
    body: transactions.map(t => [
      format(new Date(t.date), 'dd MMM yyyy'),
      t.description,
      t.debit ? `KES ${t.debit.toLocaleString()}` : '-',
      t.credit ? `KES ${t.credit.toLocaleString()}` : '-',
      `KES ${t.balance.toLocaleString()}`,
    ]),
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [55, 65, 81],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' },
      2: { halign: 'right', cellWidth: 32, textColor: [220, 38, 38] },
      3: { halign: 'right', cellWidth: 32, textColor: [5, 150, 105] },
      4: { halign: 'right', cellWidth: 35, fontStyle: 'bold' },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Closing balance
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(pageWidth - 100, finalY, 80, 20, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Closing Balance', pageWidth - 95, finalY + 8);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`KES ${closingBalance.toLocaleString()}`, pageWidth - 25, finalY + 15, { align: 'right' });
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth / 2, footerY, { align: 'center' });
  
  return doc.output('blob');
}

export function downloadFeeStatementPDF(data: FeeStatementData, filename?: string): void {
  const blob = generateFeeStatementPDFBlob(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `Fee-Statement-${data.student.admission_number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

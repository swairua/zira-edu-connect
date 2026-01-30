import Papa from 'papaparse';

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(title: string, data: Record<string, unknown>[]): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const tableRows = data.map(row => 
    `<tr>${headers.map(h => `<td style="border: 1px solid #ddd; padding: 8px;">${row[h] ?? ''}</td>`).join('')}</tr>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th { background-color: #f5f5f5; border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-weight: 600; }
        td { border: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #fafafa; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .date { color: #666; font-size: 14px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <span class="date">Generated: ${new Date().toLocaleDateString()}</span>
      </div>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${formatHeader(h)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function formatHeader(header: string): string {
  return header
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export function formatStudentData(students: any[]): Record<string, unknown>[] {
  return students.map(s => ({
    'Admission No': s.admission_number || '',
    'Name': `${s.first_name || ''} ${s.last_name || ''}`.trim(),
    'Class': s.classes?.name || '',
    'Gender': s.gender || '',
    'Status': s.status || '',
    'Guardian Name': s.guardian_name || '',
    'Guardian Phone': s.guardian_phone || '',
    'Date of Birth': s.date_of_birth || '',
  }));
}

export function formatStaffData(staff: any[]): Record<string, unknown>[] {
  return staff.map(s => ({
    'Employee ID': s.employee_id || '',
    'Name': `${s.first_name || ''} ${s.last_name || ''}`.trim(),
    'Department': s.department || '',
    'Position': s.position || '',
    'Phone': s.phone || '',
    'Email': s.email || '',
    'Status': s.status || '',
    'Hire Date': s.hire_date || '',
  }));
}

export function formatPaymentData(payments: any[]): Record<string, unknown>[] {
  return payments.map(p => ({
    'Receipt No': p.receipt_number || '',
    'Student': p.students ? `${p.students.first_name || ''} ${p.students.last_name || ''}`.trim() : '',
    'Amount': p.amount || 0,
    'Payment Method': p.payment_method || '',
    'Date': p.payment_date || '',
    'Status': p.status || '',
    'Reference': p.reference_number || '',
  }));
}

export function formatAttendanceData(attendance: any[]): Record<string, unknown>[] {
  return attendance.map(a => ({
    'Date': a.date || '',
    'Student': a.students ? `${a.students.first_name || ''} ${a.students.last_name || ''}`.trim() : '',
    'Class': a.classes?.name || '',
    'Status': a.status || '',
    'Notes': a.notes || '',
  }));
}

export function formatExamResultsData(scores: any[]): Record<string, unknown>[] {
  return scores.map(s => ({
    'Student': s.students ? `${s.students.first_name || ''} ${s.students.last_name || ''}`.trim() : '',
    'Exam': s.exams?.name || '',
    'Subject': s.subjects?.name || '',
    'Score': s.score ?? '',
    'Grade': s.grade || '',
    'Remarks': s.remarks || '',
  }));
}

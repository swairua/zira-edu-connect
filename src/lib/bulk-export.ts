import Papa from 'papaparse';
import type { Student } from '@/hooks/useStudents';

export interface ExportableStudent {
  admission_number: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  class_name: string;
  boarding_status: string;
  status: string;
}

export interface ExportableParent {
  phone: string;
  first_name: string;
  last_name: string;
  email: string;
  relationship_type: string;
  occupation: string;
  address: string;
}

export interface ExportableStaff {
  employee_number: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employment_type: string;
  date_joined: string;
  is_active: string;
}

export interface Parent {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  relationship_type: string | null;
  occupation: string | null;
  address: string | null;
}

export interface StaffMember {
  id: string;
  employee_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  designation?: string | null;
  employment_type?: string | null;
  date_joined?: string | null;
  is_active?: boolean | null;
}

/**
 * Export students in a format ready for bulk update
 * Includes all editable fields pre-filled with current data
 */
export function exportStudentsForUpdate(students: Student[]): string {
  const exportData: ExportableStudent[] = students.map(student => ({
    admission_number: student.admission_number,
    first_name: student.first_name,
    middle_name: student.middle_name || '',
    last_name: student.last_name,
    gender: student.gender || '',
    date_of_birth: student.date_of_birth || '',
    nationality: student.nationality || '',
    class_name: student.class?.name || '',
    boarding_status: student.boarding_status || '',
    status: student.status || 'active',
  }));

  return Papa.unparse(exportData);
}

/**
 * Export parents in a format ready for bulk update
 * Includes all editable fields pre-filled with current data
 */
export function exportParentsForUpdate(parents: Parent[]): string {
  const exportData: ExportableParent[] = parents.map(parent => ({
    phone: parent.phone,
    first_name: parent.first_name,
    last_name: parent.last_name,
    email: parent.email || '',
    relationship_type: parent.relationship_type || '',
    occupation: parent.occupation || '',
    address: parent.address || '',
  }));

  return Papa.unparse(exportData);
}

/**
 * Export staff in a format ready for bulk update
 * Includes all editable fields pre-filled with current data
 */
export function exportStaffForUpdate(staff: StaffMember[]): string {
  const exportData: ExportableStaff[] = staff.map(s => ({
    employee_number: s.employee_number,
    first_name: s.first_name,
    middle_name: s.middle_name || '',
    last_name: s.last_name,
    email: s.email || '',
    phone: s.phone || '',
    department: s.department || '',
    designation: s.designation || '',
    employment_type: s.employment_type || '',
    date_joined: s.date_joined || '',
    is_active: s.is_active ? 'true' : 'false',
  }));

  return Papa.unparse(exportData);
}

/**
 * Download a CSV file with the given content
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export students and trigger download
 */
export function downloadStudentsForUpdate(students: Student[], institutionName?: string): void {
  const csvContent = exportStudentsForUpdate(students);
  const filename = `${institutionName?.replace(/\s+/g, '_') || 'students'}_update_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export parents and trigger download
 */
export function downloadParentsForUpdate(parents: Parent[], institutionName?: string): void {
  const csvContent = exportParentsForUpdate(parents);
  const filename = `${institutionName?.replace(/\s+/g, '_') || 'parents'}_update_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export staff and trigger download
 */
export function downloadStaffForUpdate(staff: StaffMember[], institutionName?: string): void {
  const csvContent = exportStaffForUpdate(staff);
  const filename = `${institutionName?.replace(/\s+/g, '_') || 'staff'}_update_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Question export interface
 */
export interface ExportableQuestion {
  id: string;
  subject_code: string;
  topic: string;
  question_type: string;
  question_text: string;
  marks: number;
  difficulty: string;
  cognitive_level: string;
  explanation: string;
  is_active: string;
}

/**
 * Export questions in a format ready for bulk update
 */
export function exportQuestionsForUpdate(questions: ExportableQuestion[]): string {
  return Papa.unparse(questions);
}

/**
 * Export questions and trigger download
 */
export function downloadQuestionsForUpdate(questions: ExportableQuestion[], institutionName?: string): void {
  const csvContent = exportQuestionsForUpdate(questions);
  const filename = `${institutionName?.replace(/\s+/g, '_') || 'questions'}_update_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

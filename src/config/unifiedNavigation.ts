import {
  Home,
  BookOpen,
  ClipboardList,
  Calendar,
  CalendarDays,
  FileText,
  MessageSquare,
  User,
  Award,
  Wallet,
  CreditCard,
  LayoutDashboard,
  CheckCircle,
  Percent,
  Calculator,
  Lock,
  Clock,
  Receipt,
  TrendingUp,
  FileBarChart,
  Library,
  Users,
  Settings,
  Briefcase,
  Bus,
  Building,
  Landmark,
  BarChart3,
  FolderCog,
  ChevronDown,
  Layers,
  NotebookPen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PortalType = 'admin' | 'teacher' | 'student' | 'parent' | 'staff' | 'finance';

export interface UnifiedNavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  showInMore?: boolean;
  requiresModule?: string;
  /** Roles that can see this item (if not specified, all roles can see it) */
  roles?: string[];
  /** Section grouping for organized sidebar display */
  section?: string;
  /** Only show for public schools (ownership_type = 'public') */
  publicSchoolOnly?: boolean;
  /** Only show for private schools (ownership_type = 'private') */
  privateSchoolOnly?: boolean;
}

export interface UnifiedNavConfig {
  main: UnifiedNavItem[];
  secondary: UnifiedNavItem[];
}

// Navigation section definitions for grouped display
export interface NavSection {
  id: string;
  label: string;
  icon?: LucideIcon;
  collapsible?: boolean;
}

export const FINANCE_NAV_SECTIONS: NavSection[] = [
  { id: 'main', label: 'Main' },
  { id: 'fees', label: 'Fee Management', icon: CreditCard, collapsible: true },
  { id: 'setup', label: 'Setup', icon: FolderCog, collapsible: true },
  { id: 'reports', label: 'Reports', icon: BarChart3, collapsible: true },
  { id: 'control', label: 'Control', icon: Lock, collapsible: true },
];

// Admin portal navigation (institution_owner, institution_admin)
const adminNavigation: UnifiedNavConfig = {
  main: [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/academics', icon: BookOpen, label: 'Academics' },
    { path: '/students', icon: User, label: 'Students' },
    { path: '/finance', icon: Wallet, label: 'Finance' },
  ],
  secondary: [
    { path: '/staff', icon: Users, label: 'Staff', showInMore: true },
    { path: '/communication', icon: MessageSquare, label: 'Communication', showInMore: true },
    { path: '/reports', icon: FileBarChart, label: 'Reports', showInMore: true },
    { path: '/library', icon: Library, label: 'Library', showInMore: true, requiresModule: 'library' },
    { path: '/transport', icon: Bus, label: 'Transport', showInMore: true, requiresModule: 'transport' },
    { path: '/settings', icon: Settings, label: 'Settings', showInMore: true },
  ],
};

// Teacher portal navigation
const teacherNavigation: UnifiedNavConfig = {
  main: [
    { path: '/portal', icon: Home, label: 'Dashboard' },
    { path: '/portal/classes', icon: BookOpen, label: 'My Classes' },
    { path: '/portal/lesson-plans', icon: NotebookPen, label: 'Lesson Plans' },
    { path: '/portal/attendance', icon: ClipboardList, label: 'Attendance' },
    { path: '/portal/assignments', icon: FileText, label: 'Assignments' },
  ],
  secondary: [
    { path: '/portal/curriculum', icon: Layers, label: 'CBC Curriculum', showInMore: true },
    { path: '/portal/question-bank', icon: BookOpen, label: 'Question Bank', showInMore: true },
    { path: '/portal/exam-papers', icon: FileText, label: 'Exam Papers', showInMore: true },
    { path: '/portal/diary', icon: NotebookPen, label: 'Student Diary', showInMore: true },
    { path: '/portal/timetable', icon: Calendar, label: 'Timetable', showInMore: true },
    { path: '/portal/library', icon: Library, label: 'My Books', showInMore: true, requiresModule: 'library' },
    { path: '/portal/grades', icon: Award, label: 'Grades', showInMore: true },
    { path: '/portal/leave', icon: CalendarDays, label: 'My Leave', showInMore: true },
    { path: '/portal/messages', icon: MessageSquare, label: 'Messages', showInMore: true },
    { path: '/portal/profile', icon: User, label: 'Profile', showInMore: true },
  ],
};

// Finance staff navigation (finance_officer, accountant, bursar)
const financeNavigation: UnifiedNavConfig = {
  main: [
    { path: '/portal/finance', icon: Home, label: 'Dashboard', section: 'main' },
    { path: '/portal/cashbook', icon: BookOpen, label: 'Cashbook', section: 'main' },
    { path: '/portal/vouchers', icon: FileText, label: 'Vouchers', section: 'main' },
    { path: '/portal/receipts', icon: Receipt, label: 'Receipts', section: 'main' },
  ],
  secondary: [
    // Fee Management section
    { path: '/portal/payments', icon: CreditCard, label: 'Fee Payments', showInMore: true, section: 'fees' },
    { path: '/portal/invoices', icon: FileText, label: 'Invoices', showInMore: true, section: 'fees' },
    { path: '/portal/discounts', icon: Percent, label: 'Discounts', showInMore: true, section: 'fees' },
    { path: '/portal/capitation', icon: Landmark, label: 'Capitation', showInMore: true, section: 'fees', publicSchoolOnly: true },
    
    // Setup & Configuration section
    { path: '/portal/chart-of-accounts', icon: BookOpen, label: 'Chart of Accounts', showInMore: true, section: 'setup' },
    { path: '/portal/funds', icon: Wallet, label: 'Funds', showInMore: true, section: 'setup' },
    { path: '/portal/voteheads', icon: Calculator, label: 'Voteheads', showInMore: true, section: 'setup' },
    { path: '/portal/bank-accounts', icon: Building, label: 'Bank Accounts', showInMore: true, section: 'setup' },
    
    // Reports section
    { path: '/portal/trial-balance', icon: BarChart3, label: 'Trial Balance', showInMore: true, section: 'reports' },
    { path: '/portal/general-ledger', icon: FileBarChart, label: 'General Ledger', showInMore: true, section: 'reports' },
    { path: '/portal/daily-report', icon: TrendingUp, label: 'Daily Report', showInMore: true, section: 'reports' },
    { path: '/portal/aging', icon: Clock, label: 'Aging Report', showInMore: true, section: 'reports' },
    
    // Control section
    { path: '/portal/reconciliation', icon: CheckCircle, label: 'Reconciliation', showInMore: true, section: 'control' },
    { path: '/portal/periods', icon: Lock, label: 'Periods', showInMore: true, section: 'control' },
    { path: '/portal/adjustments', icon: Calculator, label: 'Adjustments', showInMore: true, section: 'control' },
    
    // Personal
    { path: '/portal/profile', icon: User, label: 'Profile', showInMore: true },
  ],
};

// NOTE: HR and Academic director navigation removed - routes not implemented
// These portal types should use the admin dashboard or staff portal instead

// Student portal navigation
const studentNavigation: UnifiedNavConfig = {
  main: [
    { path: '/student', icon: Home, label: 'Dashboard' },
    { path: '/student/assignments', icon: FileText, label: 'Assignments' },
    { path: '/student/results', icon: Award, label: 'Results' },
    { path: '/student/timetable', icon: Calendar, label: 'Timetable' },
  ],
  secondary: [
    { path: '/student/library', icon: Library, label: 'My Books', showInMore: true, requiresModule: 'library' },
    { path: '/student/fees', icon: Wallet, label: 'Fees', showInMore: true },
    { path: '/student/profile', icon: User, label: 'Profile', showInMore: true },
  ],
};

// Parent portal navigation
const parentNavigation: UnifiedNavConfig = {
  main: [
    { path: '/parent', icon: Home, label: 'Dashboard' },
    { path: '/parent/children', icon: User, label: 'My Children' },
    { path: '/parent/fees', icon: Wallet, label: 'Fees' },
    { path: '/parent/messages', icon: MessageSquare, label: 'Messages' },
  ],
  secondary: [
    { path: '/parent/diary', icon: NotebookPen, label: 'Diary', showInMore: true },
    { path: '/parent/notices', icon: FileText, label: 'Notices', showInMore: true },
    { path: '/parent/library', icon: Library, label: 'Library', showInMore: true, requiresModule: 'library' },
    { path: '/parent/results', icon: Award, label: 'Results', showInMore: true },
    { path: '/parent/timetable', icon: Calendar, label: 'Timetable', showInMore: true },
    { path: '/parent/profile', icon: User, label: 'Profile', showInMore: true },
  ],
};

// General staff navigation (librarian, coach, ict_admin, etc.)
const staffNavigation: UnifiedNavConfig = {
  main: [
    { path: '/portal', icon: Home, label: 'Dashboard' },
    { path: '/portal/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/portal/messages', icon: MessageSquare, label: 'Messages' },
  ],
  secondary: [
    { path: '/portal/leave', icon: CalendarDays, label: 'My Leave', showInMore: true },
    { path: '/portal/profile', icon: User, label: 'Profile', showInMore: true },
  ],
};

// Map portal types to their navigation configs
const navigationMap: Record<PortalType, UnifiedNavConfig> = {
  admin: adminNavigation,
  teacher: teacherNavigation,
  student: studentNavigation,
  parent: parentNavigation,
  staff: staffNavigation,
  finance: financeNavigation,
};

export function getUnifiedNavigation(portalType: PortalType): UnifiedNavConfig {
  return navigationMap[portalType] || staffNavigation;
}

export function getAllNavItems(portalType: PortalType): UnifiedNavItem[] {
  const config = getUnifiedNavigation(portalType);
  return [...config.main, ...config.secondary];
}

// Group navigation items by section for organized sidebar display
export function getNavItemsBySection(portalType: PortalType): Record<string, UnifiedNavItem[]> {
  const items = getAllNavItems(portalType);
  const grouped: Record<string, UnifiedNavItem[]> = {};
  
  items.forEach(item => {
    const section = item.section || 'other';
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(item);
  });
  
  return grouped;
}

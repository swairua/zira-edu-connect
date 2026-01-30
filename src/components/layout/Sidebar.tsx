import { useState, useRef, useLayoutEffect, useCallback, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useGroup } from '@/contexts/GroupContext';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { usePendingTicketsCount } from '@/hooks/useSupportTickets';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Building2,
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Settings,
  MessageSquare,
  FileText,
  Shield,
  Globe,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Library,
  BookMarked,
  HelpCircle,
  LogOut,
  Loader2,
  Activity,
  Wallet,
  Smartphone,
  BookOpen,
  UserCheck,
  CheckSquare,
  Eye,
  History,
  BarChart3,
  TrendingUp,
  Clock,
  Rocket,
  Network,
  CalendarDays,
  Bed,
  Home,
  DoorOpen,
  Bus,
  Truck,
  Trophy,
  UserPlus,
  ClipboardCheck,
  Shirt,
  Package,
  ShoppingBag,
  Grid3X3,
  Briefcase,
  Send,
  Megaphone,
  Bell,
  PieChart,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PermissionDomain, PermissionAction } from '@/types/permissions';

// Sections that should be collapsible (module-based sections)
const COLLAPSIBLE_SECTIONS = [
  'Setup', // Setup is collapsible and starts collapsed
  'Academics', 'Finance', 'Finance Setup', 'Finance Reports',
  'Boarding', 'Transport', 'Library', 'Activities', 
  'Uniforms', 'Timetable', 'HR Management', 'Communication', 'Reports'
];

// Default expanded sections (Setup excluded so it starts collapsed)
const DEFAULT_EXPANDED_SECTIONS = ['Operations', 'Academics', 'Finance', 'System'];

const STORAGE_KEY = 'sidebar-expanded-sections';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  /** Required permission domain and action to view this nav item */
  permission?: { domain: PermissionDomain; action: PermissionAction };
  /** Require super admin to view */
  superAdminOnly?: boolean;
  /** Require support admin or super admin */
  supportAdminOnly?: boolean;
  /** Only show for group users */
  groupOnly?: boolean;
  /** Only show if user has institution context */
  requiresInstitution?: boolean;
  /** Required module to be enabled in subscription */
  requiresModule?: string;
}

// ============================================
// PLATFORM-LEVEL NAVIGATION (Super/Support Admin)
// ============================================
const platformNavItems: NavItem[] = [
  { label: 'Platform Dashboard', href: '/dashboard', icon: LayoutDashboard, superAdminOnly: true },
  { label: 'Institutions', href: '/institutions', icon: Building2, superAdminOnly: true },
  { label: 'Demo Requests', href: '/demo-requests', icon: UserPlus, superAdminOnly: true },
  { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard, superAdminOnly: true },
  { label: 'Regional Settings', href: '/countries', icon: Globe, superAdminOnly: true },
];

const platformFinanceNavItems: NavItem[] = [
  { label: 'Platform Billing', href: '/billing', icon: Receipt, superAdminOnly: true },
  { label: 'Platform Finance', href: '/finance', icon: PieChart, superAdminOnly: true },
];

const platformSystemNavItems: NavItem[] = [
  { label: 'System Health', href: '/system-health', icon: Activity, superAdminOnly: true },
  { label: 'Audit Logs', href: '/audit-logs', icon: FileText, superAdminOnly: true },
  { label: 'Support Tickets', href: '/tickets', icon: HelpCircle, superAdminOnly: true },
  { label: 'SMS Gateway', href: '/sms-settings', icon: Smartphone, superAdminOnly: true },
  { label: 'Module Catalog', href: '/platform/modules', icon: Grid3X3, superAdminOnly: true },
  { label: 'Bank Integrations', href: '/platform/bank-integrations', icon: Building2, superAdminOnly: true },
  { label: 'IPN Gateway', href: '/platform/ipn-gateway', icon: Globe, superAdminOnly: true },
  { label: 'Integration Health', href: '/platform/integration-health', icon: Activity, superAdminOnly: true },
];

// ============================================
// GROUP-LEVEL NAVIGATION (Multi-campus users)
// ============================================
const groupNavItems: NavItem[] = [
  { label: 'Group Overview', href: '/group', icon: Network, groupOnly: true },
  { label: 'Campuses', href: '/group/campuses', icon: Building2, groupOnly: true },
  { label: 'Group Reports', href: '/group/reports', icon: BarChart3, groupOnly: true },
  { label: 'Group Settings', href: '/group/settings', icon: Settings, groupOnly: true },
];

// ============================================
// INSTITUTION-LEVEL NAVIGATION (School Admin)
// ============================================
const institutionNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiresInstitution: true },
  { label: 'Students', href: '/students', icon: BookOpen, permission: { domain: 'students', action: 'view' }, requiresInstitution: true },
  { label: 'Parents', href: '/parents', icon: Users, permission: { domain: 'students', action: 'view' }, requiresInstitution: true },
  { label: 'Staff', href: '/staff', icon: UserCheck, permission: { domain: 'staff_hr', action: 'view' }, requiresInstitution: true },
];

const institutionAcademicsNavItems: NavItem[] = [
  { label: 'Academics Overview', href: '/academics', icon: GraduationCap, permission: { domain: 'academics', action: 'view' }, requiresInstitution: true, requiresModule: 'academics' },
  { label: 'Attendance', href: '/attendance', icon: Users, permission: { domain: 'academics', action: 'view' }, requiresInstitution: true, requiresModule: 'academics' },
  { label: 'Exams', href: '/exams', icon: FileText, permission: { domain: 'academics', action: 'view' }, requiresInstitution: true, requiresModule: 'academics' },
  { label: 'Results', href: '/results', icon: GraduationCap, permission: { domain: 'academics', action: 'view' }, requiresInstitution: true, requiresModule: 'academics' },
  { label: 'Grade Approvals', href: '/grade-approvals', icon: CheckSquare, permission: { domain: 'academics', action: 'approve' }, requiresInstitution: true, requiresModule: 'academics' },
  { label: 'Lesson Plan Approvals', href: '/lesson-plan-approvals', icon: BookOpen, permission: { domain: 'academics', action: 'approve' }, requiresInstitution: true, requiresModule: 'academics' },
  { label: 'Scheme Approvals', href: '/scheme-approvals', icon: CalendarDays, permission: { domain: 'academics', action: 'approve' }, requiresInstitution: true, requiresModule: 'academics' },
  { label: 'Release Results', href: '/result-releases', icon: Eye, permission: { domain: 'academics', action: 'approve' }, requiresInstitution: true, requiresModule: 'academics' },
  { label: 'Grade History', href: '/grade-history', icon: History, permission: { domain: 'academics', action: 'approve' }, requiresInstitution: true, requiresModule: 'academics' },
];

const institutionFinanceNavItems: NavItem[] = [
  { label: 'Finance Overview', href: '/finance-overview', icon: Wallet, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Fee Structure', href: '/fees', icon: Wallet, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Invoices', href: '/invoices', icon: Receipt, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Payments', href: '/payments', icon: CreditCard, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Discounts', href: '/finance/discounts', icon: Receipt, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Adjustments', href: '/finance/adjustments', icon: FileText, permission: { domain: 'finance', action: 'approve' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Reconciliation', href: '/finance/reconciliation', icon: CheckSquare, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Period Locks', href: '/finance/periods', icon: Shield, permission: { domain: 'finance', action: 'approve' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Daily Collections', href: '/reports/daily-collection', icon: BarChart3, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Aging Report', href: '/reports/aging', icon: Clock, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
];

const institutionFinanceSetupNavItems: NavItem[] = [
  { label: 'Chart of Accounts', href: '/finance/chart-of-accounts', icon: BookOpen, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Funds', href: '/finance/funds', icon: Wallet, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Voteheads', href: '/finance/voteheads', icon: FileText, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Bank Accounts', href: '/finance/bank-accounts', icon: Building2, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'Finance Settings', href: '/finance/settings', icon: Settings, permission: { domain: 'system_settings', action: 'edit' }, requiresInstitution: true, requiresModule: 'finance' },
];

const institutionFinanceReportsNavItems: NavItem[] = [
  { label: 'Trial Balance', href: '/reports/trial-balance', icon: BarChart3, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
  { label: 'General Ledger', href: '/reports/general-ledger', icon: FileText, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'finance' },
];

const institutionSetupNavItems: NavItem[] = [
  { label: 'Setup Wizard', href: '/onboarding', icon: Rocket, permission: { domain: 'system_settings', action: 'edit' }, requiresInstitution: true },
  { label: 'Academic Calendar', href: '/academic-setup', icon: CalendarDays, permission: { domain: 'system_settings', action: 'view' }, requiresInstitution: true },
  { label: 'Classes', href: '/classes', icon: Building2, permission: { domain: 'system_settings', action: 'view' }, requiresInstitution: true },
  { label: 'Subjects', href: '/subjects', icon: BookOpen, permission: { domain: 'academics', action: 'view' }, requiresInstitution: true },
];

const institutionHostelNavItems: NavItem[] = [
  { label: 'Boarding Overview', href: '/hostel', icon: Home, permission: { domain: 'students', action: 'view' }, requiresInstitution: true, requiresModule: 'hostel' },
  { label: 'Hostels & Rooms', href: '/hostel/hostels', icon: Building2, permission: { domain: 'students', action: 'view' }, requiresInstitution: true, requiresModule: 'hostel' },
  { label: 'Bed Allocations', href: '/hostel/allocations', icon: Bed, permission: { domain: 'students', action: 'view' }, requiresInstitution: true, requiresModule: 'hostel' },
  { label: 'Boarding Charges', href: '/hostel/charges', icon: Receipt, permission: { domain: 'finance', action: 'view' }, requiresInstitution: true, requiresModule: 'hostel' },
];

const institutionTransportNavItems: NavItem[] = [
  { label: 'Transport Overview', href: '/transport', icon: Bus, permission: { domain: 'students', action: 'view' }, requiresInstitution: true, requiresModule: 'transport' },
  { label: 'Routes & Zones', href: '/transport/routes', icon: Globe, permission: { domain: 'students', action: 'view' }, requiresInstitution: true, requiresModule: 'transport' },
  { label: 'Vehicles', href: '/transport/vehicles', icon: Truck, permission: { domain: 'students', action: 'view' }, requiresInstitution: true, requiresModule: 'transport' },
  { label: 'Drivers', href: '/transport/drivers', icon: Users, permission: { domain: 'students', action: 'view' }, requiresInstitution: true, requiresModule: 'transport' },
  { label: 'Subscriptions', href: '/transport/subscriptions', icon: UserCheck, permission: { domain: 'students', action: 'view' }, requiresInstitution: true, requiresModule: 'transport' },
  { label: 'Approvals', href: '/transport/approvals', icon: CheckSquare, permission: { domain: 'students', action: 'edit' }, requiresInstitution: true, requiresModule: 'transport' },
  { label: 'Policy Settings', href: '/transport/settings', icon: Settings, permission: { domain: 'system_settings', action: 'edit' }, requiresInstitution: true, requiresModule: 'transport' },
];

const institutionLibraryNavItems: NavItem[] = [
  { label: 'Library Overview', href: '/library', icon: Library, permission: { domain: 'library', action: 'view' }, requiresInstitution: true, requiresModule: 'library' },
  { label: 'Book Catalog', href: '/library/books', icon: BookOpen, permission: { domain: 'library', action: 'view' }, requiresInstitution: true, requiresModule: 'library' },
  { label: 'Active Loans', href: '/library/loans', icon: BookMarked, permission: { domain: 'library', action: 'view' }, requiresInstitution: true, requiresModule: 'library' },
  { label: 'Teacher Allocations', href: '/library/allocations', icon: Users, permission: { domain: 'library', action: 'edit' }, requiresInstitution: true, requiresModule: 'library' },
  { label: 'Library Settings', href: '/library/settings', icon: Settings, permission: { domain: 'library', action: 'approve' }, requiresInstitution: true, requiresModule: 'library' },
];

const institutionActivitiesNavItems: NavItem[] = [
  { label: 'Activities Overview', href: '/activities', icon: Trophy, permission: { domain: 'activities', action: 'view' }, requiresInstitution: true, requiresModule: 'activities' },
  { label: 'All Activities', href: '/activities/list', icon: Trophy, permission: { domain: 'activities', action: 'view' }, requiresInstitution: true, requiresModule: 'activities' },
  { label: 'Enrollments', href: '/activities/enrollments', icon: UserPlus, permission: { domain: 'activities', action: 'view' }, requiresInstitution: true, requiresModule: 'activities' },
  { label: 'Attendance', href: '/activities/attendance', icon: ClipboardCheck, permission: { domain: 'activities', action: 'edit' }, requiresInstitution: true, requiresModule: 'activities' },
  { label: 'Events', href: '/activities/events', icon: CalendarDays, permission: { domain: 'activities', action: 'view' }, requiresInstitution: true, requiresModule: 'activities' },
  { label: 'Reports', href: '/activities/reports', icon: BarChart3, permission: { domain: 'activities', action: 'view' }, requiresInstitution: true, requiresModule: 'activities' },
];

const institutionUniformNavItems: NavItem[] = [
  { label: 'Uniform Store', href: '/uniforms', icon: Shirt, permission: { domain: 'uniforms', action: 'view' }, requiresInstitution: true, requiresModule: 'uniforms' },
  { label: 'Catalog', href: '/uniforms/catalog', icon: Package, permission: { domain: 'uniforms', action: 'view' }, requiresInstitution: true, requiresModule: 'uniforms' },
  { label: 'Orders', href: '/uniforms/orders', icon: ShoppingBag, permission: { domain: 'uniforms', action: 'view' }, requiresInstitution: true, requiresModule: 'uniforms' },
  { label: 'Stock', href: '/uniforms/stock', icon: Package, permission: { domain: 'uniforms', action: 'view' }, requiresInstitution: true, requiresModule: 'uniforms' },
];

const institutionTimetableNavItems: NavItem[] = [
  { label: 'Timetable Overview', href: '/timetable', icon: CalendarDays, permission: { domain: 'timetable', action: 'view' }, requiresInstitution: true, requiresModule: 'timetable' },
  { label: 'Manage Timetables', href: '/timetable/manage', icon: Grid3X3, permission: { domain: 'timetable', action: 'view' }, requiresInstitution: true, requiresModule: 'timetable' },
  { label: 'Rooms & Venues', href: '/timetable/rooms', icon: DoorOpen, permission: { domain: 'timetable', action: 'edit' }, requiresInstitution: true, requiresModule: 'timetable' },
  { label: 'Period Setup', href: '/timetable/periods', icon: Clock, permission: { domain: 'timetable', action: 'edit' }, requiresInstitution: true, requiresModule: 'timetable' },
];

// HR Management Module
const institutionHRNavItems: NavItem[] = [
  { label: 'HR Dashboard', href: '/hr', icon: Briefcase, permission: { domain: 'staff_hr', action: 'view' }, requiresInstitution: true, requiresModule: 'hr' },
  { label: 'Leave Management', href: '/hr/leave', icon: CalendarDays, permission: { domain: 'staff_hr', action: 'view' }, requiresInstitution: true, requiresModule: 'hr' },
  { label: 'Staff Attendance', href: '/hr/attendance', icon: Clock, permission: { domain: 'staff_hr', action: 'view' }, requiresInstitution: true, requiresModule: 'hr' },
  { label: 'Payroll', href: '/hr/payroll', icon: Wallet, permission: { domain: 'staff_hr', action: 'view' }, requiresInstitution: true, requiresModule: 'hr' },
  { label: 'Staff Salaries', href: '/hr/payroll/salaries', icon: Users, permission: { domain: 'staff_hr', action: 'edit' }, requiresInstitution: true, requiresModule: 'hr' },
  { label: 'Payroll Runs', href: '/hr/payroll/runs', icon: TrendingUp, permission: { domain: 'staff_hr', action: 'edit' }, requiresInstitution: true, requiresModule: 'hr' },
];

// Communication Module
const institutionCommunicationNavItems: NavItem[] = [
  { label: 'Communications', href: '/communication', icon: MessageSquare, permission: { domain: 'communication', action: 'view' }, requiresInstitution: true, requiresModule: 'communication' },
  { label: 'Bulk SMS', href: '/communication/bulk-sms', icon: Send, permission: { domain: 'communication', action: 'create' }, requiresInstitution: true, requiresModule: 'communication' },
  { label: 'Announcements', href: '/communication/announcements', icon: Megaphone, permission: { domain: 'communication', action: 'view' }, requiresInstitution: true, requiresModule: 'communication' },
  { label: 'Reminders', href: '/communication/reminders', icon: Bell, permission: { domain: 'communication', action: 'view' }, requiresInstitution: true, requiresModule: 'communication' },
  { label: 'SMS History', href: '/communication/history', icon: History, permission: { domain: 'communication', action: 'view' }, requiresInstitution: true, requiresModule: 'communication' },
];

// Reports Module
const institutionReportsNavItems: NavItem[] = [
  { label: 'Reports Dashboard', href: '/reports', icon: BarChart3, permission: { domain: 'reports', action: 'view' }, requiresInstitution: true, requiresModule: 'reports' },
  { label: 'Report Cards', href: '/reports/report-cards', icon: FileText, permission: { domain: 'academics', action: 'view' }, requiresInstitution: true },
  { label: 'Financial Reports', href: '/reports/financial', icon: Wallet, permission: { domain: 'reports', action: 'view' }, requiresInstitution: true, requiresModule: 'reports' },
  { label: 'Academic Reports', href: '/reports/academic', icon: GraduationCap, permission: { domain: 'reports', action: 'view' }, requiresInstitution: true, requiresModule: 'reports' },
  { label: 'Data Export', href: '/reports/export', icon: Download, permission: { domain: 'reports', action: 'export' }, requiresInstitution: true, requiresModule: 'reports' },
];

const institutionSystemNavItems: NavItem[] = [
  { label: 'Support Tickets', href: '/tickets', icon: HelpCircle, requiresInstitution: true },
  { label: 'Security', href: '/security', icon: Shield, permission: { domain: 'system_settings', action: 'view' }, requiresInstitution: true },
  { label: 'Settings', href: '/settings', icon: Settings, permission: { domain: 'system_settings', action: 'view' }, requiresInstitution: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Ignore parsing errors
    }
    return new Set(DEFAULT_EXPANDED_SECTIONS);
  });
  const scrollRef = useRef<HTMLElement>(null);
  const scrollPositionRef = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isSuperAdmin, isSupportAdmin, userRoles } = useAuth();
  const { can, isLoading: permissionsLoading } = usePermissions();
  const { isGroupUser } = useGroup();
  const { institutionId } = useInstitution();
  const { isModuleEnabled, disabledModules } = useSubscriptionLimits();
  const { data: pendingTicketsCount = 0 } = usePendingTicketsCount();

  // Persist expanded sections to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedSections]));
  }, [expandedSections]);

  // Toggle section expand/collapse
  const toggleSection = useCallback((sectionTitle: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionTitle)) {
        next.delete(sectionTitle);
      } else {
        next.add(sectionTitle);
      }
      return next;
    });
  }, []);

  // Preserve scroll position across re-renders
  useLayoutEffect(() => {
    const nav = scrollRef.current;
    if (nav) {
      nav.scrollTop = scrollPositionRef.current;
    }
  });

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      scrollPositionRef.current = scrollRef.current.scrollTop;
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    navigate('/auth');
    setIsLoggingOut(false);
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    const email = user.email;
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    const metadata = user?.user_metadata;
    if (metadata?.first_name && metadata?.last_name) {
      return `${metadata.first_name} ${metadata.last_name}`;
    }
    return 'User';
  };

  const getUserRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isSupportAdmin) return 'Support Admin';
    if (userRoles.length > 0) {
      const roleLabels: Record<string, string> = {
        institution_owner: 'Owner',
        institution_admin: 'Admin',
        finance_officer: 'Finance',
        academic_director: 'Academic',
        teacher: 'Teacher',
        hr_manager: 'HR',
        accountant: 'Accountant',
        ict_admin: 'ICT',
        parent: 'Parent',
        student: 'Student',
      };
      return roleLabels[userRoles[0].role] || userRoles[0].role;
    }
    return 'User';
  };

  // Determine user type for menu display
  const isPlatformUser = isSuperAdmin || isSupportAdmin;
  const isInstitutionUser = !!institutionId && !isPlatformUser;

  // Filter nav items based on permissions, context, and module requirements
  // IMPORTANT: Don't hide items during loading - show them to prevent UI flicker
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      // Check group-only items
      if (item.groupOnly && !isGroupUser) return false;
      
      // Check super admin requirement
      if (item.superAdminOnly && !isSuperAdmin) return false;
      
      // Check support admin requirement
      if (item.supportAdminOnly && !isSuperAdmin && !isSupportAdmin) return false;
      
      // Check institution requirement - BUT allow during loading to prevent flicker
      // Only hide if we've confirmed there's no institution after loading
      if (item.requiresInstitution) {
        // If permissions are still loading, show the item (prevents disappearing nav)
        if (permissionsLoading) return true;
        // Once loaded, check if we have institution
        if (!institutionId) return false;
      }
      
      // Check module requirement (skip for platform users)
      if (item.requiresModule && !isPlatformUser) {
        if (!isModuleEnabled(item.requiresModule)) return false;
      }
      
      // Check permission if specified
      if (item.permission) {
        // Super admins bypass permission checks
        if (isSuperAdmin) return true;
        // During loading, show items to prevent flicker
        if (permissionsLoading) return true;
        return can(item.permission.domain, item.permission.action);
      }
      
      return true;
    });
  };

  // Build navigation sections based on user type
  const getNavigationSections = () => {
    const sections: { title: string; items: NavItem[] }[] = [];

    // Platform users see platform menus
    if (isPlatformUser) {
      const platformItems = filterNavItems(platformNavItems);
      if (platformItems.length > 0) {
        sections.push({ title: 'Platform', items: platformItems });
      }

      const platformFinanceItems = filterNavItems(platformFinanceNavItems);
      if (platformFinanceItems.length > 0) {
        sections.push({ title: 'Platform Finance', items: platformFinanceItems });
      }
      
      const platformSystemItems = filterNavItems(platformSystemNavItems);
      if (platformSystemItems.length > 0) {
        sections.push({ title: 'Platform System', items: platformSystemItems });
      }
    }

    // Group users see group menus
    if (isGroupUser) {
      const groupItems = filterNavItems(groupNavItems);
      if (groupItems.length > 0) {
        sections.push({ title: 'School Network', items: groupItems });
      }
    }

    // Institution users see school menus
    if (isInstitutionUser) {
      const institutionItems = filterNavItems(institutionNavItems);
      if (institutionItems.length > 0) {
        sections.push({ title: 'Operations', items: institutionItems });
      }

      const academicsItems = filterNavItems(institutionAcademicsNavItems);
      if (academicsItems.length > 0) {
        sections.push({ title: 'Academics', items: academicsItems });
      }

      const financeItems = filterNavItems(institutionFinanceNavItems);
      if (financeItems.length > 0) {
        sections.push({ title: 'Finance', items: financeItems });
      }

      const financeSetupItems = filterNavItems(institutionFinanceSetupNavItems);
      if (financeSetupItems.length > 0) {
        sections.push({ title: 'Finance Setup', items: financeSetupItems });
      }

      const financeReportItems = filterNavItems(institutionFinanceReportsNavItems);
      if (financeReportItems.length > 0) {
        sections.push({ title: 'Finance Reports', items: financeReportItems });
      }

      // Setup moved to near bottom (before System) - see below

      const hostelItems = filterNavItems(institutionHostelNavItems);
      if (hostelItems.length > 0) {
        sections.push({ title: 'Boarding', items: hostelItems });
      }

      const transportItems = filterNavItems(institutionTransportNavItems);
      if (transportItems.length > 0) {
        sections.push({ title: 'Transport', items: transportItems });
      }

      const libraryItems = filterNavItems(institutionLibraryNavItems);
      if (libraryItems.length > 0) {
        sections.push({ title: 'Library', items: libraryItems });
      }

      const activitiesItems = filterNavItems(institutionActivitiesNavItems);
      if (activitiesItems.length > 0) {
        sections.push({ title: 'Activities', items: activitiesItems });
      }

      const uniformItems = filterNavItems(institutionUniformNavItems);
      if (uniformItems.length > 0) {
        sections.push({ title: 'Uniforms', items: uniformItems });
      }

      const timetableItems = filterNavItems(institutionTimetableNavItems);
      if (timetableItems.length > 0) {
        sections.push({ title: 'Timetable', items: timetableItems });
      }

      const hrItems = filterNavItems(institutionHRNavItems);
      if (hrItems.length > 0) {
        sections.push({ title: 'HR Management', items: hrItems });
      }

      const communicationItems = filterNavItems(institutionCommunicationNavItems);
      if (communicationItems.length > 0) {
        sections.push({ title: 'Communication', items: communicationItems });
      }

      const reportsItems = filterNavItems(institutionReportsNavItems);
      if (reportsItems.length > 0) {
        sections.push({ title: 'Reports', items: reportsItems });
      }

      // Setup section moved to bottom (before System) - starts collapsed
      const setupItems = filterNavItems(institutionSetupNavItems);
      if (setupItems.length > 0) {
        sections.push({ title: 'Setup', items: setupItems });
      }

      const systemItems = filterNavItems(institutionSystemNavItems);
      if (systemItems.length > 0) {
        sections.push({ title: 'System', items: systemItems });
      }
    }

    return sections;
  };

  const navigationSections = useMemo(() => getNavigationSections(), [
    isSuperAdmin, 
    isSupportAdmin, 
    isGroupUser, 
    isInstitutionUser, 
    institutionId,
    permissionsLoading,
    disabledModules // Re-compute when disabled modules change
  ]);

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    const linkContent = (
      <Link
        to={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.href === '/tickets' && pendingTicketsCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
                {pendingTicketsCount}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.href === '/tickets' && pendingTicketsCount > 0 && (
              <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                {pendingTicketsCount}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-sm">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-base font-bold text-sidebar-foreground">
                Zira
              </span>
              <span className="text-xs text-sidebar-foreground/60">EduSuite</span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav ref={scrollRef} onScroll={handleScroll} className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigationSections.map((section, index) => {
          const isCollapsible = COLLAPSIBLE_SECTIONS.includes(section.title);
          const isExpanded = expandedSections.has(section.title);
          
          return (
            <div key={section.title} className="space-y-1">
              {index > 0 && <div className="my-3 border-t border-sidebar-border" />}
              
              {/* Collapsible section */}
              {isCollapsible && !collapsed ? (
                <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.title)}>
                  <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/70 transition-colors">
                    <span>{section.title}</span>
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    {section.items.map((item) => (
                      <NavLink key={item.href} item={item} />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <>
                  {/* Non-collapsible section or collapsed sidebar */}
                  {!collapsed && (
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                      {section.title}
                    </p>
                  )}
                  {section.items.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2',
            collapsed ? 'justify-center' : ''
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
            {getUserInitials()}
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-sidebar-foreground">{getUserDisplayName()}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{getUserRoleLabel()}</p>
            </div>
          )}
          {!collapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          )}
        </div>
        {collapsed && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-2 w-full text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}

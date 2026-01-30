import { GraduationCap, Users, Briefcase, BookOpen } from 'lucide-react';
import { ComponentType } from 'react';

export type PortalType = 'admin' | 'teacher' | 'student' | 'parent' | 'staff' | 'finance';

export interface PortalBranding {
  name: string;
  shortName: string;
  icon: ComponentType<{ className?: string }>;
  accentClass: string;
  iconBgClass: string;
  activeNavClass: string;
  searchPlaceholder: string;
}

export const PORTAL_BRANDING: Record<PortalType, PortalBranding> = {
  admin: {
    name: 'Zira EduSuite',
    shortName: 'Admin',
    icon: GraduationCap,
    accentClass: 'text-primary',
    iconBgClass: 'bg-primary',
    activeNavClass: 'text-primary bg-primary/10',
    searchPlaceholder: 'Search institutions, users...',
  },
  teacher: {
    name: 'Teacher Portal',
    shortName: 'Teacher',
    icon: GraduationCap,
    accentClass: 'text-primary',
    iconBgClass: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    activeNavClass: 'text-primary bg-primary/10',
    searchPlaceholder: 'Search students, classes...',
  },
  student: {
    name: 'Student Portal',
    shortName: 'Student',
    icon: GraduationCap,
    accentClass: 'text-indigo-600 dark:text-indigo-400',
    iconBgClass: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    activeNavClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10',
    searchPlaceholder: 'Search subjects, assignments...',
  },
  parent: {
    name: 'Parent Portal',
    shortName: 'Parent',
    icon: Users,
    accentClass: 'text-primary',
    iconBgClass: 'bg-primary',
    activeNavClass: 'text-primary bg-primary/10',
    searchPlaceholder: 'Search payments, notices...',
  },
  staff: {
    name: 'Staff Portal',
    shortName: 'Staff',
    icon: Briefcase,
    accentClass: 'text-primary',
    iconBgClass: 'bg-primary/10',
    activeNavClass: 'text-primary bg-primary/10',
    searchPlaceholder: 'Search students, records...',
  },
  finance: {
    name: 'Finance Portal',
    shortName: 'Finance',
    icon: Briefcase,
    accentClass: 'text-primary',
    iconBgClass: 'bg-gradient-to-br from-amber-500 to-orange-600',
    activeNavClass: 'text-primary bg-primary/10',
    searchPlaceholder: 'Search payments, invoices...',
  },
};

export function getPortalBranding(portalType: PortalType): PortalBranding {
  return PORTAL_BRANDING[portalType] || PORTAL_BRANDING.admin;
}

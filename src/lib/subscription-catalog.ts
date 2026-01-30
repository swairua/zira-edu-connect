import {
  GraduationCap,
  Wallet,
  MessageSquare,
  Users,
  Package,
  BookOpen,
  Bus,
  BarChart3,
  Home,
} from 'lucide-react';

// MODULES: Control access to sections of the app (routes, menus)
export const MODULE_CATALOG = {
  academics: {
    id: 'academics',
    label: 'Academics',
    description: 'Attendance, exams, results, grade management',
    icon: GraduationCap,
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    description: 'Fee structure, invoices, payments, reconciliation',
    icon: Wallet,
  },
  communication: {
    id: 'communication',
    label: 'Communication',
    description: 'Messaging, SMS, notifications',
    icon: MessageSquare,
  },
  hr: {
    id: 'hr',
    label: 'HR Management',
    description: 'Staff management, leave, payroll',
    icon: Users,
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    description: 'Asset and stock management',
    icon: Package,
  },
  library: {
    id: 'library',
    label: 'Library',
    description: 'Book catalog, lending, returns',
    icon: BookOpen,
  },
  transport: {
    id: 'transport',
    label: 'Transport',
    description: 'Bus routes, vehicle tracking',
    icon: Bus,
  },
  hostel: {
    id: 'hostel',
    label: 'Boarding & Hostel',
    description: 'Hostel management, bed allocations, boarding fees',
    icon: Home,
  },
  reports: {
    id: 'reports',
    label: 'Advanced Reports',
    description: 'Custom report builder, data export',
    icon: BarChart3,
  },
} as const;

export type ModuleId = keyof typeof MODULE_CATALOG;

export const MODULE_IDS = Object.keys(MODULE_CATALOG) as ModuleId[];

// FEATURES: Marketing/capability toggles (not route-based)
export const FEATURE_CATALOG = {
  // Communication features
  sms_notifications: { 
    id: 'sms_notifications', 
    label: 'SMS Notifications', 
    category: 'Communication' 
  },
  whatsapp_integration: { 
    id: 'whatsapp_integration', 
    label: 'WhatsApp Integration', 
    category: 'Communication' 
  },
  email_notifications: { 
    id: 'email_notifications', 
    label: 'Email Notifications', 
    category: 'Communication' 
  },
  
  // Reporting features
  basic_reports: { 
    id: 'basic_reports', 
    label: 'Basic Reports', 
    category: 'Reports' 
  },
  custom_reports: { 
    id: 'custom_reports', 
    label: 'Custom Report Builder', 
    category: 'Reports' 
  },
  
  // Advanced features
  api_access: { 
    id: 'api_access', 
    label: 'API Access', 
    category: 'Advanced' 
  },
  multi_campus: { 
    id: 'multi_campus', 
    label: 'Multi-Campus Support', 
    category: 'Advanced' 
  },
  white_labeling: { 
    id: 'white_labeling', 
    label: 'White Labeling', 
    category: 'Advanced' 
  },
  custom_integrations: { 
    id: 'custom_integrations', 
    label: 'Custom Integrations', 
    category: 'Advanced' 
  },
  
  // Support levels
  priority_support: { 
    id: 'priority_support', 
    label: 'Priority Support', 
    category: 'Support' 
  },
  dedicated_support: { 
    id: 'dedicated_support', 
    label: 'Dedicated Support', 
    category: 'Support' 
  },
  on_premise: { 
    id: 'on_premise', 
    label: 'On-Premise Option', 
    category: 'Support' 
  },
} as const;

export type FeatureId = keyof typeof FEATURE_CATALOG;

export const FEATURE_IDS = Object.keys(FEATURE_CATALOG) as FeatureId[];

// Get features grouped by category
export function getFeaturesByCategory() {
  const grouped: Record<string, typeof FEATURE_CATALOG[FeatureId][]> = {};
  
  for (const feature of Object.values(FEATURE_CATALOG)) {
    if (!grouped[feature.category]) {
      grouped[feature.category] = [];
    }
    grouped[feature.category].push(feature);
  }
  
  return grouped;
}

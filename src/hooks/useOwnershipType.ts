import { useMemo } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import type { OwnershipType } from '@/types/database';

export interface OwnershipFeatures {
  // Public school specific features
  capitation: boolean;
  governmentGrants: boolean;
  fpeTracking: boolean;
  moeVoteheads: boolean;
  
  // Available to all
  feeCollection: boolean;
  invoicing: boolean;
  
  // Private school focus
  flexibleFeeStructure: boolean;
  commercialBilling: boolean;
}

export interface UseOwnershipTypeResult {
  ownershipType: OwnershipType | null;
  isPublicSchool: boolean;
  isPrivateSchool: boolean;
  isLoading: boolean;
  features: OwnershipFeatures;
}

/**
 * Hook to determine institution ownership type and available features.
 * Used to conditionally show/hide finance features based on school type.
 * 
 * Public schools see: Capitation, FPE Tracking, MoE Voteheads, Government Grants
 * Private schools see: Flexible Fee Structures, Commercial Billing categories
 * Both see: Fee Collection, Invoicing, Basic Accounting
 */
export function useOwnershipType(): UseOwnershipTypeResult {
  const { institution, isLoading } = useInstitution();
  
  const ownershipType = institution?.ownership_type || null;
  
  const isPublicSchool = ownershipType === 'public';
  const isPrivateSchool = ownershipType === 'private';
  
  const features = useMemo<OwnershipFeatures>(() => ({
    // Public school specific features
    capitation: isPublicSchool,
    governmentGrants: isPublicSchool,
    fpeTracking: isPublicSchool,
    moeVoteheads: isPublicSchool,
    
    // Available to all schools
    feeCollection: true,
    invoicing: true,
    
    // Private school focused (but available to all)
    flexibleFeeStructure: true,
    commercialBilling: isPrivateSchool,
  }), [isPublicSchool, isPrivateSchool]);
  
  return {
    ownershipType,
    isPublicSchool,
    isPrivateSchool,
    isLoading,
    features,
  };
}

// Votehead templates filtered by ownership type
export const PUBLIC_SCHOOL_VOTEHEADS = [
  { code: 'RMI', name: 'Repairs, Maintenance & Improvement', category: 'recurrent' },
  { code: 'PE', name: 'Personal Emoluments', category: 'personal_emolument' },
  { code: 'FPE', name: 'FPE Operations', category: 'recurrent' },
  { code: 'EXAM', name: 'Examination & Assessment', category: 'recurrent' },
  { code: 'ADMIN', name: 'Administrative Costs', category: 'recurrent' },
  { code: 'ELECT', name: 'Electricity & Water', category: 'recurrent' },
  { code: 'ENVIRON', name: 'Environmental Activities', category: 'recurrent' },
  { code: 'ICT', name: 'ICT & Computer Studies', category: 'recurrent' },
  { code: 'COCURR', name: 'Co-curricular Activities', category: 'recurrent' },
  { code: 'FSE', name: 'Free Secondary Education', category: 'recurrent' },
];

export const PRIVATE_SCHOOL_VOTEHEADS = [
  { code: 'TUITION', name: 'Tuition Fees', category: 'recurrent' },
  { code: 'BOARDING', name: 'Boarding Fees', category: 'recurrent' },
  { code: 'TRANSPORT', name: 'Transport Services', category: 'recurrent' },
  { code: 'UNIFORM', name: 'Uniforms & Attire', category: 'recurrent' },
  { code: 'BOOKS', name: 'Books & Learning Materials', category: 'recurrent' },
  { code: 'ACTIVITIES', name: 'Extra-Curricular Activities', category: 'recurrent' },
  { code: 'TECH', name: 'Technology & E-Learning', category: 'recurrent' },
  { code: 'MEDICAL', name: 'Medical & Health Services', category: 'recurrent' },
  { code: 'MEALS', name: 'Meals & Catering', category: 'recurrent' },
  { code: 'STAFF', name: 'Staff Salaries & Benefits', category: 'personal_emolument' },
];

// Fund templates filtered by ownership type
export const PUBLIC_SCHOOL_FUND_TEMPLATES = [
  { code: 'FPE', name: 'Free Primary Education', type: 'capitation', source: 'government', description: 'Government capitation for primary schools' },
  { code: 'JSS', name: 'Junior Secondary School', type: 'capitation', source: 'government', description: 'Government capitation for JSS' },
  { code: 'FSE', name: 'Free Secondary Education', type: 'capitation', source: 'government', description: 'Government capitation for secondary schools' },
  { code: 'INFRA', name: 'Infrastructure Fund', type: 'project', source: 'government', description: 'Development and construction projects' },
  { code: 'FEES', name: 'School Levies', type: 'fees', source: 'parents', description: 'Approved levies from parents' },
];

export const PRIVATE_SCHOOL_FUND_TEMPLATES = [
  { code: 'FEES', name: 'Tuition Fees', type: 'fees', source: 'parents', description: 'Main tuition and fees collection' },
  { code: 'BOARD', name: 'Boarding Fund', type: 'operations', source: 'parents', description: 'Boarding and accommodation fees' },
  { code: 'TRANS', name: 'Transport Fund', type: 'operations', source: 'parents', description: 'School transport services' },
  { code: 'DEV', name: 'Development Fund', type: 'project', source: 'parents', description: 'Infrastructure and development' },
  { code: 'DONOR', name: 'Donations Fund', type: 'donation', source: 'donors', description: 'Scholarships and donations' },
];

// Fund types filtered by ownership
export const PUBLIC_SCHOOL_FUND_TYPES = ['capitation', 'fees', 'project', 'donation', 'operations', 'reserve'] as const;
export const PRIVATE_SCHOOL_FUND_TYPES = ['fees', 'operations', 'project', 'donation', 'reserve'] as const;

// Fund sources filtered by ownership
export const PUBLIC_SCHOOL_SOURCES = ['government', 'parents', 'donors', 'internal', 'other'] as const;
export const PRIVATE_SCHOOL_SOURCES = ['parents', 'donors', 'internal', 'other'] as const;

/**
 * Country-Specific Payroll Configuration
 * 
 * This module provides statutory deduction rules, tax brackets, and payroll
 * guidelines for each supported country.
 */

import type { CountryCode } from './country-config';

// ============= Type Definitions =============

export interface TaxBand {
  min: number;
  max: number | null;
  rate: number;
}

export interface StatutoryDeductionTemplate {
  code: string;
  name: string;
  description: string;
  category: 'statutory' | 'voluntary';
  calculationType: 'tiered' | 'percentage' | 'fixed' | 'capped_percentage';
  rate?: number;
  maxContribution?: number;
  basis: 'gross' | 'basic' | 'taxable' | 'pensionable';
  tiers?: TaxBand[];
  personalRelief?: number;
  employerContributionRate: number;
  reducesTaxableIncome: boolean;
  calculationOrder: number;
}

export interface VoluntaryDeductionTemplate {
  code: string;
  name: string;
  description: string;
  category: string; // e.g., 'savings', 'welfare', 'loan', 'union'
  isCommon: boolean;
}

export interface PayrollCountryConfig {
  code: CountryCode;
  name: string;
  currency: string;
  currencySymbol: string;
  taxAuthority: string;
  taxAuthorityUrl: string;
  payrollRemittanceDeadline: string;
  statutoryDeductions: StatutoryDeductionTemplate[];
  commonVoluntaryDeductions: VoluntaryDeductionTemplate[];
  notes: string[];
}

// ============= Kenya Configuration (2025) =============

const kenyaConfig: PayrollCountryConfig = {
  code: 'KE',
  name: 'Kenya',
  currency: 'KES',
  currencySymbol: 'KSh',
  taxAuthority: 'Kenya Revenue Authority (KRA)',
  taxAuthorityUrl: 'https://www.kra.go.ke',
  payrollRemittanceDeadline: '9th of following month',
  statutoryDeductions: [
    {
      code: 'NSSF',
      name: 'NSSF Contribution',
      description: 'National Social Security Fund - 6% of pensionable earnings (KES 8,000 - 72,000), max KES 4,320',
      category: 'statutory',
      calculationType: 'capped_percentage',
      rate: 0.06,
      maxContribution: 4320,
      basis: 'gross',
      tiers: [
        { min: 0, max: 8000, rate: 0.06 },
        { min: 8000, max: 72000, rate: 0.06 },
      ],
      employerContributionRate: 0.06,
      reducesTaxableIncome: true,
      calculationOrder: 10,
    },
    {
      code: 'SHIF',
      name: 'SHIF Contribution',
      description: 'Social Health Insurance Fund - 2.75% of gross salary (replaced NHIF)',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0.0275,
      basis: 'gross',
      employerContributionRate: 0,
      reducesTaxableIncome: true,
      calculationOrder: 20,
    },
    {
      code: 'HOUSING_LEVY',
      name: 'Housing Levy (AHL)',
      description: 'Affordable Housing Levy - 1.5% of gross salary (employer matches)',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0.015,
      basis: 'gross',
      employerContributionRate: 0.015,
      reducesTaxableIncome: true,
      calculationOrder: 30,
    },
    {
      code: 'PAYE',
      name: 'PAYE (Income Tax)',
      description: 'Pay As You Earn - Tiered tax rates (10% - 35%) with KES 2,400 personal relief',
      category: 'statutory',
      calculationType: 'tiered',
      basis: 'taxable',
      tiers: [
        { min: 0, max: 24000, rate: 0.10 },
        { min: 24000, max: 32333, rate: 0.25 },
        { min: 32333, max: 500000, rate: 0.30 },
        { min: 500000, max: 800000, rate: 0.325 },
        { min: 800000, max: null, rate: 0.35 },
      ],
      personalRelief: 2400,
      employerContributionRate: 0,
      reducesTaxableIncome: false,
      calculationOrder: 100,
    },
  ],
  commonVoluntaryDeductions: [
    { code: 'SACCO', name: 'SACCO Contribution', description: 'Savings and Credit Cooperative', category: 'savings', isCommon: true },
    { code: 'SACCO_LOAN', name: 'SACCO Loan Repayment', description: 'SACCO loan deduction', category: 'loan', isCommon: true },
    { code: 'WELFARE', name: 'Staff Welfare Fund', description: 'Staff benevolent/welfare contribution', category: 'welfare', isCommon: true },
    { code: 'UNION_DUES', name: 'Union Dues (Check-off)', description: 'Trade union membership dues', category: 'union', isCommon: true },
    { code: 'ADVANCE', name: 'Salary Advance Recovery', description: 'Repayment of salary advance', category: 'loan', isCommon: true },
    { code: 'STAFF_LOAN', name: 'Staff Loan Repayment', description: 'Institution staff loan deduction', category: 'loan', isCommon: true },
  ],
  notes: [
    'NSSF Tier 1 (Lower Limit): KES 8,000 × 6% = KES 480',
    'NSSF Tier 2 (Upper Limit): (KES 72,000 - 8,000) × 6% = KES 3,840',
    'Maximum total NSSF contribution: KES 4,320/month',
    'SHIF replaced NHIF effective 2024',
    'Housing Levy is matched by employer 1:1',
    'Personal relief of KES 2,400/month applies to PAYE',
    'Insurance relief up to KES 5,000/month for approved insurance premiums',
  ],
};

// ============= Uganda Configuration (2025) =============

const ugandaConfig: PayrollCountryConfig = {
  code: 'UG',
  name: 'Uganda',
  currency: 'UGX',
  currencySymbol: 'USh',
  taxAuthority: 'Uganda Revenue Authority (URA)',
  taxAuthorityUrl: 'https://www.ura.go.ug',
  payrollRemittanceDeadline: '15th of following month',
  statutoryDeductions: [
    {
      code: 'NSSF_UG',
      name: 'NSSF Contribution',
      description: 'National Social Security Fund - 5% employee, 10% employer',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0.05,
      basis: 'gross',
      employerContributionRate: 0.10,
      reducesTaxableIncome: true,
      calculationOrder: 10,
    },
    {
      code: 'LST',
      name: 'Local Service Tax',
      description: 'Local Service Tax based on income brackets',
      category: 'statutory',
      calculationType: 'tiered',
      basis: 'gross',
      tiers: [
        { min: 0, max: 100000, rate: 0 },
        { min: 100000, max: 500000, rate: 0 }, // UGX 10,000/year
        { min: 500000, max: null, rate: 0 }, // Varies by income
      ],
      employerContributionRate: 0,
      reducesTaxableIncome: false,
      calculationOrder: 50,
    },
    {
      code: 'PAYE_UG',
      name: 'PAYE (Income Tax)',
      description: 'Pay As You Earn - 0% to 30% based on income',
      category: 'statutory',
      calculationType: 'tiered',
      basis: 'taxable',
      tiers: [
        { min: 0, max: 235000, rate: 0 },
        { min: 235000, max: 335000, rate: 0.10 },
        { min: 335000, max: 410000, rate: 0.20 },
        { min: 410000, max: null, rate: 0.30 },
      ],
      employerContributionRate: 0,
      reducesTaxableIncome: false,
      calculationOrder: 100,
    },
  ],
  commonVoluntaryDeductions: [
    { code: 'SACCO', name: 'SACCO Contribution', description: 'Savings cooperative', category: 'savings', isCommon: true },
    { code: 'WELFARE', name: 'Staff Welfare', description: 'Staff welfare fund', category: 'welfare', isCommon: true },
  ],
  notes: [
    'First UGX 235,000 is tax-free',
    'NSSF: 5% employee + 10% employer = 15% total',
    'LST varies by district and income level',
  ],
};

// ============= Tanzania Configuration (2025) =============

const tanzaniaConfig: PayrollCountryConfig = {
  code: 'TZ',
  name: 'Tanzania',
  currency: 'TZS',
  currencySymbol: 'TSh',
  taxAuthority: 'Tanzania Revenue Authority (TRA)',
  taxAuthorityUrl: 'https://www.tra.go.tz',
  payrollRemittanceDeadline: '7th of following month',
  statutoryDeductions: [
    {
      code: 'NSSF_TZ',
      name: 'NSSF Contribution',
      description: 'National Social Security Fund - 10% employee, 10% employer',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0.10,
      basis: 'gross',
      employerContributionRate: 0.10,
      reducesTaxableIncome: true,
      calculationOrder: 10,
    },
    {
      code: 'SDL',
      name: 'Skills Development Levy',
      description: 'Skills and Development Levy - 4.5% employer only',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0, // Employee pays nothing
      basis: 'gross',
      employerContributionRate: 0.045,
      reducesTaxableIncome: false,
      calculationOrder: 20,
    },
    {
      code: 'WCF',
      name: 'Workers Compensation Fund',
      description: 'WCF contribution - 0.5% employer only',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0,
      basis: 'gross',
      employerContributionRate: 0.005,
      reducesTaxableIncome: false,
      calculationOrder: 30,
    },
    {
      code: 'PAYE_TZ',
      name: 'PAYE (Income Tax)',
      description: 'Pay As You Earn - 0% to 30% based on income',
      category: 'statutory',
      calculationType: 'tiered',
      basis: 'taxable',
      tiers: [
        { min: 0, max: 270000, rate: 0 },
        { min: 270000, max: 520000, rate: 0.08 },
        { min: 520000, max: 760000, rate: 0.20 },
        { min: 760000, max: 1000000, rate: 0.25 },
        { min: 1000000, max: null, rate: 0.30 },
      ],
      employerContributionRate: 0,
      reducesTaxableIncome: false,
      calculationOrder: 100,
    },
  ],
  commonVoluntaryDeductions: [
    { code: 'SACCOS', name: 'SACCOS Contribution', description: 'Savings cooperative', category: 'savings', isCommon: true },
  ],
  notes: [
    'First TZS 270,000 is tax-free',
    'NSSF: 10% employee + 10% employer = 20% total',
    'SDL is employer-only contribution',
  ],
};

// ============= Rwanda Configuration (2025) =============

const rwandaConfig: PayrollCountryConfig = {
  code: 'RW',
  name: 'Rwanda',
  currency: 'RWF',
  currencySymbol: 'FRw',
  taxAuthority: 'Rwanda Revenue Authority (RRA)',
  taxAuthorityUrl: 'https://www.rra.gov.rw',
  payrollRemittanceDeadline: '15th of following month',
  statutoryDeductions: [
    {
      code: 'RSSB_PENSION',
      name: 'RSSB Pension',
      description: 'Rwanda Social Security Board Pension - 6% employee, 6% employer',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0.06,
      basis: 'gross',
      employerContributionRate: 0.06,
      reducesTaxableIncome: true,
      calculationOrder: 10,
    },
    {
      code: 'MATERNITY',
      name: 'Maternity Leave Contribution',
      description: 'Maternity leave scheme - 0.6% employer only',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0,
      basis: 'gross',
      employerContributionRate: 0.006,
      reducesTaxableIncome: false,
      calculationOrder: 20,
    },
    {
      code: 'CBHI',
      name: 'Community-Based Health Insurance',
      description: 'Mutuelle de Santé - employer contribution required',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0,
      basis: 'gross',
      employerContributionRate: 0.005,
      reducesTaxableIncome: false,
      calculationOrder: 30,
    },
    {
      code: 'PAYE_RW',
      name: 'PAYE (Income Tax)',
      description: 'Pay As You Earn - 0%, 20%, or 30%',
      category: 'statutory',
      calculationType: 'tiered',
      basis: 'taxable',
      tiers: [
        { min: 0, max: 60000, rate: 0 },
        { min: 60000, max: 100000, rate: 0.20 },
        { min: 100000, max: null, rate: 0.30 },
      ],
      employerContributionRate: 0,
      reducesTaxableIncome: false,
      calculationOrder: 100,
    },
  ],
  commonVoluntaryDeductions: [
    { code: 'SACCO', name: 'SACCO Contribution', description: 'Savings cooperative', category: 'savings', isCommon: true },
  ],
  notes: [
    'First RWF 60,000 is tax-free',
    'RSSB Pension: 6% employee + 6% employer = 12% total',
    'Maternity leave contribution is employer-only',
  ],
};

// ============= Nigeria Configuration (2025) =============

const nigeriaConfig: PayrollCountryConfig = {
  code: 'NG',
  name: 'Nigeria',
  currency: 'NGN',
  currencySymbol: '₦',
  taxAuthority: 'Federal Inland Revenue Service (FIRS)',
  taxAuthorityUrl: 'https://www.firs.gov.ng',
  payrollRemittanceDeadline: '10th of following month',
  statutoryDeductions: [
    {
      code: 'PENSION_NG',
      name: 'Pension Contribution',
      description: 'Contributory Pension Scheme - 8% employee, 10% employer',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0.08,
      basis: 'gross',
      employerContributionRate: 0.10,
      reducesTaxableIncome: true,
      calculationOrder: 10,
    },
    {
      code: 'NHF',
      name: 'National Housing Fund',
      description: 'National Housing Fund - 2.5% of basic salary',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0.025,
      basis: 'basic',
      employerContributionRate: 0,
      reducesTaxableIncome: true,
      calculationOrder: 20,
    },
    {
      code: 'NHIS',
      name: 'National Health Insurance',
      description: 'NHIS contribution - 5% employee, 10% employer',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0.05,
      basis: 'basic',
      employerContributionRate: 0.10,
      reducesTaxableIncome: true,
      calculationOrder: 30,
    },
    {
      code: 'PAYE_NG',
      name: 'PAYE (Income Tax)',
      description: 'Pay As You Earn - 7% to 24% with consolidated relief',
      category: 'statutory',
      calculationType: 'tiered',
      basis: 'taxable',
      tiers: [
        { min: 0, max: 300000, rate: 0.07 },
        { min: 300000, max: 600000, rate: 0.11 },
        { min: 600000, max: 1100000, rate: 0.15 },
        { min: 1100000, max: 1600000, rate: 0.19 },
        { min: 1600000, max: 3200000, rate: 0.21 },
        { min: 3200000, max: null, rate: 0.24 },
      ],
      personalRelief: 0, // Uses consolidated relief instead
      employerContributionRate: 0,
      reducesTaxableIncome: false,
      calculationOrder: 100,
    },
  ],
  commonVoluntaryDeductions: [
    { code: 'COOPERATIVE', name: 'Cooperative Contribution', description: 'Staff cooperative', category: 'savings', isCommon: true },
    { code: 'UNION', name: 'Union Dues', description: 'Trade union membership', category: 'union', isCommon: true },
  ],
  notes: [
    'Consolidated relief: Higher of NGN 200,000 or 1% of gross + 20% of gross',
    'Pension: 8% employee + 10% employer = 18% total (minimum)',
    'NHF applies to employees earning above NGN 3,000/month',
  ],
};

// ============= Ghana Configuration (2025) =============

const ghanaConfig: PayrollCountryConfig = {
  code: 'GH',
  name: 'Ghana',
  currency: 'GHS',
  currencySymbol: 'GH₵',
  taxAuthority: 'Ghana Revenue Authority (GRA)',
  taxAuthorityUrl: 'https://www.gra.gov.gh',
  payrollRemittanceDeadline: '14th of following month',
  statutoryDeductions: [
    {
      code: 'SSNIT',
      name: 'SSNIT Contribution',
      description: 'Social Security - 5.5% employee, 13% employer',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0.055,
      basis: 'gross',
      employerContributionRate: 0.13,
      reducesTaxableIncome: true,
      calculationOrder: 10,
    },
    {
      code: 'TIER2',
      name: 'Tier 2 Pension',
      description: 'Occupational Pension - 5% employee (from employer contribution)',
      category: 'statutory',
      calculationType: 'percentage',
      rate: 0, // Comes from employer's 13%
      basis: 'gross',
      employerContributionRate: 0, // Part of SSNIT employer contribution
      reducesTaxableIncome: false,
      calculationOrder: 15,
    },
    {
      code: 'PAYE_GH',
      name: 'PAYE (Income Tax)',
      description: 'Pay As You Earn - 0% to 35% based on income',
      category: 'statutory',
      calculationType: 'tiered',
      basis: 'taxable',
      tiers: [
        { min: 0, max: 490, rate: 0 },
        { min: 490, max: 600, rate: 0.05 },
        { min: 600, max: 730, rate: 0.10 },
        { min: 730, max: 3896.67, rate: 0.175 },
        { min: 3896.67, max: 20000, rate: 0.25 },
        { min: 20000, max: 50000, rate: 0.30 },
        { min: 50000, max: null, rate: 0.35 },
      ],
      employerContributionRate: 0,
      reducesTaxableIncome: false,
      calculationOrder: 100,
    },
  ],
  commonVoluntaryDeductions: [
    { code: 'TIER3', name: 'Tier 3 Pension', description: 'Voluntary provident fund', category: 'savings', isCommon: true },
  ],
  notes: [
    'SSNIT employer 13% = 13.5% SSNIT + 5% Tier 2',
    'First GHS 490 is tax-free',
    'Tier 3 contributions are tax-deductible up to GHS 1,750/month',
  ],
};

// ============= South Africa Configuration (2025) =============

const southAfricaConfig: PayrollCountryConfig = {
  code: 'ZA',
  name: 'South Africa',
  currency: 'ZAR',
  currencySymbol: 'R',
  taxAuthority: 'South African Revenue Service (SARS)',
  taxAuthorityUrl: 'https://www.sars.gov.za',
  payrollRemittanceDeadline: '7th of following month',
  statutoryDeductions: [
    {
      code: 'UIF',
      name: 'UIF Contribution',
      description: 'Unemployment Insurance Fund - 1% employee, 1% employer (max R177.12)',
      category: 'statutory',
      calculationType: 'capped_percentage',
      rate: 0.01,
      maxContribution: 177.12,
      basis: 'gross',
      employerContributionRate: 0.01,
      reducesTaxableIncome: false,
      calculationOrder: 10,
    },
    {
      code: 'PAYE_ZA',
      name: 'PAYE (Income Tax)',
      description: 'Pay As You Earn - 18% to 45% based on annual income',
      category: 'statutory',
      calculationType: 'tiered',
      basis: 'taxable',
      tiers: [
        { min: 0, max: 237100, rate: 0.18 },
        { min: 237100, max: 370500, rate: 0.26 },
        { min: 370500, max: 512800, rate: 0.31 },
        { min: 512800, max: 673000, rate: 0.36 },
        { min: 673000, max: 857900, rate: 0.39 },
        { min: 857900, max: 1817000, rate: 0.41 },
        { min: 1817000, max: null, rate: 0.45 },
      ],
      personalRelief: 17235, // Primary rebate (monthly)
      employerContributionRate: 0,
      reducesTaxableIncome: false,
      calculationOrder: 100,
    },
  ],
  commonVoluntaryDeductions: [
    { code: 'RA', name: 'Retirement Annuity', description: 'Retirement annuity contribution', category: 'savings', isCommon: true },
    { code: 'MED_AID', name: 'Medical Aid', description: 'Medical aid scheme', category: 'medical', isCommon: true },
  ],
  notes: [
    'UIF capped at R177.12/month per party',
    'Tax brackets are ANNUAL figures - divide by 12 for monthly',
    'Primary rebate: R17,235/year (R1,436.25/month)',
    'Secondary rebate (65+): R9,444/year additional',
    'Retirement contributions tax-deductible up to 27.5% of remuneration (max R350,000/year)',
  ],
};

// ============= Configuration Map =============

export const payrollCountryConfigs: Record<string, PayrollCountryConfig> = {
  KE: kenyaConfig,
  UG: ugandaConfig,
  TZ: tanzaniaConfig,
  RW: rwandaConfig,
  NG: nigeriaConfig,
  GH: ghanaConfig,
  ZA: southAfricaConfig,
};

// ============= Utility Functions =============

export function getPayrollCountryConfig(countryCode: string): PayrollCountryConfig | null {
  return payrollCountryConfigs[countryCode] || null;
}

export function getSupportedPayrollCountries(): string[] {
  return Object.keys(payrollCountryConfigs);
}

export function getStatutoryDeductions(countryCode: string): StatutoryDeductionTemplate[] {
  const config = getPayrollCountryConfig(countryCode);
  return config?.statutoryDeductions || [];
}

export function getVoluntaryDeductionTemplates(countryCode: string): VoluntaryDeductionTemplate[] {
  const config = getPayrollCountryConfig(countryCode);
  return config?.commonVoluntaryDeductions || [];
}

export function isPayrollCountrySupported(countryCode: string): boolean {
  return countryCode in payrollCountryConfigs;
}

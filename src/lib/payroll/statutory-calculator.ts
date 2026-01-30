/**
 * Statutory Deduction Calculator
 * 
 * This module provides calculation engines for statutory deductions
 * based on country-specific tax laws and regulations.
 */

import { getPayrollCountryConfig, type StatutoryDeductionTemplate, type TaxBand } from '../payroll-country-config';

// ============= Type Definitions =============

export interface StatutoryDeductionResult {
  code: string;
  name: string;
  employeeAmount: number;
  employerAmount: number;
  basis: string;
  basisAmount: number;
  rate?: number;
  description: string;
}

export interface PayrollCalculationInput {
  basicSalary: number;
  grossSalary: number;
  countryCode: string;
  allowances?: { name: string; amount: number; taxable: boolean }[];
  voluntaryDeductions?: { code: string; amount: number; reducesTaxable: boolean }[];
}

export interface PayrollCalculationResult {
  grossSalary: number;
  taxableIncome: number;
  totalStatutoryEmployeeDeductions: number;
  totalStatutoryEmployerContributions: number;
  totalVoluntaryDeductions: number;
  netSalary: number;
  statutoryDeductions: StatutoryDeductionResult[];
  voluntaryDeductions: { code: string; name: string; amount: number }[];
  breakdown: {
    basic: number;
    allowances: number;
    gross: number;
    prePayeDeductions: number;
    taxableIncome: number;
    paye: number;
    otherStatutory: number;
    voluntary: number;
    netPay: number;
  };
}

// ============= Kenya Specific Calculators =============

/**
 * Calculate Kenya PAYE (Pay As You Earn) tax
 * Uses 2025 tax bands with personal relief
 */
export function calculateKenyaPAYE(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  const bands: TaxBand[] = [
    { min: 0, max: 24000, rate: 0.10 },
    { min: 24000, max: 32333, rate: 0.25 },
    { min: 32333, max: 500000, rate: 0.30 },
    { min: 500000, max: 800000, rate: 0.325 },
    { min: 800000, max: null, rate: 0.35 },
  ];

  let tax = 0;
  let remaining = taxableIncome;
  let prevMax = 0;

  for (const band of bands) {
    const bandMax = band.max ?? Infinity;
    const taxableInBand = Math.min(remaining, bandMax - prevMax);
    
    if (taxableInBand > 0) {
      tax += taxableInBand * band.rate;
      remaining -= taxableInBand;
    }
    
    prevMax = bandMax;
    if (remaining <= 0) break;
  }

  // Apply personal relief
  const personalRelief = 2400;
  return Math.max(0, tax - personalRelief);
}

/**
 * Calculate Kenya NSSF contribution
 * 6% of pensionable earnings capped at KES 4,320
 */
export function calculateKenyaNSSF(grossSalary: number): { employee: number; employer: number } {
  const lowerLimit = 8000;
  const upperLimit = 72000;
  const rate = 0.06;

  // Cap the pensionable earnings
  const pensionable = Math.min(Math.max(grossSalary, lowerLimit), upperLimit);
  const contribution = Math.round(pensionable * rate);

  // Max contribution is 4,320 per party
  const capped = Math.min(contribution, 4320);

  return { employee: capped, employer: capped };
}

/**
 * Calculate Kenya SHIF (Social Health Insurance Fund)
 * 2.75% of gross salary (replaced NHIF)
 */
export function calculateKenyaSHIF(grossSalary: number): number {
  return Math.round(grossSalary * 0.0275);
}

/**
 * Calculate Kenya Housing Levy (Affordable Housing Levy)
 * 1.5% of gross salary, employer matches
 */
export function calculateKenyaHousingLevy(grossSalary: number): { employee: number; employer: number } {
  const levy = Math.round(grossSalary * 0.015);
  return { employee: levy, employer: levy };
}

// ============= Generic Calculators =============

/**
 * Calculate a simple percentage deduction
 */
function calculatePercentageDeduction(
  amount: number, 
  rate: number, 
  maxContribution?: number
): number {
  const deduction = amount * rate;
  if (maxContribution) {
    return Math.min(deduction, maxContribution);
  }
  return Math.round(deduction);
}

/**
 * Calculate a tiered/progressive deduction (like income tax)
 */
function calculateTieredDeduction(
  amount: number, 
  bands: TaxBand[], 
  personalRelief: number = 0
): number {
  if (amount <= 0) return 0;

  let tax = 0;
  let remaining = amount;
  let prevMax = 0;

  for (const band of bands) {
    const bandMax = band.max ?? Infinity;
    const taxableInBand = Math.min(remaining, bandMax - prevMax);
    
    if (taxableInBand > 0) {
      tax += taxableInBand * band.rate;
      remaining -= taxableInBand;
    }
    
    prevMax = bandMax;
    if (remaining <= 0) break;
  }

  return Math.max(0, Math.round(tax - personalRelief));
}

/**
 * Calculate a capped percentage deduction (like NSSF)
 */
function calculateCappedPercentageDeduction(
  amount: number,
  rate: number,
  maxContribution: number
): number {
  const deduction = amount * rate;
  return Math.min(Math.round(deduction), maxContribution);
}

// ============= Main Calculator =============

/**
 * Calculate a single statutory deduction based on its type
 */
function calculateSingleDeduction(
  template: StatutoryDeductionTemplate,
  basicSalary: number,
  grossSalary: number,
  taxableIncome: number
): StatutoryDeductionResult {
  // Determine basis amount
  let basisAmount = grossSalary;
  switch (template.basis) {
    case 'basic':
      basisAmount = basicSalary;
      break;
    case 'gross':
      basisAmount = grossSalary;
      break;
    case 'taxable':
      basisAmount = taxableIncome;
      break;
    case 'pensionable':
      basisAmount = grossSalary; // Default to gross for pensionable
      break;
  }

  let employeeAmount = 0;
  let employerAmount = 0;

  switch (template.calculationType) {
    case 'percentage':
      employeeAmount = calculatePercentageDeduction(basisAmount, template.rate || 0);
      break;
    
    case 'capped_percentage':
      employeeAmount = calculateCappedPercentageDeduction(
        basisAmount, 
        template.rate || 0, 
        template.maxContribution || Infinity
      );
      break;
    
    case 'tiered':
      if (template.tiers) {
        employeeAmount = calculateTieredDeduction(
          basisAmount, 
          template.tiers, 
          template.personalRelief || 0
        );
      }
      break;
    
    case 'fixed':
      employeeAmount = template.rate || 0;
      break;
  }

  // Calculate employer contribution if applicable
  if (template.employerContributionRate > 0) {
    employerAmount = calculatePercentageDeduction(
      grossSalary, 
      template.employerContributionRate,
      template.maxContribution
    );
  }

  return {
    code: template.code,
    name: template.name,
    employeeAmount: Math.round(employeeAmount),
    employerAmount: Math.round(employerAmount),
    basis: template.basis,
    basisAmount: Math.round(basisAmount),
    rate: template.rate,
    description: template.description,
  };
}

/**
 * Calculate all statutory deductions for an employee
 */
export function calculateAllStatutoryDeductions(
  input: PayrollCalculationInput
): PayrollCalculationResult {
  const config = getPayrollCountryConfig(input.countryCode);
  
  if (!config) {
    // Return zero deductions for unsupported countries
    return {
      grossSalary: input.grossSalary,
      taxableIncome: input.grossSalary,
      totalStatutoryEmployeeDeductions: 0,
      totalStatutoryEmployerContributions: 0,
      totalVoluntaryDeductions: 0,
      netSalary: input.grossSalary,
      statutoryDeductions: [],
      voluntaryDeductions: [],
      breakdown: {
        basic: input.basicSalary,
        allowances: input.grossSalary - input.basicSalary,
        gross: input.grossSalary,
        prePayeDeductions: 0,
        taxableIncome: input.grossSalary,
        paye: 0,
        otherStatutory: 0,
        voluntary: 0,
        netPay: input.grossSalary,
      },
    };
  }

  // Sort deductions by calculation order
  const sortedDeductions = [...config.statutoryDeductions].sort(
    (a, b) => a.calculationOrder - b.calculationOrder
  );

  const results: StatutoryDeductionResult[] = [];
  let taxableIncome = input.grossSalary;
  let totalEmployeeDeductions = 0;
  let totalEmployerContributions = 0;
  let prePayeDeductions = 0;

  // First pass: calculate deductions that reduce taxable income (before PAYE)
  for (const template of sortedDeductions) {
    if (template.calculationOrder < 100) {
      // Non-PAYE deductions
      const result = calculateSingleDeduction(
        template,
        input.basicSalary,
        input.grossSalary,
        taxableIncome
      );
      
      results.push(result);
      totalEmployeeDeductions += result.employeeAmount;
      totalEmployerContributions += result.employerAmount;
      
      if (template.reducesTaxableIncome) {
        taxableIncome -= result.employeeAmount;
        prePayeDeductions += result.employeeAmount;
      }
    }
  }

  // Calculate voluntary deductions that reduce taxable income
  const voluntaryResults: { code: string; name: string; amount: number }[] = [];
  let totalVoluntary = 0;
  
  if (input.voluntaryDeductions) {
    for (const vol of input.voluntaryDeductions) {
      voluntaryResults.push({
        code: vol.code,
        name: vol.code, // Would ideally look up name
        amount: vol.amount,
      });
      totalVoluntary += vol.amount;
      
      if (vol.reducesTaxable) {
        taxableIncome -= vol.amount;
      }
    }
  }

  // Ensure taxable income doesn't go negative
  taxableIncome = Math.max(0, taxableIncome);

  // Second pass: calculate PAYE on taxable income
  let payeAmount = 0;
  for (const template of sortedDeductions) {
    if (template.calculationOrder >= 100) {
      // PAYE calculation
      const result = calculateSingleDeduction(
        template,
        input.basicSalary,
        input.grossSalary,
        taxableIncome
      );
      
      payeAmount = result.employeeAmount;
      results.push(result);
      totalEmployeeDeductions += result.employeeAmount;
    }
  }

  // Calculate net salary
  const netSalary = input.grossSalary - totalEmployeeDeductions - totalVoluntary;

  return {
    grossSalary: input.grossSalary,
    taxableIncome,
    totalStatutoryEmployeeDeductions: totalEmployeeDeductions,
    totalStatutoryEmployerContributions: totalEmployerContributions,
    totalVoluntaryDeductions: totalVoluntary,
    netSalary: Math.round(netSalary),
    statutoryDeductions: results,
    voluntaryDeductions: voluntaryResults,
    breakdown: {
      basic: input.basicSalary,
      allowances: input.grossSalary - input.basicSalary,
      gross: input.grossSalary,
      prePayeDeductions,
      taxableIncome,
      paye: payeAmount,
      otherStatutory: totalEmployeeDeductions - payeAmount,
      voluntary: totalVoluntary,
      netPay: Math.round(netSalary),
    },
  };
}

/**
 * Calculate Kenya-specific deductions (shorthand)
 */
export function calculateKenyaPayroll(basicSalary: number, grossSalary: number): PayrollCalculationResult {
  return calculateAllStatutoryDeductions({
    basicSalary,
    grossSalary,
    countryCode: 'KE',
  });
}

/**
 * Get a summary of statutory deductions for display
 */
export function getStatutoryDeductionsSummary(countryCode: string): string[] {
  const config = getPayrollCountryConfig(countryCode);
  if (!config) return ['No statutory deductions configured for this country'];

  return config.statutoryDeductions.map(d => {
    const rate = d.rate ? `${(d.rate * 100).toFixed(2)}%` : '';
    const employer = d.employerContributionRate > 0 
      ? ` + ${(d.employerContributionRate * 100).toFixed(2)}% employer` 
      : '';
    return `${d.name}: ${rate}${employer}`;
  });
}

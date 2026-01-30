// Institution-level settings types

export interface FinanceModuleSettings {
  // Currency Settings
  default_currency: string;
  currency_symbol: string;
  decimal_places: number;
  thousand_separator: ',' | '.' | ' ';
  decimal_separator: '.' | ',';
  
  // Fiscal Year Settings
  fiscal_year_start_month: number; // 1-12
  fiscal_year_naming: 'calendar' | 'academic' | 'custom';
  period_naming: 'month' | 'quarter' | 'term';
  
  // Accounting Preferences
  require_voucher_approval: boolean;
  voucher_approval_levels: 1 | 2 | 3;
  auto_generate_journal_entries: boolean;
  enforce_budget_limits: boolean;
  allow_backdated_entries: boolean;
  backdated_days_limit: number;
  default_fund_id?: string;
  
  // M-PESA Integration
  mpesa_enabled: boolean;
  mpesa_shortcode?: string;
  mpesa_till_number?: string;
  mpesa_paybill_number?: string;
  
  // Fee Management
  reminders_enabled: boolean;
  auto_reminders: boolean;
  reminder_channels: ('sms' | 'email' | 'in_app')[];
  
  penalties_enabled: boolean;
  auto_apply_penalties: boolean;
  
  // Multi-level Approval Settings
  adjustment_secondary_threshold: number; // Amount above which requires secondary approval
  adjustment_secondary_approver_role: string; // Role required for secondary approval
  
  installments_enabled: boolean;
  
  // Receipt Settings
  receipt_prefix: string;
  receipt_starting_number: number;
  show_balance_on_receipt: boolean;
  
  // Invoice Settings
  invoice_prefix: string;
  invoice_due_days: number;
  show_itemized_fees: boolean;
}

export interface AssignmentSettings {
  enabled: boolean;
  allow_parent_submission: boolean;
  default_max_file_size_mb: number;
  allowed_file_types: string[];
  default_allow_late: boolean;
  default_allow_resubmission: boolean;
}

export interface InstitutionSettings {
  assignments?: AssignmentSettings;
  finance?: FinanceModuleSettings;
}

export const DEFAULT_FINANCE_SETTINGS: FinanceModuleSettings = {
  // Currency defaults (Kenya)
  default_currency: 'KES',
  currency_symbol: 'KES',
  decimal_places: 2,
  thousand_separator: ',',
  decimal_separator: '.',
  
  // Fiscal year defaults
  fiscal_year_start_month: 1, // January
  fiscal_year_naming: 'calendar',
  period_naming: 'month',
  
  // Accounting preferences
  require_voucher_approval: true,
  voucher_approval_levels: 2,
  auto_generate_journal_entries: true,
  enforce_budget_limits: false,
  allow_backdated_entries: true,
  backdated_days_limit: 30,
  
  // M-PESA
  mpesa_enabled: false,
  
  // Fee management
  reminders_enabled: false,
  auto_reminders: false,
  reminder_channels: ['in_app'],
  penalties_enabled: false,
  auto_apply_penalties: false,
  installments_enabled: true,
  
  // Multi-level approval defaults
  adjustment_secondary_threshold: 50000, // 50,000 KES
  adjustment_secondary_approver_role: 'institution_admin',
  
  // Receipts
  receipt_prefix: 'RCP',
  receipt_starting_number: 1,
  show_balance_on_receipt: true,
  
  // Invoices
  invoice_prefix: 'INV',
  invoice_due_days: 30,
  show_itemized_fees: true,
};

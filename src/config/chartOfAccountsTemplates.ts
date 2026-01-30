/**
 * Chart of Accounts Template Definitions
 * Standard templates for Kenyan educational institution fund accounting
 */

export interface StandardAccountTemplate {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent: string | null;
  description?: string;
  isBank?: boolean;
  isControl?: boolean;
}

export interface CoaTemplate {
  id: string;
  name: string;
  description: string;
  institutionType: 'primary' | 'secondary' | 'university' | 'tvet' | 'religious' | 'international' | 'general';
  accounts: StandardAccountTemplate[];
}

/**
 * Base accounts common to all institution types
 */
const BASE_ACCOUNTS: StandardAccountTemplate[] = [
  // Assets (1000s)
  { code: '1000', name: 'Assets', type: 'asset', parent: null, description: 'All institutional assets' },
  { code: '1100', name: 'Current Assets', type: 'asset', parent: '1000', description: 'Short-term assets' },
  { code: '1110', name: 'Cash and Bank', type: 'asset', parent: '1100', description: 'Cash holdings and bank accounts' },
  { code: '1111', name: 'Petty Cash', type: 'asset', parent: '1110', description: 'Small cash for daily expenses' },
  { code: '1112', name: 'Main Bank Account', type: 'asset', parent: '1110', description: 'Primary operating account', isBank: true },
  { code: '1113', name: 'Fees Collection Account', type: 'asset', parent: '1110', description: 'Account for fee deposits', isBank: true },
  { code: '1114', name: 'M-PESA Float', type: 'asset', parent: '1110', description: 'Mobile money holdings' },
  { code: '1120', name: 'Accounts Receivable', type: 'asset', parent: '1100', description: 'Money owed to institution', isControl: true },
  { code: '1121', name: 'Student Fees Receivable', type: 'asset', parent: '1120', description: 'Outstanding student fees' },
  { code: '1130', name: 'Prepaid Expenses', type: 'asset', parent: '1100', description: 'Advance payments' },
  { code: '1140', name: 'Inventory', type: 'asset', parent: '1100', description: 'Stock and supplies' },
  { code: '1141', name: 'Teaching Materials', type: 'asset', parent: '1140', description: 'Books and learning aids' },
  { code: '1142', name: 'Office Supplies', type: 'asset', parent: '1140', description: 'Stationery and consumables' },
  { code: '1200', name: 'Fixed Assets', type: 'asset', parent: '1000', description: 'Long-term assets' },
  { code: '1210', name: 'Land', type: 'asset', parent: '1200', description: 'School grounds' },
  { code: '1220', name: 'Buildings', type: 'asset', parent: '1200', description: 'Classrooms, offices' },
  { code: '1230', name: 'Furniture and Fixtures', type: 'asset', parent: '1200', description: 'Desks, chairs, cabinets' },
  { code: '1240', name: 'Equipment', type: 'asset', parent: '1200', description: 'Lab and office equipment' },
  { code: '1250', name: 'Vehicles', type: 'asset', parent: '1200', description: 'School buses and cars' },
  { code: '1260', name: 'Computer Equipment', type: 'asset', parent: '1200', description: 'ICT infrastructure' },
  { code: '1290', name: 'Accumulated Depreciation', type: 'asset', parent: '1200', description: 'Asset value reduction' },

  // Liabilities (2000s)
  { code: '2000', name: 'Liabilities', type: 'liability', parent: null, description: 'All institutional obligations' },
  { code: '2100', name: 'Current Liabilities', type: 'liability', parent: '2000', description: 'Short-term obligations' },
  { code: '2110', name: 'Accounts Payable', type: 'liability', parent: '2100', description: 'Money owed to suppliers', isControl: true },
  { code: '2120', name: 'Salaries Payable', type: 'liability', parent: '2100', description: 'Staff salary obligations' },
  { code: '2130', name: 'Statutory Deductions Payable', type: 'liability', parent: '2100', description: 'PAYE, NHIF, NSSF due' },
  { code: '2131', name: 'PAYE Payable', type: 'liability', parent: '2130', description: 'Income tax withheld' },
  { code: '2132', name: 'NHIF Payable', type: 'liability', parent: '2130', description: 'Health insurance contributions' },
  { code: '2133', name: 'NSSF Payable', type: 'liability', parent: '2130', description: 'Pension contributions' },
  { code: '2140', name: 'Accrued Expenses', type: 'liability', parent: '2100', description: 'Expenses incurred not yet paid' },
  { code: '2150', name: 'Fees Paid in Advance', type: 'liability', parent: '2100', description: 'Student prepayments' },
  { code: '2160', name: 'Deposits Held', type: 'liability', parent: '2100', description: 'Refundable deposits' },
  { code: '2200', name: 'Long-term Liabilities', type: 'liability', parent: '2000', description: 'Long-term obligations' },
  { code: '2210', name: 'Bank Loans', type: 'liability', parent: '2200', description: 'Institutional borrowings' },

  // Equity (3000s)
  { code: '3000', name: 'Equity', type: 'equity', parent: null, description: 'Net assets and fund balances' },
  { code: '3100', name: 'Fund Balances', type: 'equity', parent: '3000', description: 'Accumulated fund surpluses' },
  { code: '3110', name: 'General Fund Balance', type: 'equity', parent: '3100', description: 'Unrestricted funds' },
  { code: '3200', name: 'Retained Surplus', type: 'equity', parent: '3000', description: 'Accumulated surpluses' },

  // Income (4000s)
  { code: '4000', name: 'Income', type: 'income', parent: null, description: 'All revenue sources' },
  { code: '4100', name: 'Fee Income', type: 'income', parent: '4000', description: 'Student fee revenue' },
  { code: '4110', name: 'Tuition Fees', type: 'income', parent: '4100', description: 'Academic fees collected' },
  { code: '4300', name: 'Other Income', type: 'income', parent: '4000', description: 'Miscellaneous revenue' },
  { code: '4310', name: 'Donations', type: 'income', parent: '4300', description: 'Charitable contributions' },
  { code: '4320', name: 'Rental Income', type: 'income', parent: '4300', description: 'Facility rentals' },
  { code: '4330', name: 'Interest Income', type: 'income', parent: '4300', description: 'Bank interest earned' },

  // Expenses (5000s)
  { code: '5000', name: 'Expenses', type: 'expense', parent: null, description: 'All operational costs' },
  { code: '5100', name: 'Personnel Costs', type: 'expense', parent: '5000', description: 'Staff-related expenses' },
  { code: '5110', name: 'Teaching Staff Salaries', type: 'expense', parent: '5100', description: 'Teacher remuneration' },
  { code: '5120', name: 'Non-Teaching Staff Salaries', type: 'expense', parent: '5100', description: 'Support staff wages' },
  { code: '5130', name: 'Staff Allowances', type: 'expense', parent: '5100', description: 'Housing, transport allowances' },
  { code: '5140', name: 'Staff Benefits', type: 'expense', parent: '5100', description: 'Medical, pension contributions' },
  { code: '5200', name: 'Teaching and Learning', type: 'expense', parent: '5000', description: 'Educational expenses' },
  { code: '5210', name: 'Textbooks and Materials', type: 'expense', parent: '5200', description: 'Learning resources' },
  { code: '5240', name: 'Examination Expenses', type: 'expense', parent: '5200', description: 'Testing materials' },
  { code: '5300', name: 'Administration', type: 'expense', parent: '5000', description: 'Office operations' },
  { code: '5310', name: 'Office Supplies', type: 'expense', parent: '5300', description: 'Stationery and consumables' },
  { code: '5320', name: 'Communication', type: 'expense', parent: '5300', description: 'Phone, internet, postage' },
  { code: '5330', name: 'Professional Fees', type: 'expense', parent: '5300', description: 'Audit, legal services' },
  { code: '5340', name: 'Bank Charges', type: 'expense', parent: '5300', description: 'Transaction fees' },
  { code: '5400', name: 'Facilities', type: 'expense', parent: '5000', description: 'Property maintenance' },
  { code: '5410', name: 'Utilities', type: 'expense', parent: '5400', description: 'Water, electricity, gas' },
  { code: '5420', name: 'Repairs and Maintenance', type: 'expense', parent: '5400', description: 'RMI expenses' },
  { code: '5430', name: 'Security', type: 'expense', parent: '5400', description: 'Guards and systems' },
  { code: '5440', name: 'Cleaning and Sanitation', type: 'expense', parent: '5400', description: 'Janitorial services' },
  { code: '5600', name: 'Transport', type: 'expense', parent: '5000', description: 'Vehicle operations' },
  { code: '5610', name: 'Fuel and Oil', type: 'expense', parent: '5600', description: 'Vehicle running costs' },
  { code: '5620', name: 'Vehicle Maintenance', type: 'expense', parent: '5600', description: 'Repairs and servicing' },
  { code: '5630', name: 'Insurance - Vehicles', type: 'expense', parent: '5600', description: 'Motor insurance' },
  { code: '5700', name: 'Other Expenses', type: 'expense', parent: '5000', description: 'Miscellaneous costs' },
  { code: '5710', name: 'Depreciation', type: 'expense', parent: '5700', description: 'Asset value reduction' },
  { code: '5720', name: 'Bad Debts', type: 'expense', parent: '5700', description: 'Uncollectible fees' },
  { code: '5730', name: 'Contingencies', type: 'expense', parent: '5700', description: 'Unexpected expenses' },
];

/**
 * Primary School specific accounts (FPE focus)
 */
const PRIMARY_SCHOOL_ACCOUNTS: StandardAccountTemplate[] = [
  ...BASE_ACCOUNTS,
  // Government Grants specific to primary
  { code: '1122', name: 'FPE Grants Receivable', type: 'asset', parent: '1120', description: 'Pending FPE capitation' },
  { code: '1143', name: 'Food Supplies', type: 'asset', parent: '1140', description: 'School feeding programme' },
  // Equity - FPE Fund
  { code: '3120', name: 'FPE Fund Balance', type: 'equity', parent: '3100', description: 'Free Primary Education funds' },
  // FPE Income
  { code: '4200', name: 'Government Grants', type: 'income', parent: '4000', description: 'Capitation and grants' },
  { code: '4210', name: 'FPE Capitation', type: 'income', parent: '4200', description: 'Free Primary Education grants' },
  { code: '4230', name: 'Infrastructure Grants', type: 'income', parent: '4200', description: 'Development funding' },
  // Activity fees
  { code: '4130', name: 'Activity Fees', type: 'income', parent: '4100', description: 'Extra-curricular fees' },
  // School feeding
  { code: '5500', name: 'School Feeding', type: 'expense', parent: '5000', description: 'Meal programme costs' },
  { code: '5510', name: 'Food and Catering', type: 'expense', parent: '5500', description: 'Student meals' },
  // Library
  { code: '5230', name: 'Library Resources', type: 'expense', parent: '5200', description: 'Books and reading materials' },
];

/**
 * Secondary School specific accounts (includes boarding, JSS)
 */
const SECONDARY_SCHOOL_ACCOUNTS: StandardAccountTemplate[] = [
  ...BASE_ACCOUNTS,
  // Government Grants
  { code: '1122', name: 'Government Grants Receivable', type: 'asset', parent: '1120', description: 'Pending capitation' },
  { code: '1143', name: 'Food Supplies', type: 'asset', parent: '1140', description: 'Boarding provisions' },
  // Equity - Multiple funds
  { code: '3120', name: 'FPE Fund Balance', type: 'equity', parent: '3100', description: 'Free Primary Education funds' },
  { code: '3130', name: 'JSS Fund Balance', type: 'equity', parent: '3100', description: 'Junior Secondary funds' },
  { code: '3140', name: 'Boarding Fund Balance', type: 'equity', parent: '3100', description: 'Boarding operations funds' },
  { code: '3150', name: 'Capital Development Fund', type: 'equity', parent: '3100', description: 'Infrastructure development' },
  // Fee types
  { code: '4120', name: 'Boarding Fees', type: 'income', parent: '4100', description: 'Accommodation fees' },
  { code: '4130', name: 'Activity Fees', type: 'income', parent: '4100', description: 'Extra-curricular fees' },
  { code: '4140', name: 'Transport Fees', type: 'income', parent: '4100', description: 'School bus fees' },
  { code: '4150', name: 'Examination Fees', type: 'income', parent: '4100', description: 'Exam registration fees' },
  // Government grants
  { code: '4200', name: 'Government Grants', type: 'income', parent: '4000', description: 'Capitation and grants' },
  { code: '4210', name: 'FPE Capitation', type: 'income', parent: '4200', description: 'Free Primary Education grants' },
  { code: '4220', name: 'JSS Capitation', type: 'income', parent: '4200', description: 'Junior Secondary grants' },
  { code: '4230', name: 'Infrastructure Grants', type: 'income', parent: '4200', description: 'Development funding' },
  { code: '4340', name: 'Late Payment Penalties', type: 'income', parent: '4300', description: 'Fee penalty charges' },
  // Lab expenses
  { code: '5220', name: 'Laboratory Supplies', type: 'expense', parent: '5200', description: 'Science equipment' },
  { code: '5230', name: 'Library Resources', type: 'expense', parent: '5200', description: 'Books and periodicals' },
  // Boarding operations
  { code: '5500', name: 'Boarding Operations', type: 'expense', parent: '5000', description: 'Dormitory costs' },
  { code: '5510', name: 'Food and Catering', type: 'expense', parent: '5500', description: 'Student meals' },
  { code: '5520', name: 'Dormitory Supplies', type: 'expense', parent: '5500', description: 'Bedding, toiletries' },
];

/**
 * University/College specific accounts
 */
const UNIVERSITY_ACCOUNTS: StandardAccountTemplate[] = [
  ...BASE_ACCOUNTS,
  // Receivables
  { code: '1122', name: 'HELB Receivable', type: 'asset', parent: '1120', description: 'Pending HELB disbursements' },
  { code: '1123', name: 'Scholarship Receivable', type: 'asset', parent: '1120', description: 'Pending scholarship payments' },
  { code: '1143', name: 'Food Supplies', type: 'asset', parent: '1140', description: 'Cafeteria provisions' },
  { code: '1144', name: 'Laboratory Consumables', type: 'asset', parent: '1140', description: 'Research materials' },
  // Research assets
  { code: '1270', name: 'Research Equipment', type: 'asset', parent: '1200', description: 'Specialized research assets' },
  // Equity - Multiple funds
  { code: '3120', name: 'Research Fund Balance', type: 'equity', parent: '3100', description: 'Research grants' },
  { code: '3130', name: 'Scholarship Fund', type: 'equity', parent: '3100', description: 'Student scholarships' },
  { code: '3140', name: 'Capital Development Fund', type: 'equity', parent: '3100', description: 'Infrastructure development' },
  { code: '3150', name: 'Endowment Fund', type: 'equity', parent: '3100', description: 'Long-term investments' },
  // Income types
  { code: '4120', name: 'Accommodation Fees', type: 'income', parent: '4100', description: 'Hostel fees' },
  { code: '4130', name: 'Registration Fees', type: 'income', parent: '4100', description: 'Semester registration' },
  { code: '4140', name: 'Examination Fees', type: 'income', parent: '4100', description: 'Exam and graduation fees' },
  { code: '4150', name: 'Library Fees', type: 'income', parent: '4100', description: 'Library access fees' },
  { code: '4160', name: 'Laboratory Fees', type: 'income', parent: '4100', description: 'Lab usage fees' },
  // Grants and funding
  { code: '4200', name: 'Government Funding', type: 'income', parent: '4000', description: 'State allocations' },
  { code: '4210', name: 'Capitation Grants', type: 'income', parent: '4200', description: 'Per-student funding' },
  { code: '4220', name: 'HELB Disbursements', type: 'income', parent: '4200', description: 'Student loan payments' },
  { code: '4230', name: 'Research Grants', type: 'income', parent: '4200', description: 'Government research funding' },
  { code: '4400', name: 'Research Income', type: 'income', parent: '4000', description: 'Research revenue' },
  { code: '4410', name: 'External Research Grants', type: 'income', parent: '4400', description: 'NGO/Corporate grants' },
  { code: '4420', name: 'Consultancy Income', type: 'income', parent: '4400', description: 'Professional services' },
  // Teaching expenses
  { code: '5220', name: 'Laboratory Supplies', type: 'expense', parent: '5200', description: 'Lab consumables' },
  { code: '5230', name: 'Library Resources', type: 'expense', parent: '5200', description: 'Journals, databases' },
  { code: '5250', name: 'E-Learning Resources', type: 'expense', parent: '5200', description: 'Digital learning platforms' },
  // Research expenses
  { code: '5800', name: 'Research Expenses', type: 'expense', parent: '5000', description: 'Research operations' },
  { code: '5810', name: 'Research Materials', type: 'expense', parent: '5800', description: 'Consumables for research' },
  { code: '5820', name: 'Research Equipment', type: 'expense', parent: '5800', description: 'Specialized equipment' },
  { code: '5830', name: 'Conference and Travel', type: 'expense', parent: '5800', description: 'Academic conferences' },
  { code: '5840', name: 'Publication Costs', type: 'expense', parent: '5800', description: 'Journal publication fees' },
  // Student services
  { code: '5500', name: 'Student Services', type: 'expense', parent: '5000', description: 'Student welfare' },
  { code: '5510', name: 'Cafeteria Operations', type: 'expense', parent: '5500', description: 'Food services' },
  { code: '5520', name: 'Hostel Operations', type: 'expense', parent: '5500', description: 'Accommodation services' },
  { code: '5530', name: 'Student Health', type: 'expense', parent: '5500', description: 'Medical services' },
  { code: '5540', name: 'Career Services', type: 'expense', parent: '5500', description: 'Placement and counseling' },
];

/**
 * TVET/Polytechnic specific accounts
 */
const TVET_ACCOUNTS: StandardAccountTemplate[] = [
  ...BASE_ACCOUNTS,
  // Workshop materials
  { code: '1143', name: 'Workshop Materials', type: 'asset', parent: '1140', description: 'Raw materials for practicals' },
  { code: '1144', name: 'Tools and Equipment Stock', type: 'asset', parent: '1140', description: 'Hand tools inventory' },
  { code: '1145', name: 'Consumables Inventory', type: 'asset', parent: '1140', description: 'Welding rods, chemicals, etc.' },
  // Fixed assets specific to TVET
  { code: '1270', name: 'Workshop Machinery', type: 'asset', parent: '1200', description: 'Heavy workshop equipment' },
  { code: '1280', name: 'Training Equipment', type: 'asset', parent: '1200', description: 'Specialized training tools' },
  // Receivables
  { code: '1122', name: 'NITA Levy Receivable', type: 'asset', parent: '1120', description: 'Pending NITA reimbursements' },
  { code: '1123', name: 'CDACC Grants Receivable', type: 'asset', parent: '1120', description: 'CBET funding receivables' },
  // Equity - Training funds
  { code: '3120', name: 'TVET Fund Balance', type: 'equity', parent: '3100', description: 'TVET capitation funds' },
  { code: '3130', name: 'Workshop Fund', type: 'equity', parent: '3100', description: 'Workshop operations fund' },
  { code: '3140', name: 'Industry Attachment Fund', type: 'equity', parent: '3100', description: 'Student placement funds' },
  // Income types
  { code: '4120', name: 'Workshop Fees', type: 'income', parent: '4100', description: 'Practical training fees' },
  { code: '4130', name: 'Examination Fees', type: 'income', parent: '4100', description: 'KNEC/CDACC exam fees' },
  { code: '4140', name: 'Attachment Fees', type: 'income', parent: '4100', description: 'Industrial attachment fees' },
  { code: '4150', name: 'Certification Fees', type: 'income', parent: '4100', description: 'Certificate processing fees' },
  // Government grants
  { code: '4200', name: 'Government Grants', type: 'income', parent: '4000', description: 'TVET funding' },
  { code: '4210', name: 'TVET Capitation', type: 'income', parent: '4200', description: 'Per-trainee funding' },
  { code: '4220', name: 'NITA Levy Refunds', type: 'income', parent: '4200', description: 'Industrial training levy' },
  { code: '4230', name: 'CDACC CBET Grants', type: 'income', parent: '4200', description: 'Competency-based training funds' },
  // Production income
  { code: '4400', name: 'Production Income', type: 'income', parent: '4000', description: 'Workshop production sales' },
  { code: '4410', name: 'Workshop Products', type: 'income', parent: '4400', description: 'Items made by students' },
  { code: '4420', name: 'Repair Services', type: 'income', parent: '4400', description: 'Community repair work' },
  // Workshop expenses
  { code: '5220', name: 'Workshop Supplies', type: 'expense', parent: '5200', description: 'Raw materials for practicals' },
  { code: '5230', name: 'Tools Replacement', type: 'expense', parent: '5200', description: 'Workshop tool maintenance' },
  { code: '5240', name: 'Safety Equipment', type: 'expense', parent: '5200', description: 'PPE and safety gear' },
  // Industrial attachment
  { code: '5800', name: 'Attachment Expenses', type: 'expense', parent: '5000', description: 'Industry placement costs' },
  { code: '5810', name: 'Attachment Supervision', type: 'expense', parent: '5800', description: 'Lecturer travel for supervision' },
  { code: '5820', name: 'Trainee Allowances', type: 'expense', parent: '5800', description: 'Student attachment support' },
  // Examination
  { code: '5250', name: 'KNEC Exam Fees', type: 'expense', parent: '5200', description: 'Examination body charges' },
];

/**
 * Religious/Faith-based School accounts
 */
const RELIGIOUS_SCHOOL_ACCOUNTS: StandardAccountTemplate[] = [
  ...BASE_ACCOUNTS,
  // Church/Religious receivables
  { code: '1122', name: 'Church Grants Receivable', type: 'asset', parent: '1120', description: 'Pending church/diocese grants' },
  { code: '1123', name: 'Mission Support Receivable', type: 'asset', parent: '1120', description: 'Pending mission organization funds' },
  { code: '1143', name: 'Food Supplies', type: 'asset', parent: '1140', description: 'Boarding provisions' },
  { code: '1144', name: 'Religious Materials', type: 'asset', parent: '1140', description: 'Bibles, prayer books, etc.' },
  // Religious property
  { code: '1225', name: 'Chapel/Mosque', type: 'asset', parent: '1200', description: 'Place of worship' },
  // Equity - Religious funds
  { code: '3120', name: 'Church/Diocese Fund', type: 'equity', parent: '3100', description: 'Religious sponsor contributions' },
  { code: '3130', name: 'Mission Fund', type: 'equity', parent: '3100', description: 'Mission organization support' },
  { code: '3140', name: 'Bursary Fund', type: 'equity', parent: '3100', description: 'Religious bursary endowment' },
  { code: '3150', name: 'Boarding Fund Balance', type: 'equity', parent: '3100', description: 'Boarding operations' },
  // Fee types
  { code: '4120', name: 'Boarding Fees', type: 'income', parent: '4100', description: 'Accommodation fees' },
  { code: '4130', name: 'Activity Fees', type: 'income', parent: '4100', description: 'Extra-curricular fees' },
  { code: '4140', name: 'Development Levy', type: 'income', parent: '4100', description: 'Infrastructure contributions' },
  // Religious income
  { code: '4200', name: 'Sponsor Contributions', type: 'income', parent: '4000', description: 'Religious organization funding' },
  { code: '4210', name: 'Church/Diocese Grants', type: 'income', parent: '4200', description: 'Regular sponsor support' },
  { code: '4220', name: 'Mission Organization Grants', type: 'income', parent: '4200', description: 'External mission funding' },
  { code: '4230', name: 'Religious Bursaries', type: 'income', parent: '4200', description: 'Sponsor-funded scholarships' },
  { code: '4240', name: 'Tithe Allocations', type: 'income', parent: '4200', description: 'Church tithe for education' },
  // Donations
  { code: '4350', name: 'Harambee Contributions', type: 'income', parent: '4300', description: 'Community fundraising' },
  { code: '4360', name: 'Alumni Donations', type: 'income', parent: '4300', description: 'Former student contributions' },
  // Chaplaincy
  { code: '5800', name: 'Chaplaincy Services', type: 'expense', parent: '5000', description: 'Religious program costs' },
  { code: '5810', name: 'Chaplain Allowances', type: 'expense', parent: '5800', description: 'Religious leader stipends' },
  { code: '5820', name: 'Religious Materials', type: 'expense', parent: '5800', description: 'Bibles, prayer materials' },
  { code: '5830', name: 'Retreats and Camps', type: 'expense', parent: '5800', description: 'Spiritual formation events' },
  { code: '5840', name: 'Community Outreach', type: 'expense', parent: '5800', description: 'Service to community' },
  // Boarding
  { code: '5500', name: 'Boarding Operations', type: 'expense', parent: '5000', description: 'Dormitory costs' },
  { code: '5510', name: 'Food and Catering', type: 'expense', parent: '5500', description: 'Student meals' },
  { code: '5520', name: 'Dormitory Supplies', type: 'expense', parent: '5500', description: 'Bedding, toiletries' },
  // Bursary disbursements
  { code: '5850', name: 'Bursary Disbursements', type: 'expense', parent: '5800', description: 'Student fee support' },
];

/**
 * International School accounts (IB/Cambridge curriculum)
 */
const INTERNATIONAL_SCHOOL_ACCOUNTS: StandardAccountTemplate[] = [
  ...BASE_ACCOUNTS,
  // Multiple currencies
  { code: '1115', name: 'USD Bank Account', type: 'asset', parent: '1110', description: 'Foreign currency account', isBank: true },
  { code: '1116', name: 'GBP Bank Account', type: 'asset', parent: '1110', description: 'Sterling account', isBank: true },
  // Receivables
  { code: '1122', name: 'Corporate Sponsors Receivable', type: 'asset', parent: '1120', description: 'Company education benefits' },
  { code: '1123', name: 'Embassy Receivable', type: 'asset', parent: '1120', description: 'Diplomatic family fees' },
  { code: '1143', name: 'Food Supplies', type: 'asset', parent: '1140', description: 'International menu provisions' },
  { code: '1144', name: 'International Curriculum Materials', type: 'asset', parent: '1140', description: 'IB/Cambridge textbooks' },
  // Specialized facilities
  { code: '1270', name: 'Sports Complex', type: 'asset', parent: '1200', description: 'International sports facilities' },
  { code: '1280', name: 'Performing Arts Center', type: 'asset', parent: '1200', description: 'Auditorium and studios' },
  // Equity - Multiple funds
  { code: '3120', name: 'Scholarship Fund', type: 'equity', parent: '3100', description: 'Merit and need-based scholarships' },
  { code: '3130', name: 'Capital Projects Fund', type: 'equity', parent: '3100', description: 'Major infrastructure' },
  { code: '3140', name: 'Technology Fund', type: 'equity', parent: '3100', description: 'IT infrastructure fund' },
  { code: '3150', name: 'Activities Fund', type: 'equity', parent: '3100', description: 'Extracurricular programs' },
  // Fee income (premium)
  { code: '4120', name: 'Capital Levy', type: 'income', parent: '4100', description: 'One-time enrollment fee' },
  { code: '4130', name: 'Technology Fee', type: 'income', parent: '4100', description: 'IT and devices fee' },
  { code: '4140', name: 'Examination Fees', type: 'income', parent: '4100', description: 'IB/Cambridge/SAT fees' },
  { code: '4150', name: 'Activity Fees', type: 'income', parent: '4100', description: 'ECA participation fees' },
  { code: '4160', name: 'Transport Fees', type: 'income', parent: '4100', description: 'Bus service fees' },
  { code: '4170', name: 'Lunch Program Fees', type: 'income', parent: '4100', description: 'Cafeteria fees' },
  // Corporate/Embassy income
  { code: '4200', name: 'Corporate Sponsorships', type: 'income', parent: '4000', description: 'Company-sponsored students' },
  { code: '4210', name: 'Corporate Tuition Payments', type: 'income', parent: '4200', description: 'Employer education benefits' },
  { code: '4220', name: 'Embassy Payments', type: 'income', parent: '4200', description: 'Diplomatic family fees' },
  { code: '4230', name: 'NGO Scholarships', type: 'income', parent: '4200', description: 'NGO-funded students' },
  // Foreign exchange
  { code: '4340', name: 'Foreign Exchange Gains', type: 'income', parent: '4300', description: 'Currency conversion gains' },
  // Curriculum expenses
  { code: '5220', name: 'IB Programme Fees', type: 'expense', parent: '5200', description: 'IBO annual fees' },
  { code: '5225', name: 'Cambridge Fees', type: 'expense', parent: '5200', description: 'CAIE registration' },
  { code: '5230', name: 'International Textbooks', type: 'expense', parent: '5200', description: 'Premium curriculum materials' },
  { code: '5260', name: 'E-Learning Platforms', type: 'expense', parent: '5200', description: 'Digital learning subscriptions' },
  // International staff
  { code: '5150', name: 'Expatriate Allowances', type: 'expense', parent: '5100', description: 'Housing, flights for intl staff' },
  { code: '5160', name: 'Recruitment Costs', type: 'expense', parent: '5100', description: 'International recruitment' },
  // Activities
  { code: '5800', name: 'Extracurricular Activities', type: 'expense', parent: '5000', description: 'ECA program costs' },
  { code: '5810', name: 'Sports Programs', type: 'expense', parent: '5800', description: 'Coaching and equipment' },
  { code: '5820', name: 'Arts Programs', type: 'expense', parent: '5800', description: 'Music, drama, visual arts' },
  { code: '5830', name: 'International Trips', type: 'expense', parent: '5800', description: 'MUN, sports tours, exchanges' },
  { code: '5840', name: 'Service Learning', type: 'expense', parent: '5800', description: 'CAS and community service' },
  // Foreign exchange losses
  { code: '5740', name: 'Foreign Exchange Losses', type: 'expense', parent: '5700', description: 'Currency conversion losses' },
  // Cafeteria
  { code: '5500', name: 'Cafeteria Operations', type: 'expense', parent: '5000', description: 'Food service costs' },
  { code: '5510', name: 'Food and Catering', type: 'expense', parent: '5500', description: 'International menu' },
];

/**
 * All available COA templates
 */
export const COA_TEMPLATES: CoaTemplate[] = [
  {
    id: 'primary-school',
    name: 'Primary School',
    description: 'Standard chart of accounts for Kenyan primary schools with FPE capitation tracking',
    institutionType: 'primary',
    accounts: PRIMARY_SCHOOL_ACCOUNTS,
  },
  {
    id: 'secondary-school',
    name: 'Secondary School',
    description: 'Comprehensive accounts for secondary schools including boarding, JSS, and activity funds',
    institutionType: 'secondary',
    accounts: SECONDARY_SCHOOL_ACCOUNTS,
  },
  {
    id: 'university',
    name: 'University / College',
    description: 'Full chart of accounts for universities with research grants, HELB, and multiple revenue streams',
    institutionType: 'university',
    accounts: UNIVERSITY_ACCOUNTS,
  },
  {
    id: 'tvet-college',
    name: 'TVET / Polytechnic',
    description: 'Tailored for technical institutions with workshop operations, NITA levy, and production income tracking',
    institutionType: 'tvet',
    accounts: TVET_ACCOUNTS,
  },
  {
    id: 'religious-school',
    name: 'Religious / Faith School',
    description: 'For church or faith-sponsored schools with chaplaincy, mission funds, and religious bursary tracking',
    institutionType: 'religious',
    accounts: RELIGIOUS_SCHOOL_ACCOUNTS,
  },
  {
    id: 'international-school',
    name: 'International School',
    description: 'Premium accounts for IB/Cambridge schools with multi-currency, corporate sponsors, and expatriate costs',
    institutionType: 'international',
    accounts: INTERNATIONAL_SCHOOL_ACCOUNTS,
  },
];

/**
 * Legacy export for backward compatibility
 */
export const STANDARD_KENYA_SCHOOL_ACCOUNTS = SECONDARY_SCHOOL_ACCOUNTS;

/**
 * Get the default chart of accounts template
 */
export function getDefaultCoaTemplate(): StandardAccountTemplate[] {
  return SECONDARY_SCHOOL_ACCOUNTS;
}

/**
 * Get template by ID
 */
export function getCoaTemplateById(templateId: string): CoaTemplate | undefined {
  return COA_TEMPLATES.find(t => t.id === templateId);
}

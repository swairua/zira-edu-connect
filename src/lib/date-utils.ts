/**
 * Flexible date parser that supports multiple formats common in African countries
 * Supports: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, YYYY/MM/DD, and natural Date parsing
 */
export function parseFlexibleDate(dateString: string): string | null {
  if (!dateString?.trim()) return null;
  
  const cleaned = dateString.trim();
  
  // Try DD-MM-YYYY or DD/MM/YYYY (African/European format)
  const ddmmyyyy = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    
    // Validate ranges
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Try YYYY-MM-DD or YYYY/MM/DD (ISO format)
  const yyyymmdd = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    
    // Validate ranges
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Try native Date parsing as fallback (handles various formats)
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
    return parsed.toISOString().split('T')[0];
  }
  
  return null;
}

/**
 * Check if a CSV row appears to be an example/instruction row that should be skipped
 */
export function isExampleRow(row: Record<string, string>, primaryFields: string[]): boolean {
  const examplePatterns = [
    /^#/,                    // Comment line
    /^\/\//,                 // Comment line
    /example/i,
    /sample/i,
    /e\.g\./i,
    /your_/i,
    /enter_/i,
    /\[.*\]/,                // [placeholder]
    /<.*>/,                  // <placeholder>
    /^required$/i,
    /^optional$/i,
    /format:/i,
    /instruction/i,
    /delete.*row/i,
    /^stu00\d$/i,            // STU001, STU002, etc.
    /^emp00\d$/i,            // EMP001, EMP002, etc.
    /^par00\d$/i,            // PAR001, PAR002, etc.
    /^test$/i,
    /^demo$/i,
    /^xxx/i,
    /^john doe$/i,
    /^jane doe$/i,
  ];
  
  // Check primary fields for example patterns
  for (const field of primaryFields) {
    const value = (row[field] || '').trim().toLowerCase();
    if (!value) continue;
    
    for (const pattern of examplePatterns) {
      if (pattern.test(value)) {
        return true;
      }
    }
  }
  
  // Check if all primary fields are empty
  const allEmpty = primaryFields.every(field => !(row[field] || '').trim());
  if (allEmpty) {
    return true;
  }
  
  return false;
}

/**
 * Normalize phone number to standard format
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone?.trim()) return '';
  
  // Remove all non-digit characters except leading +
  let cleaned = phone.trim();
  const hasPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/\D/g, '');
  
  // If it starts with 0, assume local number and keep as is
  // If it has +, add it back
  if (hasPlus && cleaned.length > 0) {
    return '+' + cleaned;
  }
  
  return cleaned;
}

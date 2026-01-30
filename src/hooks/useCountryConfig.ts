import { useMemo } from 'react';
import { 
  CountryCode, 
  CountryConfig, 
  getCountryConfig, 
  formatCurrency as formatCurrencyUtil,
  getGradeFromScore as getGradeUtil,
  getCurrentTerm as getCurrentTermUtil,
  getAcademicYear as getAcademicYearUtil,
  getAllCountries
} from '@/lib/country-config';

export function useCountryConfig(countryCode: CountryCode = 'KE') {
  const config = useMemo(() => getCountryConfig(countryCode), [countryCode]);

  const formatCurrency = useMemo(
    () => (amount: number) => formatCurrencyUtil(amount, countryCode),
    [countryCode]
  );

  const getGradeFromScore = useMemo(
    () => (score: number) => getGradeUtil(score, countryCode),
    [countryCode]
  );

  const getCurrentTerm = useMemo(
    () => () => getCurrentTermUtil(countryCode),
    [countryCode]
  );

  const getAcademicYear = useMemo(
    () => () => getAcademicYearUtil(countryCode),
    [countryCode]
  );

  return {
    config,
    formatCurrency,
    getGradeFromScore,
    getCurrentTerm,
    getAcademicYear,
    allCountries: getAllCountries(),
  };
}

export type { CountryCode, CountryConfig };

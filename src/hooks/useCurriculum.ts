import { useMemo } from 'react';
import {
  CurriculumConfig,
  CurriculumId,
  GradingScale,
  getCurriculum,
  getCurriculaForCountry,
  getNationalCurricula,
  getInternationalCurricula,
  getGradeFromScore,
  getDefaultCurriculumForCountry,
} from '@/lib/curriculum-config';
import { CountryCode } from '@/lib/country-config';

export function useCurriculum(curriculumId?: CurriculumId | null) {
  const curriculum = useMemo(() => {
    if (!curriculumId) return null;
    return getCurriculum(curriculumId);
  }, [curriculumId]);

  const gradingScales = useMemo(() => {
    return curriculum?.gradingScales || [];
  }, [curriculum]);

  const primaryGradingScale = useMemo(() => {
    return gradingScales[0] || null;
  }, [gradingScales]);

  const getGrade = (score: number, scaleId?: string): string => {
    if (!curriculumId) return 'N/A';
    return getGradeFromScore(score, curriculumId, scaleId);
  };

  return {
    curriculum,
    gradingScales,
    primaryGradingScale,
    getGrade,
    isInternational: curriculum?.isInternational ?? false,
  };
}

export function useCurriculaByCountry(countryCode: CountryCode) {
  const allCurricula = useMemo(() => {
    return getCurriculaForCountry(countryCode);
  }, [countryCode]);

  const nationalCurricula = useMemo(() => {
    return getNationalCurricula(countryCode);
  }, [countryCode]);

  const internationalCurricula = useMemo(() => {
    return getInternationalCurricula();
  }, []);

  const defaultCurriculum = useMemo(() => {
    return getDefaultCurriculumForCountry(countryCode);
  }, [countryCode]);

  return {
    allCurricula,
    nationalCurricula,
    internationalCurricula,
    defaultCurriculum,
  };
}

import { useMemo } from 'react';
import { CurriculumId } from '@/lib/curriculum-config';
import {
  CurriculumSubject,
  CurriculumLevelSubjects,
  getSubjectsForCurriculumLevel,
  getCurriculumLevels,
  getCompulsorySubjects,
  getElectiveSubjects,
  getDefaultLevelForInstitutionType,
  getCurriculumSubjectConfig,
} from '@/lib/curriculum-subjects';
import { useSubjects, Subject } from './useSubjects';

export function useCurriculumSubjects(
  curriculumId: CurriculumId | null | undefined,
  levelId?: string
) {
  const config = useMemo(() => {
    if (!curriculumId) return null;
    return getCurriculumSubjectConfig(curriculumId);
  }, [curriculumId]);

  const levels = useMemo(() => {
    if (!curriculumId) return [];
    return getCurriculumLevels(curriculumId);
  }, [curriculumId]);

  const recommendedSubjects = useMemo(() => {
    if (!curriculumId) return [];
    return getSubjectsForCurriculumLevel(curriculumId, levelId);
  }, [curriculumId, levelId]);

  const compulsorySubjects = useMemo(() => {
    if (!curriculumId) return [];
    return getCompulsorySubjects(curriculumId, levelId);
  }, [curriculumId, levelId]);

  const electiveSubjects = useMemo(() => {
    if (!curriculumId) return [];
    return getElectiveSubjects(curriculumId, levelId);
  }, [curriculumId, levelId]);

  return {
    config,
    levels,
    recommendedSubjects,
    compulsorySubjects,
    electiveSubjects,
    hasSubjectConfig: !!config,
  };
}

export function useSubjectCompliance(
  institutionId: string | null,
  curriculumId: CurriculumId | null | undefined,
  levelId?: string
) {
  const { data: existingSubjects = [], isLoading } = useSubjects(institutionId);
  const { compulsorySubjects, recommendedSubjects } = useCurriculumSubjects(curriculumId, levelId);

  const compliance = useMemo(() => {
    if (!curriculumId || compulsorySubjects.length === 0) {
      return { total: 0, configured: 0, missing: [], percentage: 100 };
    }

    const existingCodes = new Set(existingSubjects.map((s) => s.code.toUpperCase()));
    const configured = compulsorySubjects.filter((s) =>
      existingCodes.has(s.code.toUpperCase())
    );
    const missing = compulsorySubjects.filter(
      (s) => !existingCodes.has(s.code.toUpperCase())
    );

    return {
      total: compulsorySubjects.length,
      configured: configured.length,
      missing,
      percentage: Math.round((configured.length / compulsorySubjects.length) * 100),
    };
  }, [existingSubjects, compulsorySubjects, curriculumId]);

  const subjectsNotInCurriculum = useMemo(() => {
    if (!curriculumId) return [];
    const recommendedCodes = new Set(recommendedSubjects.map((s) => s.code.toUpperCase()));
    return existingSubjects.filter((s) => !recommendedCodes.has(s.code.toUpperCase()));
  }, [existingSubjects, recommendedSubjects, curriculumId]);

  return {
    ...compliance,
    isLoading,
    subjectsNotInCurriculum,
  };
}

export function useDefaultCurriculumLevel(
  curriculumId: CurriculumId | null | undefined,
  institutionType: string | null | undefined
) {
  return useMemo(() => {
    if (!curriculumId || !institutionType) return undefined;
    return getDefaultLevelForInstitutionType(curriculumId, institutionType);
  }, [curriculumId, institutionType]);
}

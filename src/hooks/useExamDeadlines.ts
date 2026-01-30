import { useMemo } from 'react';
import { differenceInDays, differenceInHours, isPast, isFuture, parseISO } from 'date-fns';

export type ExamPhase = 'before_exam' | 'exam_ongoing' | 'draft' | 'correction' | 'final' | 'closed';

export interface ExamDeadlines {
  draft_deadline: string | null;
  correction_deadline: string | null;
  final_deadline: string | null;
  allow_late_submission: boolean;
  late_submission_penalty_percent: number;
  start_date?: string | null;
  end_date?: string | null;
}

export interface DeadlineStatus {
  currentPhase: ExamPhase;
  phaseLabel: string;
  draftDeadline: Date | null;
  correctionDeadline: Date | null;
  finalDeadline: Date | null;
  timeRemaining: string;
  timeRemainingShort: string;
  canSaveDraft: boolean;
  canSubmitCorrections: boolean;
  canSubmitFinal: boolean;
  isLateSubmission: boolean;
  lateSubmissionAllowed: boolean;
  latePenaltyPercent: number;
  phaseProgress: number; // 0-100
  nextDeadline: Date | null;
  nextDeadlineLabel: string;
}

function formatTimeRemaining(targetDate: Date): { long: string; short: string } {
  const now = new Date();
  const hoursLeft = differenceInHours(targetDate, now);
  const daysLeft = differenceInDays(targetDate, now);

  if (hoursLeft < 0) {
    return { long: 'Deadline passed', short: 'Passed' };
  }

  if (hoursLeft < 1) {
    return { long: 'Less than 1 hour remaining', short: '<1h' };
  }

  if (hoursLeft < 24) {
    return { long: `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} remaining`, short: `${hoursLeft}h` };
  }

  return { long: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`, short: `${daysLeft}d` };
}

function getPhaseLabel(phase: ExamPhase): string {
  const labels: Record<ExamPhase, string> = {
    before_exam: 'Before Exam',
    exam_ongoing: 'Exam in Progress',
    draft: 'Draft Submission',
    correction: 'Correction Period',
    final: 'Final Submission',
    closed: 'Grading Closed',
  };
  return labels[phase];
}

export function useExamDeadlines(exam: ExamDeadlines | null | undefined): DeadlineStatus {
  return useMemo(() => {
    const defaultStatus: DeadlineStatus = {
      currentPhase: 'draft',
      phaseLabel: 'Draft Submission',
      draftDeadline: null,
      correctionDeadline: null,
      finalDeadline: null,
      timeRemaining: 'No deadline set',
      timeRemainingShort: '—',
      canSaveDraft: true,
      canSubmitCorrections: true,
      canSubmitFinal: true,
      isLateSubmission: false,
      lateSubmissionAllowed: false,
      latePenaltyPercent: 0,
      phaseProgress: 0,
      nextDeadline: null,
      nextDeadlineLabel: '',
    };

    if (!exam) return defaultStatus;

    const now = new Date();
    const startDate = exam.start_date ? parseISO(exam.start_date) : null;
    const endDate = exam.end_date ? parseISO(exam.end_date) : null;
    const draftDeadline = exam.draft_deadline ? parseISO(exam.draft_deadline) : null;
    const correctionDeadline = exam.correction_deadline ? parseISO(exam.correction_deadline) : null;
    const finalDeadline = exam.final_deadline ? parseISO(exam.final_deadline) : null;
    const allowLate = exam.allow_late_submission ?? false;
    const latePenalty = exam.late_submission_penalty_percent ?? 0;

    // If no deadlines are set, allow all actions
    if (!draftDeadline && !correctionDeadline && !finalDeadline) {
      return {
        ...defaultStatus,
        draftDeadline,
        correctionDeadline,
        finalDeadline,
        lateSubmissionAllowed: allowLate,
        latePenaltyPercent: latePenalty,
      };
    }

    // Determine current phase
    let currentPhase: ExamPhase = 'draft';
    let canSaveDraft = true;
    let canSubmitCorrections = true;
    let canSubmitFinal = true;
    let isLateSubmission = false;
    let nextDeadline: Date | null = null;
    let nextDeadlineLabel = '';

    // Check if before exam start
    if (startDate && isFuture(startDate)) {
      currentPhase = 'before_exam';
      canSaveDraft = false;
      canSubmitCorrections = false;
      canSubmitFinal = false;
      nextDeadline = startDate;
      nextDeadlineLabel = 'Exam starts';
    }
    // Check if exam is ongoing
    else if (startDate && endDate && isPast(startDate) && isFuture(endDate)) {
      currentPhase = 'exam_ongoing';
      canSaveDraft = false;
      canSubmitCorrections = false;
      canSubmitFinal = false;
      nextDeadline = endDate;
      nextDeadlineLabel = 'Exam ends';
    }
    // Check draft phase
    else if (draftDeadline && isFuture(draftDeadline)) {
      currentPhase = 'draft';
      canSaveDraft = true;
      canSubmitCorrections = false;
      canSubmitFinal = false;
      nextDeadline = draftDeadline;
      nextDeadlineLabel = 'Draft deadline';
    }
    // Check correction phase
    else if (correctionDeadline && isFuture(correctionDeadline)) {
      currentPhase = 'correction';
      canSaveDraft = false; // Draft phase is over
      canSubmitCorrections = true;
      canSubmitFinal = false;
      nextDeadline = correctionDeadline;
      nextDeadlineLabel = 'Correction deadline';
    }
    // Check final phase
    else if (finalDeadline && isFuture(finalDeadline)) {
      currentPhase = 'final';
      canSaveDraft = false;
      canSubmitCorrections = false;
      canSubmitFinal = true;
      nextDeadline = finalDeadline;
      nextDeadlineLabel = 'Final deadline';
    }
    // All deadlines passed
    else {
      currentPhase = 'closed';
      canSaveDraft = false;
      canSubmitCorrections = false;
      canSubmitFinal = false;

      // Check if late submission is allowed
      if (allowLate) {
        isLateSubmission = true;
        canSubmitFinal = true;
      }
    }

    // Calculate time remaining
    const timeInfo = nextDeadline 
      ? formatTimeRemaining(nextDeadline)
      : { long: 'No upcoming deadline', short: '—' };

    // Calculate phase progress
    let phaseProgress = 0;
    if (currentPhase === 'closed') {
      phaseProgress = 100;
    } else if (currentPhase === 'final') {
      phaseProgress = 75;
    } else if (currentPhase === 'correction') {
      phaseProgress = 50;
    } else if (currentPhase === 'draft') {
      phaseProgress = 25;
    }

    return {
      currentPhase,
      phaseLabel: getPhaseLabel(currentPhase),
      draftDeadline,
      correctionDeadline,
      finalDeadline,
      timeRemaining: timeInfo.long,
      timeRemainingShort: timeInfo.short,
      canSaveDraft,
      canSubmitCorrections,
      canSubmitFinal,
      isLateSubmission,
      lateSubmissionAllowed: allowLate,
      latePenaltyPercent: latePenalty,
      phaseProgress,
      nextDeadline,
      nextDeadlineLabel,
    };
  }, [exam]);
}

// Validation helper for setting deadlines
export function validateDeadlineSequence(
  endDate: string | null,
  draftDeadline: string | null,
  correctionDeadline: string | null,
  finalDeadline: string | null
): { valid: boolean; error?: string } {
  if (!draftDeadline && !correctionDeadline && !finalDeadline) {
    return { valid: true }; // All null is valid (no deadlines)
  }

  const end = endDate ? parseISO(endDate) : null;
  const draft = draftDeadline ? parseISO(draftDeadline) : null;
  const correction = correctionDeadline ? parseISO(correctionDeadline) : null;
  const final = finalDeadline ? parseISO(finalDeadline) : null;

  // Draft must be after exam end
  if (draft && end && draft <= end) {
    return { valid: false, error: 'Draft deadline must be after exam end date' };
  }

  // Correction must be after draft
  if (correction && draft && correction <= draft) {
    return { valid: false, error: 'Correction deadline must be after draft deadline' };
  }

  // Final must be after correction (or draft if no correction)
  if (final && correction && final <= correction) {
    return { valid: false, error: 'Final deadline must be after correction deadline' };
  }

  if (final && !correction && draft && final <= draft) {
    return { valid: false, error: 'Final deadline must be after draft deadline' };
  }

  return { valid: true };
}

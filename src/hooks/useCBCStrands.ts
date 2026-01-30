import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CBCStrand, CBCSubStrand, CBCLevel, StudentStrandAssessment } from '@/types/cbc';
import { toast } from 'sonner';

// Fetch all strands for a subject and level
export function useCBCStrands(subjectCode?: string, level?: CBCLevel) {
  return useQuery({
    queryKey: ['cbc-strands', subjectCode, level],
    queryFn: async () => {
      let query = supabase
        .from('cbc_strands')
        .select('*')
        .order('strand_number');
      
      if (subjectCode) {
        query = query.eq('subject_code', subjectCode);
      }
      if (level) {
        query = query.eq('level', level);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CBCStrand[];
    },
    enabled: true,
  });
}

// Fetch all sub-strands for a strand
export function useCBCSubStrands(strandId?: string) {
  return useQuery({
    queryKey: ['cbc-sub-strands', strandId],
    queryFn: async () => {
      if (!strandId) return [];
      
      const { data, error } = await supabase
        .from('cbc_sub_strands')
        .select(`
          *,
          strand:cbc_strands(*)
        `)
        .eq('strand_id', strandId)
        .order('sub_strand_number');
      
      if (error) throw error;
      return data as CBCSubStrand[];
    },
    enabled: !!strandId,
  });
}

// Fetch strands with their sub-strands for a subject/level
export function useCBCStrandsWithSubStrands(subjectCode: string, level: CBCLevel) {
  return useQuery({
    queryKey: ['cbc-strands-full', subjectCode, level],
    queryFn: async () => {
      const { data: strands, error: strandsError } = await supabase
        .from('cbc_strands')
        .select('*')
        .eq('subject_code', subjectCode)
        .eq('level', level)
        .order('strand_number');
      
      if (strandsError) throw strandsError;
      
      // Fetch sub-strands for all strands
      const strandIds = strands.map(s => s.id);
      if (strandIds.length === 0) return [];
      
      const { data: subStrands, error: subStrandsError } = await supabase
        .from('cbc_sub_strands')
        .select('*')
        .in('strand_id', strandIds)
        .order('sub_strand_number');
      
      if (subStrandsError) throw subStrandsError;
      
      // Combine strands with their sub-strands
      return strands.map(strand => ({
        ...strand,
        sub_strands: subStrands.filter(ss => ss.strand_id === strand.id),
      }));
    },
    enabled: !!subjectCode && !!level,
  });
}

// Get available subjects (unique subject codes)
export function useCBCSubjects() {
  return useQuery({
    queryKey: ['cbc-subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cbc_strands')
        .select('subject_code')
        .order('subject_code');
      
      if (error) throw error;
      
      // Get unique subject codes
      const uniqueCodes = [...new Set(data.map(d => d.subject_code))];
      return uniqueCodes;
    },
  });
}

// Get available levels for a subject
export function useCBCLevels(subjectCode?: string) {
  return useQuery({
    queryKey: ['cbc-levels', subjectCode],
    queryFn: async () => {
      let query = supabase
        .from('cbc_strands')
        .select('level');
      
      if (subjectCode) {
        query = query.eq('subject_code', subjectCode);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Get unique levels and sort them
      const levelOrder: CBCLevel[] = [
        'pp1', 'pp2', 'grade_1', 'grade_2', 'grade_3', 'grade_4',
        'grade_5', 'grade_6', 'grade_7', 'grade_8', 'grade_9',
        'grade_10', 'grade_11', 'grade_12'
      ];
      
      const uniqueLevels = [...new Set(data.map(d => d.level as CBCLevel))];
      return uniqueLevels.sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));
    },
    enabled: true,
  });
}

// Student strand assessments
export function useStudentStrandAssessments(
  studentId?: string,
  subStrandId?: string,
  examId?: string
) {
  return useQuery({
    queryKey: ['student-strand-assessments', studentId, subStrandId, examId],
    queryFn: async () => {
      let query = supabase
        .from('student_strand_assessments')
        .select(`
          *,
          sub_strand:cbc_sub_strands(
            *,
            strand:cbc_strands(*)
          )
        `);
      
      if (studentId) query = query.eq('student_id', studentId);
      if (subStrandId) query = query.eq('sub_strand_id', subStrandId);
      if (examId) query = query.eq('exam_id', examId);
      
      const { data, error } = await query.order('assessed_at', { ascending: false });
      if (error) throw error;
      return data as StudentStrandAssessment[];
    },
    enabled: !!(studentId || subStrandId || examId),
  });
}

// Create/update strand assessment
export function useUpsertStrandAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assessment: Partial<StudentStrandAssessment> & {
      student_id: string;
      sub_strand_id: string;
      institution_id: string;
      rubric_level: string;
    }) => {
      const { data, error } = await supabase
        .from('student_strand_assessments')
        .upsert(
          {
            ...assessment,
            assessed_at: new Date().toISOString(),
          },
          { onConflict: 'student_id,sub_strand_id,exam_id' }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-strand-assessments'] });
      toast.success('Strand assessment saved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save assessment: ${error.message}`);
    },
  });
}

// Bulk upsert strand assessments (for grading multiple students)
export function useBulkUpsertStrandAssessments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assessments: Array<{
      student_id: string;
      sub_strand_id: string;
      institution_id: string;
      rubric_level: string;
      exam_id?: string;
      score_percentage?: number;
      teacher_remarks?: string;
      assessed_by?: string;
    }>) => {
      const { data, error } = await supabase
        .from('student_strand_assessments')
        .upsert(
          assessments.map(a => ({
            ...a,
            assessed_at: new Date().toISOString(),
          })),
          { onConflict: 'student_id,sub_strand_id,exam_id' }
        )
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-strand-assessments'] });
      toast.success(`${data.length} strand assessments saved`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to save assessments: ${error.message}`);
    },
  });
}

// Get student performance summary by strand
export function useStudentStrandPerformance(studentId: string, subjectCode?: string, level?: CBCLevel) {
  return useQuery({
    queryKey: ['student-strand-performance', studentId, subjectCode, level],
    queryFn: async () => {
      // First get relevant strands
      let strandsQuery = supabase
        .from('cbc_strands')
        .select('id, name, strand_number, subject_code, level');
      
      if (subjectCode) strandsQuery = strandsQuery.eq('subject_code', subjectCode);
      if (level) strandsQuery = strandsQuery.eq('level', level);
      
      const { data: strands, error: strandsError } = await strandsQuery;
      if (strandsError) throw strandsError;
      
      // Get assessments for the student
      const { data: assessments, error: assessmentsError } = await supabase
        .from('student_strand_assessments')
        .select(`
          rubric_level,
          score_percentage,
          sub_strand:cbc_sub_strands(
            strand_id,
            name
          )
        `)
        .eq('student_id', studentId);
      
      if (assessmentsError) throw assessmentsError;
      
      // Calculate performance per strand
      const strandPerformance = strands.map(strand => {
        const strandAssessments = assessments.filter(
          a => a.sub_strand?.strand_id === strand.id
        );
        
        const rubricCounts = { EE: 0, ME: 0, AE: 0, BE: 0 };
        strandAssessments.forEach(a => {
          const level = a.rubric_level.substring(0, 2) as keyof typeof rubricCounts;
          if (rubricCounts[level] !== undefined) {
            rubricCounts[level]++;
          }
        });
        
        const avgScore = strandAssessments.length > 0
          ? strandAssessments.reduce((sum, a) => sum + (a.score_percentage || 0), 0) / strandAssessments.length
          : null;
        
        return {
          ...strand,
          assessment_count: strandAssessments.length,
          rubric_distribution: rubricCounts,
          average_score: avgScore,
        };
      });
      
      return strandPerformance;
    },
    enabled: !!studentId,
  });
}

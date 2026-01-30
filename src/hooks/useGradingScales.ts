import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GradeLevel {
  id: string;
  grading_scale_id: string;
  grade: string;
  min_marks: number;
  max_marks: number;
  points: number | null;
  description: string | null;
  color: string | null;
  sort_order: number;
}

export interface GradingScale {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  scale_type: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  grade_levels?: GradeLevel[];
}

// Fetch all grading scales for an institution
export function useGradingScales(institutionId: string | null) {
  return useQuery({
    queryKey: ['grading-scales', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('grading_scales')
        .select(`
          *,
          grade_levels(*)
        `)
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;

      // Sort grade levels by sort_order
      return (data as GradingScale[]).map(scale => ({
        ...scale,
        grade_levels: scale.grade_levels?.sort((a, b) => a.sort_order - b.sort_order)
      }));
    },
    enabled: !!institutionId,
  });
}

// Get the default grading scale for an institution
export function useDefaultGradingScale(institutionId: string | null) {
  return useQuery({
    queryKey: ['default-grading-scale', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;

      const { data, error } = await supabase
        .from('grading_scales')
        .select(`
          *,
          grade_levels(*)
        `)
        .eq('institution_id', institutionId)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) {
        // If no default, get any active scale
        const { data: fallback, error: fallbackError } = await supabase
          .from('grading_scales')
          .select(`*, grade_levels(*)`)
          .eq('institution_id', institutionId)
          .eq('is_active', true)
          .limit(1)
          .single();

        if (fallbackError) return null;
        return {
          ...fallback,
          grade_levels: fallback.grade_levels?.sort((a: GradeLevel, b: GradeLevel) => a.sort_order - b.sort_order)
        } as GradingScale;
      }

      return {
        ...data,
        grade_levels: data.grade_levels?.sort((a: GradeLevel, b: GradeLevel) => a.sort_order - b.sort_order)
      } as GradingScale;
    },
    enabled: !!institutionId,
  });
}

/**
 * Get CBC 8-point rubric fallback for ke_cbc curriculum institutions
 * Used when no custom grading scale is configured
 */
export function getCBCRubricFallback(): Omit<GradeLevel, 'id' | 'grading_scale_id' | 'color'>[] {
  return [
    { grade: 'EE1', min_marks: 90, max_marks: 100, points: 8, description: 'Highly Exceeding Expectations', sort_order: 1 },
    { grade: 'EE2', min_marks: 80, max_marks: 89.99, points: 7, description: 'Exceeding Expectations', sort_order: 2 },
    { grade: 'ME1', min_marks: 70, max_marks: 79.99, points: 6, description: 'Strongly Meeting Expectations', sort_order: 3 },
    { grade: 'ME2', min_marks: 65, max_marks: 69.99, points: 5, description: 'Meeting Expectations', sort_order: 4 },
    { grade: 'AE1', min_marks: 55, max_marks: 64.99, points: 4, description: 'Approaching Expectations', sort_order: 5 },
    { grade: 'AE2', min_marks: 50, max_marks: 54.99, points: 3, description: 'Nearly Approaching Expectations', sort_order: 6 },
    { grade: 'BE1', min_marks: 40, max_marks: 49.99, points: 2, description: 'Below Expectations', sort_order: 7 },
    { grade: 'BE2', min_marks: 0, max_marks: 39.99, points: 1, description: 'Significantly Below Expectations', sort_order: 8 },
  ];
}

// Calculate grade from marks using a grading scale
export function getGradeFromMarks(marks: number, gradeLevels: Pick<GradeLevel, 'grade' | 'min_marks' | 'max_marks' | 'points' | 'description'>[]): {
  grade: string;
  points: number | null;
  description: string | null;
  color: string | null;
} | null {
  if (!gradeLevels || gradeLevels.length === 0) return null;

  const level = gradeLevels.find(
    (gl) => marks >= gl.min_marks && marks <= gl.max_marks
  );

  if (!level) {
    // Return lowest grade if below all thresholds
    const lowest = [...gradeLevels].sort((a, b) => a.min_marks - b.min_marks)[0];
    return {
      grade: lowest?.grade || 'N/A',
      points: lowest?.points || null,
      description: lowest?.description || null,
      color: (lowest as GradeLevel)?.color || null,
    };
  }

  return {
    grade: level.grade,
    points: level.points,
    description: level.description,
    color: (level as GradeLevel)?.color || null,
  };
}

// Create a new grading scale
export function useCreateGradingScale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      institutionId,
      name,
      description,
      scaleType,
      isDefault,
      gradeLevels,
    }: {
      institutionId: string;
      name: string;
      description?: string;
      scaleType: string;
      isDefault?: boolean;
      gradeLevels: Omit<GradeLevel, 'id' | 'grading_scale_id'>[];
    }) => {
      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('grading_scales')
          .update({ is_default: false })
          .eq('institution_id', institutionId);
      }

      // Create the scale
      const { data: scale, error: scaleError } = await supabase
        .from('grading_scales')
        .insert({
          institution_id: institutionId,
          name,
          description,
          scale_type: scaleType,
          is_default: isDefault || false,
        })
        .select()
        .single();

      if (scaleError) throw scaleError;

      // Create grade levels
      const levels = gradeLevels.map((gl, idx) => ({
        grading_scale_id: scale.id,
        grade: gl.grade,
        min_marks: gl.min_marks,
        max_marks: gl.max_marks,
        points: gl.points,
        description: gl.description,
        color: gl.color,
        sort_order: gl.sort_order || idx + 1,
      }));

      const { error: levelsError } = await supabase
        .from('grade_levels')
        .insert(levels);

      if (levelsError) throw levelsError;

      return scale;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grading-scales', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['default-grading-scale', variables.institutionId] });
      toast.success('Grading scale created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create grading scale', { description: error.message });
    },
  });
}

// Update grading scale
export function useUpdateGradingScale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      institutionId,
      name,
      description,
      isDefault,
      gradeLevels,
    }: {
      id: string;
      institutionId: string;
      name?: string;
      description?: string;
      isDefault?: boolean;
      gradeLevels?: Omit<GradeLevel, 'grading_scale_id'>[];
    }) => {
      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('grading_scales')
          .update({ is_default: false })
          .eq('institution_id', institutionId);
      }

      // Update the scale
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (isDefault !== undefined) updates.is_default = isDefault;

      const { error: scaleError } = await supabase
        .from('grading_scales')
        .update(updates)
        .eq('id', id);

      if (scaleError) throw scaleError;

      // Update grade levels if provided
      if (gradeLevels) {
        // Delete existing levels
        await supabase.from('grade_levels').delete().eq('grading_scale_id', id);

        // Insert new levels
        const levels = gradeLevels.map((gl, idx) => ({
          grading_scale_id: id,
          grade: gl.grade,
          min_marks: gl.min_marks,
          max_marks: gl.max_marks,
          points: gl.points,
          description: gl.description,
          color: gl.color,
          sort_order: gl.sort_order || idx + 1,
        }));

        const { error: levelsError } = await supabase
          .from('grade_levels')
          .insert(levels);

        if (levelsError) throw levelsError;
      }

      return { id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grading-scales', variables.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['default-grading-scale', variables.institutionId] });
      toast.success('Grading scale updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update grading scale', { description: error.message });
    },
  });
}

// Delete grading scale
export function useDeleteGradingScale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
      const { error } = await supabase
        .from('grading_scales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, institutionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['grading-scales', data.institutionId] });
      queryClient.invalidateQueries({ queryKey: ['default-grading-scale', data.institutionId] });
      toast.success('Grading scale deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete grading scale', { description: error.message });
    },
  });
}

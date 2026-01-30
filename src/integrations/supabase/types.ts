export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          institution_id: string
          is_current: boolean | null
          name: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          institution_id: string
          is_current?: boolean | null
          name: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          institution_id?: string
          is_current?: boolean | null
          name?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          activity_type: string
          category: string
          created_at: string
          currency: string | null
          description: string | null
          fee_amount: number | null
          id: string
          institution_id: string
          is_active: boolean
          location: string | null
          max_capacity: number | null
          meeting_schedule: string | null
          name: string
          requires_fee: boolean
          updated_at: string
        }
        Insert: {
          activity_type?: string
          category?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          fee_amount?: number | null
          id?: string
          institution_id: string
          is_active?: boolean
          location?: string | null
          max_capacity?: number | null
          meeting_schedule?: string | null
          name: string
          requires_fee?: boolean
          updated_at?: string
        }
        Update: {
          activity_type?: string
          category?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          fee_amount?: number | null
          id?: string
          institution_id?: string
          is_active?: boolean
          location?: string | null
          max_capacity?: number | null
          meeting_schedule?: string | null
          name?: string
          requires_fee?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_attendance: {
        Row: {
          activity_id: string
          attendance_date: string
          created_at: string
          event_id: string | null
          id: string
          institution_id: string
          marked_by: string | null
          notes: string | null
          status: string
          student_id: string
        }
        Insert: {
          activity_id: string
          attendance_date: string
          created_at?: string
          event_id?: string | null
          id?: string
          institution_id: string
          marked_by?: string | null
          notes?: string | null
          status?: string
          student_id: string
        }
        Update: {
          activity_id?: string
          attendance_date?: string
          created_at?: string
          event_id?: string | null
          id?: string
          institution_id?: string
          marked_by?: string | null
          notes?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_attendance_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "activity_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_attendance_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_coaches: {
        Row: {
          activity_id: string
          assigned_date: string
          created_at: string
          id: string
          institution_id: string
          is_active: boolean
          is_primary: boolean
          role: string
          staff_id: string
        }
        Insert: {
          activity_id: string
          assigned_date?: string
          created_at?: string
          id?: string
          institution_id: string
          is_active?: boolean
          is_primary?: boolean
          role?: string
          staff_id: string
        }
        Update: {
          activity_id?: string
          assigned_date?: string
          created_at?: string
          id?: string
          institution_id?: string
          is_active?: boolean
          is_primary?: boolean
          role?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_coaches_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_coaches_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_coaches_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_enrollments: {
        Row: {
          academic_year_id: string | null
          activity_id: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          enrolled_by: string | null
          enrolled_date: string
          id: string
          institution_id: string
          notes: string | null
          status: string
          student_id: string
          term_id: string | null
          updated_at: string
          withdrawn_date: string | null
        }
        Insert: {
          academic_year_id?: string | null
          activity_id: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          enrolled_by?: string | null
          enrolled_date?: string
          id?: string
          institution_id: string
          notes?: string | null
          status?: string
          student_id: string
          term_id?: string | null
          updated_at?: string
          withdrawn_date?: string | null
        }
        Update: {
          academic_year_id?: string | null
          activity_id?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          enrolled_by?: string | null
          enrolled_date?: string
          id?: string
          institution_id?: string
          notes?: string | null
          status?: string
          student_id?: string
          term_id?: string | null
          updated_at?: string
          withdrawn_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_enrollments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_enrollments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_enrollments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_events: {
        Row: {
          activity_id: string
          budget: number | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_name: string
          event_type: string
          id: string
          institution_id: string
          location: string | null
          start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_name: string
          event_type?: string
          id?: string
          institution_id: string
          location?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_name?: string
          event_type?: string
          id?: string
          institution_id?: string
          location?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_fees: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          enrollment_id: string
          fee_type: string
          id: string
          institution_id: string
          invoice_id: string | null
          status: string
          updated_at: string
          waived_at: string | null
          waived_by: string | null
          waiver_reason: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          enrollment_id: string
          fee_type?: string
          id?: string
          institution_id: string
          invoice_id?: string | null
          status?: string
          updated_at?: string
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          enrollment_id?: string
          fee_type?: string
          id?: string
          institution_id?: string
          invoice_id?: string | null
          status?: string
          updated_at?: string
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_fees_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "activity_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_fees_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_fees_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      allowance_types: {
        Row: {
          calculation_type: string
          code: string
          created_at: string
          default_amount: number
          description: string | null
          id: string
          institution_id: string
          is_active: boolean
          is_taxable: boolean
          name: string
          updated_at: string
        }
        Insert: {
          calculation_type?: string
          code: string
          created_at?: string
          default_amount?: number
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          is_taxable?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          calculation_type?: string
          code?: string
          created_at?: string
          default_amount?: number
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          is_taxable?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allowance_types_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          audience: string[]
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          institution_id: string
          is_published: boolean | null
          priority: string
          publish_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string[]
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          institution_id: string
          is_published?: boolean | null
          priority?: string
          publish_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string[]
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          institution_id?: string
          is_published?: boolean | null
          priority?: string
          publish_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      applied_penalties: {
        Row: {
          amount: number
          applied_at: string
          applied_by: string
          applied_date: string
          created_at: string
          days_overdue: number
          id: string
          institution_id: string
          invoice_id: string
          penalty_rule_id: string | null
          student_id: string
          waived: boolean
          waived_at: string | null
          waived_by: string | null
          waiver_reason: string | null
        }
        Insert: {
          amount: number
          applied_at?: string
          applied_by?: string
          applied_date?: string
          created_at?: string
          days_overdue: number
          id?: string
          institution_id: string
          invoice_id: string
          penalty_rule_id?: string | null
          student_id: string
          waived?: boolean
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Update: {
          amount?: number
          applied_at?: string
          applied_by?: string
          applied_date?: string
          created_at?: string
          days_overdue?: number
          id?: string
          institution_id?: string
          invoice_id?: string
          penalty_rule_id?: string | null
          student_id?: string
          waived?: boolean
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applied_penalties_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applied_penalties_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applied_penalties_penalty_rule_id_fkey"
            columns: ["penalty_rule_id"]
            isOneToOne: false
            referencedRelation: "late_payment_penalties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applied_penalties_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string | null
          feedback: string | null
          feedback_visible: boolean | null
          file_name: string | null
          file_size_bytes: number | null
          file_url: string | null
          grade: string | null
          graded_at: string | null
          graded_by: string | null
          grading_status: string | null
          id: string
          institution_id: string
          ip_address: string | null
          is_late: boolean | null
          marks: number | null
          metadata: Json | null
          status: string
          student_id: string
          submission_type: string
          submitted_at: string | null
          submitted_by_parent_id: string | null
          submitted_by_type: string
          submitted_by_user_id: string | null
          text_content: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          feedback?: string | null
          feedback_visible?: boolean | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          grade?: string | null
          graded_at?: string | null
          graded_by?: string | null
          grading_status?: string | null
          id?: string
          institution_id: string
          ip_address?: string | null
          is_late?: boolean | null
          marks?: number | null
          metadata?: Json | null
          status?: string
          student_id: string
          submission_type: string
          submitted_at?: string | null
          submitted_by_parent_id?: string | null
          submitted_by_type?: string
          submitted_by_user_id?: string | null
          text_content?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          feedback?: string | null
          feedback_visible?: boolean | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          grade?: string | null
          graded_at?: string | null
          graded_by?: string | null
          grading_status?: string | null
          id?: string
          institution_id?: string
          ip_address?: string | null
          is_late?: boolean | null
          marks?: number | null
          metadata?: Json | null
          status?: string
          student_id?: string
          submission_type?: string
          submitted_at?: string | null
          submitted_by_parent_id?: string | null
          submitted_by_type?: string
          submitted_by_user_id?: string | null
          text_content?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_submitted_by_parent_id_fkey"
            columns: ["submitted_by_parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          academic_year_id: string | null
          allow_late_submission: boolean | null
          allow_resubmission: boolean | null
          allowed_file_types: string[] | null
          assessment_type: string | null
          class_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string
          grading_deadline: string | null
          id: string
          institution_id: string
          max_file_size_mb: number | null
          status: string
          strand_id: string | null
          sub_strand_id: string | null
          subject_id: string
          submission_type: string
          term_id: string | null
          title: string
          total_marks: number | null
          updated_at: string | null
          weight_percentage: number | null
        }
        Insert: {
          academic_year_id?: string | null
          allow_late_submission?: boolean | null
          allow_resubmission?: boolean | null
          allowed_file_types?: string[] | null
          assessment_type?: string | null
          class_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date: string
          grading_deadline?: string | null
          id?: string
          institution_id: string
          max_file_size_mb?: number | null
          status?: string
          strand_id?: string | null
          sub_strand_id?: string | null
          subject_id: string
          submission_type?: string
          term_id?: string | null
          title: string
          total_marks?: number | null
          updated_at?: string | null
          weight_percentage?: number | null
        }
        Update: {
          academic_year_id?: string | null
          allow_late_submission?: boolean | null
          allow_resubmission?: boolean | null
          allowed_file_types?: string[] | null
          assessment_type?: string | null
          class_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string
          grading_deadline?: string | null
          id?: string
          institution_id?: string
          max_file_size_mb?: number | null
          status?: string
          strand_id?: string | null
          sub_strand_id?: string | null
          subject_id?: string
          submission_type?: string
          term_id?: string | null
          title?: string
          total_marks?: number | null
          updated_at?: string | null
          weight_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_strand_id_fkey"
            columns: ["strand_id"]
            isOneToOne: false
            referencedRelation: "cbc_strands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_sub_strand_id_fkey"
            columns: ["sub_strand_id"]
            isOneToOne: false
            referencedRelation: "cbc_sub_strands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          class_id: string
          created_at: string | null
          date: string
          id: string
          institution_id: string
          is_historical: boolean | null
          notes: string | null
          recorded_by: string | null
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          date: string
          id?: string
          institution_id: string
          is_historical?: boolean | null
          notes?: string | null
          recorded_by?: string | null
          status: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          date?: string
          id?: string
          institution_id?: string
          is_historical?: boolean | null
          notes?: string | null
          recorded_by?: string | null
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          institution_id: string | null
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          permission_used: string | null
          request_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          institution_id?: string | null
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          permission_used?: string | null
          request_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          institution_id?: string | null
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          permission_used?: string | null
          request_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_history: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          download_expires_at: string | null
          download_url: string | null
          error_message: string | null
          file_name: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          include_modules: string[]
          institution_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          download_expires_at?: string | null
          download_url?: string | null
          error_message?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          include_modules?: string[]
          institution_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          download_expires_at?: string | null
          download_url?: string | null
          error_message?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          include_modules?: string[]
          institution_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_history_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          bank_name: string
          branch: string | null
          created_at: string
          currency: string
          current_balance: number
          fund_id: string | null
          id: string
          institution_id: string
          is_active: boolean
          is_primary: boolean
          ledger_account_id: string | null
          opening_balance: number
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type?: string
          bank_name: string
          branch?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          fund_id?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          is_primary?: boolean
          ledger_account_id?: string | null
          opening_balance?: number
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          bank_name?: string
          branch?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          fund_id?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          is_primary?: boolean
          ledger_account_id?: string | null
          opening_balance?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bed_allocation_history: {
        Row: {
          action: string
          allocation_id: string | null
          approved_at: string | null
          approved_by: string | null
          change_reason: string | null
          changed_by: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          requires_approval: boolean | null
        }
        Insert: {
          action: string
          allocation_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          change_reason?: string | null
          changed_by: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          requires_approval?: boolean | null
        }
        Update: {
          action?: string
          allocation_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          change_reason?: string | null
          changed_by?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          requires_approval?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "bed_allocation_history_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "bed_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      bed_allocations: {
        Row: {
          academic_year_id: string | null
          allocated_by: string
          allocation_date: string
          bed_id: string
          created_at: string | null
          end_date: string | null
          end_reason: string | null
          ended_by: string | null
          id: string
          institution_id: string
          notes: string | null
          start_date: string
          status: string | null
          student_id: string
          term_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          allocated_by: string
          allocation_date?: string
          bed_id: string
          created_at?: string | null
          end_date?: string | null
          end_reason?: string | null
          ended_by?: string | null
          id?: string
          institution_id: string
          notes?: string | null
          start_date: string
          status?: string | null
          student_id: string
          term_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          allocated_by?: string
          allocation_date?: string
          bed_id?: string
          created_at?: string | null
          end_date?: string | null
          end_reason?: string | null
          ended_by?: string | null
          id?: string
          institution_id?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          student_id?: string
          term_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bed_allocations_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_allocations_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "hostel_beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_allocations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_allocations_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_records: {
        Row: {
          action_taken: string | null
          behavior_type: string
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          institution_id: string
          parent_notified: boolean | null
          recorded_at: string
          student_id: string
        }
        Insert: {
          action_taken?: string | null
          behavior_type: string
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          institution_id: string
          parent_notified?: boolean | null
          recorded_at?: string
          student_id: string
        }
        Update: {
          action_taken?: string | null
          behavior_type?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          institution_id?: string
          parent_notified?: boolean | null
          recorded_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_settings: {
        Row: {
          annual_discount_percent: number | null
          annual_enabled: boolean | null
          annual_grace_days: number | null
          base_setup_fee: number | null
          created_at: string | null
          customization_hourly_rate: number | null
          data_migration_fee_per_record: number | null
          data_migration_flat_fee: number | null
          default_billing_cycle: string | null
          id: string
          integration_fee_per_system: number | null
          monthly_enabled: boolean | null
          monthly_grace_days: number | null
          termly_discount_percent: number | null
          termly_enabled: boolean | null
          termly_grace_days: number | null
          tier_base_annual_fee: number | null
          tier_base_setup_fee: number | null
          tier_per_learner_annual: number | null
          tier_per_learner_setup: number | null
          tier_private_multiplier: number | null
          training_fee_per_day: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          annual_discount_percent?: number | null
          annual_enabled?: boolean | null
          annual_grace_days?: number | null
          base_setup_fee?: number | null
          created_at?: string | null
          customization_hourly_rate?: number | null
          data_migration_fee_per_record?: number | null
          data_migration_flat_fee?: number | null
          default_billing_cycle?: string | null
          id?: string
          integration_fee_per_system?: number | null
          monthly_enabled?: boolean | null
          monthly_grace_days?: number | null
          termly_discount_percent?: number | null
          termly_enabled?: boolean | null
          termly_grace_days?: number | null
          tier_base_annual_fee?: number | null
          tier_base_setup_fee?: number | null
          tier_per_learner_annual?: number | null
          tier_per_learner_setup?: number | null
          tier_private_multiplier?: number | null
          training_fee_per_day?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          annual_discount_percent?: number | null
          annual_enabled?: boolean | null
          annual_grace_days?: number | null
          base_setup_fee?: number | null
          created_at?: string | null
          customization_hourly_rate?: number | null
          data_migration_fee_per_record?: number | null
          data_migration_flat_fee?: number | null
          default_billing_cycle?: string | null
          id?: string
          integration_fee_per_system?: number | null
          monthly_enabled?: boolean | null
          monthly_grace_days?: number | null
          termly_discount_percent?: number | null
          termly_enabled?: boolean | null
          termly_grace_days?: number | null
          tier_base_annual_fee?: number | null
          tier_base_setup_fee?: number | null
          tier_per_learner_annual?: number | null
          tier_per_learner_setup?: number | null
          tier_private_multiplier?: number | null
          training_fee_per_day?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      boarding_charges: {
        Row: {
          allocation_id: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          charge_type: string
          created_at: string | null
          created_by: string
          currency: string | null
          description: string
          id: string
          institution_id: string
          invoice_id: string | null
          notes: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          allocation_id?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          charge_type: string
          created_at?: string | null
          created_by: string
          currency?: string | null
          description: string
          id?: string
          institution_id: string
          invoice_id?: string | null
          notes?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          allocation_id?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          charge_type?: string
          created_at?: string | null
          created_by?: string
          currency?: string | null
          description?: string
          id?: string
          institution_id?: string
          invoice_id?: string | null
          notes?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boarding_charges_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "bed_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_charges_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_charges_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_charges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      boarding_fee_configs: {
        Row: {
          academic_year_id: string | null
          created_at: string | null
          currency: string | null
          deposit_amount: number | null
          fee_amount: number
          hostel_id: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          room_type: string | null
          term_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string | null
          currency?: string | null
          deposit_amount?: number | null
          fee_amount: number
          hostel_id?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          room_type?: string | null
          term_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string | null
          currency?: string | null
          deposit_amount?: number | null
          fee_amount?: number
          hostel_id?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          room_type?: string | null
          term_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boarding_fee_configs_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_fee_configs_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_fee_configs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_fee_configs_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      capitation_records: {
        Row: {
          academic_year_id: string | null
          capitation_type: string
          created_at: string
          disbursement_date: string | null
          enrolled_learners: number
          expected_amount: number
          fund_id: string
          id: string
          institution_id: string
          notes: string | null
          rate_per_learner: number
          receipt_id: string | null
          received_amount: number
          reference_number: string | null
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          capitation_type: string
          created_at?: string
          disbursement_date?: string | null
          enrolled_learners: number
          expected_amount: number
          fund_id: string
          id?: string
          institution_id: string
          notes?: string | null
          rate_per_learner: number
          receipt_id?: string | null
          received_amount?: number
          reference_number?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          capitation_type?: string
          created_at?: string
          disbursement_date?: string | null
          enrolled_learners?: number
          expected_amount?: number
          fund_id?: string
          id?: string
          institution_id?: string
          notes?: string | null
          rate_per_learner?: number
          receipt_id?: string | null
          received_amount?: number
          reference_number?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capitation_records_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capitation_records_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capitation_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capitation_records_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "finance_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capitation_records_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      cashbook_entries: {
        Row: {
          bank_account_id: string
          created_at: string
          created_by: string | null
          credit_amount: number
          debit_amount: number
          description: string
          entry_date: string
          entry_type: string
          id: string
          institution_id: string
          journal_entry_id: string | null
          reconciled: boolean
          reconciled_by: string | null
          reconciled_date: string | null
          reference_number: string | null
          running_balance: number | null
          source_id: string | null
          source_type: string | null
          updated_at: string
          value_date: string | null
        }
        Insert: {
          bank_account_id: string
          created_at?: string
          created_by?: string | null
          credit_amount?: number
          debit_amount?: number
          description: string
          entry_date: string
          entry_type: string
          id?: string
          institution_id: string
          journal_entry_id?: string | null
          reconciled?: boolean
          reconciled_by?: string | null
          reconciled_date?: string | null
          reference_number?: string | null
          running_balance?: number | null
          source_id?: string | null
          source_type?: string | null
          updated_at?: string
          value_date?: string | null
        }
        Update: {
          bank_account_id?: string
          created_at?: string
          created_by?: string | null
          credit_amount?: number
          debit_amount?: number
          description?: string
          entry_date?: string
          entry_type?: string
          id?: string
          institution_id?: string
          journal_entry_id?: string | null
          reconciled?: boolean
          reconciled_by?: string | null
          reconciled_date?: string | null
          reference_number?: string | null
          running_balance?: number | null
          source_id?: string | null
          source_type?: string | null
          updated_at?: string
          value_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cashbook_entries_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashbook_entries_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashbook_entries_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      cbc_strands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          level: Database["public"]["Enums"]["cbc_level"]
          name: string
          strand_number: number
          subject_code: string
          suggested_time_allocation: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          level: Database["public"]["Enums"]["cbc_level"]
          name: string
          strand_number: number
          subject_code: string
          suggested_time_allocation?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["cbc_level"]
          name?: string
          strand_number?: number
          subject_code?: string
          suggested_time_allocation?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cbc_sub_strands: {
        Row: {
          assessment_rubrics: Json | null
          core_competencies:
            | Database["public"]["Enums"]["cbc_competency"][]
            | null
          created_at: string | null
          id: string
          key_inquiry_questions: Json | null
          learning_experiences: Json | null
          name: string
          pertinent_contemporary_issues: string[] | null
          specific_learning_outcomes: Json | null
          strand_id: string
          sub_strand_number: number
          suggested_lesson_count: number | null
          suggested_resources: Json | null
          updated_at: string | null
          values: Database["public"]["Enums"]["cbc_value"][] | null
        }
        Insert: {
          assessment_rubrics?: Json | null
          core_competencies?:
            | Database["public"]["Enums"]["cbc_competency"][]
            | null
          created_at?: string | null
          id?: string
          key_inquiry_questions?: Json | null
          learning_experiences?: Json | null
          name: string
          pertinent_contemporary_issues?: string[] | null
          specific_learning_outcomes?: Json | null
          strand_id: string
          sub_strand_number: number
          suggested_lesson_count?: number | null
          suggested_resources?: Json | null
          updated_at?: string | null
          values?: Database["public"]["Enums"]["cbc_value"][] | null
        }
        Update: {
          assessment_rubrics?: Json | null
          core_competencies?:
            | Database["public"]["Enums"]["cbc_competency"][]
            | null
          created_at?: string | null
          id?: string
          key_inquiry_questions?: Json | null
          learning_experiences?: Json | null
          name?: string
          pertinent_contemporary_issues?: string[] | null
          specific_learning_outcomes?: Json | null
          strand_id?: string
          sub_strand_number?: number
          suggested_lesson_count?: number | null
          suggested_resources?: Json | null
          updated_at?: string | null
          values?: Database["public"]["Enums"]["cbc_value"][] | null
        }
        Relationships: [
          {
            foreignKeyName: "cbc_sub_strands_strand_id_fkey"
            columns: ["strand_id"]
            isOneToOne: false
            referencedRelation: "cbc_strands"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string
          description: string | null
          fund_id: string | null
          id: string
          institution_id: string
          is_active: boolean
          is_bank_account: boolean
          is_control_account: boolean
          is_system_account: boolean
          normal_balance: string
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string
          description?: string | null
          fund_id?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          is_bank_account?: boolean
          is_control_account?: boolean
          is_system_account?: boolean
          normal_balance?: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string
          description?: string | null
          fund_id?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          is_bank_account?: boolean
          is_control_account?: boolean
          is_system_account?: boolean
          normal_balance?: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      class_subjects: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          institution_id: string
          subject_id: string
          teacher_id: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          institution_id: string
          subject_id: string
          teacher_id?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          institution_id?: string
          subject_id?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teachers: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          class_id: string
          created_at: string | null
          id: string
          institution_id: string
          is_class_teacher: boolean | null
          staff_id: string
          subject_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          class_id: string
          created_at?: string | null
          id?: string
          institution_id: string
          is_class_teacher?: boolean | null
          staff_id: string
          subject_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          class_id?: string
          created_at?: string | null
          id?: string
          institution_id?: string
          is_class_teacher?: boolean | null
          staff_id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_teachers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teachers_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teachers_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teachers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year_id: string | null
          capacity: number | null
          class_teacher_id: string | null
          created_at: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          level: string
          name: string
          stream: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          level: string
          name: string
          stream?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          level?: string
          name?: string
          stream?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_events: {
        Row: {
          channels_used: string[] | null
          created_at: string
          event_type: string
          id: string
          institution_id: string
          message_content: string | null
          metadata: Json | null
          parent_id: string | null
          processed_at: string | null
          reference_id: string | null
          reference_type: string | null
          staff_id: string | null
          status: string
          student_id: string | null
          trigger_source: string
        }
        Insert: {
          channels_used?: string[] | null
          created_at?: string
          event_type: string
          id?: string
          institution_id: string
          message_content?: string | null
          metadata?: Json | null
          parent_id?: string | null
          processed_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          staff_id?: string | null
          status?: string
          student_id?: string | null
          trigger_source?: string
        }
        Update: {
          channels_used?: string[] | null
          created_at?: string
          event_type?: string
          id?: string
          institution_id?: string
          message_content?: string | null
          metadata?: Json | null
          parent_id?: string | null
          processed_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          staff_id?: string | null
          status?: string
          student_id?: string | null
          trigger_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_events_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_events_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_events_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_role_permissions: {
        Row: {
          custom_role_id: string
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_id: string
        }
        Insert: {
          custom_role_id: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id: string
        }
        Update: {
          custom_role_id?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_role_permissions_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_roles: {
        Row: {
          base_role: string | null
          created_at: string | null
          description: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          base_role?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          base_role?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_roles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      data_imports: {
        Row: {
          created_at: string | null
          failed_rows: number | null
          file_name: string | null
          file_url: string | null
          id: string
          import_type: string
          imported_at: string | null
          imported_by: string | null
          imported_ids: string[] | null
          imported_rows: number | null
          institution_id: string
          is_dry_run: boolean | null
          rolled_back_at: string | null
          rolled_back_by: string | null
          status: string
          total_rows: number | null
          valid_rows: number | null
          validated_at: string | null
          validation_errors: Json | null
        }
        Insert: {
          created_at?: string | null
          failed_rows?: number | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          import_type: string
          imported_at?: string | null
          imported_by?: string | null
          imported_ids?: string[] | null
          imported_rows?: number | null
          institution_id: string
          is_dry_run?: boolean | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          status?: string
          total_rows?: number | null
          valid_rows?: number | null
          validated_at?: string | null
          validation_errors?: Json | null
        }
        Update: {
          created_at?: string | null
          failed_rows?: number | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          import_type?: string
          imported_at?: string | null
          imported_by?: string | null
          imported_ids?: string[] | null
          imported_rows?: number | null
          institution_id?: string
          is_dry_run?: boolean | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          status?: string
          total_rows?: number | null
          valid_rows?: number | null
          validated_at?: string | null
          validation_errors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "data_imports_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      deduction_types: {
        Row: {
          calculation_formula: Json | null
          calculation_order: number | null
          calculation_type: string
          category: string | null
          code: string
          country_code: string | null
          created_at: string
          default_amount: number
          description: string | null
          employer_contribution_rate: number | null
          id: string
          institution_id: string
          is_active: boolean
          is_statutory: boolean
          name: string
          reduces_taxable_income: boolean | null
          updated_at: string
        }
        Insert: {
          calculation_formula?: Json | null
          calculation_order?: number | null
          calculation_type?: string
          category?: string | null
          code: string
          country_code?: string | null
          created_at?: string
          default_amount?: number
          description?: string | null
          employer_contribution_rate?: number | null
          id?: string
          institution_id: string
          is_active?: boolean
          is_statutory?: boolean
          name: string
          reduces_taxable_income?: boolean | null
          updated_at?: string
        }
        Update: {
          calculation_formula?: Json | null
          calculation_order?: number | null
          calculation_type?: string
          category?: string | null
          code?: string
          country_code?: string | null
          created_at?: string
          default_amount?: number
          description?: string | null
          employer_contribution_rate?: number | null
          id?: string
          institution_id?: string
          is_active?: boolean
          is_statutory?: boolean
          name?: string
          reduces_taxable_income?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deduction_types_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          contacted_at: string | null
          contacted_by: string | null
          converted_institution_id: string | null
          created_at: string | null
          email: string
          id: string
          location: string | null
          name: string
          notes: string | null
          number_of_learners: string | null
          phone: string
          school_name: string
          status: string | null
        }
        Insert: {
          contacted_at?: string | null
          contacted_by?: string | null
          converted_institution_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          number_of_learners?: string | null
          phone: string
          school_name: string
          status?: string | null
        }
        Update: {
          contacted_at?: string | null
          contacted_by?: string | null
          converted_institution_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          number_of_learners?: string | null
          phone?: string
          school_name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_requests_converted_institution_id_fkey"
            columns: ["converted_institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_paper_questions: {
        Row: {
          created_at: string | null
          exam_paper_id: string
          id: string
          marks_override: number | null
          question_id: string
          question_order: number
          section_index: number
        }
        Insert: {
          created_at?: string | null
          exam_paper_id: string
          id?: string
          marks_override?: number | null
          question_id: string
          question_order: number
          section_index?: number
        }
        Update: {
          created_at?: string | null
          exam_paper_id?: string
          id?: string
          marks_override?: number | null
          question_id?: string
          question_order?: number
          section_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_paper_questions_exam_paper_id_fkey"
            columns: ["exam_paper_id"]
            isOneToOne: false
            referencedRelation: "exam_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_paper_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_papers: {
        Row: {
          class_id: string | null
          created_at: string | null
          created_by: string | null
          duration_minutes: number
          exam_id: string | null
          finalized_at: string | null
          finalized_by: string | null
          id: string
          institution_id: string
          instructions: string | null
          sections: Json | null
          status: Database["public"]["Enums"]["exam_paper_status"]
          subject_id: string
          title: string
          total_marks: number
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number
          exam_id?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          institution_id: string
          instructions?: string | null
          sections?: Json | null
          status?: Database["public"]["Enums"]["exam_paper_status"]
          subject_id: string
          title: string
          total_marks?: number
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number
          exam_id?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          institution_id?: string
          instructions?: string | null
          sections?: Json | null
          status?: Database["public"]["Enums"]["exam_paper_status"]
          subject_id?: string
          title?: string
          total_marks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_papers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_finalized_by_fkey"
            columns: ["finalized_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year_id: string | null
          allow_late_submission: boolean | null
          correction_deadline: string | null
          created_at: string | null
          created_by: string | null
          draft_deadline: string | null
          end_date: string | null
          exam_type: string
          final_deadline: string | null
          id: string
          institution_id: string
          late_submission_penalty_percent: number | null
          max_marks: number | null
          name: string
          start_date: string | null
          status: string | null
          strand_coverage: Json | null
          term_id: string | null
          updated_at: string | null
          weight_percentage: number | null
        }
        Insert: {
          academic_year_id?: string | null
          allow_late_submission?: boolean | null
          correction_deadline?: string | null
          created_at?: string | null
          created_by?: string | null
          draft_deadline?: string | null
          end_date?: string | null
          exam_type: string
          final_deadline?: string | null
          id?: string
          institution_id: string
          late_submission_penalty_percent?: number | null
          max_marks?: number | null
          name: string
          start_date?: string | null
          status?: string | null
          strand_coverage?: Json | null
          term_id?: string | null
          updated_at?: string | null
          weight_percentage?: number | null
        }
        Update: {
          academic_year_id?: string | null
          allow_late_submission?: boolean | null
          correction_deadline?: string | null
          created_at?: string | null
          created_by?: string | null
          draft_deadline?: string | null
          end_date?: string | null
          exam_type?: string
          final_deadline?: string | null
          id?: string
          institution_id?: string
          late_submission_penalty_percent?: number | null
          max_marks?: number | null
          name?: string
          start_date?: string | null
          status?: string | null
          strand_coverage?: Json | null
          term_id?: string | null
          updated_at?: string | null
          weight_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_discounts: {
        Row: {
          amount: number
          applicable_classes: string[] | null
          applicable_fee_items: string[] | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          criteria: Json | null
          current_usage: number | null
          description: string | null
          discount_type: string
          end_date: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          max_usage: number | null
          name: string
          requires_approval: boolean | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          applicable_classes?: string[] | null
          applicable_fee_items?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          criteria?: Json | null
          current_usage?: number | null
          description?: string | null
          discount_type: string
          end_date?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          max_usage?: number | null
          name: string
          requires_approval?: boolean | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          applicable_classes?: string[] | null
          applicable_fee_items?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          criteria?: Json | null
          current_usage?: number | null
          description?: string | null
          discount_type?: string
          end_date?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          max_usage?: number | null
          name?: string
          requires_approval?: boolean | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_discounts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_installments: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          due_date: string
          fee_item_id: string
          id: string
          installment_number: number
          institution_id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          due_date: string
          fee_item_id: string
          id?: string
          installment_number: number
          institution_id: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string
          fee_item_id?: string
          id?: string
          installment_number?: number
          institution_id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_installments_fee_item_id_fkey"
            columns: ["fee_item_id"]
            isOneToOne: false
            referencedRelation: "fee_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_installments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_items: {
        Row: {
          academic_year_id: string | null
          amount: number
          applicable_to: string[] | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          name: string
          term_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          amount: number
          applicable_to?: string[] | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          name: string
          term_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          amount?: number
          applicable_to?: string[] | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          name?: string
          term_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_items_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_items_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_items_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          institution_id: string
          notes: string | null
          payment_method: string | null
          recorded_by: string | null
          student_fee_account_id: string
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          institution_id: string
          notes?: string | null
          payment_method?: string | null
          recorded_by?: string | null
          student_fee_account_id: string
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          institution_id?: string
          notes?: string | null
          payment_method?: string | null
          recorded_by?: string | null
          student_fee_account_id?: string
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_fee_account_id_fkey"
            columns: ["student_fee_account_id"]
            isOneToOne: false
            referencedRelation: "student_fee_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string
          amount: number
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          amount: number
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          amount?: number
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_receipts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_account_id: string | null
          bank_reference: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cashbook_entry_id: string | null
          cheque_bank: string | null
          cheque_date: string | null
          cheque_number: string | null
          created_at: string
          currency: string
          fund_id: string | null
          id: string
          institution_id: string
          journal_entry_id: string | null
          mpesa_code: string | null
          narration: string | null
          payer_id: string | null
          payer_name: string
          payer_type: string
          payment_method: string
          printed_at: string | null
          printed_by: string | null
          receipt_date: string
          receipt_number: string
          received_by: string | null
          status: string
          student_payment_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id?: string | null
          bank_reference?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cashbook_entry_id?: string | null
          cheque_bank?: string | null
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          currency?: string
          fund_id?: string | null
          id?: string
          institution_id: string
          journal_entry_id?: string | null
          mpesa_code?: string | null
          narration?: string | null
          payer_id?: string | null
          payer_name: string
          payer_type: string
          payment_method: string
          printed_at?: string | null
          printed_by?: string | null
          receipt_date: string
          receipt_number: string
          received_by?: string | null
          status?: string
          student_payment_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id?: string | null
          bank_reference?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cashbook_entry_id?: string | null
          cheque_bank?: string | null
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          currency?: string
          fund_id?: string | null
          id?: string
          institution_id?: string
          journal_entry_id?: string | null
          mpesa_code?: string | null
          narration?: string | null
          payer_id?: string | null
          payer_name?: string
          payer_type?: string
          payment_method?: string
          printed_at?: string | null
          printed_by?: string | null
          receipt_date?: string
          receipt_number?: string
          received_by?: string | null
          status?: string
          student_payment_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_receipts_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_receipts_cashbook_entry_id_fkey"
            columns: ["cashbook_entry_id"]
            isOneToOne: false
            referencedRelation: "cashbook_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_receipts_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_receipts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_receipts_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_receipts_student_payment_id_fkey"
            columns: ["student_payment_id"]
            isOneToOne: false
            referencedRelation: "student_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_adjustments: {
        Row: {
          adjustment_amount: number
          adjustment_type: string
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          executed_at: string | null
          id: string
          institution_id: string
          new_amount: number | null
          old_amount: number | null
          reason: string
          requested_at: string | null
          requested_by: string
          requires_secondary_approval: boolean | null
          secondary_approved_at: string | null
          secondary_approved_by: string | null
          status: string
          student_id: string | null
          supporting_document_url: string | null
          updated_at: string | null
        }
        Insert: {
          adjustment_amount: number
          adjustment_type: string
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          executed_at?: string | null
          id?: string
          institution_id: string
          new_amount?: number | null
          old_amount?: number | null
          reason: string
          requested_at?: string | null
          requested_by: string
          requires_secondary_approval?: boolean | null
          secondary_approved_at?: string | null
          secondary_approved_by?: string | null
          status?: string
          student_id?: string | null
          supporting_document_url?: string | null
          updated_at?: string | null
        }
        Update: {
          adjustment_amount?: number
          adjustment_type?: string
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          executed_at?: string | null
          id?: string
          institution_id?: string
          new_amount?: number | null
          old_amount?: number | null
          reason?: string
          requested_at?: string | null
          requested_by?: string
          requires_secondary_approval?: boolean | null
          secondary_approved_at?: string | null
          secondary_approved_by?: string | null
          status?: string
          student_id?: string | null
          supporting_document_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_adjustments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_adjustments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_periods: {
        Row: {
          can_unlock: boolean | null
          created_at: string | null
          end_date: string
          id: string
          institution_id: string
          is_locked: boolean | null
          lock_reason: string | null
          locked_at: string | null
          locked_by: string | null
          period_name: string
          period_type: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          can_unlock?: boolean | null
          created_at?: string | null
          end_date: string
          id?: string
          institution_id: string
          is_locked?: boolean | null
          lock_reason?: string | null
          locked_at?: string | null
          locked_by?: string | null
          period_name: string
          period_type: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          can_unlock?: boolean | null
          created_at?: string | null
          end_date?: string
          id?: string
          institution_id?: string
          is_locked?: boolean | null
          lock_reason?: string | null
          locked_at?: string | null
          locked_by?: string | null
          period_name?: string
          period_type?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_periods_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_votehead_allocations: {
        Row: {
          academic_year_id: string | null
          budget_amount: number | null
          created_at: string
          fund_id: string
          id: string
          institution_id: string
          spent_amount: number | null
          updated_at: string
          votehead_id: string
        }
        Insert: {
          academic_year_id?: string | null
          budget_amount?: number | null
          created_at?: string
          fund_id: string
          id?: string
          institution_id: string
          spent_amount?: number | null
          updated_at?: string
          votehead_id: string
        }
        Update: {
          academic_year_id?: string | null
          budget_amount?: number | null
          created_at?: string
          fund_id?: string
          id?: string
          institution_id?: string
          spent_amount?: number | null
          updated_at?: string
          votehead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_votehead_allocations_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_votehead_allocations_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_votehead_allocations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_votehead_allocations_votehead_id_fkey"
            columns: ["votehead_id"]
            isOneToOne: false
            referencedRelation: "voteheads"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          budget_amount: number | null
          created_at: string
          description: string | null
          fund_code: string
          fund_name: string
          fund_type: string
          id: string
          institution_id: string
          is_active: boolean
          source: string
          updated_at: string
        }
        Insert: {
          budget_amount?: number | null
          created_at?: string
          description?: string | null
          fund_code: string
          fund_name: string
          fund_type?: string
          id?: string
          institution_id: string
          is_active?: boolean
          source?: string
          updated_at?: string
        }
        Update: {
          budget_amount?: number | null
          created_at?: string
          description?: string | null
          fund_code?: string
          fund_name?: string
          fund_type?: string
          id?: string
          institution_id?: string
          is_active?: boolean
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funds_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_approvals: {
        Row: {
          assignment_id: string | null
          class_id: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          exam_id: string | null
          id: string
          institution_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          student_count: number | null
          subject_id: string | null
          submitted_at: string | null
          submitted_by: string
          updated_at: string | null
        }
        Insert: {
          assignment_id?: string | null
          class_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          exam_id?: string | null
          id?: string
          institution_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_count?: number | null
          subject_id?: string | null
          submitted_at?: string | null
          submitted_by: string
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string | null
          class_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          exam_id?: string | null
          id?: string
          institution_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_count?: number | null
          subject_id?: string | null
          submitted_at?: string | null
          submitted_by?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_approvals_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_approvals_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_approvals_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_approvals_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_approvals_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_change_logs: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          assignment_id: string | null
          change_reason: string
          changed_at: string | null
          changed_by: string
          entity_id: string
          entity_type: string
          exam_id: string | null
          id: string
          institution_id: string
          new_feedback: string | null
          new_grade: string | null
          new_marks: number | null
          old_feedback: string | null
          old_grade: string | null
          old_marks: number | null
          requires_approval: boolean | null
          student_id: string
          subject_id: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assignment_id?: string | null
          change_reason: string
          changed_at?: string | null
          changed_by: string
          entity_id: string
          entity_type: string
          exam_id?: string | null
          id?: string
          institution_id: string
          new_feedback?: string | null
          new_grade?: string | null
          new_marks?: number | null
          old_feedback?: string | null
          old_grade?: string | null
          old_marks?: number | null
          requires_approval?: boolean | null
          student_id: string
          subject_id?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assignment_id?: string | null
          change_reason?: string
          changed_at?: string | null
          changed_by?: string
          entity_id?: string
          entity_type?: string
          exam_id?: string | null
          id?: string
          institution_id?: string
          new_feedback?: string | null
          new_grade?: string | null
          new_marks?: number | null
          old_feedback?: string | null
          old_grade?: string | null
          old_marks?: number | null
          requires_approval?: boolean | null
          student_id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_change_logs_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_change_logs_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_change_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_change_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_change_logs_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_levels: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          grade: string
          grading_scale_id: string
          id: string
          max_marks: number
          min_marks: number
          points: number | null
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          grade: string
          grading_scale_id: string
          id?: string
          max_marks: number
          min_marks: number
          points?: number | null
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          grade?: string
          grading_scale_id?: string
          id?: string
          max_marks?: number
          min_marks?: number
          points?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "grade_levels_grading_scale_id_fkey"
            columns: ["grading_scale_id"]
            isOneToOne: false
            referencedRelation: "grading_scales"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_scales: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          scale_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          scale_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          scale_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grading_scales_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_shared_services: {
        Row: {
          config: Json | null
          created_at: string
          group_id: string
          id: string
          is_centralized: boolean
          service_type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          group_id: string
          id?: string
          is_centralized?: boolean
          service_type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          group_id?: string
          id?: string
          is_centralized?: boolean
          service_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_shared_services_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "institution_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_user_roles: {
        Row: {
          campus_access: string[] | null
          granted_at: string
          granted_by: string | null
          group_id: string
          id: string
          role: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Insert: {
          campus_access?: string[] | null
          granted_at?: string
          granted_by?: string | null
          group_id: string
          id?: string
          role: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Update: {
          campus_access?: string[] | null
          granted_at?: string
          granted_by?: string | null
          group_id?: string
          id?: string
          role?: Database["public"]["Enums"]["group_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_user_roles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "institution_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_beds: {
        Row: {
          bed_number: string
          bed_type: string | null
          created_at: string | null
          id: string
          institution_id: string
          notes: string | null
          room_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bed_number: string
          bed_type?: string | null
          created_at?: string | null
          id?: string
          institution_id: string
          notes?: string | null
          room_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bed_number?: string
          bed_type?: string | null
          created_at?: string | null
          id?: string
          institution_id?: string
          notes?: string | null
          room_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_beds_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_beds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hostel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_rooms: {
        Row: {
          amenities: string[] | null
          bed_capacity: number
          created_at: string | null
          floor: string | null
          hostel_id: string
          id: string
          institution_id: string
          is_active: boolean | null
          room_number: string
          room_type: string | null
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          bed_capacity?: number
          created_at?: string | null
          floor?: string | null
          hostel_id: string
          id?: string
          institution_id: string
          is_active?: boolean | null
          room_number: string
          room_type?: string | null
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          bed_capacity?: number
          created_at?: string | null
          floor?: string | null
          hostel_id?: string
          id?: string
          institution_id?: string
          is_active?: boolean | null
          room_number?: string
          room_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_rooms_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_rooms_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          capacity: number
          code: string
          created_at: string | null
          description: string | null
          gender: string
          id: string
          institution_id: string
          is_active: boolean | null
          location: string | null
          name: string
          updated_at: string | null
          warden_staff_id: string | null
        }
        Insert: {
          capacity?: number
          code: string
          created_at?: string | null
          description?: string | null
          gender: string
          id?: string
          institution_id: string
          is_active?: boolean | null
          location?: string | null
          name: string
          updated_at?: string | null
          warden_staff_id?: string | null
        }
        Update: {
          capacity?: number
          code?: string
          created_at?: string | null
          description?: string | null
          gender?: string
          id?: string
          institution_id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          updated_at?: string | null
          warden_staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostels_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostels_warden_staff_id_fkey"
            columns: ["warden_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_staff_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          id: string
          institution_id: string
          notes: string | null
          staff_id: string
          status: string
          updated_at: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date: string
          id?: string
          institution_id: string
          notes?: string | null
          staff_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          id?: string
          institution_id?: string
          notes?: string | null
          staff_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_staff_attendance_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      in_app_notifications: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          is_read: boolean
          message: string
          parent_id: string | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          student_id: string | null
          title: string
          type: string
          user_id: string | null
          user_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          is_read?: boolean
          message: string
          parent_id?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          student_id?: string | null
          title: string
          type?: string
          user_id?: string | null
          user_type: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          is_read?: boolean
          message?: string
          parent_id?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          student_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "in_app_notifications_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "in_app_notifications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "in_app_notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_bank_accounts: {
        Row: {
          academic_year_id: string | null
          account_name: string | null
          account_number: string | null
          account_reference: string | null
          campus_mappings: string[] | null
          created_at: string | null
          fee_type_mappings: Json | null
          id: string
          institution_id: string
          is_enabled: boolean | null
          paybill_number: string | null
          platform_integration_id: string
          till_number: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          account_name?: string | null
          account_number?: string | null
          account_reference?: string | null
          campus_mappings?: string[] | null
          created_at?: string | null
          fee_type_mappings?: Json | null
          id?: string
          institution_id: string
          is_enabled?: boolean | null
          paybill_number?: string | null
          platform_integration_id: string
          till_number?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          account_name?: string | null
          account_number?: string | null
          account_reference?: string | null
          campus_mappings?: string[] | null
          created_at?: string | null
          fee_type_mappings?: Json | null
          id?: string
          institution_id?: string
          is_enabled?: boolean | null
          paybill_number?: string | null
          platform_integration_id?: string
          till_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_bank_accounts_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_bank_accounts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_bank_accounts_platform_integration_id_fkey"
            columns: ["platform_integration_id"]
            isOneToOne: false
            referencedRelation: "platform_bank_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_custom_pricing: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          custom_max_staff: number | null
          custom_max_students: number | null
          custom_monthly_price: number | null
          custom_yearly_price: number | null
          discount_percentage: number | null
          id: string
          included_modules: string[] | null
          institution_id: string
          is_active: boolean | null
          negotiation_notes: string | null
          updated_at: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          custom_max_staff?: number | null
          custom_max_students?: number | null
          custom_monthly_price?: number | null
          custom_yearly_price?: number | null
          discount_percentage?: number | null
          id?: string
          included_modules?: string[] | null
          institution_id: string
          is_active?: boolean | null
          negotiation_notes?: string | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          custom_max_staff?: number | null
          custom_max_students?: number | null
          custom_monthly_price?: number | null
          custom_yearly_price?: number | null
          discount_percentage?: number | null
          id?: string
          included_modules?: string[] | null
          institution_id?: string
          is_active?: boolean | null
          negotiation_notes?: string | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_custom_pricing_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_groups: {
        Row: {
          code: string
          created_at: string
          id: string
          logo_url: string | null
          name: string
          primary_country: Database["public"]["Enums"]["country_code"]
          settings: Json | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          primary_country?: Database["public"]["Enums"]["country_code"]
          settings?: Json | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_country?: Database["public"]["Enums"]["country_code"]
          settings?: Json | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Relationships: []
      }
      institution_invoices: {
        Row: {
          addons_amount: number
          base_plan_amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string | null
          currency: string | null
          due_date: string
          id: string
          institution_id: string
          invoice_number: string
          invoice_type: string
          line_items: Json | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          plan_id: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          addons_amount?: number
          base_plan_amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          currency?: string | null
          due_date: string
          id?: string
          institution_id: string
          invoice_number: string
          invoice_type?: string
          line_items?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          plan_id?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          addons_amount?: number
          base_plan_amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string
          id?: string
          institution_id?: string
          invoice_number?: string
          invoice_type?: string
          line_items?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          plan_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_invoices_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_module_config: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          activation_type: string | null
          created_at: string | null
          custom_settings: Json | null
          expires_at: string | null
          id: string
          institution_id: string
          is_enabled: boolean | null
          is_institution_disabled: boolean | null
          module_id: string
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          activation_type?: string | null
          created_at?: string | null
          custom_settings?: Json | null
          expires_at?: string | null
          id?: string
          institution_id: string
          is_enabled?: boolean | null
          is_institution_disabled?: boolean | null
          module_id: string
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          activation_type?: string | null
          created_at?: string | null
          custom_settings?: Json | null
          expires_at?: string | null
          id?: string
          institution_id?: string
          is_enabled?: boolean | null
          is_institution_disabled?: boolean | null
          module_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_module_config_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_notification_settings: {
        Row: {
          category: string
          channels: string[] | null
          created_at: string | null
          custom_template: string | null
          id: string
          institution_id: string
          is_enabled: boolean | null
          schedule_days: number[] | null
          schedule_time: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          channels?: string[] | null
          created_at?: string | null
          custom_template?: string | null
          id?: string
          institution_id: string
          is_enabled?: boolean | null
          schedule_days?: number[] | null
          schedule_time?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          channels?: string[] | null
          created_at?: string | null
          custom_template?: string | null
          id?: string
          institution_id?: string
          is_enabled?: boolean | null
          schedule_days?: number[] | null
          schedule_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_notification_settings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_payments: {
        Row: {
          amount: number
          checkout_request_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          institution_id: string
          invoice_id: string | null
          metadata: Json | null
          mpesa_phone: string | null
          mpesa_receipt: string | null
          payment_method: string
          payment_reference: string | null
          payment_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          checkout_request_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_id: string
          invoice_id?: string | null
          metadata?: Json | null
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          payment_method: string
          payment_reference?: string | null
          payment_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          checkout_request_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_id?: string
          invoice_id?: string | null
          metadata?: Json | null
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          payment_method?: string
          payment_reference?: string | null
          payment_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_payments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "institution_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_setup_fees: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          custom_name: string | null
          discount_percentage: number | null
          fee_catalog_id: string | null
          final_amount: number | null
          id: string
          institution_id: string
          notes: string | null
          paid_at: string | null
          quantity: number
          status: string
          total_amount: number | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          custom_name?: string | null
          discount_percentage?: number | null
          fee_catalog_id?: string | null
          final_amount?: number | null
          id?: string
          institution_id: string
          notes?: string | null
          paid_at?: string | null
          quantity?: number
          status?: string
          total_amount?: number | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          custom_name?: string | null
          discount_percentage?: number | null
          fee_catalog_id?: string | null
          final_amount?: number | null
          id?: string
          institution_id?: string
          notes?: string | null
          paid_at?: string | null
          quantity?: number
          status?: string
          total_amount?: number | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_setup_fees_fee_catalog_id_fkey"
            columns: ["fee_catalog_id"]
            isOneToOne: false
            referencedRelation: "setup_fee_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_setup_fees_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_sms_credits: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          last_topup_at: string | null
          low_balance_threshold: number
          remaining_credits: number | null
          total_credits: number
          updated_at: string
          used_credits: number
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          last_topup_at?: string | null
          low_balance_threshold?: number
          remaining_credits?: number | null
          total_credits?: number
          updated_at?: string
          used_credits?: number
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          last_topup_at?: string | null
          low_balance_threshold?: number
          remaining_credits?: number | null
          total_credits?: number
          updated_at?: string
          used_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "institution_sms_credits_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: true
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          billing_cycle: string
          campus_code: string | null
          churn_reason: string | null
          code: string
          country: Database["public"]["Enums"]["country_code"]
          county: string | null
          created_at: string
          curriculum: string | null
          email: string | null
          enabled_modules: string[] | null
          go_live_at: string | null
          grading_system: string | null
          group_id: string | null
          id: string
          invoice_sequence: number | null
          is_demo: boolean | null
          is_headquarters: boolean | null
          last_payment_at: string | null
          logo_url: string | null
          motto: string | null
          name: string
          onboarding_status: string | null
          ownership_type: Database["public"]["Enums"]["ownership_type"] | null
          phone: string | null
          settings: Json | null
          staff_count: number
          status: Database["public"]["Enums"]["institution_status"]
          student_count: number
          subscription_expires_at: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          subscription_started_at: string | null
          trial_ends_at: string | null
          type: Database["public"]["Enums"]["institution_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          billing_cycle?: string
          campus_code?: string | null
          churn_reason?: string | null
          code: string
          country?: Database["public"]["Enums"]["country_code"]
          county?: string | null
          created_at?: string
          curriculum?: string | null
          email?: string | null
          enabled_modules?: string[] | null
          go_live_at?: string | null
          grading_system?: string | null
          group_id?: string | null
          id?: string
          invoice_sequence?: number | null
          is_demo?: boolean | null
          is_headquarters?: boolean | null
          last_payment_at?: string | null
          logo_url?: string | null
          motto?: string | null
          name: string
          onboarding_status?: string | null
          ownership_type?: Database["public"]["Enums"]["ownership_type"] | null
          phone?: string | null
          settings?: Json | null
          staff_count?: number
          status?: Database["public"]["Enums"]["institution_status"]
          student_count?: number
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_started_at?: string | null
          trial_ends_at?: string | null
          type?: Database["public"]["Enums"]["institution_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          billing_cycle?: string
          campus_code?: string | null
          churn_reason?: string | null
          code?: string
          country?: Database["public"]["Enums"]["country_code"]
          county?: string | null
          created_at?: string
          curriculum?: string | null
          email?: string | null
          enabled_modules?: string[] | null
          go_live_at?: string | null
          grading_system?: string | null
          group_id?: string | null
          id?: string
          invoice_sequence?: number | null
          is_demo?: boolean | null
          is_headquarters?: boolean | null
          last_payment_at?: string | null
          logo_url?: string | null
          motto?: string | null
          name?: string
          onboarding_status?: string | null
          ownership_type?: Database["public"]["Enums"]["ownership_type"] | null
          phone?: string | null
          settings?: Json | null
          staff_count?: number
          status?: Database["public"]["Enums"]["institution_status"]
          student_count?: number
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_started_at?: string | null
          trial_ends_at?: string | null
          type?: Database["public"]["Enums"]["institution_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "institution_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          id: string
          integration_id: string
          is_acknowledged: boolean | null
          message: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          integration_id: string
          is_acknowledged?: boolean | null
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          severity: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          integration_id?: string
          is_acknowledged?: boolean | null
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_alerts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "platform_bank_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_health_logs: {
        Row: {
          check_type: string
          checked_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          integration_id: string
          request_details: Json | null
          response_details: Json | null
          response_time_ms: number | null
          status: string
        }
        Insert: {
          check_type: string
          checked_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          integration_id: string
          request_details?: Json | null
          response_details?: Json | null
          response_time_ms?: number | null
          status: string
        }
        Update: {
          check_type?: string
          checked_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string
          request_details?: Json | null
          response_details?: Json | null
          response_time_ms?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_health_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "platform_bank_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_email_logs: {
        Row: {
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          institution_id: string
          invoice_id: string
          resend_message_id: string | null
          sent_at: string
          sent_to: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          institution_id: string
          invoice_id: string
          resend_message_id?: string | null
          sent_at?: string
          sent_to: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          institution_id?: string
          invoice_id?: string
          resend_message_id?: string | null
          sent_at?: string
          sent_to?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_email_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_email_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          created_at: string | null
          description: string
          fee_item_id: string | null
          id: string
          invoice_id: string
          quantity: number | null
          total_amount: number
          unit_amount: number
        }
        Insert: {
          created_at?: string | null
          description: string
          fee_item_id?: string | null
          id?: string
          invoice_id: string
          quantity?: number | null
          total_amount: number
          unit_amount: number
        }
        Update: {
          created_at?: string | null
          description?: string
          fee_item_id?: string | null
          id?: string
          invoice_id?: string
          quantity?: number | null
          total_amount?: number
          unit_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_fee_item_id_fkey"
            columns: ["fee_item_id"]
            isOneToOne: false
            referencedRelation: "fee_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at: string
          currency: string | null
          due_date: string
          id: string
          institution_id: string
          invoice_number: string
          metadata: Json | null
          paid_at: string | null
          status: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
        }
        Insert: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          currency?: string | null
          due_date: string
          id?: string
          institution_id: string
          invoice_number: string
          metadata?: Json | null
          paid_at?: string | null
          status?: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          currency?: string | null
          due_date?: string
          id?: string
          institution_id?: string
          invoice_number?: string
          metadata?: Json | null
          paid_at?: string | null
          status?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      ipn_events: {
        Row: {
          amount: number | null
          bank_reference: string | null
          created_at: string | null
          currency: string | null
          event_type: string
          external_reference: string | null
          id: string
          integration_id: string
          normalized_payload: Json | null
          processing_completed_at: string | null
          processing_started_at: string | null
          raw_payload: Json
          sender_account: string | null
          sender_name: string | null
          sender_phone: string | null
          source_ip: string | null
          status: string
          validation_errors: string[] | null
        }
        Insert: {
          amount?: number | null
          bank_reference?: string | null
          created_at?: string | null
          currency?: string | null
          event_type?: string
          external_reference?: string | null
          id?: string
          integration_id: string
          normalized_payload?: Json | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          raw_payload: Json
          sender_account?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          source_ip?: string | null
          status?: string
          validation_errors?: string[] | null
        }
        Update: {
          amount?: number | null
          bank_reference?: string | null
          created_at?: string | null
          currency?: string | null
          event_type?: string
          external_reference?: string | null
          id?: string
          integration_id?: string
          normalized_payload?: Json | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          raw_payload?: Json
          sender_account?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          source_ip?: string | null
          status?: string
          validation_errors?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ipn_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "platform_bank_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      ipn_processing_queue: {
        Row: {
          action_at: string | null
          action_by: string | null
          action_taken: string | null
          created_at: string | null
          id: string
          institution_bank_account_id: string | null
          institution_id: string | null
          invoice_id: string | null
          ipn_event_id: string
          match_confidence: number | null
          match_details: Json | null
          match_status: string
          max_retries: number | null
          next_retry_at: string | null
          processed_at: string | null
          processing_notes: string | null
          retry_count: number | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_at?: string | null
          action_by?: string | null
          action_taken?: string | null
          created_at?: string | null
          id?: string
          institution_bank_account_id?: string | null
          institution_id?: string | null
          invoice_id?: string | null
          ipn_event_id: string
          match_confidence?: number | null
          match_details?: Json | null
          match_status?: string
          max_retries?: number | null
          next_retry_at?: string | null
          processed_at?: string | null
          processing_notes?: string | null
          retry_count?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_at?: string | null
          action_by?: string | null
          action_taken?: string | null
          created_at?: string | null
          id?: string
          institution_bank_account_id?: string | null
          institution_id?: string | null
          invoice_id?: string | null
          ipn_event_id?: string
          match_confidence?: number | null
          match_details?: Json | null
          match_status?: string
          max_retries?: number | null
          next_retry_at?: string | null
          processed_at?: string | null
          processing_notes?: string | null
          retry_count?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipn_processing_queue_institution_bank_account_id_fkey"
            columns: ["institution_bank_account_id"]
            isOneToOne: false
            referencedRelation: "institution_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipn_processing_queue_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipn_processing_queue_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipn_processing_queue_ipn_event_id_fkey"
            columns: ["ipn_event_id"]
            isOneToOne: false
            referencedRelation: "ipn_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipn_processing_queue_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          entry_number: string
          id: string
          institution_id: string
          period_id: string | null
          posted_at: string | null
          posted_by: string | null
          posting_date: string | null
          reference: string | null
          reversal_reason: string | null
          reversed_at: string | null
          reversed_by: string | null
          source_id: string | null
          source_type: string | null
          status: string
          total_credit: number
          total_debit: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          entry_date: string
          entry_number: string
          id?: string
          institution_id: string
          period_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          posting_date?: string | null
          reference?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          total_credit?: number
          total_debit?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          institution_id?: string
          period_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          posting_date?: string | null
          reference?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          total_credit?: number
          total_debit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "financial_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          fund_id: string | null
          id: string
          institution_id: string
          journal_entry_id: string
          line_order: number
          votehead_id: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          fund_id?: string | null
          id?: string
          institution_id: string
          journal_entry_id: string
          line_order?: number
          votehead_id?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          fund_id?: string | null
          id?: string
          institution_id?: string
          journal_entry_id?: string
          line_order?: number
          votehead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_votehead_id_fkey"
            columns: ["votehead_id"]
            isOneToOne: false
            referencedRelation: "voteheads"
            referencedColumns: ["id"]
          },
        ]
      }
      late_payment_penalties: {
        Row: {
          apply_per: string | null
          auto_apply: boolean | null
          created_at: string | null
          fee_item_id: string | null
          grace_period_days: number | null
          id: string
          institution_id: string
          is_active: boolean | null
          is_compounding: boolean | null
          last_applied_at: string | null
          max_penalty: number | null
          name: string
          penalty_amount: number
          penalty_type: string
          updated_at: string | null
        }
        Insert: {
          apply_per?: string | null
          auto_apply?: boolean | null
          created_at?: string | null
          fee_item_id?: string | null
          grace_period_days?: number | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          is_compounding?: boolean | null
          last_applied_at?: string | null
          max_penalty?: number | null
          name: string
          penalty_amount: number
          penalty_type: string
          updated_at?: string | null
        }
        Update: {
          apply_per?: string | null
          auto_apply?: boolean | null
          created_at?: string | null
          fee_item_id?: string | null
          grace_period_days?: number | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          is_compounding?: boolean | null
          last_applied_at?: string | null
          max_penalty?: number | null
          name?: string
          penalty_amount?: number
          penalty_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "late_payment_penalties_fee_item_id_fkey"
            columns: ["fee_item_id"]
            isOneToOne: false
            referencedRelation: "fee_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "late_payment_penalties_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_approval_workflow: {
        Row: {
          approver_order: number | null
          approver_role: string
          approver_staff_id: string | null
          auto_approve_days: number | null
          created_at: string | null
          department: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          approver_order?: number | null
          approver_role: string
          approver_staff_id?: string | null
          auto_approve_days?: number | null
          created_at?: string | null
          department?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          approver_order?: number | null
          approver_role?: string
          approver_staff_id?: string | null
          auto_approve_days?: number | null
          created_at?: string | null
          department?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_approval_workflow_approver_staff_id_fkey"
            columns: ["approver_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_approval_workflow_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          balance: number | null
          created_at: string
          entitled: number
          id: string
          institution_id: string
          leave_type_id: string
          staff_id: string
          updated_at: string
          used: number
          year: number
        }
        Insert: {
          balance?: number | null
          created_at?: string
          entitled?: number
          id?: string
          institution_id: string
          leave_type_id: string
          staff_id: string
          updated_at?: string
          used?: number
          year: number
        }
        Update: {
          balance?: number | null
          created_at?: string
          entitled?: number
          id?: string
          institution_id?: string
          leave_type_id?: string
          staff_id?: string
          updated_at?: string
          used?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approver_id: string | null
          attachment_url: string | null
          created_at: string
          days: number
          end_date: string
          escalated_at: string | null
          half_day: boolean | null
          half_day_period: string | null
          id: string
          institution_id: string
          leave_type_id: string
          reason: string | null
          rejection_reason: string | null
          remarks: string | null
          staff_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approver_id?: string | null
          attachment_url?: string | null
          created_at?: string
          days: number
          end_date: string
          escalated_at?: string | null
          half_day?: boolean | null
          half_day_period?: string | null
          id?: string
          institution_id: string
          leave_type_id: string
          reason?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          staff_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approver_id?: string | null
          attachment_url?: string | null
          created_at?: string
          days?: number
          end_date?: string
          escalated_at?: string | null
          half_day?: boolean | null
          half_day_period?: string | null
          id?: string
          institution_id?: string
          leave_type_id?: string
          reason?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          staff_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          carry_forward: boolean | null
          created_at: string
          days_allowed: number
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          requires_approval: boolean | null
          updated_at: string
        }
        Insert: {
          carry_forward?: boolean | null
          created_at?: string
          days_allowed?: number
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          requires_approval?: boolean | null
          updated_at?: string
        }
        Update: {
          carry_forward?: boolean | null
          created_at?: string
          days_allowed?: number
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          requires_approval?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plan_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          institution_id: string
          is_shared: boolean | null
          is_system: boolean | null
          lesson_structure: Json
          level: string | null
          name: string
          subject_code: string | null
          teaching_methods: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          institution_id: string
          is_shared?: boolean | null
          is_system?: boolean | null
          lesson_structure: Json
          level?: string | null
          name: string
          subject_code?: string | null
          teaching_methods?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          is_shared?: boolean | null
          is_system?: boolean | null
          lesson_structure?: Json
          level?: string | null
          name?: string
          subject_code?: string | null
          teaching_methods?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plan_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plan_templates_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plans: {
        Row: {
          academic_year_id: string | null
          approved_at: string | null
          approved_by: string | null
          assessment_methods: Json | null
          challenges_faced: string | null
          class_id: string
          conclusion: string | null
          core_competencies:
            | Database["public"]["Enums"]["cbc_competency"][]
            | null
          created_at: string | null
          differentiation_notes: string | null
          duration_minutes: number | null
          expected_outcomes: string | null
          follow_up_actions: string | null
          id: string
          institution_id: string
          introduction: string | null
          learner_achievement: string | null
          learning_resources: Json | null
          lesson_date: string
          lesson_development: Json | null
          lesson_number: number | null
          lesson_objectives: Json | null
          pertinent_contemporary_issues: string[] | null
          reflection: string | null
          rejection_reason: string | null
          scheme_entry_id: string | null
          special_needs_accommodations: string | null
          status: Database["public"]["Enums"]["lesson_plan_status"] | null
          strand_id: string | null
          sub_strand_id: string | null
          sub_topic: string | null
          subject_id: string
          submitted_at: string | null
          teacher_id: string
          teaching_aids: Json | null
          teaching_methods: string[] | null
          term_id: string | null
          timetable_entry_id: string | null
          topic: string
          updated_at: string | null
          values: Database["public"]["Enums"]["cbc_value"][] | null
          week_number: number | null
        }
        Insert: {
          academic_year_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assessment_methods?: Json | null
          challenges_faced?: string | null
          class_id: string
          conclusion?: string | null
          core_competencies?:
            | Database["public"]["Enums"]["cbc_competency"][]
            | null
          created_at?: string | null
          differentiation_notes?: string | null
          duration_minutes?: number | null
          expected_outcomes?: string | null
          follow_up_actions?: string | null
          id?: string
          institution_id: string
          introduction?: string | null
          learner_achievement?: string | null
          learning_resources?: Json | null
          lesson_date: string
          lesson_development?: Json | null
          lesson_number?: number | null
          lesson_objectives?: Json | null
          pertinent_contemporary_issues?: string[] | null
          reflection?: string | null
          rejection_reason?: string | null
          scheme_entry_id?: string | null
          special_needs_accommodations?: string | null
          status?: Database["public"]["Enums"]["lesson_plan_status"] | null
          strand_id?: string | null
          sub_strand_id?: string | null
          sub_topic?: string | null
          subject_id: string
          submitted_at?: string | null
          teacher_id: string
          teaching_aids?: Json | null
          teaching_methods?: string[] | null
          term_id?: string | null
          timetable_entry_id?: string | null
          topic: string
          updated_at?: string | null
          values?: Database["public"]["Enums"]["cbc_value"][] | null
          week_number?: number | null
        }
        Update: {
          academic_year_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assessment_methods?: Json | null
          challenges_faced?: string | null
          class_id?: string
          conclusion?: string | null
          core_competencies?:
            | Database["public"]["Enums"]["cbc_competency"][]
            | null
          created_at?: string | null
          differentiation_notes?: string | null
          duration_minutes?: number | null
          expected_outcomes?: string | null
          follow_up_actions?: string | null
          id?: string
          institution_id?: string
          introduction?: string | null
          learner_achievement?: string | null
          learning_resources?: Json | null
          lesson_date?: string
          lesson_development?: Json | null
          lesson_number?: number | null
          lesson_objectives?: Json | null
          pertinent_contemporary_issues?: string[] | null
          reflection?: string | null
          rejection_reason?: string | null
          scheme_entry_id?: string | null
          special_needs_accommodations?: string | null
          status?: Database["public"]["Enums"]["lesson_plan_status"] | null
          strand_id?: string | null
          sub_strand_id?: string | null
          sub_topic?: string | null
          subject_id?: string
          submitted_at?: string | null
          teacher_id?: string
          teaching_aids?: Json | null
          teaching_methods?: string[] | null
          term_id?: string | null
          timetable_entry_id?: string | null
          topic?: string
          updated_at?: string | null
          values?: Database["public"]["Enums"]["cbc_value"][] | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_scheme_entry_id_fkey"
            columns: ["scheme_entry_id"]
            isOneToOne: false
            referencedRelation: "scheme_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_strand_id_fkey"
            columns: ["strand_id"]
            isOneToOne: false
            referencedRelation: "cbc_strands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_sub_strand_id_fkey"
            columns: ["sub_strand_id"]
            isOneToOne: false
            referencedRelation: "cbc_sub_strands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_timetable_entry_id_fkey"
            columns: ["timetable_entry_id"]
            isOneToOne: false
            referencedRelation: "timetable_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      library_book_copies: {
        Row: {
          acquisition_date: string | null
          barcode: string | null
          book_id: string
          condition: string
          copy_number: string
          created_at: string
          id: string
          institution_id: string
          is_available: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          acquisition_date?: string | null
          barcode?: string | null
          book_id: string
          condition?: string
          copy_number: string
          created_at?: string
          id?: string
          institution_id: string
          is_available?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_date?: string | null
          barcode?: string | null
          book_id?: string
          condition?: string
          copy_number?: string
          created_at?: string
          id?: string
          institution_id?: string
          is_available?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_book_copies_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_book_copies_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      library_books: {
        Row: {
          author: string | null
          available_copies: number
          book_code: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          institution_id: string
          is_active: boolean
          isbn: string | null
          location: string | null
          publication_year: number | null
          publisher: string | null
          title: string
          total_copies: number
          updated_at: string
        }
        Insert: {
          author?: string | null
          available_copies?: number
          book_code?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          isbn?: string | null
          location?: string | null
          publication_year?: number | null
          publisher?: string | null
          title: string
          total_copies?: number
          updated_at?: string
        }
        Update: {
          author?: string | null
          available_copies?: number
          book_code?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          isbn?: string | null
          location?: string | null
          publication_year?: number | null
          publisher?: string | null
          title?: string
          total_copies?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_books_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      library_loans: {
        Row: {
          borrowed_at: string
          borrowed_by: string
          condition_at_checkout: string | null
          condition_at_return: string | null
          copy_id: string
          created_at: string
          due_date: string
          id: string
          institution_id: string
          notes: string | null
          renewal_count: number
          returned_at: string | null
          returned_to: string | null
          status: string
          student_id: string
          teacher_allocation_id: string | null
          updated_at: string
        }
        Insert: {
          borrowed_at?: string
          borrowed_by: string
          condition_at_checkout?: string | null
          condition_at_return?: string | null
          copy_id: string
          created_at?: string
          due_date: string
          id?: string
          institution_id: string
          notes?: string | null
          renewal_count?: number
          returned_at?: string | null
          returned_to?: string | null
          status?: string
          student_id: string
          teacher_allocation_id?: string | null
          updated_at?: string
        }
        Update: {
          borrowed_at?: string
          borrowed_by?: string
          condition_at_checkout?: string | null
          condition_at_return?: string | null
          copy_id?: string
          created_at?: string
          due_date?: string
          id?: string
          institution_id?: string
          notes?: string | null
          renewal_count?: number
          returned_at?: string | null
          returned_to?: string | null
          status?: string
          student_id?: string
          teacher_allocation_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_loans_copy_id_fkey"
            columns: ["copy_id"]
            isOneToOne: false
            referencedRelation: "library_book_copies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_teacher_allocation_id_fkey"
            columns: ["teacher_allocation_id"]
            isOneToOne: false
            referencedRelation: "library_teacher_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      library_penalties: {
        Row: {
          amount: number
          applied_at: string
          applied_by: string | null
          created_at: string
          days_overdue: number | null
          id: string
          institution_id: string
          invoice_id: string | null
          loan_id: string
          penalty_type: string
          status: string
          student_id: string
          updated_at: string
          waived_at: string | null
          waived_by: string | null
          waiver_reason: string | null
        }
        Insert: {
          amount: number
          applied_at?: string
          applied_by?: string | null
          created_at?: string
          days_overdue?: number | null
          id?: string
          institution_id: string
          invoice_id?: string | null
          loan_id: string
          penalty_type: string
          status?: string
          student_id: string
          updated_at?: string
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Update: {
          amount?: number
          applied_at?: string
          applied_by?: string | null
          created_at?: string
          days_overdue?: number | null
          id?: string
          institution_id?: string
          invoice_id?: string | null
          loan_id?: string
          penalty_type?: string
          status?: string
          student_id?: string
          updated_at?: string
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_penalties_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_penalties_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_penalties_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "library_loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_penalties_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      library_settings: {
        Row: {
          created_at: string
          currency: string
          damaged_book_penalty: number
          grace_period_days: number
          id: string
          institution_id: string
          loan_period_days: number
          lost_book_penalty: number
          max_books_per_student: number
          max_renewals: number
          overdue_penalty_per_day: number
          renewal_allowed: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          damaged_book_penalty?: number
          grace_period_days?: number
          id?: string
          institution_id: string
          loan_period_days?: number
          lost_book_penalty?: number
          max_books_per_student?: number
          max_renewals?: number
          overdue_penalty_per_day?: number
          renewal_allowed?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          damaged_book_penalty?: number
          grace_period_days?: number
          id?: string
          institution_id?: string
          loan_period_days?: number
          lost_book_penalty?: number
          max_books_per_student?: number
          max_renewals?: number
          overdue_penalty_per_day?: number
          renewal_allowed?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_settings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: true
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      library_teacher_allocation_copies: {
        Row: {
          allocation_id: string
          condition_at_return: string | null
          copy_id: string
          created_at: string
          id: string
          notes: string | null
          returned_at: string | null
          status: string
        }
        Insert: {
          allocation_id: string
          condition_at_return?: string | null
          copy_id: string
          created_at?: string
          id?: string
          notes?: string | null
          returned_at?: string | null
          status?: string
        }
        Update: {
          allocation_id?: string
          condition_at_return?: string | null
          copy_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          returned_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_teacher_allocation_copies_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "library_teacher_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_teacher_allocation_copies_copy_id_fkey"
            columns: ["copy_id"]
            isOneToOne: false
            referencedRelation: "library_book_copies"
            referencedColumns: ["id"]
          },
        ]
      }
      library_teacher_allocations: {
        Row: {
          allocated_at: string
          allocated_by: string
          book_id: string
          class_id: string | null
          created_at: string
          id: string
          institution_id: string
          notes: string | null
          quantity_allocated: number
          quantity_distributed: number
          returned_at: string | null
          status: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          allocated_at?: string
          allocated_by: string
          book_id: string
          class_id?: string | null
          created_at?: string
          id?: string
          institution_id: string
          notes?: string | null
          quantity_allocated?: number
          quantity_distributed?: number
          returned_at?: string | null
          status?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          allocated_at?: string
          allocated_by?: string
          book_id?: string
          class_id?: string | null
          created_at?: string
          id?: string
          institution_id?: string
          notes?: string | null
          quantity_allocated?: number
          quantity_distributed?: number
          returned_at?: string | null
          status?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_teacher_allocations_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_teacher_allocations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_teacher_allocations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_teacher_allocations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string | null
          id: string
          institution_id: string
          is_archived: boolean | null
          last_message_at: string | null
          parent_id: string
          staff_id: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_id: string
          is_archived?: boolean | null
          last_message_at?: string | null
          parent_id: string
          staff_id: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          parent_id?: string
          staff_id?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          failed_count: number | null
          id: string
          institution_id: string
          recipient_filter: Json | null
          recipient_type: string
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          template_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          failed_count?: number | null
          id?: string
          institution_id: string
          recipient_filter?: Json | null
          recipient_type: string
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          template_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          failed_count?: number | null
          id?: string
          institution_id?: string
          recipient_filter?: Json | null
          recipient_type?: string
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      module_activation_history: {
        Row: {
          action: string
          activated_by: string | null
          billing_tier: string | null
          created_at: string | null
          effective_from: string | null
          effective_until: string | null
          id: string
          institution_id: string
          module_id: string
          monthly_price: number | null
          new_status: boolean | null
          previous_status: boolean | null
          reason: string | null
        }
        Insert: {
          action: string
          activated_by?: string | null
          billing_tier?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          institution_id: string
          module_id: string
          monthly_price?: number | null
          new_status?: boolean | null
          previous_status?: boolean | null
          reason?: string | null
        }
        Update: {
          action?: string
          activated_by?: string | null
          billing_tier?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          institution_id?: string
          module_id?: string
          monthly_price?: number | null
          new_status?: boolean | null
          previous_status?: boolean | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_activation_history_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      module_pricing: {
        Row: {
          base_annual_price: number | null
          base_monthly_price: number | null
          base_termly_price: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          max_usage_limit: number | null
          module_id: string
          original_annual_price: number | null
          original_monthly_price: number | null
          original_termly_price: number | null
          original_tier: string | null
          requires_modules: string[] | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          base_annual_price?: number | null
          base_monthly_price?: number | null
          base_termly_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          max_usage_limit?: number | null
          module_id: string
          original_annual_price?: number | null
          original_monthly_price?: number | null
          original_termly_price?: number | null
          original_tier?: string | null
          requires_modules?: string[] | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          base_annual_price?: number | null
          base_monthly_price?: number | null
          base_termly_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          max_usage_limit?: number | null
          module_id?: string
          original_annual_price?: number | null
          original_monthly_price?: number | null
          original_termly_price?: number | null
          original_tier?: string | null
          requires_modules?: string[] | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      module_pricing_overrides: {
        Row: {
          approved_by: string | null
          created_at: string | null
          custom_price: number
          id: string
          institution_id: string
          module_id: string
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          custom_price: number
          id?: string
          institution_id: string
          module_id: string
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          custom_price?: number
          id?: string
          institution_id?: string
          module_id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_pricing_overrides_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      mpesa_stk_requests: {
        Row: {
          amount: number
          callback_received_at: string | null
          checkout_request_id: string | null
          created_at: string
          id: string
          institution_id: string
          invoice_id: string | null
          last_retry_at: string | null
          merchant_request_id: string | null
          metadata: Json | null
          mpesa_receipt: string | null
          phone_number: string
          result_code: string | null
          result_desc: string | null
          retry_count: number | null
          status: string
          student_id: string
          transaction_date: string | null
          triggered_by: string
          updated_at: string
        }
        Insert: {
          amount: number
          callback_received_at?: string | null
          checkout_request_id?: string | null
          created_at?: string
          id?: string
          institution_id: string
          invoice_id?: string | null
          last_retry_at?: string | null
          merchant_request_id?: string | null
          metadata?: Json | null
          mpesa_receipt?: string | null
          phone_number: string
          result_code?: string | null
          result_desc?: string | null
          retry_count?: number | null
          status?: string
          student_id: string
          transaction_date?: string | null
          triggered_by?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          callback_received_at?: string | null
          checkout_request_id?: string | null
          created_at?: string
          id?: string
          institution_id?: string
          invoice_id?: string | null
          last_retry_at?: string | null
          merchant_request_id?: string | null
          metadata?: Json | null
          mpesa_receipt?: string | null
          phone_number?: string
          result_code?: string | null
          result_desc?: string | null
          retry_count?: number | null
          status?: string
          student_id?: string
          transaction_date?: string | null
          triggered_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_stk_requests_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_stk_requests_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_stk_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channel: string
          created_at: string
          id: string
          institution_id: string
          is_opted_in: boolean
          opted_out_at: string | null
          opted_out_reason: string | null
          parent_id: string
          updated_at: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          institution_id: string
          is_opted_in?: boolean
          opted_out_at?: string | null
          opted_out_reason?: string | null
          parent_id: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          institution_id?: string
          is_opted_in?: boolean
          opted_out_at?: string | null
          opted_out_reason?: string | null
          parent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          institution_id: string
          max_retries: number
          message: string
          metadata: Json | null
          notification_type: string
          priority: number
          processed_at: string | null
          recipient_id: string
          recipient_type: string
          reference_id: string | null
          reference_type: string | null
          retry_count: number
          scheduled_at: string
          status: string
          subject: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          institution_id: string
          max_retries?: number
          message: string
          metadata?: Json | null
          notification_type: string
          priority?: number
          processed_at?: string | null
          recipient_id: string
          recipient_type: string
          reference_id?: string | null
          reference_type?: string | null
          retry_count?: number
          scheduled_at?: string
          status?: string
          subject?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          institution_id?: string
          max_retries?: number
          message?: string
          metadata?: Json | null
          notification_type?: string
          priority?: number
          processed_at?: string | null
          recipient_id?: string
          recipient_type?: string
          reference_id?: string | null
          reference_type?: string | null
          retry_count?: number
          scheduled_at?: string
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_rate_limits: {
        Row: {
          channel: string
          count: number
          created_at: string
          id: string
          institution_id: string
          last_sent_at: string | null
          notification_date: string
          recipient_id: string
          recipient_type: string
        }
        Insert: {
          channel: string
          count?: number
          created_at?: string
          id?: string
          institution_id: string
          last_sent_at?: string | null
          notification_date?: string
          recipient_id: string
          recipient_type: string
        }
        Update: {
          channel?: string
          count?: number
          created_at?: string
          id?: string
          institution_id?: string
          last_sent_at?: string | null
          notification_date?: string
          recipient_id?: string
          recipient_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_rate_limits_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          completed_steps: string[] | null
          created_at: string | null
          current_step: string
          id: string
          institution_id: string
          is_locked: boolean | null
          started_at: string | null
          step_data: Json | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          id?: string
          institution_id: string
          is_locked?: boolean | null
          started_at?: string | null
          step_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          id?: string
          institution_id?: string
          is_locked?: boolean | null
          started_at?: string | null
          step_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: true
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_balances: {
        Row: {
          admission_number: string
          amount: number
          balance_date: string
          created_at: string | null
          description: string | null
          id: string
          import_id: string | null
          institution_id: string
          student_id: string | null
        }
        Insert: {
          admission_number: string
          amount: number
          balance_date: string
          created_at?: string | null
          description?: string | null
          id?: string
          import_id?: string | null
          institution_id: string
          student_id?: string | null
        }
        Update: {
          admission_number?: string
          amount?: number
          balance_date?: string
          created_at?: string | null
          description?: string | null
          id?: string
          import_id?: string | null
          institution_id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_balances_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "data_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_balances_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_balances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          attempts: number | null
          code_hash: string
          created_at: string | null
          entity_id: string
          expires_at: string
          id: string
          institution_id: string | null
          phone: string
          user_type: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          code_hash: string
          created_at?: string | null
          entity_id: string
          expires_at: string
          id?: string
          institution_id?: string | null
          phone: string
          user_type: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          code_hash?: string
          created_at?: string | null
          entity_id?: string
          expires_at?: string
          id?: string
          institution_id?: string | null
          phone?: string
          user_type?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "otp_codes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          parent_id: string
          token_hash: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          parent_id: string
          token_hash: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          parent_id?: string
          token_hash?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_sessions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          address: string | null
          alternate_phone: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          imported_from: string | null
          institution_id: string
          is_demo_showcase: boolean | null
          is_primary_contact: boolean | null
          last_login_at: string | null
          last_name: string
          metadata: Json | null
          occupation: string | null
          phone: string
          portal_enabled: boolean | null
          relationship_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          alternate_phone?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          imported_from?: string | null
          institution_id: string
          is_demo_showcase?: boolean | null
          is_primary_contact?: boolean | null
          last_login_at?: string | null
          last_name: string
          metadata?: Json | null
          occupation?: string | null
          phone: string
          portal_enabled?: boolean | null
          relationship_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          alternate_phone?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          imported_from?: string | null
          institution_id?: string
          is_demo_showcase?: boolean | null
          is_primary_contact?: boolean | null
          last_login_at?: string | null
          last_name?: string
          metadata?: Json | null
          occupation?: string | null
          phone?: string
          portal_enabled?: boolean | null
          relationship_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parents_imported_from_fkey"
            columns: ["imported_from"]
            isOneToOne: false
            referencedRelation: "data_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parents_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_allocations: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          payment_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          payment_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "student_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_commitments: {
        Row: {
          committed_amount: number
          committed_date: string
          created_at: string
          fulfilled_at: string | null
          id: string
          institution_id: string
          invoice_id: string
          notes: string | null
          parent_id: string
          reminder_days_before: number[] | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          committed_amount: number
          committed_date: string
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          institution_id: string
          invoice_id: string
          notes?: string | null
          parent_id: string
          reminder_days_before?: number[] | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          committed_amount?: number
          committed_date?: string
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          institution_id?: string
          invoice_id?: string
          notes?: string | null
          parent_id?: string
          reminder_days_before?: number[] | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_commitments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commitments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commitments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commitments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_vouchers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_account_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cashbook_entry_id: string | null
          checked_at: string | null
          checked_by: string | null
          cheque_date: string | null
          cheque_number: string | null
          created_at: string
          currency: string
          description: string
          fund_id: string | null
          id: string
          institution_id: string
          journal_entry_id: string | null
          paid_at: string | null
          paid_by: string | null
          payee_id: string | null
          payee_name: string
          payee_type: string
          payment_method: string | null
          prepared_at: string
          prepared_by: string
          purpose: string | null
          rejection_reason: string | null
          secondary_approved_at: string | null
          secondary_approved_by: string | null
          status: string
          supporting_documents: Json | null
          total_amount: number
          updated_at: string
          voucher_date: string
          voucher_number: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cashbook_entry_id?: string | null
          checked_at?: string | null
          checked_by?: string | null
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          currency?: string
          description: string
          fund_id?: string | null
          id?: string
          institution_id: string
          journal_entry_id?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payee_id?: string | null
          payee_name: string
          payee_type: string
          payment_method?: string | null
          prepared_at?: string
          prepared_by: string
          purpose?: string | null
          rejection_reason?: string | null
          secondary_approved_at?: string | null
          secondary_approved_by?: string | null
          status?: string
          supporting_documents?: Json | null
          total_amount: number
          updated_at?: string
          voucher_date: string
          voucher_number: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cashbook_entry_id?: string | null
          checked_at?: string | null
          checked_by?: string | null
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          currency?: string
          description?: string
          fund_id?: string | null
          id?: string
          institution_id?: string
          journal_entry_id?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payee_id?: string | null
          payee_name?: string
          payee_type?: string
          payment_method?: string | null
          prepared_at?: string
          prepared_by?: string
          purpose?: string | null
          rejection_reason?: string | null
          secondary_approved_at?: string | null
          secondary_approved_by?: string | null
          status?: string
          supporting_documents?: Json | null
          total_amount?: number
          updated_at?: string
          voucher_date?: string
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_vouchers_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_cashbook_entry_id_fkey"
            columns: ["cashbook_entry_id"]
            isOneToOne: false
            referencedRelation: "cashbook_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          institution_id: string
          invoice_id: string | null
          metadata: Json | null
          notes: string | null
          payment_method: string | null
          recorded_by: string | null
          status: string | null
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          institution_id: string
          invoice_id?: string | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          recorded_by?: string | null
          status?: string | null
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          institution_id?: string
          invoice_id?: string | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          recorded_by?: string | null
          status?: string | null
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_country_templates: {
        Row: {
          calculation_formula: Json
          calculation_order: number | null
          calculation_type: string
          category: string
          country_code: string
          created_at: string | null
          deduction_code: string
          default_amount: number | null
          description: string | null
          effective_from: string
          effective_to: string | null
          employer_contribution_rate: number | null
          id: string
          name: string
          reduces_taxable_income: boolean | null
          updated_at: string | null
        }
        Insert: {
          calculation_formula: Json
          calculation_order?: number | null
          calculation_type?: string
          category?: string
          country_code: string
          created_at?: string | null
          deduction_code: string
          default_amount?: number | null
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          employer_contribution_rate?: number | null
          id?: string
          name: string
          reduces_taxable_income?: boolean | null
          updated_at?: string | null
        }
        Update: {
          calculation_formula?: Json
          calculation_order?: number | null
          calculation_type?: string
          category?: string
          country_code?: string
          created_at?: string | null
          deduction_code?: string
          default_amount?: number | null
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          employer_contribution_rate?: number | null
          id?: string
          name?: string
          reduces_taxable_income?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payroll_runs: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          month: number
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          status: string
          total_deductions: number
          total_gross: number
          total_net: number
          total_staff: number
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          month: number
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          total_deductions?: number
          total_gross?: number
          total_net?: number
          total_staff?: number
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          month?: number
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          total_deductions?: number
          total_gross?: number
          total_net?: number
          total_staff?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_settings: {
        Row: {
          auto_generate: boolean
          created_at: string
          currency: string
          id: string
          institution_id: string
          pay_day: number
          updated_at: string
        }
        Insert: {
          auto_generate?: boolean
          created_at?: string
          currency?: string
          id?: string
          institution_id: string
          pay_day?: number
          updated_at?: string
        }
        Update: {
          auto_generate?: boolean
          created_at?: string
          currency?: string
          id?: string
          institution_id?: string
          pay_day?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_settings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: true
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      payslip_items: {
        Row: {
          amount: number
          created_at: string
          id: string
          item_type: string
          name: string
          payslip_id: string
          type_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          item_type: string
          name: string
          payslip_id: string
          type_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          item_type?: string
          name?: string
          payslip_id?: string
          type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslip_items_payslip_id_fkey"
            columns: ["payslip_id"]
            isOneToOne: false
            referencedRelation: "payslips"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          basic_salary: number
          created_at: string
          gross_salary: number
          id: string
          institution_id: string
          net_salary: number
          payment_date: string | null
          payment_method: string | null
          payment_ref: string | null
          payroll_run_id: string
          staff_id: string
          status: string
          total_allowances: number
          total_deductions: number
          updated_at: string
        }
        Insert: {
          basic_salary: number
          created_at?: string
          gross_salary: number
          id?: string
          institution_id: string
          net_salary: number
          payment_date?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          payroll_run_id: string
          staff_id: string
          status?: string
          total_allowances?: number
          total_deductions?: number
          updated_at?: string
        }
        Update: {
          basic_salary?: number
          created_at?: string
          gross_salary?: number
          id?: string
          institution_id?: string
          net_salary?: number
          payment_date?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          payroll_run_id?: string
          staff_id?: string
          status?: string
          total_allowances?: number
          total_deductions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payslips_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      penalty_waiver_requests: {
        Row: {
          applied_penalty_id: string
          created_at: string
          id: string
          institution_id: string
          reason: string
          requested_by: string | null
          requester_type: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          applied_penalty_id: string
          created_at?: string
          id?: string
          institution_id: string
          reason: string
          requested_by?: string | null
          requester_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          applied_penalty_id?: string
          created_at?: string
          id?: string
          institution_id?: string
          reason?: string
          requested_by?: string | null
          requester_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "penalty_waiver_requests_applied_penalty_id_fkey"
            columns: ["applied_penalty_id"]
            isOneToOne: false
            referencedRelation: "applied_penalties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penalty_waiver_requests_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at: string | null
          description: string | null
          domain: Database["public"]["Enums"]["permission_domain"]
          id: string
          is_system: boolean | null
          name: string
        }
        Insert: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at?: string | null
          description?: string | null
          domain: Database["public"]["Enums"]["permission_domain"]
          id?: string
          is_system?: boolean | null
          name: string
        }
        Update: {
          action?: Database["public"]["Enums"]["permission_action"]
          created_at?: string | null
          description?: string | null
          domain?: Database["public"]["Enums"]["permission_domain"]
          id?: string
          is_system?: boolean | null
          name?: string
        }
        Relationships: []
      }
      platform_bank_integrations: {
        Row: {
          api_base_url: string | null
          bank_code: string
          bank_name: string
          created_at: string | null
          credentials: Json | null
          environment: string
          health_status: string | null
          id: string
          is_active: boolean | null
          last_health_check: string | null
          oauth_settings: Json | null
          provider_type: string
          supported_countries: string[] | null
          updated_at: string | null
          webhook_config: Json | null
        }
        Insert: {
          api_base_url?: string | null
          bank_code: string
          bank_name: string
          created_at?: string | null
          credentials?: Json | null
          environment?: string
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          last_health_check?: string | null
          oauth_settings?: Json | null
          provider_type?: string
          supported_countries?: string[] | null
          updated_at?: string | null
          webhook_config?: Json | null
        }
        Update: {
          api_base_url?: string | null
          bank_code?: string
          bank_name?: string
          created_at?: string | null
          credentials?: Json | null
          environment?: string
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          last_health_check?: string | null
          oauth_settings?: Json | null
          provider_type?: string
          supported_countries?: string[] | null
          updated_at?: string | null
          webhook_config?: Json | null
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          is_active: boolean | null
          is_contact_sales: boolean | null
          is_popular: boolean | null
          max_students: number
          min_students: number
          name: string
          representative_count: number
          tier_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order: number
          id?: string
          is_active?: boolean | null
          is_contact_sales?: boolean | null
          is_popular?: boolean | null
          max_students: number
          min_students: number
          name: string
          representative_count: number
          tier_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          is_contact_sales?: boolean | null
          is_popular?: boolean | null
          max_students?: number
          min_students?: number
          name?: string
          representative_count?: number
          tier_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          institution_id: string | null
          is_active: boolean
          last_login_at: string | null
          last_name: string | null
          notification_settings: Json | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
          notification_settings?: Json | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
          notification_settings?: Json | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_bank: {
        Row: {
          cognitive_level: Database["public"]["Enums"]["cognitive_level"]
          correct_answer: string | null
          created_at: string | null
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string | null
          id: string
          image_url: string | null
          institution_id: string
          is_active: boolean | null
          marks: number
          options: Json | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          sub_strand_id: string | null
          subject_id: string
          tags: string[] | null
          topic: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          cognitive_level?: Database["public"]["Enums"]["cognitive_level"]
          correct_answer?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          image_url?: string | null
          institution_id: string
          is_active?: boolean | null
          marks?: number
          options?: Json | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          sub_strand_id?: string | null
          subject_id: string
          tags?: string[] | null
          topic: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          cognitive_level?: Database["public"]["Enums"]["cognitive_level"]
          correct_answer?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          image_url?: string | null
          institution_id?: string
          is_active?: boolean | null
          marks?: number
          options?: Json | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          sub_strand_id?: string | null
          subject_id?: string
          tags?: string[] | null
          topic?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_sub_strand_id_fkey"
            columns: ["sub_strand_id"]
            isOneToOne: false
            referencedRelation: "cbc_sub_strands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliation_records: {
        Row: {
          batch_id: string | null
          created_at: string | null
          exception_notes: string | null
          exception_type: string | null
          external_amount: number
          external_date: string | null
          external_description: string | null
          external_reference: string | null
          id: string
          institution_id: string
          matched_payment_id: string | null
          reconciled_at: string | null
          reconciled_by: string | null
          reconciliation_date: string
          source: string
          status: string
          updated_at: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          exception_notes?: string | null
          exception_type?: string | null
          external_amount: number
          external_date?: string | null
          external_description?: string | null
          external_reference?: string | null
          id?: string
          institution_id: string
          matched_payment_id?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_date: string
          source: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          exception_notes?: string | null
          exception_type?: string | null
          external_amount?: number
          external_date?: string | null
          external_description?: string | null
          external_reference?: string | null
          id?: string
          institution_id?: string
          matched_payment_id?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_date?: string
          source?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_records_matched_payment_id_fkey"
            columns: ["matched_payment_id"]
            isOneToOne: false
            referencedRelation: "student_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_logs: {
        Row: {
          channel: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          institution_id: string
          invoice_id: string | null
          message: string
          parent_id: string | null
          schedule_id: string | null
          sent_at: string | null
          status: string
          student_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          institution_id: string
          invoice_id?: string | null
          message: string
          parent_id?: string | null
          schedule_id?: string | null
          sent_at?: string | null
          status?: string
          student_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          institution_id?: string
          invoice_id?: string | null
          message?: string
          parent_id?: string | null
          schedule_id?: string | null
          sent_at?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "reminder_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_schedules: {
        Row: {
          channels: string[]
          created_at: string
          days_offset: number
          id: string
          institution_id: string
          is_active: boolean
          message_template: string
          metadata: Json | null
          name: string
          notification_category: string | null
          priority: string | null
          reminder_type: string
          send_time: string | null
          target_audience: string | null
          trigger_event: string | null
          updated_at: string
        }
        Insert: {
          channels?: string[]
          created_at?: string
          days_offset?: number
          id?: string
          institution_id: string
          is_active?: boolean
          message_template: string
          metadata?: Json | null
          name: string
          notification_category?: string | null
          priority?: string | null
          reminder_type: string
          send_time?: string | null
          target_audience?: string | null
          trigger_event?: string | null
          updated_at?: string
        }
        Update: {
          channels?: string[]
          created_at?: string
          days_offset?: number
          id?: string
          institution_id?: string
          is_active?: boolean
          message_template?: string
          metadata?: Json | null
          name?: string
          notification_category?: string | null
          priority?: string | null
          reminder_type?: string
          send_time?: string | null
          target_audience?: string | null
          trigger_event?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_schedules_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      report_exports: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string | null
          file_url: string | null
          format: string
          id: string
          institution_id: string
          report_type: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name?: string | null
          file_url?: string | null
          format: string
          id?: string
          institution_id: string
          report_type: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string | null
          file_url?: string | null
          format?: string
          id?: string
          institution_id?: string
          report_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_exports_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      result_releases: {
        Row: {
          academic_year_id: string | null
          assignment_id: string | null
          class_id: string | null
          created_at: string | null
          exam_id: string | null
          id: string
          institution_id: string
          notes: string | null
          notify_parents: boolean | null
          notify_students: boolean | null
          release_type: string
          released_at: string | null
          released_by: string
          subject_id: string | null
          term_id: string | null
        }
        Insert: {
          academic_year_id?: string | null
          assignment_id?: string | null
          class_id?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          institution_id: string
          notes?: string | null
          notify_parents?: boolean | null
          notify_students?: boolean | null
          release_type: string
          released_at?: string | null
          released_by: string
          subject_id?: string | null
          term_id?: string | null
        }
        Update: {
          academic_year_id?: string | null
          assignment_id?: string | null
          class_id?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          institution_id?: string
          notes?: string | null
          notify_parents?: boolean | null
          notify_students?: boolean | null
          release_type?: string
          released_at?: string | null
          released_by?: string
          subject_id?: string | null
          term_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "result_releases_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_releases_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_releases_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_releases_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_releases_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_releases_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_releases_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          institution_id: string | null
          permission_id: string
          role: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          institution_id?: string | null
          permission_id: string
          role: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          institution_id?: string | null
          permission_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          building: string | null
          capacity: number | null
          created_at: string | null
          facilities: string[] | null
          floor: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          room_type: string | null
          updated_at: string | null
        }
        Insert: {
          building?: string | null
          capacity?: number | null
          created_at?: string | null
          facilities?: string[] | null
          floor?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          room_type?: string | null
          updated_at?: string | null
        }
        Update: {
          building?: string | null
          capacity?: number | null
          created_at?: string | null
          facilities?: string[] | null
          floor?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          room_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_structures: {
        Row: {
          base_salary: number
          created_at: string
          description: string | null
          id: string
          institution_id: string
          is_active: boolean
          max_salary: number | null
          min_salary: number | null
          name: string
          updated_at: string
        }
        Insert: {
          base_salary: number
          created_at?: string
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          max_salary?: number | null
          min_salary?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          base_salary?: number
          created_at?: string
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          max_salary?: number | null
          min_salary?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_structures_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_reports: {
        Row: {
          config: Json | null
          created_at: string
          created_by: string | null
          id: string
          institution_id: string
          name: string
          report_type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          institution_id: string
          name: string
          report_type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          institution_id?: string
          name?: string
          report_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_reports_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_backups: {
        Row: {
          created_at: string
          created_by: string | null
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          include_modules: string[]
          institution_id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          notify_emails: string[]
          time_of_day: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          include_modules?: string[]
          institution_id: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notify_emails?: string[]
          time_of_day?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          include_modules?: string[]
          institution_id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notify_emails?: string[]
          time_of_day?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_backups_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_notifications: {
        Row: {
          channels: string[]
          created_at: string
          created_by: string | null
          custom_message: string | null
          error_message: string | null
          id: string
          institution_id: string
          last_run_at: string | null
          max_runs: number | null
          message_template_id: string | null
          next_run_at: string | null
          notification_type: string
          priority: string | null
          recurrence_config: Json | null
          run_count: number | null
          schedule_type: string
          scheduled_for: string
          status: string
          target_filter: Json | null
          target_ids: string[] | null
          target_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          channels?: string[]
          created_at?: string
          created_by?: string | null
          custom_message?: string | null
          error_message?: string | null
          id?: string
          institution_id: string
          last_run_at?: string | null
          max_runs?: number | null
          message_template_id?: string | null
          next_run_at?: string | null
          notification_type: string
          priority?: string | null
          recurrence_config?: Json | null
          run_count?: number | null
          schedule_type?: string
          scheduled_for: string
          status?: string
          target_filter?: Json | null
          target_ids?: string[] | null
          target_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          channels?: string[]
          created_at?: string
          created_by?: string | null
          custom_message?: string | null
          error_message?: string | null
          id?: string
          institution_id?: string
          last_run_at?: string | null
          max_runs?: number | null
          message_template_id?: string | null
          next_run_at?: string | null
          notification_type?: string
          priority?: string | null
          recurrence_config?: Json | null
          run_count?: number | null
          schedule_type?: string
          scheduled_for?: string
          status?: string
          target_filter?: Json | null
          target_ids?: string[] | null
          target_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_notifications_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_notifications_message_template_id_fkey"
            columns: ["message_template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_entries: {
        Row: {
          assessment_methods: Json | null
          created_at: string | null
          id: string
          learning_activities: Json | null
          lessons_allocated: number | null
          objectives: Json | null
          remarks: string | null
          scheme_id: string
          strand_id: string | null
          sub_strand_id: string | null
          sub_topic: string | null
          teaching_resources: Json | null
          topic: string
          updated_at: string | null
          week_number: number
        }
        Insert: {
          assessment_methods?: Json | null
          created_at?: string | null
          id?: string
          learning_activities?: Json | null
          lessons_allocated?: number | null
          objectives?: Json | null
          remarks?: string | null
          scheme_id: string
          strand_id?: string | null
          sub_strand_id?: string | null
          sub_topic?: string | null
          teaching_resources?: Json | null
          topic: string
          updated_at?: string | null
          week_number: number
        }
        Update: {
          assessment_methods?: Json | null
          created_at?: string | null
          id?: string
          learning_activities?: Json | null
          lessons_allocated?: number | null
          objectives?: Json | null
          remarks?: string | null
          scheme_id?: string
          strand_id?: string | null
          sub_strand_id?: string | null
          sub_topic?: string | null
          teaching_resources?: Json | null
          topic?: string
          updated_at?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "scheme_entries_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes_of_work"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_entries_strand_id_fkey"
            columns: ["strand_id"]
            isOneToOne: false
            referencedRelation: "cbc_strands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_entries_sub_strand_id_fkey"
            columns: ["sub_strand_id"]
            isOneToOne: false
            referencedRelation: "cbc_sub_strands"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes_of_work: {
        Row: {
          academic_year_id: string
          approved_at: string | null
          approved_by: string | null
          class_id: string
          created_at: string | null
          description: string | null
          id: string
          institution_id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["scheme_status"] | null
          subject_id: string
          submitted_at: string | null
          teacher_id: string | null
          term_id: string
          title: string
          total_weeks: number
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          approved_at?: string | null
          approved_by?: string | null
          class_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["scheme_status"] | null
          subject_id: string
          submitted_at?: string | null
          teacher_id?: string | null
          term_id: string
          title: string
          total_weeks?: number
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          approved_at?: string | null
          approved_by?: string | null
          class_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["scheme_status"] | null
          subject_id?: string
          submitted_at?: string | null
          teacher_id?: string | null
          term_id?: string
          title?: string
          total_weeks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schemes_of_work_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schemes_of_work_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schemes_of_work_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schemes_of_work_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schemes_of_work_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schemes_of_work_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schemes_of_work_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_fee_catalog: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          is_required: boolean
          name: string
          price_type: string
          service_type: string
          unit_label: string | null
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name: string
          price_type?: string
          service_type: string
          unit_label?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name?: string
          price_type?: string
          service_type?: string
          unit_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sms_bundles: {
        Row: {
          bonus_credits: number
          created_at: string
          credits: number
          currency: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          bonus_credits?: number
          created_at?: string
          credits: number
          currency?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          bonus_credits?: number
          created_at?: string
          credits?: number
          currency?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      sms_credit_purchases: {
        Row: {
          amount: number
          bundle_id: string
          callback_received_at: string | null
          checkout_request_id: string | null
          created_at: string | null
          created_by: string | null
          credits_to_add: number
          id: string
          institution_id: string
          merchant_request_id: string | null
          mpesa_receipt: string | null
          phone_number: string
          result_code: string | null
          result_desc: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bundle_id: string
          callback_received_at?: string | null
          checkout_request_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credits_to_add: number
          id?: string
          institution_id: string
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          phone_number: string
          result_code?: string | null
          result_desc?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bundle_id?: string
          callback_received_at?: string | null
          checkout_request_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credits_to_add?: number
          id?: string
          institution_id?: string
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          phone_number?: string
          result_code?: string | null
          result_desc?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_credit_purchases_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "sms_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_credit_purchases_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_credit_transactions: {
        Row: {
          balance_after: number
          bundle_id: string | null
          created_at: string
          created_by: string | null
          credits: number
          description: string | null
          id: string
          institution_id: string
          payment_id: string | null
          sms_log_id: string | null
          transaction_type: string
        }
        Insert: {
          balance_after: number
          bundle_id?: string | null
          created_at?: string
          created_by?: string | null
          credits: number
          description?: string | null
          id?: string
          institution_id: string
          payment_id?: string | null
          sms_log_id?: string | null
          transaction_type: string
        }
        Update: {
          balance_after?: number
          bundle_id?: string | null
          created_at?: string
          created_by?: string | null
          credits?: number
          description?: string | null
          id?: string
          institution_id?: string
          payment_id?: string | null
          sms_log_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_credit_transactions_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "sms_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_credit_transactions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_credit_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "institution_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          institution_id: string | null
          message: string
          message_type: string
          provider_response: Json | null
          recipient_name: string | null
          recipient_phone: string
          recipient_type: string | null
          sent_at: string | null
          status: string | null
          unique_identifier: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          institution_id?: string | null
          message: string
          message_type: string
          provider_response?: Json | null
          recipient_name?: string | null
          recipient_phone: string
          recipient_type?: string | null
          sent_at?: string | null
          status?: string | null
          unique_identifier?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          institution_id?: string | null
          message?: string
          message_type?: string
          provider_response?: Json | null
          recipient_name?: string | null
          recipient_phone?: string
          recipient_type?: string | null
          sent_at?: string | null
          status?: string | null
          unique_identifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_settings: {
        Row: {
          api_url: string
          created_at: string | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          promotional_sender_id: string | null
          promotional_sender_type: number | null
          provider: string
          sender_name: string
          transactional_sender_id: string | null
          transactional_sender_type: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          api_url: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          promotional_sender_id?: string | null
          promotional_sender_type?: number | null
          provider?: string
          sender_name: string
          transactional_sender_id?: string | null
          transactional_sender_type?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          api_url?: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          promotional_sender_id?: string | null
          promotional_sender_type?: number | null
          provider?: string
          sender_name?: string
          transactional_sender_id?: string | null
          transactional_sender_type?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_settings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string | null
          date_joined: string | null
          date_left: string | null
          deleted_at: string | null
          department: string | null
          designation: string | null
          email: string | null
          employee_number: string
          employment_type: string | null
          first_name: string
          id: string
          imported_from: string | null
          institution_id: string
          is_active: boolean | null
          is_demo_showcase: boolean | null
          last_name: string
          metadata: Json | null
          middle_name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_joined?: string | null
          date_left?: string | null
          deleted_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          employee_number: string
          employment_type?: string | null
          first_name: string
          id?: string
          imported_from?: string | null
          institution_id: string
          is_active?: boolean | null
          is_demo_showcase?: boolean | null
          last_name: string
          metadata?: Json | null
          middle_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_joined?: string | null
          date_left?: string | null
          deleted_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          employee_number?: string
          employment_type?: string | null
          first_name?: string
          id?: string
          imported_from?: string | null
          institution_id?: string
          is_active?: boolean | null
          is_demo_showcase?: boolean | null
          last_name?: string
          metadata?: Json | null
          middle_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_imported_from_fkey"
            columns: ["imported_from"]
            isOneToOne: false
            referencedRelation: "data_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_allowances: {
        Row: {
          allowance_type_id: string
          amount: number
          calculation_type: string
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          institution_id: string
          is_active: boolean
          staff_id: string
          updated_at: string
        }
        Insert: {
          allowance_type_id: string
          amount: number
          calculation_type?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          staff_id: string
          updated_at?: string
        }
        Update: {
          allowance_type_id?: string
          amount?: number
          calculation_type?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_allowances_allowance_type_id_fkey"
            columns: ["allowance_type_id"]
            isOneToOne: false
            referencedRelation: "allowance_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_allowances_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_allowances_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_deductions: {
        Row: {
          amount: number
          calculation_type: string
          created_at: string
          deduction_type_id: string
          effective_from: string
          effective_to: string | null
          id: string
          institution_id: string
          is_active: boolean
          staff_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          calculation_type?: string
          created_at?: string
          deduction_type_id: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          staff_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          calculation_type?: string
          created_at?: string
          deduction_type_id?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_deductions_deduction_type_id_fkey"
            columns: ["deduction_type_id"]
            isOneToOne: false
            referencedRelation: "deduction_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_deductions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_deductions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_module_access: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          institution_id: string
          module_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          institution_id: string
          module_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          institution_id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_module_access_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_salaries: {
        Row: {
          basic_salary: number
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          institution_id: string
          is_current: boolean
          salary_structure_id: string | null
          staff_id: string
          updated_at: string
        }
        Insert: {
          basic_salary: number
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          institution_id: string
          is_current?: boolean
          salary_structure_id?: string | null
          staff_id: string
          updated_at?: string
        }
        Update: {
          basic_salary?: number
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          institution_id?: string
          is_current?: boolean
          salary_structure_id?: string | null
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_salaries_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_salaries_salary_structure_id_fkey"
            columns: ["salary_structure_id"]
            isOneToOne: false
            referencedRelation: "salary_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_salaries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      student_diary_entries: {
        Row: {
          activities: string[] | null
          attachments: Json | null
          created_at: string
          created_by: string | null
          entry_date: string
          entry_type: string
          id: string
          institution_id: string
          is_flagged: boolean | null
          learning_highlights: string | null
          meals: Json | null
          mood: string | null
          nap_duration_minutes: number | null
          parent_acknowledged_at: string | null
          parent_comment: string | null
          student_id: string
          teacher_comment: string | null
          updated_at: string
        }
        Insert: {
          activities?: string[] | null
          attachments?: Json | null
          created_at?: string
          created_by?: string | null
          entry_date?: string
          entry_type?: string
          id?: string
          institution_id: string
          is_flagged?: boolean | null
          learning_highlights?: string | null
          meals?: Json | null
          mood?: string | null
          nap_duration_minutes?: number | null
          parent_acknowledged_at?: string | null
          parent_comment?: string | null
          student_id: string
          teacher_comment?: string | null
          updated_at?: string
        }
        Update: {
          activities?: string[] | null
          attachments?: Json | null
          created_at?: string
          created_by?: string | null
          entry_date?: string
          entry_type?: string
          id?: string
          institution_id?: string
          is_flagged?: boolean | null
          learning_highlights?: string | null
          meals?: Json | null
          mood?: string | null
          nap_duration_minutes?: number | null
          parent_acknowledged_at?: string | null
          parent_comment?: string | null
          student_id?: string
          teacher_comment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_diary_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_diary_entries_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_diary_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_discounts: {
        Row: {
          amount_applied: number
          applied_by: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          discount_id: string
          id: string
          institution_id: string
          invoice_id: string | null
          notes: string | null
          status: string
          student_id: string
        }
        Insert: {
          amount_applied: number
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          discount_id: string
          id?: string
          institution_id: string
          invoice_id?: string | null
          notes?: string | null
          status?: string
          student_id: string
        }
        Update: {
          amount_applied?: number
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          discount_id?: string
          id?: string
          institution_id?: string
          invoice_id?: string | null
          notes?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_discounts_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "fee_discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_discounts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_discounts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "student_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_discounts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_accounts: {
        Row: {
          class: string | null
          created_at: string | null
          id: string
          institution_id: string
          last_payment_date: string | null
          status: string | null
          student_id: string
          student_name: string
          total_fees: number | null
          total_paid: number | null
          updated_at: string | null
        }
        Insert: {
          class?: string | null
          created_at?: string | null
          id?: string
          institution_id: string
          last_payment_date?: string | null
          status?: string | null
          student_id: string
          student_name: string
          total_fees?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Update: {
          class?: string | null
          created_at?: string | null
          id?: string
          institution_id?: string
          last_payment_date?: string | null
          status?: string | null
          student_id?: string
          student_name?: string
          total_fees?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_accounts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_invoices: {
        Row: {
          academic_year_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string | null
          currency: string | null
          due_date: string
          id: string
          institution_id: string
          invoice_number: string
          notes: string | null
          posted_at: string | null
          posted_by: string | null
          status: string | null
          student_id: string
          term_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          currency?: string | null
          due_date: string
          id?: string
          institution_id: string
          invoice_number: string
          notes?: string | null
          posted_at?: string | null
          posted_by?: string | null
          status?: string | null
          student_id: string
          term_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string
          id?: string
          institution_id?: string
          invoice_number?: string
          notes?: string | null
          posted_at?: string | null
          posted_by?: string | null
          status?: string | null
          student_id?: string
          term_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_invoices_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_invoices_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_invoices_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      student_parents: {
        Row: {
          can_pickup: boolean | null
          created_at: string | null
          emergency_contact: boolean | null
          id: string
          institution_id: string
          is_primary: boolean | null
          parent_id: string
          relationship: string
          student_id: string
        }
        Insert: {
          can_pickup?: boolean | null
          created_at?: string | null
          emergency_contact?: boolean | null
          id?: string
          institution_id: string
          is_primary?: boolean | null
          parent_id: string
          relationship: string
          student_id: string
        }
        Update: {
          can_pickup?: boolean | null
          created_at?: string | null
          emergency_contact?: boolean | null
          id?: string
          institution_id?: string
          is_primary?: boolean | null
          parent_id?: string
          relationship?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_parents_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          institution_id: string
          is_historical: boolean | null
          metadata: Json | null
          notes: string | null
          payment_date: string
          payment_method: string
          receipt_number: string
          received_by: string | null
          reversal_reason: string | null
          reversed_at: string | null
          reversed_by: string | null
          source_receipt_number: string | null
          status: string | null
          student_id: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_id: string
          is_historical?: boolean | null
          metadata?: Json | null
          notes?: string | null
          payment_date: string
          payment_method: string
          receipt_number: string
          received_by?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          source_receipt_number?: string | null
          status?: string | null
          student_id: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_id?: string
          is_historical?: boolean | null
          metadata?: Json | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_number?: string
          received_by?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          source_receipt_number?: string | null
          status?: string | null
          student_id?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_payments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_scores: {
        Row: {
          created_at: string | null
          entered_by: string | null
          exam_id: string
          grade: string | null
          id: string
          imported_at: string | null
          institution_id: string
          is_historical: boolean | null
          marks: number | null
          remarks: string | null
          source_system: string | null
          status: string | null
          student_id: string
          subject_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entered_by?: string | null
          exam_id: string
          grade?: string | null
          id?: string
          imported_at?: string | null
          institution_id: string
          is_historical?: boolean | null
          marks?: number | null
          remarks?: string | null
          source_system?: string | null
          status?: string | null
          student_id: string
          subject_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entered_by?: string | null
          exam_id?: string
          grade?: string | null
          id?: string
          imported_at?: string | null
          institution_id?: string
          is_historical?: boolean | null
          marks?: number | null
          remarks?: string | null
          source_system?: string | null
          status?: string | null
          student_id?: string
          subject_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_scores_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scores_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scores_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          student_id: string
          token_hash: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          student_id: string
          token_hash: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          student_id?: string
          token_hash?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_strand_assessments: {
        Row: {
          academic_year_id: string | null
          assessed_at: string | null
          assessed_by: string | null
          created_at: string | null
          exam_id: string | null
          id: string
          institution_id: string
          rubric_level: string
          score_percentage: number | null
          student_id: string
          sub_strand_id: string
          teacher_remarks: string | null
          term_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          assessed_at?: string | null
          assessed_by?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          institution_id: string
          rubric_level: string
          score_percentage?: number | null
          student_id: string
          sub_strand_id: string
          teacher_remarks?: string | null
          term_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          assessed_at?: string | null
          assessed_by?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          institution_id?: string
          rubric_level?: string
          score_percentage?: number | null
          student_id?: string
          sub_strand_id?: string
          teacher_remarks?: string | null
          term_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_strand_assessments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_strand_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_strand_assessments_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_strand_assessments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_strand_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_strand_assessments_sub_strand_id_fkey"
            columns: ["sub_strand_id"]
            isOneToOne: false
            referencedRelation: "cbc_sub_strands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_strand_assessments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          admission_date: string | null
          admission_number: string
          boarding_status: string | null
          class_id: string | null
          created_at: string | null
          date_of_birth: string | null
          deleted_at: string | null
          first_name: string
          gender: string | null
          id: string
          imported_from: string | null
          institution_id: string
          is_demo_showcase: boolean | null
          last_name: string
          login_pin: string | null
          medical_info: Json | null
          metadata: Json | null
          middle_name: string | null
          nationality: string | null
          photo_url: string | null
          pin_attempts: number | null
          pin_expires_at: string | null
          portal_enabled: boolean | null
          status: string | null
          transport_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admission_date?: string | null
          admission_number: string
          boarding_status?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          first_name: string
          gender?: string | null
          id?: string
          imported_from?: string | null
          institution_id: string
          is_demo_showcase?: boolean | null
          last_name: string
          login_pin?: string | null
          medical_info?: Json | null
          metadata?: Json | null
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          pin_attempts?: number | null
          pin_expires_at?: string | null
          portal_enabled?: boolean | null
          status?: string | null
          transport_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admission_date?: string | null
          admission_number?: string
          boarding_status?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          imported_from?: string | null
          institution_id?: string
          is_demo_showcase?: boolean | null
          last_name?: string
          login_pin?: string | null
          medical_info?: Json | null
          metadata?: Json | null
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          pin_attempts?: number | null
          pin_expires_at?: string | null
          portal_enabled?: boolean | null
          status?: string | null
          transport_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_imported_from_fkey"
            columns: ["imported_from"]
            isOneToOne: false
            referencedRelation: "data_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          core_modules: string[] | null
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: Database["public"]["Enums"]["subscription_plan"]
          includes_setup_year1: boolean | null
          is_active: boolean
          max_staff: number
          max_students: number
          modules: string[] | null
          name: string
          price_monthly: number
          price_termly: number | null
          price_yearly: number
          supports_tier_pricing: boolean | null
          updated_at: string
        }
        Insert: {
          core_modules?: string[] | null
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id: Database["public"]["Enums"]["subscription_plan"]
          includes_setup_year1?: boolean | null
          is_active?: boolean
          max_staff?: number
          max_students?: number
          modules?: string[] | null
          name: string
          price_monthly?: number
          price_termly?: number | null
          price_yearly?: number
          supports_tier_pricing?: boolean | null
          updated_at?: string
        }
        Update: {
          core_modules?: string[] | null
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: Database["public"]["Enums"]["subscription_plan"]
          includes_setup_year1?: boolean | null
          is_active?: boolean
          max_staff?: number
          max_students?: number
          modules?: string[] | null
          name?: string
          price_monthly?: number
          price_termly?: number | null
          price_yearly?: number
          supports_tier_pricing?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_tier_pricing: {
        Row: {
          annual_subscription: number
          created_at: string
          currency: string
          id: string
          is_active: boolean
          max_students: number
          min_students: number
          ownership_type: Database["public"]["Enums"]["ownership_type"]
          plan_id: Database["public"]["Enums"]["subscription_plan"]
          setup_cost: number
          updated_at: string
        }
        Insert: {
          annual_subscription?: number
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          max_students?: number
          min_students?: number
          ownership_type: Database["public"]["Enums"]["ownership_type"]
          plan_id: Database["public"]["Enums"]["subscription_plan"]
          setup_cost?: number
          updated_at?: string
        }
        Update: {
          annual_subscription?: number
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          max_students?: number
          min_students?: number
          ownership_type?: Database["public"]["Enums"]["ownership_type"]
          plan_id?: Database["public"]["Enums"]["subscription_plan"]
          setup_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_tier_pricing_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_branch: string | null
          bank_name: string | null
          category: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          institution_id: string
          is_active: boolean
          is_approved: boolean
          kra_pin: string | null
          notes: string | null
          payment_terms: string | null
          phone: string | null
          supplier_code: string | null
          supplier_name: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          is_approved?: boolean
          kra_pin?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          supplier_code?: string | null
          supplier_name: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          is_approved?: boolean
          kra_pin?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          supplier_code?: string | null
          supplier_name?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          closed_at: string | null
          created_at: string | null
          created_by: string
          created_by_email: string | null
          description: string
          id: string
          institution_id: string | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          closed_at?: string | null
          created_at?: string | null
          created_by: string
          created_by_email?: string | null
          description: string
          id?: string
          institution_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          closed_at?: string | null
          created_at?: string | null
          created_by?: string
          created_by_email?: string | null
          description?: string
          id?: string
          institution_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          academic_year_id: string
          created_at: string | null
          end_date: string
          id: string
          institution_id: string
          is_current: boolean | null
          name: string
          sequence_order: number
          start_date: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          end_date: string
          id?: string
          institution_id: string
          is_current?: boolean | null
          name: string
          sequence_order: number
          start_date: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          institution_id?: string
          is_current?: boolean | null
          name?: string
          sequence_order?: number
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          sender_id: string
          sender_type: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_id: string
          sender_type: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_responses: {
        Row: {
          created_at: string | null
          created_by: string
          created_by_email: string | null
          id: string
          is_staff_response: boolean | null
          message: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          created_by_email?: string | null
          id?: string
          is_staff_response?: boolean | null
          message: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          created_by_email?: string | null
          id?: string
          is_staff_response?: boolean | null
          message?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          applies_to: string | null
          created_at: string | null
          end_time: string
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          sequence_order: number
          slot_type: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          applies_to?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          sequence_order: number
          slot_type?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          applies_to?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          sequence_order?: number
          slot_type?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_constraints: {
        Row: {
          config: Json
          constraint_type: string
          created_at: string
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          priority: number | null
          updated_at: string
        }
        Insert: {
          config?: Json
          constraint_type: string
          created_at?: string
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          updated_at?: string
        }
        Update: {
          config?: Json
          constraint_type?: string
          created_at?: string
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_constraints_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          class_id: string
          created_at: string | null
          day_of_week: number
          id: string
          institution_id: string
          is_double_period: boolean | null
          notes: string | null
          room_id: string | null
          subject_id: string
          teacher_id: string
          time_slot_id: string
          timetable_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          day_of_week: number
          id?: string
          institution_id: string
          is_double_period?: boolean | null
          notes?: string | null
          room_id?: string | null
          subject_id: string
          teacher_id: string
          time_slot_id: string
          timetable_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          day_of_week?: number
          id?: string
          institution_id?: string
          is_double_period?: boolean | null
          notes?: string | null
          room_id?: string | null
          subject_id?: string
          teacher_id?: string
          time_slot_id?: string
          timetable_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "timetables"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_exceptions: {
        Row: {
          created_at: string | null
          created_by: string | null
          exception_date: string
          exception_type: string
          id: string
          institution_id: string
          reason: string | null
          substitute_room_id: string | null
          substitute_teacher_id: string | null
          timetable_entry_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          exception_date: string
          exception_type: string
          id?: string
          institution_id: string
          reason?: string | null
          substitute_room_id?: string | null
          substitute_teacher_id?: string | null
          timetable_entry_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          exception_date?: string
          exception_type?: string
          id?: string
          institution_id?: string
          reason?: string | null
          substitute_room_id?: string | null
          substitute_teacher_id?: string | null
          timetable_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_exceptions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_exceptions_substitute_room_id_fkey"
            columns: ["substitute_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_exceptions_substitute_teacher_id_fkey"
            columns: ["substitute_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_exceptions_timetable_entry_id_fkey"
            columns: ["timetable_entry_id"]
            isOneToOne: false
            referencedRelation: "timetable_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          academic_year_id: string
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          institution_id: string
          name: string
          notes: string | null
          published_at: string | null
          published_by: string | null
          status: string | null
          term_id: string | null
          timetable_type: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          institution_id: string
          name: string
          notes?: string | null
          published_at?: string | null
          published_by?: string | null
          status?: string | null
          term_id?: string | null
          timetable_type?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          institution_id?: string
          name?: string
          notes?: string | null
          published_at?: string | null
          published_by?: string | null
          status?: string | null
          term_id?: string | null
          timetable_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetables_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_drivers: {
        Row: {
          created_at: string | null
          current_vehicle_id: string | null
          emergency_contact: string | null
          id: string
          institution_id: string
          license_expiry: string | null
          license_number: string | null
          name: string
          phone: string
          photo_url: string | null
          staff_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_vehicle_id?: string | null
          emergency_contact?: string | null
          id?: string
          institution_id: string
          license_expiry?: string | null
          license_number?: string | null
          name: string
          phone: string
          photo_url?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_vehicle_id?: string | null
          emergency_contact?: string | null
          id?: string
          institution_id?: string
          license_expiry?: string | null
          license_number?: string | null
          name?: string
          phone?: string
          photo_url?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_drivers_current_vehicle_id_fkey"
            columns: ["current_vehicle_id"]
            isOneToOne: false
            referencedRelation: "transport_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_drivers_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_drivers_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_fee_configs: {
        Row: {
          academic_year_id: string | null
          both_ways_fee: number
          created_at: string | null
          currency: string | null
          dropoff_only_fee: number | null
          fee_type: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          pickup_only_fee: number | null
          route_id: string | null
          term_id: string | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          academic_year_id?: string | null
          both_ways_fee: number
          created_at?: string | null
          currency?: string | null
          dropoff_only_fee?: number | null
          fee_type?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          pickup_only_fee?: number | null
          route_id?: string | null
          term_id?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          academic_year_id?: string | null
          both_ways_fee?: number
          created_at?: string | null
          currency?: string | null
          dropoff_only_fee?: number | null
          fee_type?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          pickup_only_fee?: number | null
          route_id?: string | null
          term_id?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_fee_configs_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_fee_configs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_fee_configs_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_fee_configs_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_fee_configs_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "transport_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_policy_settings: {
        Row: {
          allow_parent_self_service: boolean | null
          created_at: string | null
          enable_auto_suspension: boolean | null
          id: string
          institution_id: string
          notice_days_before_suspension: number | null
          require_approval_for_subscription: boolean | null
          send_suspension_notice: boolean | null
          suspension_days_overdue: number | null
          suspension_grace_period_days: number | null
          updated_at: string | null
        }
        Insert: {
          allow_parent_self_service?: boolean | null
          created_at?: string | null
          enable_auto_suspension?: boolean | null
          id?: string
          institution_id: string
          notice_days_before_suspension?: number | null
          require_approval_for_subscription?: boolean | null
          send_suspension_notice?: boolean | null
          suspension_days_overdue?: number | null
          suspension_grace_period_days?: number | null
          updated_at?: string | null
        }
        Update: {
          allow_parent_self_service?: boolean | null
          created_at?: string | null
          enable_auto_suspension?: boolean | null
          id?: string
          institution_id?: string
          notice_days_before_suspension?: number | null
          require_approval_for_subscription?: boolean | null
          send_suspension_notice?: boolean | null
          suspension_days_overdue?: number | null
          suspension_grace_period_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_policy_settings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: true
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_routes: {
        Row: {
          arrival_time: string | null
          code: string
          created_at: string | null
          departure_time: string | null
          description: string | null
          distance_km: number | null
          estimated_duration_minutes: number | null
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          route_type: string | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          arrival_time?: string | null
          code: string
          created_at?: string | null
          departure_time?: string | null
          description?: string | null
          distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          route_type?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          arrival_time?: string | null
          code?: string
          created_at?: string | null
          departure_time?: string | null
          description?: string | null
          distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          route_type?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_routes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_routes_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "transport_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_stops: {
        Row: {
          created_at: string | null
          dropoff_time: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          latitude: number | null
          location_description: string | null
          longitude: number | null
          name: string
          pickup_time: string | null
          route_id: string
          stop_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dropoff_time?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          name: string
          pickup_time?: string | null
          route_id: string
          stop_order: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dropoff_time?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          name?: string
          pickup_time?: string | null
          route_id?: string
          stop_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_stops_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_subscription_history: {
        Row: {
          action: string
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          subscription_id: string
        }
        Insert: {
          action: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          subscription_id: string
        }
        Update: {
          action?: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_subscription_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "transport_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_subscriptions: {
        Row: {
          academic_year_id: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          end_date: string | null
          fee_amount: number
          id: string
          institution_id: string
          notes: string | null
          parent_requested: boolean | null
          route_id: string | null
          start_date: string
          status: string | null
          stop_id: string | null
          student_id: string
          subscription_type: string | null
          suspended_at: string | null
          suspended_reason: string | null
          term_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          end_date?: string | null
          fee_amount: number
          id?: string
          institution_id: string
          notes?: string | null
          parent_requested?: boolean | null
          route_id?: string | null
          start_date: string
          status?: string | null
          stop_id?: string | null
          student_id: string
          subscription_type?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          term_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          end_date?: string | null
          fee_amount?: number
          id?: string
          institution_id?: string
          notes?: string | null
          parent_requested?: boolean | null
          route_id?: string | null
          start_date?: string
          status?: string | null
          stop_id?: string | null
          student_id?: string
          subscription_type?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          term_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_subscriptions_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_subscriptions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_subscriptions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_subscriptions_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "transport_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_subscriptions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_subscriptions_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_vehicles: {
        Row: {
          capacity: number
          created_at: string | null
          current_route_id: string | null
          id: string
          inspection_expiry: string | null
          institution_id: string
          insurance_expiry: string | null
          make: string | null
          model: string | null
          notes: string | null
          registration_number: string
          status: string | null
          updated_at: string | null
          vehicle_type: string | null
          year: number | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          current_route_id?: string | null
          id?: string
          inspection_expiry?: string | null
          institution_id: string
          insurance_expiry?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          registration_number: string
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          current_route_id?: string | null
          id?: string
          inspection_expiry?: string | null
          institution_id?: string
          insurance_expiry?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          registration_number?: string
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_vehicles_current_route_id_fkey"
            columns: ["current_route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_vehicles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_zones: {
        Row: {
          base_fee: number
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          base_fee?: number
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          base_fee?: number
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_zones_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          institution_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          institution_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          institution_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      voteheads: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          id: string
          institution_id: string
          is_active: boolean
          name: string
          requires_approval_above: number | null
          updated_at: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          name: string
          requires_approval_above?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          name?: string
          requires_approval_above?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voteheads_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_lines: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          description: string
          id: string
          institution_id: string
          line_order: number
          quantity: number | null
          unit_price: number
          votehead_id: string | null
          voucher_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          description: string
          id?: string
          institution_id: string
          line_order?: number
          quantity?: number | null
          unit_price: number
          votehead_id?: string | null
          voucher_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          description?: string
          id?: string
          institution_id?: string
          line_order?: number
          quantity?: number | null
          unit_price?: number
          votehead_id?: string | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_lines_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_lines_votehead_id_fkey"
            columns: ["votehead_id"]
            isOneToOne: false
            referencedRelation: "voteheads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_lines_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_campus: {
        Args: { _institution_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_role: {
        Args: {
          _institution_id: string
          _target_role: string
          _user_id: string
        }
        Returns: boolean
      }
      check_room_clash: {
        Args: {
          p_day_of_week: number
          p_exclude_entry_id?: string
          p_room_id: string
          p_time_slot_id: string
          p_timetable_id: string
        }
        Returns: boolean
      }
      check_teacher_clash: {
        Args: {
          p_day_of_week: number
          p_exclude_entry_id?: string
          p_teacher_id: string
          p_time_slot_id: string
          p_timetable_id: string
        }
        Returns: boolean
      }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      cleanup_expired_parent_sessions: { Args: never; Returns: undefined }
      cleanup_expired_student_sessions: { Args: never; Returns: undefined }
      generate_accounting_number: {
        Args: {
          p_institution_id: string
          p_prefix: string
          p_table_name: string
        }
        Returns: string
      }
      generate_admission_number: {
        Args: { _institution_id: string }
        Returns: string
      }
      generate_institution_invoice_number: {
        Args: { p_institution_id: string }
        Returns: string
      }
      get_account_balance: {
        Args: { p_account_id: string; p_as_of_date?: string }
        Returns: number
      }
      get_fund_balance: {
        Args: { p_as_of_date?: string; p_fund_id: string }
        Returns: number
      }
      get_parent_institution_id: { Args: { _user_id: string }; Returns: string }
      get_student_institution_id: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_group_campus_ids: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_user_group_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_institution_id: { Args: { _user_id: string }; Returns: string }
      get_user_permissions: {
        Args: { _institution_id?: string; _user_id: string }
        Returns: {
          action: string
          domain: string
          permission_name: string
        }[]
      }
      has_group_role: {
        Args: {
          _group_id?: string
          _role: Database["public"]["Enums"]["group_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_institution_role: {
        Args: {
          _institution_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_module_access: {
        Args: { _institution_id: string; _module_id: string; _user_id: string }
        Returns: boolean
      }
      has_permission: {
        Args: {
          _action: string
          _domain: string
          _institution_id?: string
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_institution_admin: {
        Args: { _institution_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_support_admin: { Args: { _user_id: string }; Returns: boolean }
      parent_linked_to_student: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
      preview_admission_number: {
        Args: { _institution_id: string }
        Returns: string
      }
      user_belongs_to_institution: {
        Args: { _institution_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "institution_admin"
        | "teacher"
        | "accountant"
        | "hr_manager"
        | "parent"
        | "student"
        | "support_admin"
        | "institution_owner"
        | "finance_officer"
        | "academic_director"
        | "ict_admin"
        | "librarian"
        | "coach"
        | "bursar"
      cbc_competency:
        | "communication"
        | "critical_thinking"
        | "creativity"
        | "citizenship"
        | "digital_literacy"
        | "learning_to_learn"
        | "self_efficacy"
      cbc_level:
        | "pp1"
        | "pp2"
        | "grade_1"
        | "grade_2"
        | "grade_3"
        | "grade_4"
        | "grade_5"
        | "grade_6"
        | "grade_7"
        | "grade_8"
        | "grade_9"
        | "grade_10"
        | "grade_11"
        | "grade_12"
      cbc_value:
        | "love"
        | "responsibility"
        | "respect"
        | "unity"
        | "peace"
        | "patriotism"
        | "social_justice"
        | "integrity"
      cognitive_level:
        | "knowledge"
        | "comprehension"
        | "application"
        | "analysis"
        | "synthesis"
        | "evaluation"
      country_code: "KE" | "UG" | "TZ" | "RW" | "NG" | "GH" | "ZA"
      difficulty_level: "easy" | "medium" | "hard"
      exam_paper_status: "draft" | "finalized" | "archived"
      group_role:
        | "group_owner"
        | "group_finance_admin"
        | "group_academic_admin"
        | "group_hr_admin"
        | "group_viewer"
      institution_status:
        | "active"
        | "suspended"
        | "pending"
        | "trial"
        | "churned"
        | "expired"
      institution_type:
        | "primary"
        | "secondary"
        | "tvet"
        | "college"
        | "university"
      lesson_plan_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "revised"
      onboarding_status: "not_started" | "in_progress" | "completed"
      ownership_type: "public" | "private"
      permission_action:
        | "view"
        | "create"
        | "edit"
        | "approve"
        | "delete"
        | "export"
      permission_domain:
        | "students"
        | "academics"
        | "finance"
        | "staff_hr"
        | "communication"
        | "reports"
        | "system_settings"
        | "platform"
        | "library"
        | "activities"
        | "uniforms"
        | "timetable"
        | "transport"
      question_type:
        | "multiple_choice"
        | "short_answer"
        | "long_answer"
        | "fill_blank"
        | "matching"
        | "true_false"
      scheme_status: "draft" | "active" | "archived" | "submitted" | "rejected"
      subscription_plan: "starter" | "professional" | "enterprise" | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "institution_admin",
        "teacher",
        "accountant",
        "hr_manager",
        "parent",
        "student",
        "support_admin",
        "institution_owner",
        "finance_officer",
        "academic_director",
        "ict_admin",
        "librarian",
        "coach",
        "bursar",
      ],
      cbc_competency: [
        "communication",
        "critical_thinking",
        "creativity",
        "citizenship",
        "digital_literacy",
        "learning_to_learn",
        "self_efficacy",
      ],
      cbc_level: [
        "pp1",
        "pp2",
        "grade_1",
        "grade_2",
        "grade_3",
        "grade_4",
        "grade_5",
        "grade_6",
        "grade_7",
        "grade_8",
        "grade_9",
        "grade_10",
        "grade_11",
        "grade_12",
      ],
      cbc_value: [
        "love",
        "responsibility",
        "respect",
        "unity",
        "peace",
        "patriotism",
        "social_justice",
        "integrity",
      ],
      cognitive_level: [
        "knowledge",
        "comprehension",
        "application",
        "analysis",
        "synthesis",
        "evaluation",
      ],
      country_code: ["KE", "UG", "TZ", "RW", "NG", "GH", "ZA"],
      difficulty_level: ["easy", "medium", "hard"],
      exam_paper_status: ["draft", "finalized", "archived"],
      group_role: [
        "group_owner",
        "group_finance_admin",
        "group_academic_admin",
        "group_hr_admin",
        "group_viewer",
      ],
      institution_status: [
        "active",
        "suspended",
        "pending",
        "trial",
        "churned",
        "expired",
      ],
      institution_type: [
        "primary",
        "secondary",
        "tvet",
        "college",
        "university",
      ],
      lesson_plan_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "revised",
      ],
      onboarding_status: ["not_started", "in_progress", "completed"],
      ownership_type: ["public", "private"],
      permission_action: [
        "view",
        "create",
        "edit",
        "approve",
        "delete",
        "export",
      ],
      permission_domain: [
        "students",
        "academics",
        "finance",
        "staff_hr",
        "communication",
        "reports",
        "system_settings",
        "platform",
        "library",
        "activities",
        "uniforms",
        "timetable",
        "transport",
      ],
      question_type: [
        "multiple_choice",
        "short_answer",
        "long_answer",
        "fill_blank",
        "matching",
        "true_false",
      ],
      scheme_status: ["draft", "active", "archived", "submitted", "rejected"],
      subscription_plan: ["starter", "professional", "enterprise", "custom"],
    },
  },
} as const

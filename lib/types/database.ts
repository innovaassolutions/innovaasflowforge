/**
 * Database TypeScript Types
 *
 * Auto-generated types from Supabase database schema.
 * Generated using: mcp__supabase__generate_typescript_types
 *
 * DO NOT EDIT MANUALLY - Regenerate when schema changes.
 *
 * Story: 1.1 - Database & API Foundation
 */

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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_sessions: {
        Row: {
          agent_model: string
          agent_type: string
          conversation_history: Json
          created_at: string
          id: string
          last_message_at: string | null
          metadata: Json | null
          session_context: Json | null
          stakeholder_session_id: string
          system_prompt: string | null
          updated_at: string
        }
        Insert: {
          agent_model?: string
          agent_type: string
          conversation_history?: Json
          created_at?: string
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          session_context?: Json | null
          stakeholder_session_id: string
          system_prompt?: string | null
          updated_at?: string
        }
        Update: {
          agent_model?: string
          agent_type?: string
          conversation_history?: Json
          created_at?: string
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          session_context?: Json | null
          stakeholder_session_id?: string
          system_prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_sessions_stakeholder_session_id_fkey"
            columns: ["stakeholder_session_id"]
            isOneToOne: false
            referencedRelation: "campaign_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_assignments: {
        Row: {
          access_expires_at: string | null
          access_token: string | null
          campaign_id: string
          completed_at: string | null
          created_at: string
          current_question_index: number | null
          has_uploaded_documents: boolean | null
          id: string
          last_activity_at: string | null
          metadata: Json | null
          progress_percentage: number | null
          stakeholder_email: string
          stakeholder_name: string
          stakeholder_profile_id: string | null
          stakeholder_role: string
          stakeholder_title: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_expires_at?: string | null
          access_token?: string | null
          campaign_id: string
          completed_at?: string | null
          created_at?: string
          current_question_index?: number | null
          has_uploaded_documents?: boolean | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          stakeholder_email: string
          stakeholder_name: string
          stakeholder_profile_id?: string | null
          stakeholder_role: string
          stakeholder_title?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_expires_at?: string | null
          access_token?: string | null
          campaign_id?: string
          completed_at?: string | null
          created_at?: string
          current_question_index?: number | null
          has_uploaded_documents?: boolean | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          stakeholder_email?: string
          stakeholder_name?: string
          stakeholder_profile_id?: string | null
          stakeholder_role?: string
          stakeholder_title?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_assignments_stakeholder_profile_id_fkey"
            columns: ["stakeholder_profile_id"]
            isOneToOne: false
            referencedRelation: "stakeholder_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_sessions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_reports: {
        Row: {
          access_count: number
          access_token: string
          campaign_id: string
          consultant_observations: string | null
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          last_accessed_at: string | null
          regenerated_at: string | null
          regeneration_count: number
          report_tier: string
          supporting_documents: Json | null
          synthesis_snapshot: Json
          updated_at: string
        }
        Insert: {
          access_count?: number
          access_token: string
          campaign_id: string
          consultant_observations?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          regenerated_at?: string | null
          regeneration_count?: number
          report_tier: string
          supporting_documents?: Json | null
          synthesis_snapshot: Json
          updated_at?: string
        }
        Update: {
          access_count?: number
          access_token?: string
          campaign_id?: string
          consultant_observations?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          regenerated_at?: string | null
          regeneration_count?: number
          report_tier?: string
          supporting_documents?: Json | null
          synthesis_snapshot?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_reports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_synthesis: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          synthesis_data: Json
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          synthesis_data: Json
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          synthesis_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_synthesis_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          campaign_type: string
          company_industry: string | null
          company_name: string | null
          company_profile_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          education_config: Json | null
          facilitator_email: string
          facilitator_name: string
          id: string
          knowledge_base_ids: string[] | null
          metadata: Json | null
          name: string
          organization_id: string
          report_tier: string | null
          school_id: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_type: string
          company_industry?: string | null
          company_name?: string | null
          company_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          education_config?: Json | null
          facilitator_email: string
          facilitator_name: string
          id?: string
          knowledge_base_ids?: string[] | null
          metadata?: Json | null
          name: string
          organization_id: string
          report_tier?: string | null
          school_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          company_industry?: string | null
          company_name?: string | null
          company_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          education_config?: Json | null
          facilitator_email?: string
          facilitator_name?: string
          id?: string
          knowledge_base_ids?: string[] | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          report_tier?: string | null
          school_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          annual_revenue_range: string | null
          company_name: string
          created_at: string | null
          created_by: string
          description: string | null
          employee_count_range: string | null
          headquarters_location: string | null
          id: string
          industry: string
          market_scope: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          annual_revenue_range?: string | null
          company_name: string
          created_at?: string | null
          created_by: string
          description?: string | null
          employee_count_range?: string | null
          headquarters_location?: string | null
          id?: string
          industry: string
          market_scope?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          annual_revenue_range?: string | null
          company_name?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          employee_count_range?: string | null
          headquarters_location?: string | null
          id?: string
          industry?: string
          market_scope?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          chunk_metadata: Json | null
          chunk_text: string
          created_at: string
          embedding: string | null
          id: string
          session_document_id: string
        }
        Insert: {
          chunk_index: number
          chunk_metadata?: Json | null
          chunk_text: string
          created_at?: string
          embedding?: string | null
          id?: string
          session_document_id: string
        }
        Update: {
          chunk_index?: number
          chunk_metadata?: Json | null
          chunk_text?: string
          created_at?: string
          embedding?: string | null
          id?: string
          session_document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_session_document_id_fkey"
            columns: ["session_document_id"]
            isOneToOne: false
            referencedRelation: "session_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge: {
        Row: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          domain: string
          full_content: string
          id: string
          is_public: boolean | null
          metadata: Json | null
          publication_date: string | null
          source_type: string | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category: string
          created_at?: string
          description?: string | null
          domain: string
          full_content: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          publication_date?: string | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string
          description?: string | null
          domain?: string
          full_content?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          publication_date?: string | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          chunk_metadata: Json | null
          chunk_text: string
          created_at: string
          embedding: string | null
          id: string
          knowledge_id: string
        }
        Insert: {
          chunk_index: number
          chunk_metadata?: Json | null
          chunk_text: string
          created_at?: string
          embedding?: string | null
          id?: string
          knowledge_id: string
        }
        Update: {
          chunk_index?: number
          chunk_metadata?: Json | null
          chunk_text?: string
          created_at?: string
          embedding?: string | null
          id?: string
          knowledge_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          max_campaigns: number | null
          max_stakeholders_per_campaign: number | null
          max_storage_gb: number | null
          metadata: Json | null
          name: string
          plan: string
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          slug: string
          subscription_ends_at: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          max_campaigns?: number | null
          max_stakeholders_per_campaign?: number | null
          max_storage_gb?: number | null
          metadata?: Json | null
          name: string
          plan?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug: string
          subscription_ends_at?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          max_campaigns?: number | null
          max_stakeholders_per_campaign?: number | null
          max_storage_gb?: number | null
          metadata?: Json | null
          name?: string
          plan?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug?: string
          subscription_ends_at?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_documents: {
        Row: {
          agent_insights: Json | null
          agent_questions: Json | null
          analyzed_at: string | null
          created_at: string
          document_name: string
          document_type: string
          extracted_text: string | null
          file_size: number
          id: string
          is_analyzed: boolean | null
          metadata: Json | null
          mime_type: string
          page_count: number | null
          processing_status: string
          stakeholder_session_id: string
          storage_bucket: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          agent_insights?: Json | null
          agent_questions?: Json | null
          analyzed_at?: string | null
          created_at?: string
          document_name: string
          document_type: string
          extracted_text?: string | null
          file_size: number
          id?: string
          is_analyzed?: boolean | null
          metadata?: Json | null
          mime_type: string
          page_count?: number | null
          processing_status?: string
          stakeholder_session_id: string
          storage_bucket?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          agent_insights?: Json | null
          agent_questions?: Json | null
          analyzed_at?: string | null
          created_at?: string
          document_name?: string
          document_type?: string
          extracted_text?: string | null
          file_size?: number
          id?: string
          is_analyzed?: boolean | null
          metadata?: Json | null
          mime_type?: string
          page_count?: number | null
          processing_status?: string
          stakeholder_session_id?: string
          storage_bucket?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_documents_stakeholder_session_id_fkey"
            columns: ["stakeholder_session_id"]
            isOneToOne: false
            referencedRelation: "campaign_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_profiles: {
        Row: {
          company_profile_id: string
          created_at: string | null
          created_by: string
          department: string | null
          email: string
          full_name: string
          id: string
          role_type: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          company_profile_id: string
          created_at?: string | null
          created_by: string
          department?: string | null
          email: string
          full_name: string
          id?: string
          role_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          company_profile_id?: string
          created_at?: string | null
          created_by?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          role_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_profiles_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          campaign_id: string
          created_at: string
          email: string
          id: string
          metadata: Json | null
          name: string
          role: string
          session_id: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          name: string
          role: string
          session_id?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          name?: string
          role?: string
          session_id?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "campaign_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      synthesis: {
        Row: {
          campaign_id: string
          contradictions: Json | null
          created_at: string
          detailed_analysis: Json
          gaps: Json | null
          id: string
          metadata: Json | null
          recommendations: Json | null
          roadmap: Json | null
          source_session_ids: string[] | null
          summary: string | null
          synthesis_type: string
          themes: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          contradictions?: Json | null
          created_at?: string
          detailed_analysis?: Json
          gaps?: Json | null
          id?: string
          metadata?: Json | null
          recommendations?: Json | null
          roadmap?: Json | null
          source_session_ids?: string[] | null
          summary?: string | null
          synthesis_type: string
          themes?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          contradictions?: Json | null
          created_at?: string
          detailed_analysis?: Json
          gaps?: Json | null
          id?: string
          metadata?: Json | null
          recommendations?: Json | null
          roadmap?: Json | null
          source_session_ids?: string[] | null
          summary?: string | null
          synthesis_type?: string
          themes?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "synthesis_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          company_profile_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          last_seen_at: string | null
          metadata: Json | null
          organization_id: string | null
          permissions: Json | null
          preferences: Json | null
          role: string
          status: string
          updated_at: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_profile_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          last_seen_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          permissions?: Json | null
          preferences?: Json | null
          role?: string
          status?: string
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_profile_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_seen_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          permissions?: Json | null
          preferences?: Json | null
          role?: string
          status?: string
          updated_at?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: { Args: { user_id: string }; Returns: string }
      search_knowledge: {
        Args: {
          domain_filter?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          chunk_id: string
          chunk_text: string
          domain: string
          knowledge_id: string
          similarity: number
          title: string
        }[]
      }
      search_session_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          session_id: string
        }
        Returns: {
          chunk_id: string
          chunk_text: string
          document_id: string
          document_name: string
          similarity: number
        }[]
      }
      user_has_any_role: {
        Args: { required_roles: string[]; user_id: string }
        Returns: boolean
      }
      user_has_role: {
        Args: { required_role: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

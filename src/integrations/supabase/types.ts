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
      ab_test_predictions: {
        Row: {
          confidence_score: number
          created_at: string
          id: string
          predicted_metrics: Json
          predicted_winner: string
          project_id: string
          recommendations: string
          test_name: string
          updated_at: string
          variant_a: Json
          variant_b: Json
        }
        Insert: {
          confidence_score: number
          created_at?: string
          id?: string
          predicted_metrics: Json
          predicted_winner: string
          project_id: string
          recommendations: string
          test_name: string
          updated_at?: string
          variant_a: Json
          variant_b: Json
        }
        Update: {
          confidence_score?: number
          created_at?: string
          id?: string
          predicted_metrics?: Json
          predicted_winner?: string
          project_id?: string
          recommendations?: string
          test_name?: string
          updated_at?: string
          variant_a?: Json
          variant_b?: Json
        }
        Relationships: []
      }
      campaign_images: {
        Row: {
          created_at: string
          dimensions: string
          id: string
          image_data: string
          image_type: string
          project_id: string
          prompt: string
        }
        Insert: {
          created_at?: string
          dimensions: string
          id?: string
          image_data: string
          image_type: string
          project_id: string
          prompt: string
        }
        Update: {
          created_at?: string
          dimensions?: string
          id?: string
          image_data?: string
          image_type?: string
          project_id?: string
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      competitive_analysis: {
        Row: {
          competitor_name: string
          created_at: string
          id: string
          opportunities: string[]
          positioning: string
          project_id: string
          recommendations: Json
          strengths: string[]
          threats: string[]
          updated_at: string
          weaknesses: string[]
        }
        Insert: {
          competitor_name: string
          created_at?: string
          id?: string
          opportunities: string[]
          positioning: string
          project_id: string
          recommendations: Json
          strengths: string[]
          threats: string[]
          updated_at?: string
          weaknesses: string[]
        }
        Update: {
          competitor_name?: string
          created_at?: string
          id?: string
          opportunities?: string[]
          positioning?: string
          project_id?: string
          recommendations?: Json
          strengths?: string[]
          threats?: string[]
          updated_at?: string
          weaknesses?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "competitive_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          age_range: string | null
          behavior_data: Json | null
          created_at: string
          demographics: Json | null
          email: string
          first_name: string
          id: string
          interests: Json | null
          last_name: string | null
          notes: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          age_range?: string | null
          behavior_data?: Json | null
          created_at?: string
          demographics?: Json | null
          email: string
          first_name: string
          id?: string
          interests?: Json | null
          last_name?: string | null
          notes?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          age_range?: string | null
          behavior_data?: Json | null
          created_at?: string
          demographics?: Json | null
          email?: string
          first_name?: string
          id?: string
          interests?: Json | null
          last_name?: string | null
          notes?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_personas: {
        Row: {
          age_range: string
          avatar_url: string | null
          buying_behavior: Json
          created_at: string
          demographics: Json
          goals: string[]
          id: string
          name: string
          pain_points: string[]
          preferred_channels: string[]
          project_id: string
          psychographics: Json
          updated_at: string
        }
        Insert: {
          age_range: string
          avatar_url?: string | null
          buying_behavior: Json
          created_at?: string
          demographics?: Json
          goals: string[]
          id?: string
          name: string
          pain_points: string[]
          preferred_channels: string[]
          project_id: string
          psychographics: Json
          updated_at?: string
        }
        Update: {
          age_range?: string
          avatar_url?: string | null
          buying_behavior?: Json
          created_at?: string
          demographics?: Json
          goals?: string[]
          id?: string
          name?: string
          pain_points?: string[]
          preferred_channels?: string[]
          project_id?: string
          psychographics?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_personas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hypotheses: {
        Row: {
          confidence: number
          created_at: string
          decision_rule: string
          id: string
          method: string
          method_technical: string
          order_index: number
          project_id: string
          statement: string
          updated_at: string
        }
        Insert: {
          confidence: number
          created_at?: string
          decision_rule: string
          id?: string
          method: string
          method_technical: string
          order_index?: number
          project_id: string
          statement: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          decision_rule?: string
          id?: string
          method?: string
          method_technical?: string
          order_index?: number
          project_id?: string
          statement?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hypotheses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_content: {
        Row: {
          body_text: string | null
          content_type: string
          created_at: string
          cta: string | null
          headline: string | null
          id: string
          metadata: Json | null
          project_id: string
          updated_at: string
          variant_name: string
        }
        Insert: {
          body_text?: string | null
          content_type: string
          created_at?: string
          cta?: string | null
          headline?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          updated_at?: string
          variant_name: string
        }
        Update: {
          body_text?: string | null
          content_type?: string
          created_at?: string
          cta?: string | null
          headline?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          updated_at?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_content_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      research_plans: {
        Row: {
          budget: Json
          created_at: string
          id: string
          methodology: Json
          project_id: string
          sample: Json
          target_audience: Json
          timeline: Json
          updated_at: string
        }
        Insert: {
          budget: Json
          created_at?: string
          id?: string
          methodology: Json
          project_id: string
          sample: Json
          target_audience: Json
          timeline: Json
          updated_at?: string
        }
        Update: {
          budget?: Json
          created_at?: string
          id?: string
          methodology?: Json
          project_id?: string
          sample?: Json
          target_audience?: Json
          timeline?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      research_projects: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          mode: string
          product_description: string
          product_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          mode?: string
          product_description: string
          product_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          mode?: string
          product_description?: string
          product_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          responses: Json
          submitted_at: string
          survey_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          responses?: Json
          submitted_at?: string
          survey_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          responses?: Json
          submitted_at?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_sends: {
        Row: {
          completed_at: string | null
          contact_id: string
          created_at: string
          id: string
          match_reasons: Json | null
          match_score: number
          opened_at: string | null
          persona_id: string | null
          response_data: Json | null
          sent_at: string
          survey_id: string
        }
        Insert: {
          completed_at?: string | null
          contact_id: string
          created_at?: string
          id?: string
          match_reasons?: Json | null
          match_score: number
          opened_at?: string | null
          persona_id?: string | null
          response_data?: Json | null
          sent_at?: string
          survey_id: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string
          created_at?: string
          id?: string
          match_reasons?: Json | null
          match_score?: number
          opened_at?: string | null
          persona_id?: string | null
          response_data?: Json | null
          sent_at?: string
          survey_id?: string
        }
        Relationships: []
      }
      surveys: {
        Row: {
          created_at: string
          description: string | null
          external_form_url: string | null
          id: string
          persona_id: string | null
          project_id: string
          questions: Json
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_form_url?: string | null
          id?: string
          persona_id?: string | null
          project_id: string
          questions: Json
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_form_url?: string | null
          id?: string
          persona_id?: string | null
          project_id?: string
          questions?: Json
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

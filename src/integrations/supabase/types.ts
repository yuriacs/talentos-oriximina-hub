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
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Relationships: []
      }
      availability: {
        Row: {
          created_at: string
          description: string | null
          id: string
          profile_id: string
          type: Database["public"]["Enums"]["availability_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          profile_id: string
          type: Database["public"]["Enums"]["availability_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          profile_id?: string
          type?: Database["public"]["Enums"]["availability_type"]
        }
        Relationships: [
          {
            foreignKeyName: "availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          attachment_url: string | null
          completed_at: string
          course: string
          created_at: string
          hours: number
          id: string
          institution: string
          profile_id: string
        }
        Insert: {
          attachment_url?: string | null
          completed_at: string
          course: string
          created_at?: string
          hours?: number
          id?: string
          institution: string
          profile_id: string
        }
        Update: {
          attachment_url?: string | null
          completed_at?: string
          course?: string
          created_at?: string
          hours?: number
          id?: string
          institution?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          acoes_profissionalizacao: string[] | null
          cnpj: string
          created_at: string
          email: string
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_estado: string | null
          endereco_numero: string | null
          endereco_rua: string | null
          faixa_salarial: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          modalidades_vaga: string[] | null
          nome_fantasia: string
          porte: string | null
          razao_social: string
          responsavel_cargo: string | null
          responsavel_nome: string
          setor_atividade: string | null
          site_url: string | null
          status: string
          termo_aceito: boolean
          termo_aceito_em: string | null
          turnos_trabalho: string[] | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          acoes_profissionalizacao?: string[] | null
          cnpj: string
          created_at?: string
          email: string
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          faixa_salarial?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          modalidades_vaga?: string[] | null
          nome_fantasia: string
          porte?: string | null
          razao_social: string
          responsavel_cargo?: string | null
          responsavel_nome: string
          setor_atividade?: string | null
          site_url?: string | null
          status?: string
          termo_aceito?: boolean
          termo_aceito_em?: string | null
          turnos_trabalho?: string[] | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          acoes_profissionalizacao?: string[] | null
          cnpj?: string
          created_at?: string
          email?: string
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          faixa_salarial?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          modalidades_vaga?: string[] | null
          nome_fantasia?: string
          porte?: string | null
          razao_social?: string
          responsavel_cargo?: string | null
          responsavel_nome?: string
          setor_atividade?: string | null
          site_url?: string | null
          status?: string
          termo_aceito?: boolean
          termo_aceito_em?: string | null
          turnos_trabalho?: string[] | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          course: string
          created_at: string
          current: boolean
          id: string
          institution: string
          level: string
          profile_id: string
          year: number
        }
        Insert: {
          course: string
          created_at?: string
          current?: boolean
          id?: string
          institution: string
          level: string
          profile_id: string
          year: number
        }
        Update: {
          course?: string
          created_at?: string
          current?: boolean
          id?: string
          institution?: string
          level?: string
          profile_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          created_at: string
          current: boolean
          description: string | null
          end_date: string | null
          id: string
          place: string
          profile_id: string
          start_date: string
          type: string
        }
        Insert: {
          created_at?: string
          current?: boolean
          description?: string | null
          end_date?: string | null
          id?: string
          place: string
          profile_id: string
          start_date: string
          type: string
        }
        Update: {
          created_at?: string
          current?: boolean
          description?: string | null
          end_date?: string | null
          id?: string
          place?: string
          profile_id?: string
          start_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string
          id: string
          level: Database["public"]["Enums"]["language_level"]
          name: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["language_level"]
          name: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["language_level"]
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "languages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepts_remote: boolean | null
          accessibility_needs: string | null
          age_range: string | null
          area: string | null
          available_shifts: string[] | null
          bio: string | null
          can_travel: boolean | null
          can_work_onsite: boolean | null
          city: string | null
          contact_visibility: Database["public"]["Enums"]["contact_visibility"]
          created_at: string
          current_course: string | null
          desired_hours: string | null
          desired_opportunity_types: string[] | null
          digital_skill_level: string | null
          disability_type: string | null
          education_level: string | null
          employment_status: string | null
          experience_time: string | null
          full_name: string
          gender: string | null
          github_url: string | null
          has_computer: boolean | null
          has_transport: boolean | null
          has_work_experience: boolean | null
          id: string
          institution_type: string | null
          interest_areas: string[] | null
          internet_access: string | null
          is_pcd: boolean | null
          is_verified: boolean
          linkedin_url: string | null
          photo: string | null
          portfolio_url: string | null
          professional_objective: string | null
          profile_completion: number
          race_color: string | null
          salary_range: string | null
          social_programs_interest: boolean | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
          user_id: string
          video_url: string | null
          whatsapp: string | null
        }
        Insert: {
          accepts_remote?: boolean | null
          accessibility_needs?: string | null
          age_range?: string | null
          area?: string | null
          available_shifts?: string[] | null
          bio?: string | null
          can_travel?: boolean | null
          can_work_onsite?: boolean | null
          city?: string | null
          contact_visibility?: Database["public"]["Enums"]["contact_visibility"]
          created_at?: string
          current_course?: string | null
          desired_hours?: string | null
          desired_opportunity_types?: string[] | null
          digital_skill_level?: string | null
          disability_type?: string | null
          education_level?: string | null
          employment_status?: string | null
          experience_time?: string | null
          full_name: string
          gender?: string | null
          github_url?: string | null
          has_computer?: boolean | null
          has_transport?: boolean | null
          has_work_experience?: boolean | null
          id?: string
          institution_type?: string | null
          interest_areas?: string[] | null
          internet_access?: string | null
          is_pcd?: boolean | null
          is_verified?: boolean
          linkedin_url?: string | null
          photo?: string | null
          portfolio_url?: string | null
          professional_objective?: string | null
          profile_completion?: number
          race_color?: string | null
          salary_range?: string | null
          social_programs_interest?: boolean | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          user_id: string
          video_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          accepts_remote?: boolean | null
          accessibility_needs?: string | null
          age_range?: string | null
          area?: string | null
          available_shifts?: string[] | null
          bio?: string | null
          can_travel?: boolean | null
          can_work_onsite?: boolean | null
          city?: string | null
          contact_visibility?: Database["public"]["Enums"]["contact_visibility"]
          created_at?: string
          current_course?: string | null
          desired_hours?: string | null
          desired_opportunity_types?: string[] | null
          digital_skill_level?: string | null
          disability_type?: string | null
          education_level?: string | null
          employment_status?: string | null
          experience_time?: string | null
          full_name?: string
          gender?: string | null
          github_url?: string | null
          has_computer?: boolean | null
          has_transport?: boolean | null
          has_work_experience?: boolean | null
          id?: string
          institution_type?: string | null
          interest_areas?: string[] | null
          internet_access?: string | null
          is_pcd?: boolean | null
          is_verified?: boolean
          linkedin_url?: string | null
          photo?: string | null
          portfolio_url?: string | null
          professional_objective?: string | null
          profile_completion?: number
          race_color?: string | null
          salary_range?: string | null
          social_programs_interest?: boolean | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          user_id?: string
          video_url?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          id: string
          images: string[] | null
          links: string[] | null
          problem: string | null
          profile_id: string
          results: string | null
          solution: string | null
          technologies: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          images?: string[] | null
          links?: string[] | null
          problem?: string | null
          profile_id: string
          results?: string | null
          solution?: string | null
          technologies?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          images?: string[] | null
          links?: string[] | null
          problem?: string | null
          profile_id?: string
          results?: string | null
          solution?: string | null
          technologies?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_profile_id?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string
          id: string
          level: Database["public"]["Enums"]["skill_level"]
          name: string
          profile_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["skill_level"]
          name: string
          profile_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["skill_level"]
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      soft_skills: {
        Row: {
          created_at: string
          id: string
          name: string
          profile_id: string
          rating: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          profile_id: string
          rating?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          profile_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "soft_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_profile_id: { Args: never; Returns: string }
      get_profile_user_id: { Args: { _profile_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      availability_type:
        | "ESTAGIO"
        | "FREELANCE"
        | "VOLUNTARIO"
        | "PROJETO"
        | "MENTORIA"
      contact_visibility:
        | "INTERNAL_ONLY"
        | "EMAIL_LOGGED"
        | "WHATSAPP_LOGGED"
        | "ALL"
        | "HIDDEN"
      language_level:
        | "BASICO"
        | "INTERMEDIARIO"
        | "AVANCADO"
        | "FLUENTE"
        | "NATIVO"
      profile_status: "DRAFT" | "PUBLISHED" | "BLOCKED"
      report_status: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED"
      skill_category: "HARD" | "SOFT"
      skill_level: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO"
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
      app_role: ["admin", "user"],
      availability_type: [
        "ESTAGIO",
        "FREELANCE",
        "VOLUNTARIO",
        "PROJETO",
        "MENTORIA",
      ],
      contact_visibility: [
        "INTERNAL_ONLY",
        "EMAIL_LOGGED",
        "WHATSAPP_LOGGED",
        "ALL",
        "HIDDEN",
      ],
      language_level: [
        "BASICO",
        "INTERMEDIARIO",
        "AVANCADO",
        "FLUENTE",
        "NATIVO",
      ],
      profile_status: ["DRAFT", "PUBLISHED", "BLOCKED"],
      report_status: ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"],
      skill_category: ["HARD", "SOFT"],
      skill_level: ["INICIANTE", "INTERMEDIARIO", "AVANCADO"],
    },
  },
} as const

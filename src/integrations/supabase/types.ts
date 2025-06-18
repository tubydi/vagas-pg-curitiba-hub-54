export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          current_position: string | null
          education: string | null
          email: string
          experience_years: number | null
          id: string
          job_id: string
          linkedin: string | null
          name: string
          phone: string
          resume_url: string | null
          skills: string[] | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          current_position?: string | null
          education?: string | null
          email: string
          experience_years?: number | null
          id?: string
          job_id: string
          linkedin?: string | null
          name: string
          phone: string
          resume_url?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          current_position?: string | null
          education?: string | null
          email?: string
          experience_years?: number | null
          id?: string
          job_id?: string
          linkedin?: string | null
          name?: string
          phone?: string
          resume_url?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string
          city: string
          cnpj: string
          created_at: string
          description: string | null
          email: string
          id: string
          legal_representative: string
          name: string
          phone: string
          sector: string
          status: Database["public"]["Enums"]["company_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          cnpj: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          legal_representative: string
          name: string
          phone: string
          sector: string
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          cnpj?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          legal_representative?: string
          name?: string
          phone?: string
          sector?: string
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_method: string | null
          benefits: string[] | null
          company_id: string
          contact_info: string | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          has_external_application: boolean | null
          id: string
          location: string
          payment_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          requirements: string
          salary: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          work_mode: Database["public"]["Enums"]["work_mode"]
        }
        Insert: {
          application_method?: string | null
          benefits?: string[] | null
          company_id: string
          contact_info?: string | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          has_external_application?: boolean | null
          id?: string
          location: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          requirements: string
          salary: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          work_mode: Database["public"]["Enums"]["work_mode"]
        }
        Update: {
          application_method?: string | null
          benefits?: string[] | null
          company_id?: string
          contact_info?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          description?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          has_external_application?: boolean | null
          id?: string
          location?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          requirements?: string
          salary?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          work_mode?: Database["public"]["Enums"]["work_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          application_id: string
          company_id: string
          created_at: string
          id: string
          message: string
          read: boolean
        }
        Insert: {
          application_id: string
          company_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
        }
        Update: {
          application_id?: string
          company_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          id: string
          job_id: string | null
          mercadopago_data: Json | null
          paid_at: string | null
          payment_id: string | null
          preference_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          id?: string
          job_id?: string | null
          mercadopago_data?: Json | null
          paid_at?: string | null
          payment_id?: string | null
          preference_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          id?: string
          job_id?: string | null
          mercadopago_data?: Json | null
          paid_at?: string | null
          payment_id?: string | null
          preference_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_exempt_from_payment: {
        Args: Record<PropertyKey, never> | { company_email: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status:
        | "Novo"
        | "Visualizado"
        | "Contato"
        | "Rejeitado"
        | "Aprovado"
      company_status: "Ativa" | "Pendente" | "Bloqueada"
      contract_type: "CLT" | "PJ" | "Freelancer" | "Estágio"
      experience_level:
        | "Estagiário"
        | "Júnior"
        | "Pleno"
        | "Sênior"
        | "Especialista"
      job_status: "Ativa" | "Pausada" | "Fechada"
      payment_status: "pending" | "approved" | "rejected" | "cancelled"
      user_role: "admin" | "company"
      work_mode: "Presencial" | "Remoto" | "Híbrido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: [
        "Novo",
        "Visualizado",
        "Contato",
        "Rejeitado",
        "Aprovado",
      ],
      company_status: ["Ativa", "Pendente", "Bloqueada"],
      contract_type: ["CLT", "PJ", "Freelancer", "Estágio"],
      experience_level: [
        "Estagiário",
        "Júnior",
        "Pleno",
        "Sênior",
        "Especialista",
      ],
      job_status: ["Ativa", "Pausada", "Fechada"],
      payment_status: ["pending", "approved", "rejected", "cancelled"],
      user_role: ["admin", "company"],
      work_mode: ["Presencial", "Remoto", "Híbrido"],
    },
  },
} as const

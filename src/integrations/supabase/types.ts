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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          created_at: string
          data_acesso: string
          evento_nome: string
          id: string
          local_evento: string
          status: string
          ticket_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data_acesso?: string
          evento_nome: string
          id?: string
          local_evento: string
          status?: string
          ticket_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data_acesso?: string
          evento_nome?: string
          id?: string
          local_evento?: string
          status?: string
          ticket_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      account_locks: {
        Row: {
          created_at: string
          email: string | null
          failed_attempts: number
          id: string
          locked_until: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          failed_attempts?: number
          id?: string
          locked_until: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          failed_attempts?: number
          id?: string
          locked_until?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_type: string
          created_at: string
          email: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempt_type?: string
          created_at?: string
          email?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string
          email?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_code: string | null
          created_at: string
          device_info: Json | null
          id: string
          last_login: string | null
          last_password_change: string | null
          location_data: Json | null
          name: string
          password_hash: string | null
          pending_approval: boolean | null
          phone: string | null
          phone_verified: boolean | null
          profile: string
          require_password_change: boolean | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_code?: string | null
          created_at?: string
          device_info?: Json | null
          id?: string
          last_login?: string | null
          last_password_change?: string | null
          location_data?: Json | null
          name: string
          password_hash?: string | null
          pending_approval?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          profile: string
          require_password_change?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_code?: string | null
          created_at?: string
          device_info?: Json | null
          id?: string
          last_login?: string | null
          last_password_change?: string | null
          location_data?: Json | null
          name?: string
          password_hash?: string | null
          pending_approval?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          profile?: string
          require_password_change?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      secure_access_logs: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          encrypted_data: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          location_data: Json | null
          timestamp: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          encrypted_data?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          timestamp?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          encrypted_data?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          duracao: string
          id: string
          plano: string
          renovacao_automatica: boolean
          status: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio?: string
          duracao: string
          id?: string
          plano: string
          renovacao_automatica?: boolean
          status?: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          duracao?: string
          id?: string
          plano?: string
          renovacao_automatica?: boolean
          status?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          data_evento: string
          descricao: string | null
          id: string
          local_evento: string
          nome_evento: string
          preco: number
          quantidade_disponivel: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_evento: string
          descricao?: string | null
          id?: string
          local_evento: string
          nome_evento: string
          preco: number
          quantidade_disponivel?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_evento?: string
          descricao?: string | null
          id?: string
          local_evento?: string
          nome_evento?: string
          preco?: number
          quantidade_disponivel?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      two_factor_settings: {
        Row: {
          backup_codes_generated: boolean
          created_at: string
          enabled: boolean
          id: string
          secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes_generated?: boolean
          created_at?: string
          enabled?: boolean
          id?: string
          secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes_generated?: boolean
          created_at?: string
          enabled?: boolean
          id?: string
          secret?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_account_lock: {
        Args: { p_email: string }
        Returns: {
          failed_attempts: number
          is_locked: boolean
          locked_until: string
        }[]
      }
      cleanup_old_login_attempts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_backup_codes: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { role: string }
        Returns: boolean
      }
      log_login_attempt: {
        Args: {
          p_attempt_type?: string
          p_email: string
          p_error_message?: string
          p_ip_address: unknown
          p_success: boolean
          p_user_agent: string
          p_user_id: string
        }
        Returns: undefined
      }
      validate_backup_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cliente" | "pendente"
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
      app_role: ["admin", "cliente", "pendente"],
    },
  },
} as const

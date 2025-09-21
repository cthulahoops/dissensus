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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      public_shares: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          share_token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          share_token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          share_token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sleep_records: {
        Row: {
          comments: string | null
          created_at: string | null
          date: string
          date_unix: number | null
          final_awakening_time: string | null
          id: string
          sleep_quality_rating: string | null
          time_got_into_bed: string | null
          time_got_out_of_bed: string | null
          time_to_fall_asleep_mins: number | null
          time_tried_to_sleep: string | null
          time_trying_to_sleep_after_final_awakening_mins: number | null
          times_woke_up_count: number | null
          total_awake_time_mins: number | null
          uid: string | null
          updated_at: string | null
          user_id: string | null
          wore_bite_guard: boolean | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          date: string
          date_unix?: number | null
          final_awakening_time?: string | null
          id?: string
          sleep_quality_rating?: string | null
          time_got_into_bed?: string | null
          time_got_out_of_bed?: string | null
          time_to_fall_asleep_mins?: number | null
          time_tried_to_sleep?: string | null
          time_trying_to_sleep_after_final_awakening_mins?: number | null
          times_woke_up_count?: number | null
          total_awake_time_mins?: number | null
          uid?: string | null
          updated_at?: string | null
          user_id?: string | null
          wore_bite_guard?: boolean | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          date?: string
          date_unix?: number | null
          final_awakening_time?: string | null
          id?: string
          sleep_quality_rating?: string | null
          time_got_into_bed?: string | null
          time_got_out_of_bed?: string | null
          time_to_fall_asleep_mins?: number | null
          time_tried_to_sleep?: string | null
          time_trying_to_sleep_after_final_awakening_mins?: number | null
          times_woke_up_count?: number | null
          total_awake_time_mins?: number | null
          uid?: string | null
          updated_at?: string | null
          user_id?: string | null
          wore_bite_guard?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fetch_shared_sleep_records: {
        Args: { share_token: string }
        Returns: {
          comments: string
          created_at: string
          date: string
          date_unix: number
          final_awakening_time: string
          id: string
          sleep_quality_rating: string
          time_got_into_bed: string
          time_got_out_of_bed: string
          time_to_fall_asleep_mins: number
          time_tried_to_sleep: string
          time_trying_to_sleep_after_final_awakening_mins: number
          times_woke_up_count: number
          total_awake_time_mins: number
          uid: string
          updated_at: string
          user_id: string
        }[]
      }
      set_share_token: {
        Args: { token: string }
        Returns: undefined
      }
      validate_share_token: {
        Args: { share_token: string }
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

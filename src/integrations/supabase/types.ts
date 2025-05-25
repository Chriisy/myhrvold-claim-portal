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
      account_codes: {
        Row: {
          comment: string | null
          created_at: string | null
          konto_nr: number
          seller_flag: boolean | null
          type: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          konto_nr: number
          seller_flag?: boolean | null
          type: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          konto_nr?: number
          seller_flag?: boolean | null
          type?: string
        }
        Relationships: []
      }
      accounts_deprecated: {
        Row: {
          comment: string | null
          created_at: string | null
          konto_nr: number
          seller_flag: boolean | null
          type: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          konto_nr: number
          seller_flag?: boolean | null
          type: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          konto_nr?: number
          seller_flag?: boolean | null
          type?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          account_code_id: number | null
          category: Database["public"]["Enums"]["claim_category"] | null
          closed_at: string | null
          corrective_action: string | null
          created_at: string | null
          created_by: string
          customer_address: string | null
          customer_name: string | null
          customer_no: string | null
          customer_po: string | null
          deleted_at: string | null
          department: string | null
          description: string | null
          due_date: string | null
          id: string
          improvement_action:
            | Database["public"]["Enums"]["improvement_action"]
            | null
          improvement_cost: number | null
          improvement_done: boolean | null
          improvement_due: string | null
          improvement_owner: string | null
          improvement_toggle: boolean | null
          internal_note: string | null
          learning_note: string | null
          machine_model: string | null
          machine_serial: string | null
          part_number: string | null
          preventive_action: string | null
          quantity: number | null
          reported_by: string | null
          root_cause: string | null
          salesperson_id: string | null
          source: string
          status: Database["public"]["Enums"]["claim_status"]
          supplier_id: string | null
          technician_id: string | null
          visma_order_no: string | null
          warranty: boolean | null
        }
        Insert: {
          account_code_id?: number | null
          category?: Database["public"]["Enums"]["claim_category"] | null
          closed_at?: string | null
          corrective_action?: string | null
          created_at?: string | null
          created_by: string
          customer_address?: string | null
          customer_name?: string | null
          customer_no?: string | null
          customer_po?: string | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          improvement_action?:
            | Database["public"]["Enums"]["improvement_action"]
            | null
          improvement_cost?: number | null
          improvement_done?: boolean | null
          improvement_due?: string | null
          improvement_owner?: string | null
          improvement_toggle?: boolean | null
          internal_note?: string | null
          learning_note?: string | null
          machine_model?: string | null
          machine_serial?: string | null
          part_number?: string | null
          preventive_action?: string | null
          quantity?: number | null
          reported_by?: string | null
          root_cause?: string | null
          salesperson_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["claim_status"]
          supplier_id?: string | null
          technician_id?: string | null
          visma_order_no?: string | null
          warranty?: boolean | null
        }
        Update: {
          account_code_id?: number | null
          category?: Database["public"]["Enums"]["claim_category"] | null
          closed_at?: string | null
          corrective_action?: string | null
          created_at?: string | null
          created_by?: string
          customer_address?: string | null
          customer_name?: string | null
          customer_no?: string | null
          customer_po?: string | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          improvement_action?:
            | Database["public"]["Enums"]["improvement_action"]
            | null
          improvement_cost?: number | null
          improvement_done?: boolean | null
          improvement_due?: string | null
          improvement_owner?: string | null
          improvement_toggle?: boolean | null
          internal_note?: string | null
          learning_note?: string | null
          machine_model?: string | null
          machine_serial?: string | null
          part_number?: string | null
          preventive_action?: string | null
          quantity?: number | null
          reported_by?: string | null
          root_cause?: string | null
          salesperson_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["claim_status"]
          supplier_id?: string | null
          technician_id?: string | null
          visma_order_no?: string | null
          warranty?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_account_code_id_fkey"
            columns: ["account_code_id"]
            isOneToOne: false
            referencedRelation: "account_codes"
            referencedColumns: ["konto_nr"]
          },
          {
            foreignKeyName: "claims_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_line: {
        Row: {
          amount: number
          claim_id: string
          created_at: string
          date: string
          description: string
          id: string
          konto_nr: number | null
          source: string
          voucher_no: string | null
        }
        Insert: {
          amount: number
          claim_id: string
          created_at?: string
          date?: string
          description: string
          id?: string
          konto_nr?: number | null
          source?: string
          voucher_no?: string | null
        }
        Update: {
          amount?: number
          claim_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          konto_nr?: number | null
          source?: string
          voucher_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_line_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_note: {
        Row: {
          amount: number
          claim_id: string
          created_at: string
          date: string
          description: string
          id: string
          konto_nr: number | null
          source: string
          voucher_no: string | null
        }
        Insert: {
          amount: number
          claim_id: string
          created_at?: string
          date?: string
          description: string
          id?: string
          konto_nr?: number | null
          source?: string
          voucher_no?: string | null
        }
        Update: {
          amount?: number
          claim_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          konto_nr?: number | null
          source?: string
          voucher_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_note_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_import: {
        Row: {
          created_at: string
          created_by: string
          file_id: string
          id: string
          meta_json: Json
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          file_id: string
          id?: string
          meta_json?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          file_id?: string
          id?: string
          meta_json?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      timeline_item: {
        Row: {
          claim_id: string
          created_at: string
          created_by: string
          id: string
          message: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          created_by: string
          id?: string
          message: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          created_by?: string
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_item_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          department_scope: Database["public"]["Enums"]["department"] | null
          id: string
          permission_name: Database["public"]["Enums"]["permission_type"]
          resource: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department_scope?: Database["public"]["Enums"]["department"] | null
          id?: string
          permission_name: Database["public"]["Enums"]["permission_type"]
          resource?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department_scope?: Database["public"]["Enums"]["department"] | null
          id?: string
          permission_name?: Database["public"]["Enums"]["permission_type"]
          resource?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          department: Database["public"]["Enums"]["department"] | null
          email: string
          id: string
          name: string
          role: string
          seller_no: number | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          email: string
          id?: string
          name: string
          role: string
          seller_no?: number | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          email?: string
          id?: string
          name?: string
          role?: string
          seller_no?: number | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
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
      has_permission: {
        Args: {
          _user_id: string
          _permission: Database["public"]["Enums"]["permission_type"]
          _resource?: string
          _department?: Database["public"]["Enums"]["department"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      claim_category: "Service" | "Installasjon" | "Produkt" | "Del"
      claim_status:
        | "Ny"
        | "Avventer"
        | "Godkjent"
        | "Avslått"
        | "Bokført"
        | "Lukket"
      department:
        | "oslo"
        | "bergen"
        | "trondheim"
        | "kristiansand"
        | "sornorge"
        | "nord"
      import_status: "new" | "validating" | "ready" | "error"
      improvement_action:
        | "Ingen"
        | "ForbedreProsess"
        | "ErstatteKomponent"
        | "StopSale"
      permission_type:
        | "view_all_claims"
        | "edit_all_claims"
        | "delete_claims"
        | "manage_users"
        | "view_reports"
        | "approve_claims"
        | "view_department_claims"
        | "edit_own_claims"
        | "create_claims"
      user_role: "admin" | "saksbehandler" | "tekniker" | "avdelingsleder"
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
      claim_category: ["Service", "Installasjon", "Produkt", "Del"],
      claim_status: [
        "Ny",
        "Avventer",
        "Godkjent",
        "Avslått",
        "Bokført",
        "Lukket",
      ],
      department: [
        "oslo",
        "bergen",
        "trondheim",
        "kristiansand",
        "sornorge",
        "nord",
      ],
      import_status: ["new", "validating", "ready", "error"],
      improvement_action: [
        "Ingen",
        "ForbedreProsess",
        "ErstatteKomponent",
        "StopSale",
      ],
      permission_type: [
        "view_all_claims",
        "edit_all_claims",
        "delete_claims",
        "manage_users",
        "view_reports",
        "approve_claims",
        "view_department_claims",
        "edit_own_claims",
        "create_claims",
      ],
      user_role: ["admin", "saksbehandler", "tekniker", "avdelingsleder"],
    },
  },
} as const

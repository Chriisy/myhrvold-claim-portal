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
      certificate_audit_log: {
        Row: {
          action: string
          certificate_id: string | null
          id: string
          new_values: Json | null
          notes: string | null
          old_values: Json | null
          performed_at: string
          performed_by: string
        }
        Insert: {
          action: string
          certificate_id?: string | null
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          performed_at?: string
          performed_by: string
        }
        Update: {
          action?: string
          certificate_id?: string | null
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          performed_at?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_audit_log_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "f_gas_certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_documents: {
        Row: {
          certificate_id: string | null
          document_type: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          certificate_id?: string | null
          document_type?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          certificate_id?: string | null
          document_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_documents_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "f_gas_certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_notifications: {
        Row: {
          certificate_id: string | null
          days_before_expiry: number | null
          id: string
          message: string | null
          notification_type: string
          recipient_email: string | null
          recipient_user_id: string | null
          sent_at: string
        }
        Insert: {
          certificate_id?: string | null
          days_before_expiry?: number | null
          id?: string
          message?: string | null
          notification_type: string
          recipient_email?: string | null
          recipient_user_id?: string | null
          sent_at?: string
        }
        Update: {
          certificate_id?: string | null
          days_before_expiry?: number | null
          id?: string
          message?: string | null
          notification_type?: string
          recipient_email?: string | null
          recipient_user_id?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_notifications_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "f_gas_certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_renewal_checklists: {
        Row: {
          certificate_id: string | null
          checklist_item: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          due_date: string | null
          id: string
          is_completed: boolean
          notes: string | null
        }
        Insert: {
          certificate_id?: string | null
          checklist_item: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          notes?: string | null
        }
        Update: {
          certificate_id?: string | null
          checklist_item?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_renewal_checklists_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "f_gas_certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_renewal_checklists_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          checklist_items: Json
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          checklist_items?: Json
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          checklist_items?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_files: {
        Row: {
          claim_id: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          claim_id?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          claim_id?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_files_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          account_code_id: number | null
          action_completed_at: string | null
          action_due_date: string | null
          action_effectiveness: string | null
          action_owner: string | null
          action_status: Database["public"]["Enums"]["action_status"] | null
          category: Database["public"]["Enums"]["claim_category"] | null
          closed_at: string | null
          corrective_action: string | null
          created_at: string | null
          created_by: string
          customer_address: string | null
          customer_city: string | null
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
          action_completed_at?: string | null
          action_due_date?: string | null
          action_effectiveness?: string | null
          action_owner?: string | null
          action_status?: Database["public"]["Enums"]["action_status"] | null
          category?: Database["public"]["Enums"]["claim_category"] | null
          closed_at?: string | null
          corrective_action?: string | null
          created_at?: string | null
          created_by: string
          customer_address?: string | null
          customer_city?: string | null
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
          action_completed_at?: string | null
          action_due_date?: string | null
          action_effectiveness?: string | null
          action_owner?: string | null
          action_status?: Database["public"]["Enums"]["action_status"] | null
          category?: Database["public"]["Enums"]["claim_category"] | null
          closed_at?: string | null
          corrective_action?: string | null
          created_at?: string | null
          created_by?: string
          customer_address?: string | null
          customer_city?: string | null
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
            foreignKeyName: "claims_action_owner_fkey"
            columns: ["action_owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
      f_gas_certificates: {
        Row: {
          certificate_number: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at: string
          created_by: string
          expiry_date: string
          holder_name: string | null
          holder_user_id: string | null
          id: string
          issue_date: string
          issuing_authority: string | null
          notes: string | null
          status: Database["public"]["Enums"]["certificate_status"]
          updated_at: string
        }
        Insert: {
          certificate_number: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at?: string
          created_by: string
          expiry_date: string
          holder_name?: string | null
          holder_user_id?: string | null
          id?: string
          issue_date: string
          issuing_authority?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          updated_at?: string
        }
        Update: {
          certificate_number?: string
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          created_at?: string
          created_by?: string
          expiry_date?: string
          holder_name?: string | null
          holder_user_id?: string | null
          id?: string
          issue_date?: string
          issuing_authority?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "f_gas_certificates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "f_gas_certificates_holder_user_id_fkey"
            columns: ["holder_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_checklist_photos: {
        Row: {
          caption: string | null
          checklist_id: string | null
          checklist_item_id: string
          file_name: string
          file_path: string
          file_size: number
          file_url: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          checklist_id?: string | null
          checklist_item_id: string
          file_name: string
          file_path: string
          file_size: number
          file_url: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          checklist_id?: string | null
          checklist_item_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_url?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installation_checklist_photos_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "installation_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_checklist_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_checklists: {
        Row: {
          checklist_data: Json
          completed_at: string | null
          completed_by: string | null
          created_at: string
          deviation_notes: Json | null
          id: string
          internal_notes: string | null
          project_id: string
          status: string
          template_id: string | null
        }
        Insert: {
          checklist_data?: Json
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          deviation_notes?: Json | null
          id?: string
          internal_notes?: string | null
          project_id: string
          status?: string
          template_id?: string | null
        }
        Update: {
          checklist_data?: Json
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          deviation_notes?: Json | null
          id?: string
          internal_notes?: string | null
          project_id?: string
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installation_checklists_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "installation_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_photos: {
        Row: {
          caption: string | null
          checklist_item_id: string | null
          file_name: string
          file_path: string
          file_size: number
          file_url: string
          id: string
          project_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          checklist_item_id?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_url: string
          id?: string
          project_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          checklist_item_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_url?: string
          id?: string
          project_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "installation_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "installation_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_projects: {
        Row: {
          assigned_technician_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          customer_name: string | null
          id: string
          location: string | null
          notes: string | null
          project_name: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_technician_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          customer_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          project_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_technician_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          customer_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          project_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installation_projects_assigned_technician_id_fkey"
            columns: ["assigned_technician_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_control_checklists: {
        Row: {
          checklist_items: Json
          created_at: string
          created_by: string
          description: string | null
          document_type: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          checklist_items?: Json
          created_at?: string
          created_by: string
          description?: string | null
          document_type: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          checklist_items?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          document_type?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_control_checks: {
        Row: {
          checklist_data: Json
          comments: string | null
          created_at: string
          date_performed: string
          deviations_count: number
          document_type: string
          id: string
          performed_by: string
          status: string
          title: string
        }
        Insert: {
          checklist_data?: Json
          comments?: string | null
          created_at?: string
          date_performed: string
          deviations_count?: number
          document_type: string
          id?: string
          performed_by: string
          status: string
          title: string
        }
        Update: {
          checklist_data?: Json
          comments?: string | null
          created_at?: string
          date_performed?: string
          deviations_count?: number
          document_type?: string
          id?: string
          performed_by?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      internal_control_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string | null
          file_size: number
          file_url: string
          id: string
          title: string
          uploaded_at: string
          uploaded_by: string
          version: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path?: string | null
          file_size: number
          file_url: string
          id?: string
          title: string
          uploaded_at?: string
          uploaded_by: string
          version: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string | null
          file_size?: number
          file_url?: string
          id?: string
          title?: string
          uploaded_at?: string
          uploaded_by?: string
          version?: string
        }
        Relationships: []
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
          event_type: Database["public"]["Enums"]["timeline_event_type"] | null
          id: string
          message: string
          metadata: Json | null
        }
        Insert: {
          claim_id: string
          created_at?: string
          created_by: string
          event_type?: Database["public"]["Enums"]["timeline_event_type"] | null
          id?: string
          message: string
          metadata?: Json | null
        }
        Update: {
          claim_id?: string
          created_at?: string
          created_by?: string
          event_type?: Database["public"]["Enums"]["timeline_event_type"] | null
          id?: string
          message?: string
          metadata?: Json | null
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
      get_expiring_certificates: {
        Args: { days_ahead?: number }
        Returns: {
          certificate_id: string
          certificate_number: string
          holder_name: string
          holder_email: string
          expiry_date: string
          days_until_expiry: number
          certificate_type: Database["public"]["Enums"]["certificate_type"]
        }[]
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
      update_certificate_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      action_status: "Planlagt" | "Pågår" | "Ferdig"
      certificate_status:
        | "active"
        | "expiring_soon"
        | "expired"
        | "pending_renewal"
      certificate_type: "personal" | "company"
      claim_category: "Service" | "Installasjon" | "Produkt" | "Del"
      claim_status:
        | "Ny"
        | "Avventer"
        | "Godkjent"
        | "Avslått"
        | "Bokført"
        | "Lukket"
        | "Venter på svar"
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
      timeline_event_type:
        | "manual"
        | "status_change"
        | "file_upload"
        | "file_delete"
        | "claim_update"
        | "cost_added"
        | "credit_added"
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
      action_status: ["Planlagt", "Pågår", "Ferdig"],
      certificate_status: [
        "active",
        "expiring_soon",
        "expired",
        "pending_renewal",
      ],
      certificate_type: ["personal", "company"],
      claim_category: ["Service", "Installasjon", "Produkt", "Del"],
      claim_status: [
        "Ny",
        "Avventer",
        "Godkjent",
        "Avslått",
        "Bokført",
        "Lukket",
        "Venter på svar",
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
      timeline_event_type: [
        "manual",
        "status_change",
        "file_upload",
        "file_delete",
        "claim_update",
        "cost_added",
        "credit_added",
      ],
      user_role: ["admin", "saksbehandler", "tekniker", "avdelingsleder"],
    },
  },
} as const

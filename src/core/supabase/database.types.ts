export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          legal_name: string;
          trade_name: string;
          document: string;
          email: string;
          phone: string | null;
          status: "pending" | "active" | "suspended" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          legal_name: string;
          trade_name: string;
          document: string;
          email: string;
          phone?: string | null;
          status?: "pending" | "active" | "suspended" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          status: "invited" | "active" | "suspended" | "removed";
          last_access_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          status?: "invited" | "active" | "suspended" | "removed";
          last_access_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      tenant_memberships: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          status: "invited" | "active" | "suspended" | "removed";
          invited_by: string | null;
          joined_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          status?: "invited" | "active" | "suspended" | "removed";
          invited_by?: string | null;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenant_memberships"]["Insert"]>;
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          code: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["permissions"]["Insert"]>;
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          scope: "global" | "tenant";
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          name: string;
          scope: "global" | "tenant";
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["role_permissions"]["Insert"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          billing_cycle: "monthly" | "quarterly" | "yearly" | "trial";
          status: "active" | "pending" | "planned" | "suspended";
          maximum_users: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          billing_cycle: "monthly" | "quarterly" | "yearly" | "trial";
          status?: "active" | "pending" | "planned" | "suspended";
          maximum_users?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          status: "active" | "pending" | "planned" | "suspended";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          status?: "active" | "pending" | "planned" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          product_id: string;
          code: string;
          name: string;
          description: string | null;
          status: "active" | "pending" | "planned" | "suspended";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          code: string;
          name: string;
          description?: string | null;
          status?: "active" | "pending" | "planned" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["modules"]["Insert"]>;
        Relationships: [];
      };
      contracts: {
        Row: {
          id: string;
          tenant_id: string;
          plan_id: string;
          contract_number: string;
          billing_cycle: "monthly" | "quarterly" | "yearly" | "trial";
          start_date: string;
          end_date: string | null;
          renewal_date: string | null;
          status: "draft" | "pending" | "active" | "expired" | "suspended" | "cancelled" | "closed";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          plan_id: string;
          contract_number: string;
          billing_cycle?: "monthly" | "quarterly" | "yearly" | "trial";
          start_date: string;
          end_date?: string | null;
          renewal_date?: string | null;
          status?: "draft" | "pending" | "active" | "expired" | "suspended" | "cancelled" | "closed";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contracts"]["Insert"]>;
        Relationships: [];
      };
      contract_items: {
        Row: {
          id: string;
          tenant_id: string;
          contract_id: string;
          product_id: string | null;
          module_id: string | null;
          item_type: string;
          description: string;
          billing_model: "flat" | "per_user" | "per_resource" | "per_unit" | "usage_based" | "custom";
          quantity: number;
          unit_price: number;
          total_price: number;
          starts_at: string;
          ends_at: string | null;
          status: "active" | "pending" | "planned" | "suspended";
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          contract_id: string;
          product_id?: string | null;
          module_id?: string | null;
          item_type: string;
          description: string;
          billing_model: "flat" | "per_user" | "per_resource" | "per_unit" | "usage_based" | "custom";
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          starts_at?: string;
          ends_at?: string | null;
          status?: "active" | "pending" | "planned" | "suspended";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contract_items"]["Insert"]>;
        Relationships: [];
      };
      external_resources: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string | null;
          resource_type: string;
          external_id: string;
          code: string;
          display_name: string | null;
          status: "active" | "pending" | "planned" | "suspended";
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          product_id?: string | null;
          resource_type: string;
          external_id: string;
          code: string;
          display_name?: string | null;
          status?: "active" | "pending" | "planned" | "suspended";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["external_resources"]["Insert"]>;
        Relationships: [];
      };
      contract_scopes: {
        Row: {
          id: string;
          tenant_id: string;
          contract_id: string;
          contract_item_id: string | null;
          product_id: string | null;
          resource_type: string;
          resource_id: string;
          resource_code: string;
          display_name: string | null;
          status: "active" | "pending" | "planned" | "suspended";
          starts_at: string;
          expires_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          contract_id: string;
          contract_item_id?: string | null;
          product_id?: string | null;
          resource_type: string;
          resource_id: string;
          resource_code: string;
          display_name?: string | null;
          status?: "active" | "pending" | "planned" | "suspended";
          starts_at?: string;
          expires_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contract_scopes"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          tenant_id: string;
          contract_id: string;
          plan_id: string;
          status: "trial" | "active" | "pending" | "past_due" | "suspended" | "cancelled" | "expired";
          started_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          contract_id: string;
          plan_id: string;
          status?: "trial" | "active" | "pending" | "past_due" | "suspended" | "cancelled" | "expired";
          started_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      usage_limits: {
        Row: {
          id: string;
          tenant_id: string;
          code: string;
          limit_value: number;
          used_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          code: string;
          limit_value: number;
          used_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["usage_limits"]["Insert"]>;
        Relationships: [];
      };
      entitlements: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          module_id: string | null;
          resource_type: string | null;
          resource_id: string | null;
          status: "active" | "pending" | "planned" | "suspended";
          source: "plan" | "contract" | "subscription" | "trial" | "manual" | "core";
          source_id: string | null;
          starts_at: string;
          expires_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          product_id: string;
          module_id?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          status?: "active" | "pending" | "planned" | "suspended";
          source: "plan" | "contract" | "subscription" | "trial" | "manual" | "core";
          source_id?: string | null;
          starts_at?: string;
          expires_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["entitlements"]["Insert"]>;
        Relationships: [];
      };
      branding_settings: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          logo_url: string | null;
          small_logo_url: string | null;
          favicon_url: string | null;
          primary_color: string;
          secondary_color: string;
          login_image_url: string | null;
          support_email: string | null;
          support_phone: string | null;
          terms_url: string | null;
          privacy_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          logo_url?: string | null;
          small_logo_url?: string | null;
          favicon_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          login_image_url?: string | null;
          support_email?: string | null;
          support_phone?: string | null;
          terms_url?: string | null;
          privacy_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["branding_settings"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string | null;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

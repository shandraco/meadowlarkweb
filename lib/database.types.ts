// Hand-written Supabase schema types — mirrors supabase/schema.sql +
// migration_001..004. Structured to match the canonical shape produced by
// `supabase gen types typescript` so PostgREST's overload resolution for
// .from().update() / .insert() / .upsert() infers correctly.
//
// Conventions:
//   • Generated columns (`generated always as identity`, `default now()`,
//     `default gen_random_uuid()`) are optional in Insert/Update.
//   • Columns that are `not null` without a default are required in Insert.
//   • Update mirrors Insert's shape but every field is optional.
//   • Enum columns reference Database["public"]["Enums"][…] so a single
//     rename in the Enums block flows through everywhere.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // -----------------------------------------------------------------
      // Products (schema.sql + migration_003)
      // -----------------------------------------------------------------
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tier: string | null;
          category: Database["public"]["Enums"]["product_category"];
          description: string | null;
          price_cents: number;
          sale_price_cents: number | null;
          sale_starts_at: string | null;
          sale_ends_at: string | null;
          image_url: string | null;
          abv: string | null;
          stock_quantity: number;
          active: boolean;
          sort_order: number;
          pos_category_id: string | null;
          pos_order: number;
          vendor_id: string | null;
          requires_age_check: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          price_cents: number;
          id?: string;
          tier?: string | null;
          category?: Database["public"]["Enums"]["product_category"];
          description?: string | null;
          sale_price_cents?: number | null;
          sale_starts_at?: string | null;
          sale_ends_at?: string | null;
          image_url?: string | null;
          abv?: string | null;
          stock_quantity?: number;
          active?: boolean;
          sort_order?: number;
          pos_category_id?: string | null;
          pos_order?: number;
          vendor_id?: string | null;
          requires_age_check?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          price_cents?: number;
          id?: string;
          tier?: string | null;
          category?: Database["public"]["Enums"]["product_category"];
          description?: string | null;
          sale_price_cents?: number | null;
          sale_starts_at?: string | null;
          sale_ends_at?: string | null;
          image_url?: string | null;
          abv?: string | null;
          stock_quantity?: number;
          active?: boolean;
          sort_order?: number;
          pos_category_id?: string | null;
          pos_order?: number;
          vendor_id?: string | null;
          requires_age_check?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_pos_category_id_fkey";
            columns: ["pos_category_id"];
            isOneToOne: false;
            referencedRelation: "pos_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // POS categories
      // -----------------------------------------------------------------
      pos_categories: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          name: string;
          id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      // -----------------------------------------------------------------
      // POS register locations
      // -----------------------------------------------------------------
      locations: {
        Row: {
          id: string;
          name: string;
          kind: Database["public"]["Enums"]["location_kind"];
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          name: string;
          id?: string;
          kind?: Database["public"]["Enums"]["location_kind"];
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["location_kind"];
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      // -----------------------------------------------------------------
      // Consignment vendors
      // -----------------------------------------------------------------
      vendors: {
        Row: {
          id: string;
          name: string;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          split_pct: number;
          notes: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          id?: string;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          split_pct?: number;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          id?: string;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          split_pct?: number;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      // -----------------------------------------------------------------
      // Orders (schema.sql + migration_003)
      // -----------------------------------------------------------------
      orders: {
        Row: {
          id: string;
          order_number: number;
          channel: Database["public"]["Enums"]["order_channel"];
          status: Database["public"]["Enums"]["order_status"];
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          notes: string | null;
          created_by: string | null;
          location_id: string | null;
          stripe_payment_intent_id: string | null;
          payment_provider: string | null;
          payment_ref: string | null;
          age_confirmed_at: string | null;
          age_confirm_ip: string | null;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          channel: Database["public"]["Enums"]["order_channel"];
          id?: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          notes?: string | null;
          created_by?: string | null;
          location_id?: string | null;
          stripe_payment_intent_id?: string | null;
          payment_provider?: string | null;
          payment_ref?: string | null;
          age_confirmed_at?: string | null;
          age_confirm_ip?: string | null;
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          channel?: Database["public"]["Enums"]["order_channel"];
          id?: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          notes?: string | null;
          created_by?: string | null;
          location_id?: string | null;
          stripe_payment_intent_id?: string | null;
          payment_provider?: string | null;
          payment_ref?: string | null;
          age_confirmed_at?: string | null;
          age_confirm_ip?: string | null;
          created_at?: string;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // Order line items
      // -----------------------------------------------------------------
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          name_snapshot: string;
          unit_price_cents: number;
          quantity: number;
          line_total_cents: number;
        };
        Insert: {
          order_id: string;
          name_snapshot: string;
          unit_price_cents: number;
          quantity: number;
          line_total_cents: number;
          id?: string;
          product_id?: string | null;
        };
        Update: {
          order_id?: string;
          name_snapshot?: string;
          unit_price_cents?: number;
          quantity?: number;
          line_total_cents?: number;
          id?: string;
          product_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // Staff profiles
      // -----------------------------------------------------------------
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // Stock movements (audit trail)
      // -----------------------------------------------------------------
      stock_movements: {
        Row: {
          id: string;
          product_id: string;
          delta: number;
          reason: Database["public"]["Enums"]["stock_reason"];
          note: string | null;
          order_id: string | null;
          created_by: string | null;
          vendor_id: string | null;
          created_at: string;
        };
        Insert: {
          product_id: string;
          delta: number;
          reason: Database["public"]["Enums"]["stock_reason"];
          id?: string;
          note?: string | null;
          order_id?: string | null;
          created_by?: string | null;
          vendor_id?: string | null;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          delta?: number;
          reason?: Database["public"]["Enums"]["stock_reason"];
          id?: string;
          note?: string | null;
          order_id?: string | null;
          created_by?: string | null;
          vendor_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movements_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movements_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // CMS content blocks
      // -----------------------------------------------------------------
      site_content: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "site_content_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // Bookable resources (shelters, barn, fields)
      // -----------------------------------------------------------------
      bookable_resources: {
        Row: {
          id: string;
          name: string;
          kind: Database["public"]["Enums"]["resource_kind"];
          capacity: number | null;
          description: string | null;
          price_cents: number;
          deposit_pct: number;
          hero_image_url: string | null;
          floor_plan_url: string | null;
          amenities: Json;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          name: string;
          id?: string;
          kind?: Database["public"]["Enums"]["resource_kind"];
          capacity?: number | null;
          description?: string | null;
          price_cents?: number;
          deposit_pct?: number;
          hero_image_url?: string | null;
          floor_plan_url?: string | null;
          amenities?: Json;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["resource_kind"];
          capacity?: number | null;
          description?: string | null;
          price_cents?: number;
          deposit_pct?: number;
          hero_image_url?: string | null;
          floor_plan_url?: string | null;
          amenities?: Json;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      // -----------------------------------------------------------------
      // Field trip programs
      // -----------------------------------------------------------------
      field_trip_programs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_per_student_cents: number;
          min_students: number;
          max_students: number;
          season_start_month: number | null;
          season_end_month: number | null;
          schedule: Json;
          teacher_notes: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          id?: string;
          description?: string | null;
          price_per_student_cents?: number;
          min_students?: number;
          max_students?: number;
          season_start_month?: number | null;
          season_end_month?: number | null;
          schedule?: Json;
          teacher_notes?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          id?: string;
          description?: string | null;
          price_per_student_cents?: number;
          min_students?: number;
          max_students?: number;
          season_start_month?: number | null;
          season_end_month?: number | null;
          schedule?: Json;
          teacher_notes?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      // -----------------------------------------------------------------
      // Bookings — customer reservations (shelter + field trip share)
      // -----------------------------------------------------------------
      bookings: {
        Row: {
          id: string;
          booking_number: number;
          resource_id: string | null;
          program_id: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          starts_at: string;
          ends_at: string;
          guest_count: number;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          organization: string | null;
          notes: string | null;
          total_cents: number;
          deposit_cents: number;
          payment_provider: string | null;
          payment_ref: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          customer_name: string;
          customer_email: string;
          starts_at: string;
          ends_at: string;
          id?: string;
          resource_id?: string | null;
          program_id?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          guest_count?: number;
          customer_phone?: string | null;
          organization?: string | null;
          notes?: string | null;
          total_cents?: number;
          deposit_cents?: number;
          payment_provider?: string | null;
          payment_ref?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          customer_name?: string;
          customer_email?: string;
          starts_at?: string;
          ends_at?: string;
          id?: string;
          resource_id?: string | null;
          program_id?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          guest_count?: number;
          customer_phone?: string | null;
          organization?: string | null;
          notes?: string | null;
          total_cents?: number;
          deposit_cents?: number;
          payment_provider?: string | null;
          payment_ref?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "bookable_resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "field_trip_programs";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // Blocked dates (resource unavailability)
      // -----------------------------------------------------------------
      blocked_dates: {
        Row: {
          id: string;
          resource_id: string;
          starts_at: string;
          ends_at: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          resource_id: string;
          starts_at: string;
          ends_at: string;
          id?: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          resource_id?: string;
          starts_at?: string;
          ends_at?: string;
          id?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocked_dates_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "bookable_resources";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // Cider Club plans
      // -----------------------------------------------------------------
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          tier: string;
          cadence: string;
          bottles_per_shipment: number;
          price_cents: number;
          description: string | null;
          benefits: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          name: string;
          tier: string;
          price_cents: number;
          id?: string;
          cadence?: string;
          bottles_per_shipment?: number;
          description?: string | null;
          benefits?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          tier?: string;
          price_cents?: number;
          id?: string;
          cadence?: string;
          bottles_per_shipment?: number;
          description?: string | null;
          benefits?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      // -----------------------------------------------------------------
      // Cider Club members
      // -----------------------------------------------------------------
      subscriptions: {
        Row: {
          id: string;
          member_number: number;
          plan_id: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          shipping_address: string | null;
          fulfillment_mode: string;
          member_token: string;
          started_at: string;
          paused_until: string | null;
          cancelled_at: string | null;
          notes: string | null;
        };
        Insert: {
          customer_name: string;
          customer_email: string;
          id?: string;
          plan_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          customer_phone?: string | null;
          shipping_address?: string | null;
          fulfillment_mode?: string;
          member_token?: string;
          started_at?: string;
          paused_until?: string | null;
          cancelled_at?: string | null;
          notes?: string | null;
        };
        Update: {
          customer_name?: string;
          customer_email?: string;
          id?: string;
          plan_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          customer_phone?: string | null;
          shipping_address?: string | null;
          fulfillment_mode?: string;
          member_token?: string;
          started_at?: string;
          paused_until?: string | null;
          cancelled_at?: string | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // Cider Club shipment queue
      // -----------------------------------------------------------------
      subscription_shipments: {
        Row: {
          id: string;
          subscription_id: string;
          ship_date: string;
          status: Database["public"]["Enums"]["shipment_status"];
          product_ids: Json;
          tracking_number: string | null;
          notes: string | null;
          created_at: string;
          shipped_at: string | null;
        };
        Insert: {
          subscription_id: string;
          ship_date: string;
          id?: string;
          status?: Database["public"]["Enums"]["shipment_status"];
          product_ids?: Json;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          shipped_at?: string | null;
        };
        Update: {
          subscription_id?: string;
          ship_date?: string;
          id?: string;
          status?: Database["public"]["Enums"]["shipment_status"];
          product_ids?: Json;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          shipped_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_shipments_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };

      // -----------------------------------------------------------------
      // Season reminder subscribers
      // -----------------------------------------------------------------
      season_subscribers: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          topics: Json;
          confirmed_at: string;
          unsubscribe_token: string;
          created_at: string;
        };
        Insert: {
          email: string;
          id?: string;
          phone?: string | null;
          topics?: Json;
          confirmed_at?: string;
          unsubscribe_token?: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          id?: string;
          phone?: string | null;
          topics?: Json;
          confirmed_at?: string;
          unsubscribe_token?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      // -----------------------------------------------------------------
      // Discount campaigns
      // -----------------------------------------------------------------
      discount_campaigns: {
        Row: {
          id: string;
          name: string;
          status: Database["public"]["Enums"]["campaign_status"];
          product_ids: Json;
          starts_at: string | null;
          ends_at: string | null;
          hero_image_url: string | null;
          headline: string | null;
          body: string | null;
          social_posted_at: string | null;
          social_post_ref: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          id?: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          product_ids?: Json;
          starts_at?: string | null;
          ends_at?: string | null;
          hero_image_url?: string | null;
          headline?: string | null;
          body?: string | null;
          social_posted_at?: string | null;
          social_post_ref?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          id?: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          product_ids?: Json;
          starts_at?: string | null;
          ends_at?: string | null;
          hero_image_url?: string | null;
          headline?: string | null;
          body?: string | null;
          social_posted_at?: string | null;
          social_post_ref?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      // -----------------------------------------------------------------
      // Shipping providers
      // -----------------------------------------------------------------
      shipping_providers: {
        Row: {
          id: string;
          name: string;
          code: string;
          states_covered: Json;
          api_base_url: string | null;
          active: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          code: string;
          id?: string;
          states_covered?: Json;
          api_base_url?: string | null;
          active?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          code?: string;
          id?: string;
          states_covered?: Json;
          api_base_url?: string | null;
          active?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      vendor_sales_summary: {
        Row: {
          vendor_id: string;
          vendor_name: string;
          split_pct: number;
          order_count: number;
          gross_cents: number;
          vendor_owed_cents: number;
        };
        Relationships: [];
      };
    };

    Functions: {
      mark_order_paid: {
        Args: { p_payment_intent: string };
        Returns: undefined;
      };
      adjust_stock: {
        Args: {
          p_product: string;
          p_delta: number;
          p_reason: Database["public"]["Enums"]["stock_reason"];
          p_note?: string | null;
          p_user?: string | null;
        };
        Returns: number;
      };
      resource_has_conflict: {
        Args: { p_resource: string; p_start: string; p_end: string };
        Returns: boolean;
      };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };

    Enums: {
      user_role: "admin" | "cashier";
      product_category: "cider" | "farm-good";
      order_channel: "online" | "pos";
      order_status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
      location_kind: "farm" | "market" | "popup";
      stock_reason: "initial" | "restock" | "sale" | "spoilage" | "correction" | "return";
      resource_kind: "shelter" | "barn" | "field" | "other";
      booking_status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
      subscription_status: "active" | "paused" | "cancelled";
      shipment_status: "queued" | "packed" | "shipped" | "delivered" | "skipped";
      campaign_status: "draft" | "scheduled" | "live" | "ended";
    };

    CompositeTypes: Record<string, never>;
  };
}

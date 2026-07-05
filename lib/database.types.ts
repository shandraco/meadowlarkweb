// Hand-written Supabase schema types (mirrors supabase/schema.sql + migrations).
import type {
  Product,
  Order,
  OrderItem,
  Profile,
  StockMovement,
  SiteContent,
  PosCategory,
  Location,
  Vendor,
  BookableResource,
  FieldTripProgram,
  Booking,
  BlockedDate,
  SubscriptionPlan,
  Subscription,
  SubscriptionShipment,
  SeasonSubscriber,
  DiscountCampaign,
  ShippingProvider,
} from "./types";

// A convenient shape for "any JSON blob" columns.
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: {
          slug: string;
          name: string;
          price_cents: number;
          id?: string;
          tier?: string | null;
          category?: string;
          description?: string | null;
          image_url?: string | null;
          abv?: string | null;
          stock_quantity?: number;
          active?: boolean;
          sort_order?: number;
          pos_category_id?: string | null;
          pos_order?: number;
          sale_price_cents?: number | null;
          sale_starts_at?: string | null;
          sale_ends_at?: string | null;
          vendor_id?: string | null;
          requires_age_check?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      pos_categories: {
        Row: PosCategory;
        Insert: { name: string; id?: string; sort_order?: number; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["pos_categories"]["Insert"]>;
        Relationships: [];
      };
      locations: {
        Row: Location;
        Insert: {
          name: string;
          id?: string;
          kind?: "farm" | "market" | "popup";
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
        Relationships: [];
      };
      vendors: {
        Row: Vendor;
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
        Update: Partial<Database["public"]["Tables"]["vendors"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: {
          channel: "online" | "pos";
          id?: string;
          status?: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
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
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          order_id: string;
          name_snapshot: string;
          unit_price_cents: number;
          quantity: number;
          line_total_cents: number;
          id?: string;
          product_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: { id: string; full_name?: string | null; role?: "admin" | "cashier"; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      stock_movements: {
        Row: StockMovement;
        Insert: {
          product_id: string;
          delta: number;
          reason: "initial" | "restock" | "sale" | "spoilage" | "correction" | "return";
          id?: string;
          note?: string | null;
          order_id?: string | null;
          created_by?: string | null;
          vendor_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stock_movements"]["Insert"]>;
        Relationships: [];
      };
      site_content: {
        Row: SiteContent;
        Insert: {
          key: string;
          value?: Record<string, unknown>;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["site_content"]["Insert"]>;
        Relationships: [];
      };
      bookable_resources: {
        Row: BookableResource;
        Insert: {
          name: string;
          id?: string;
          kind?: "shelter" | "barn" | "field" | "other";
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
        Update: Partial<Database["public"]["Tables"]["bookable_resources"]["Insert"]>;
        Relationships: [];
      };
      field_trip_programs: {
        Row: FieldTripProgram;
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
        Update: Partial<Database["public"]["Tables"]["field_trip_programs"]["Insert"]>;
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: {
          customer_name: string;
          customer_email: string;
          starts_at: string;
          ends_at: string;
          guest_count?: number;
          id?: string;
          resource_id?: string | null;
          program_id?: string | null;
          status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
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
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [];
      };
      blocked_dates: {
        Row: BlockedDate;
        Insert: {
          resource_id: string;
          starts_at: string;
          ends_at: string;
          id?: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocked_dates"]["Insert"]>;
        Relationships: [];
      };
      subscription_plans: {
        Row: SubscriptionPlan;
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
        Update: Partial<Database["public"]["Tables"]["subscription_plans"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: {
          customer_name: string;
          customer_email: string;
          id?: string;
          plan_id?: string | null;
          status?: "active" | "paused" | "cancelled";
          customer_phone?: string | null;
          shipping_address?: string | null;
          fulfillment_mode?: string;
          started_at?: string;
          paused_until?: string | null;
          cancelled_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      subscription_shipments: {
        Row: SubscriptionShipment;
        Insert: {
          subscription_id: string;
          ship_date: string;
          id?: string;
          status?: "queued" | "packed" | "shipped" | "delivered" | "skipped";
          product_ids?: Json;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          shipped_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["subscription_shipments"]["Insert"]>;
        Relationships: [];
      };
      season_subscribers: {
        Row: SeasonSubscriber;
        Insert: {
          email: string;
          id?: string;
          phone?: string | null;
          topics?: Json;
          confirmed_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["season_subscribers"]["Insert"]>;
        Relationships: [];
      };
      discount_campaigns: {
        Row: DiscountCampaign;
        Insert: {
          name: string;
          id?: string;
          status?: "draft" | "scheduled" | "live" | "ended";
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
        Update: Partial<Database["public"]["Tables"]["discount_campaigns"]["Insert"]>;
        Relationships: [];
      };
      shipping_providers: {
        Row: ShippingProvider;
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
        Update: Partial<Database["public"]["Tables"]["shipping_providers"]["Insert"]>;
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
          p_reason: "initial" | "restock" | "sale" | "spoilage" | "correction" | "return";
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

// Hand-written Supabase schema types (mirrors supabase/schema.sql).
// Wired into the Supabase clients so table reads/writes and rpc() are typed.
// Can later be regenerated with `supabase gen types typescript`.
import type { Product, Order, OrderItem, Profile } from "./types";

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
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
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
          stripe_payment_intent_id?: string | null;
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
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          role?: "admin" | "cashier";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      mark_order_paid: {
        Args: { p_payment_intent: string };
        Returns: undefined;
      };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: "admin" | "cashier";
      order_channel: "online" | "pos";
      order_status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
    };
    CompositeTypes: Record<string, never>;
  };
}

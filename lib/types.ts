// Shared DB row types (hand-written; can later be replaced by `supabase gen types`).

export type ProductCategory = "cider" | "farm-good";
export type OrderChannel = "online" | "pos";
export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
export type UserRole = "admin" | "cashier";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tier: string | null;
  category: ProductCategory;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  abv: string | null;
  stock_quantity: number;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type Order = {
  id: string;
  order_number: number;
  channel: OrderChannel;
  status: OrderStatus;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  created_by: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name_snapshot: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

// A cart line shared by the online cart and the POS ticket.
export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  imageUrl: string | null;
}

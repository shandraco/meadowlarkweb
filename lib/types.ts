// Shared DB row types (hand-written; can later be replaced by `supabase gen types`).

export type ProductCategory = "cider" | "farm-good";
export type OrderChannel = "online" | "pos";
export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
export type UserRole = "admin" | "cashier";
export type StockReason = "initial" | "restock" | "sale" | "spoilage" | "correction" | "return";
export type LocationKind = "farm" | "market" | "popup";

export type ResourceKind = "shelter" | "barn" | "field" | "other";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type ShipmentStatus = "queued" | "packed" | "shipped" | "delivered" | "skipped";
export type CampaignStatus = "draft" | "scheduled" | "live" | "ended";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tier: string | null;
  category: ProductCategory;
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
  barcode: string | null;
  created_at: string;
  updated_at: string;
};

export type PosCategory = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type Location = {
  id: string;
  name: string;
  kind: LocationKind;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type Vendor = {
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
  location_id: string | null;
  stripe_payment_intent_id: string | null;
  payment_provider: string | null;
  payment_ref: string | null;
  age_confirmed_at: string | null;
  age_confirm_ip: string | null;
  created_at: string;
  paid_at: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name_snapshot: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type StockMovement = {
  id: string;
  product_id: string;
  delta: number;
  reason: StockReason;
  note: string | null;
  order_id: string | null;
  created_by: string | null;
  vendor_id: string | null;
  created_at: string;
};

export type SiteContent = {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
};

export type ResourceAmenities = {
  covered?: "full" | "semi" | "none";
  ac?: boolean;
  near_parking?: boolean;
  restrooms?: boolean;
  tables?: number;
  seats?: number;
  farm_open?: boolean;
  private?: boolean;
};

export type BookableResource = {
  id: string;
  name: string;
  kind: ResourceKind;
  capacity: number | null;
  description: string | null;
  price_cents: number;
  deposit_pct: number;
  hero_image_url: string | null;
  floor_plan_url: string | null;
  amenities: ResourceAmenities;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type FieldTripProgram = {
  id: string;
  name: string;
  description: string | null;
  price_per_student_cents: number;
  min_students: number;
  max_students: number;
  season_start_month: number | null;
  season_end_month: number | null;
  schedule: { time: string; activity: string }[];
  teacher_notes: string | null;
  active: boolean;
  created_at: string;
};

export type IncidentSeverity = "low" | "medium" | "high";
export type IncidentStatus = "open" | "resolved";

export type FarmIncident = {
  id: string;
  title: string;
  details: string | null;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_note: string | null;
  occurred_at: string;
  created_by: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  booking_number: number;
  resource_id: string | null;
  program_id: string | null;
  status: BookingStatus;
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

export type BlockedDate = {
  id: string;
  resource_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
};

export type SubscriptionPlan = {
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

export type Subscription = {
  id: string;
  member_number: number;
  plan_id: string | null;
  status: SubscriptionStatus;
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

export type SubscriptionShipment = {
  id: string;
  subscription_id: string;
  ship_date: string;
  status: ShipmentStatus;
  product_ids: string[];
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  shipped_at: string | null;
};

export type SeasonSubscriber = {
  id: string;
  email: string;
  phone: string | null;
  topics: string[];
  confirmed_at: string;
  unsubscribe_token: string;
  created_at: string;
};

export type DiscountCampaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  product_ids: string[];
  starts_at: string | null;
  ends_at: string | null;
  hero_image_url: string | null;
  headline: string | null;
  body: string | null;
  social_posted_at: string | null;
  social_post_ref: string | null;
  created_at: string;
};

export type ShippingProvider = {
  id: string;
  name: string;
  code: string;
  states_covered: string[];
  api_base_url: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
};

// Cart line shared by online cart and POS ticket.
export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  imageUrl: string | null;
  requiresAgeCheck: boolean;
}

// Effective price honoring an active sale window. Kept in sync with the SQL
// `effective_price_cents` function so client math matches server math.
export function effectivePriceCents(
  p: Pick<Product, "price_cents" | "sale_price_cents" | "sale_starts_at" | "sale_ends_at">,
): number {
  if (p.sale_price_cents == null) return p.price_cents;
  const now = Date.now();
  const startsOk = !p.sale_starts_at || new Date(p.sale_starts_at).getTime() <= now;
  const endsOk = !p.sale_ends_at || new Date(p.sale_ends_at).getTime() > now;
  return startsOk && endsOk ? p.sale_price_cents : p.price_cents;
}

export function isOnSale(
  p: Pick<Product, "price_cents" | "sale_price_cents" | "sale_starts_at" | "sale_ends_at">,
): boolean {
  return effectivePriceCents(p) < p.price_cents;
}

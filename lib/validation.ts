// Runtime input schemas for every mutating server action.
//
// TypeScript catches shape errors at compile time, but Next.js Server Actions
// deserialize their payload from the wire before the function body runs. That
// payload has already crossed the trust boundary — a compromised client, a
// forged POST, or a tampered network could send anything. Every action parses
// its input through the matching schema before touching the DB.
//
// Rules:
//   • Prefer .strict() so unknown fields are rejected outright.
//   • Trim strings and enforce max lengths.
//   • Never accept fields that the server owns (ids, timestamps, actor_id,
//     stock_quantity, member_number, etc.) — those are set on the server.

import { z } from "zod";

// ---- Primitive helpers ----------------------------------------------------

export const uuid = z.string().uuid("Invalid id.");

export const nonEmptyTrimmed = (label: string, max = 200) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, `${label} required.`).max(max, `${label} too long.`));

export const optionalTrimmed = (max = 2000) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().max(max))
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

export const email = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().email("Enter a valid email.").max(254));

export const phone = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.string().max(30))
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const nonNegativeInt = z.number().int().nonnegative();
export const positiveInt = z.number().int().positive();

export const isoDateTime = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/));

// ---- Enum unions (mirror DB types + CHECK constraints) --------------------

export const ProductCategory = z.enum(["cider", "farm-good"]);
export const OrderChannel = z.enum(["online", "pos"]);
export const OrderStatus = z.enum(["pending", "paid", "fulfilled", "cancelled", "refunded"]);
export const StockReason = z.enum(["initial", "restock", "sale", "spoilage", "correction", "return"]);
export const LocationKind = z.enum(["farm", "market", "popup"]);
export const ResourceKind = z.enum(["shelter", "barn", "field", "other"]);
export const BookingStatus = z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]);
export const SubscriptionStatus = z.enum(["active", "paused", "cancelled"]);
export const ShipmentStatus = z.enum(["queued", "packed", "shipped", "delivered", "skipped"]);
export const CampaignStatus = z.enum(["draft", "scheduled", "live", "ended"]);
export const FulfillmentMode = z.enum(["ship", "pickup"]);
export const PlanTier = z.enum(["basic", "reserve", "fine"]);
export const PlanCadence = z.enum(["monthly", "quarterly", "seasonal", "biannual"]);

// ---- Auth / session -------------------------------------------------------

export const LoginInput = z
  .object({
    email,
    password: z.string().min(1, "Password required.").max(200),
    next: z.string().max(500).optional(),
  })
  .strict();

// ---- Storefront: checkout -------------------------------------------------

export const CartItemInput = z
  .object({
    productId: uuid,
    quantity: z.number().int().positive().max(99),
  })
  .strict();

export const PlaceOrderInput = z
  .object({
    lines: z.array(CartItemInput).min(1, "Cart is empty.").max(50),
    customer: z
      .object({
        name: nonEmptyTrimmed("Name", 120),
        email: email,
        phone: phone,
      })
      .strict(),
    fulfillment: z.enum(["pickup", "ship"]),
    address: z.string().transform((s) => s.trim()).pipe(z.string().max(500)).optional(),
    ageConfirmed: z.boolean(),
  })
  .strict();

// ---- POS ------------------------------------------------------------------

export const PosOrderInput = z
  .object({
    items: z.array(CartItemInput).min(1, "Ticket is empty.").max(200),
    customerName: z.string().transform((s) => s.trim()).pipe(z.string().max(120)).optional(),
  })
  .strict();

export const ChooseLocationInput = uuid;

// ---- Products -------------------------------------------------------------

const priceCentsSchema = z.number().int().nonnegative().max(1_000_000);

// Base object shape — .refine()s are applied per-variant below because Zod's
// ZodEffects (produced by .refine()) can't be .extend()ed further.
const productBase = z
  .object({
    name: nonEmptyTrimmed("Name", 160),
    slug: z.string().transform((s) => s.trim()).pipe(z.string().max(60)).optional(),
    tier: z.string().transform((s) => s.trim()).pipe(z.string().max(60)),
    category: ProductCategory,
    description: z.string().transform((s) => s.trim()).pipe(z.string().max(4000)),
    priceCents: priceCentsSchema,
    abv: z.string().transform((s) => s.trim()).pipe(z.string().max(30)),
    imageUrl: z.string().transform((s) => s.trim()).pipe(z.string().url("Invalid URL.").max(500).or(z.literal(""))),
    sortOrder: z.number().int().min(0).max(9999),
    vendorId: uuid.nullable().optional(),
    requiresAgeCheck: z.boolean().optional(),
    salePriceCents: priceCentsSchema.nullable().optional(),
    saleStartsAt: z.string().datetime({ offset: true }).nullable().optional(),
    saleEndsAt: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .strict();

type ProductLike = z.infer<typeof productBase>;

const saleInvariants = <T extends ProductLike>(v: T) => {
  if (v.salePriceCents != null && v.salePriceCents >= v.priceCents) return false;
  if (v.saleStartsAt && v.saleEndsAt && new Date(v.saleStartsAt) >= new Date(v.saleEndsAt)) return false;
  return true;
};

const saleInvariantMsg = "Sale price must be lower than regular price and sale end must be after sale start.";

export const ProductInput = productBase.refine(saleInvariants, {
  message: saleInvariantMsg,
  path: ["salePriceCents"],
});

export const CreateProductInput = productBase
  .extend({ initialStock: z.number().int().min(0).max(100_000) })
  .refine(saleInvariants, { message: saleInvariantMsg, path: ["salePriceCents"] });

export const UpdateProductInput = productBase
  .extend({ id: uuid })
  .refine(saleInvariants, { message: saleInvariantMsg, path: ["salePriceCents"] });

export const AdjustStockInput = z
  .object({
    productId: uuid,
    delta: z.number().int().refine((n) => n !== 0, "Non-zero delta required.").min(-100_000).max(100_000),
    reason: StockReason,
    note: z.string().transform((s) => s.trim()).pipe(z.string().max(500)).optional(),
    vendorId: uuid.nullable().optional(),
  })
  .strict();

export const SetActiveInput = z
  .object({
    id: uuid,
    active: z.boolean(),
  })
  .strict();

// ---- Locations ------------------------------------------------------------

export const LocationInput = z
  .object({
    name: nonEmptyTrimmed("Location name", 120),
    kind: LocationKind,
    active: z.boolean(),
    sortOrder: z.number().int().min(0).max(9999),
  })
  .strict();

// ---- Vendors --------------------------------------------------------------

export const VendorInput = z
  .object({
    name: nonEmptyTrimmed("Vendor name", 120),
    contactName: z.string().transform((s) => s.trim()).pipe(z.string().max(120)).optional(),
    contactEmail: z.string().transform((s) => s.trim()).pipe(z.union([z.string().email().max(254), z.literal("")])).optional(),
    contactPhone: z.string().transform((s) => s.trim()).pipe(z.string().max(30)).optional(),
    splitPct: z.number().min(0).max(100),
    notes: z.string().transform((s) => s.trim()).pipe(z.string().max(2000)).optional(),
  })
  .strict();

// ---- CMS / content --------------------------------------------------------

export const SaveContentInput = z
  .object({
    key: z.string().min(1).max(60),
    values: z.record(z.string().max(60), z.string().max(10_000)),
  })
  .strict();

// ---- Resources (bookable) -------------------------------------------------

export const ResourceAmenitiesSchema = z
  .object({
    covered: z.enum(["full", "semi", "none"]).optional(),
    ac: z.boolean().optional(),
    near_parking: z.boolean().optional(),
    restrooms: z.boolean().optional(),
    tables: z.number().int().min(0).max(1000).optional(),
    seats: z.number().int().min(0).max(10_000).optional(),
    farm_open: z.boolean().optional(),
    private: z.boolean().optional(),
  })
  .strict();

export const ResourceInput = z
  .object({
    name: nonEmptyTrimmed("Name", 120),
    kind: ResourceKind,
    capacity: z.number().int().positive().max(5000).nullable(),
    description: z.string().transform((s) => s.trim()).pipe(z.string().max(4000)),
    priceCents: priceCentsSchema,
    depositPct: z.number().int().min(0).max(100),
    heroImageUrl: z.string().transform((s) => s.trim()).pipe(z.union([z.string().url().max(500), z.literal("")])),
    floorPlanUrl: z.string().transform((s) => s.trim()).pipe(z.union([z.string().url().max(500), z.literal("")])),
    amenities: ResourceAmenitiesSchema,
    sortOrder: z.number().int().min(0).max(9999),
  })
  .strict();

export const BlockedDateInput = z
  .object({
    resourceId: uuid,
    startsAt: z.string().datetime({ offset: true }).or(isoDateTime),
    endsAt: z.string().datetime({ offset: true }).or(isoDateTime),
    reason: z.string().transform((s) => s.trim()).pipe(z.string().max(200)).optional(),
  })
  .strict()
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: "End must be after start.",
    path: ["endsAt"],
  });

// ---- Field trip programs --------------------------------------------------

export const ScheduleStepSchema = z
  .object({
    time: z.string().max(10),
    activity: z.string().max(200),
  })
  .strict();

export const ProgramInput = z
  .object({
    name: nonEmptyTrimmed("Program name", 120),
    description: z.string().transform((s) => s.trim()).pipe(z.string().max(4000)),
    pricePerStudentCents: priceCentsSchema,
    minStudents: z.number().int().positive().max(500),
    maxStudents: z.number().int().positive().max(500),
    seasonStartMonth: z.number().int().min(1).max(12).nullable(),
    seasonEndMonth: z.number().int().min(1).max(12).nullable(),
    schedule: z.array(ScheduleStepSchema).max(30),
    teacherNotes: z.string().transform((s) => s.trim()).pipe(z.string().max(4000)),
  })
  .strict()
  .refine((v) => v.maxStudents >= v.minStudents, {
    message: "Max students must be ≥ min.",
    path: ["maxStudents"],
  });

// ---- Bookings (public request) --------------------------------------------

export const RequestBookingInput = z
  .object({
    resourceId: uuid.optional(),
    programId: uuid.optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time."),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time."),
    guestCount: z.number().int().positive().max(5000),
    customer: z
      .object({
        name: nonEmptyTrimmed("Name", 120),
        email: email,
        phone: phone,
        organization: z.string().transform((s) => s.trim()).pipe(z.string().max(120)).optional(),
      })
      .strict(),
    notes: z.string().transform((s) => s.trim()).pipe(z.string().max(2000)).optional(),
  })
  .strict()
  .refine((v) => !!v.resourceId || !!v.programId, {
    message: "Pick a resource or program.",
    path: ["resourceId"],
  });

export const SetBookingStatusInput = z
  .object({ id: uuid, status: BookingStatus })
  .strict();

// ---- Cider Club -----------------------------------------------------------

export const PlanInput = z
  .object({
    name: nonEmptyTrimmed("Plan name", 120),
    tier: PlanTier,
    cadence: PlanCadence,
    bottlesPerShipment: z.number().int().positive().max(24),
    priceCents: priceCentsSchema,
    description: z.string().transform((s) => s.trim()).pipe(z.string().max(4000)),
    benefits: z.string().transform((s) => s.trim()).pipe(z.string().max(2000)),
    sortOrder: z.number().int().min(0).max(9999),
  })
  .strict();

export const JoinClubInput = z
  .object({
    planId: uuid,
    customer: z
      .object({
        name: nonEmptyTrimmed("Name", 120),
        email: email,
        phone: phone,
      })
      .strict(),
    shippingAddress: z.string().transform((s) => s.trim()).pipe(z.string().max(1000)).optional(),
    fulfillmentMode: FulfillmentMode,
    ageConfirmed: z.boolean().refine((v) => v === true, "You must confirm you are 21 or older."),
  })
  .strict();

export const SetSubscriptionStatusInput = z
  .object({ id: uuid, status: SubscriptionStatus })
  .strict();

export const ScheduleShipmentInput = z
  .object({
    subscriptionId: uuid,
    shipDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
    productIds: z.array(uuid).min(1).max(24),
    notes: z.string().transform((s) => s.trim()).pipe(z.string().max(500)).optional(),
  })
  .strict();

export const SetShipmentStatusInput = z
  .object({
    id: uuid,
    status: ShipmentStatus,
    tracking: z.string().transform((s) => s.trim()).pipe(z.string().max(120)).optional(),
  })
  .strict();

// ---- Member portal (token-authenticated) ---------------------------------

export const MemberToken = z.string().length(32).regex(/^[a-f0-9]+$/, "Invalid token.");

export const MemberUpdateAddressInput = z
  .object({
    token: MemberToken,
    address: z.string().transform((s) => s.trim()).pipe(z.string().max(1000)),
    phone: z.string().transform((s) => s.trim()).pipe(z.string().max(30)),
  })
  .strict();

// ---- Discount campaigns ---------------------------------------------------

export const CampaignInput = z
  .object({
    name: nonEmptyTrimmed("Campaign name", 120),
    status: CampaignStatus,
    productIds: z.array(uuid).max(200),
    startsAt: z.string().datetime({ offset: true }).nullable(),
    endsAt: z.string().datetime({ offset: true }).nullable(),
    heroImageUrl: z.string().transform((s) => s.trim()).pipe(z.union([z.string().url().max(500), z.literal("")])),
    headline: z.string().transform((s) => s.trim()).pipe(z.string().max(200)),
    body: z.string().transform((s) => s.trim()).pipe(z.string().max(4000)),
  })
  .strict()
  .refine(
    (v) => !v.startsAt || !v.endsAt || new Date(v.startsAt) < new Date(v.endsAt),
    { message: "End must be after start.", path: ["endsAt"] },
  );

// ---- Shipping providers ---------------------------------------------------

const stateCode = z.string().regex(/^[A-Z]{2}$/, "Two-letter state code.");

export const ProviderInput = z
  .object({
    name: nonEmptyTrimmed("Name", 120),
    code: z
      .string()
      .transform((s) => s.trim().toLowerCase())
      .pipe(z.string().regex(/^[a-z0-9_]{2,40}$/, "Lowercase letters, digits, underscore only.")),
    statesCovered: z.array(stateCode).max(60),
    apiBaseUrl: z.string().transform((s) => s.trim()).pipe(z.union([z.string().url().max(500), z.literal("")])),
    notes: z.string().transform((s) => s.trim()).pipe(z.string().max(2000)),
    active: z.boolean(),
  })
  .strict();

// ---- Season reminders -----------------------------------------------------

export const SubscribeSeasonsInput = z
  .object({
    email: email,
    phone: phone,
    topics: z.array(z.string().max(60)).min(1).max(20),
  })
  .strict();

// ---- Farm videos (CMS block) ----------------------------------------------

export const VideoSlotSchema = z
  .object({
    title: z.string().max(120),
    url: z.string().url("Invalid URL.").max(500).or(z.literal("")),
    posterUrl: z.string().url().max(500).or(z.literal("")).optional(),
  })
  .strict();

export const FarmVideosInput = z
  .object({
    eyebrow: z.string().max(120),
    headline: z.string().max(200),
    emphasis: z.string().max(200),
    videos: z.array(VideoSlotSchema).max(12),
  })
  .strict();

// ---- Helpers --------------------------------------------------------------

// Formats Zod issues into a single readable message for surface-level errors.
export function firstIssue(err: z.ZodError): string {
  const i = err.issues[0];
  return i.path.length > 0 ? `${i.path.join(".")}: ${i.message}` : i.message;
}

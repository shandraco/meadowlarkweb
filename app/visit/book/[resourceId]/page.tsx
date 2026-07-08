import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBookableResourceById, getResourceMonthAvailability } from "@/lib/bookings";
import { formatUSD } from "@/lib/money";
import BookingForm from "@/components/booking/BookingForm";

export const dynamic = "force-dynamic";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function BookResourcePage({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  const resource = await getBookableResourceById(resourceId);
  if (!resource || !resource.active) notFound();

  const monthKey = currentMonthKey();
  const monthStart = new Date(`${monthKey}-01T00:00:00Z`);
  const availability = await getResourceMonthAvailability(resource.id, monthStart);

  return (
    <section className="pt-36 pb-28 md:pb-40">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link
          href="/visit/book"
          className="text-xs tracking-widest uppercase font-normal text-stone hover:text-meadow transition-colors"
        >
          ← Back to spaces
        </Link>

        <div className="grid lg:grid-cols-5 gap-12 mt-6">
          <div className="lg:col-span-3">
            <p className="section-label mb-2">{resource.kind === "shelter" ? "Shelter" : resource.kind}</p>
            <h1 className="font-serif text-5xl md:text-6xl text-ink mb-4">{resource.name}</h1>
            <p className="font-serif text-2xl text-meadow mb-6">
              {resource.price_cents === 0 ? "Rate on inquiry" : `${formatUSD(resource.price_cents)} per hour`}
            </p>

            {resource.hero_image_url && (
              <div className="relative aspect-[16/10] mb-8 overflow-hidden">
                <Image
                  src={resource.hero_image_url}
                  alt={resource.name}
                  fill
                  className="estate-photo object-cover"
                  priority
                />
              </div>
            )}

            {resource.description && (
              <p className="text-ink-soft font-normal leading-relaxed max-w-prose mb-6">{resource.description}</p>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {resource.capacity && (
                <div className="border border-meadow/10 p-4">
                  <p className="text-xs tracking-widest uppercase text-stone font-normal mb-1">Capacity</p>
                  <p className="font-serif text-xl text-ink">{resource.capacity} guests</p>
                </div>
              )}
              <div className="border border-meadow/10 p-4">
                <p className="text-xs tracking-widest uppercase text-stone font-normal mb-1">Deposit</p>
                <p className="font-serif text-xl text-ink">{resource.deposit_pct}% at confirmation</p>
              </div>
            </div>

            {(resource.amenities.covered ||
              resource.amenities.ac ||
              resource.amenities.near_parking ||
              resource.amenities.restrooms ||
              resource.amenities.tables ||
              resource.amenities.seats) && (
              <div className="mb-8">
                <p className="section-label mb-3">Amenities</p>
                <ul className="text-sm text-ink-soft font-normal space-y-1">
                  {resource.amenities.covered && <li>Cover: {resource.amenities.covered}</li>}
                  {resource.amenities.ac && <li>Air conditioning</li>}
                  {resource.amenities.near_parking && <li>Adjacent to parking</li>}
                  {resource.amenities.restrooms && <li>Restrooms nearby</li>}
                  {resource.amenities.tables && <li>{resource.amenities.tables} tables</li>}
                  {resource.amenities.seats && <li>Seating for {resource.amenities.seats}</li>}
                </ul>
              </div>
            )}

            {resource.floor_plan_url && (
              <a
                href={resource.floor_plan_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-block"
              >
                View floor plan
              </a>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="border border-meadow/10 bg-paper-dark/30 p-6 md:p-8 sticky top-32">
              <BookingForm resource={resource} monthKey={monthKey} availability={availability} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

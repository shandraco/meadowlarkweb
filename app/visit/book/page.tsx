import Link from "next/link";
import { getBookableResources, getFieldTripPrograms } from "@/lib/bookings";
import ResourceFilters from "@/components/booking/ResourceFilters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book a Space | Meadowlark Farm" };

export default async function BookPage() {
  const [resources, programs] = await Promise.all([getBookableResources(), getFieldTripPrograms()]);

  return (
    <>
      <section className="pt-36 pb-16 bg-meadow-deep">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-xs tracking-widest uppercase font-normal text-wheat mb-5">Reserve</p>
          <h1 className="font-serif text-6xl md:text-8xl text-paper leading-tight">
            Book the farm.
          </h1>
          <p className="text-paper/70 font-normal text-lg mt-5 max-w-lg">
            Shelters, the barn, and open fields for gatherings — plus school field trips designed for hands-on learning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#spaces" className="btn-accent">
              Browse Spaces
            </Link>
            {programs.length > 0 && (
              <Link href="/visit/field-trips" className="btn-outline border-paper/50 text-paper hover:bg-paper/10 hover:border-paper">
                School Field Trips
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="spaces" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-12">
            <p className="section-label mb-2">Spaces</p>
            <h2 className="font-serif text-4xl md:text-5xl text-ink">Pick a spot on the farm.</h2>
            <p className="text-ink-soft font-normal mt-3 max-w-xl">
              Each space has its own vibe. Filter for what matters — covered vs. open, near parking, capacity — and check the
              calendar for the date you have in mind.
            </p>
          </div>

          {resources.length === 0 ? (
            <p className="text-ink-soft font-normal">
              We&apos;re still setting up bookable spaces online. Email{" "}
              <a href="mailto:gina@themeadowlarkfarm.com" className="text-meadow underline">
                gina@themeadowlarkfarm.com
              </a>{" "}
              to inquire.
            </p>
          ) : (
            <ResourceFilters resources={resources} />
          )}
        </div>
      </section>
    </>
  );
}

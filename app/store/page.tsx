import Image from "next/image";
import Link from "next/link";
import { getActiveProducts, groupByTier } from "@/lib/products";
import { formatUSD } from "@/lib/money";
import AddToCartButton from "@/components/store/AddToCartButton";
import { BranchDivider } from "@/components/Ornament";

export const dynamic = "force-dynamic"; // always reflect live stock

export const metadata = {
  title: "Shop | Meadowlark Farm — Order Estate Cider",
  description: "Order Meadowlark Farm estate cider and farm-store goods online.",
};

export default async function StorePage() {
  const products = await getActiveProducts();
  const sections = groupByTier(products);

  return (
    <>
      {/* Header */}
      <section className="pt-36 pb-0 bg-orchard relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <p className="font-serif text-[24vw] text-cream whitespace-nowrap leading-none">The Cellar</p>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-24">
          <p className="section-label text-amber mb-5">The Cellar</p>
          <h1 className="font-serif text-7xl md:text-9xl text-cream leading-tight">
            Order
            <br />
            <em>online.</em>
          </h1>
          <p className="text-cream/70 font-light text-lg mt-6 max-w-lg">
            Estate cider and farm-store goods, shipped or held for farm pickup.
            Every cider made from fruit grown right here in Rose Hill, Kansas.
          </p>
        </div>
      </section>

      {/* Age notice */}
      <div className="bg-amber text-orchard text-center py-3 px-6">
        <p className="text-xs tracking-wide font-light">
          You must be 21 or older to purchase alcoholic cider. By proceeding you confirm your age.
        </p>
      </div>

      {sections.map((section, si) => (
        <section key={section.tier} className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="mb-12">
              <p className="section-label mb-2">{section.tier}</p>
              <div className="h-px w-16 bg-maroon" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {section.items.map((p) => (
                <article key={p.id} className="group flex flex-col">
                  <Link href={`/store/${p.slug}`} className="block">
                    <div className="aspect-[4/5] relative overflow-hidden mb-5">
                      {p.image_url && (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 33vw"
                          className="estate-photo object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {p.stock_quantity <= 0 && (
                        <div className="absolute inset-0 bg-orchard/55 flex items-center justify-center">
                          <span className="text-cream text-xs tracking-widest uppercase border border-cream/60 px-4 py-2">
                            Sold Out
                          </span>
                        </div>
                      )}
                      {p.stock_quantity > 0 && p.stock_quantity <= 6 && (
                        <span className="absolute top-4 left-4 bg-maroon text-cream text-xs tracking-widest uppercase px-3 py-1">
                          Only {p.stock_quantity} left
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Link href={`/store/${p.slug}`}>
                      <h3 className="font-serif text-2xl text-orchard leading-tight hover:text-maroon transition-colors">
                        {p.name}
                      </h3>
                    </Link>
                    <span className="font-serif text-xl text-orchard whitespace-nowrap">
                      {formatUSD(p.price_cents)}
                    </span>
                  </div>
                  {p.abv && <p className="section-label mb-3">{p.abv} · Estate Cider</p>}
                  {p.description && (
                    <p className="text-sm text-stone font-light leading-relaxed mb-5 flex-1">
                      {p.description}
                    </p>
                  )}
                  <AddToCartButton product={p} />
                </article>
              ))}
            </div>
          </div>

          {si < sections.length - 1 && (
            <div className="max-w-7xl mx-auto px-6 md:px-12 mt-20">
              <BranchDivider className="text-orchard" />
            </div>
          )}
        </section>
      ))}
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { formatUSD } from "@/lib/money";
import AddToCartButton from "@/components/store/AddToCartButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found | Meadowlark Farm" };
  return {
    title: `${product.name} | Meadowlark Farm`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  return (
    <section className="pt-36 pb-28 md:pb-40">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link
          href="/store"
          className="text-xs tracking-widest uppercase font-light text-stone hover:text-orchard transition-colors"
        >
          ← Back to the Cellar
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mt-8 items-start">
          {/* Image */}
          <div className="aspect-[4/5] relative overflow-hidden">
            {product.image_url && (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="estate-photo object-cover"
              />
            )}
          </div>

          {/* Details */}
          <div className="md:pt-6">
            {product.tier && <p className="section-label mb-4">{product.tier}</p>}
            <h1 className="embossed font-serif text-5xl md:text-6xl text-orchard leading-tight mb-5">
              {product.name}
            </h1>
            <p className="font-serif text-3xl text-maroon mb-6">{formatUSD(product.price_cents)}</p>

            {product.description && (
              <p className="text-stone font-light leading-relaxed text-lg mb-8 max-w-prose">
                {product.description}
              </p>
            )}

            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-stone font-light mb-10">
              {product.abv && (
                <span>
                  <span className="text-orchard font-normal">ABV:</span> {product.abv}
                </span>
              )}
              <span>
                <span className="text-orchard font-normal">Origin:</span> Estate-grown, Rose Hill KS
              </span>
              <span>
                <span className="text-orchard font-normal">Stock:</span>{" "}
                {product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Sold out"}
              </span>
            </div>

            <div className="max-w-xs">
              <AddToCartButton product={product} />
            </div>

            <p className="text-xs text-stone/80 font-light mt-6 leading-relaxed max-w-sm">
              Ships to KS, MO, CO, NE & OK, or choose farm pickup at checkout. Must be 21+ with
              valid ID on delivery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

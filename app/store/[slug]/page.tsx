import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { getProductImages } from "@/lib/product-images";
import { formatUSD } from "@/lib/money";
import { effectivePriceCents, isOnSale } from "@/lib/types";
import AddToCartButton from "@/components/store/AddToCartButton";
import ProductGallery from "@/components/store/ProductGallery";

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

  const [images] = await Promise.all([getProductImages(product.id)]);

  const sale = isOnSale(product);
  const priceNow = effectivePriceCents(product);

  return (
    <section className="pt-36 pb-28 md:pb-40">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link
          href="/store"
          className="text-xs tracking-widest uppercase font-normal text-stone hover:text-meadow transition-colors"
        >
          ← Back to the Cellar
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mt-8 items-start">
          <div>
            <ProductGallery
              images={images}
              fallback={{ url: product.image_url, alt: product.name }}
            />
            {sale && (
              <div className="mt-3">
                <span className="inline-block bg-cider text-wheat text-xs tracking-widest uppercase px-3 py-1">
                  On Sale
                </span>
              </div>
            )}
          </div>

          <div className="md:pt-6">
            {product.tier && <p className="section-label mb-4">{product.tier}</p>}
            <h1 className="embossed font-serif text-5xl md:text-6xl text-meadow leading-tight mb-5">{product.name}</h1>

            <div className="mb-6 flex items-baseline gap-4">
              <p className={`font-serif text-3xl ${sale ? "text-cider" : "text-meadow"}`}>{formatUSD(priceNow)}</p>
              {sale && <p className="font-serif text-xl text-stone line-through">{formatUSD(product.price_cents)}</p>}
            </div>

            {product.description && (
              <p className="text-ink-soft font-normal leading-relaxed text-lg mb-8 max-w-prose">{product.description}</p>
            )}

            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-soft font-normal mb-10">
              {product.abv && (
                <span>
                  <span className="text-meadow font-normal">ABV:</span> {product.abv}
                </span>
              )}
              <span>
                <span className="text-meadow font-normal">Origin:</span> Estate-grown, Rose Hill KS
              </span>
              <span>
                <span className="text-meadow font-normal">Stock:</span>{" "}
                {product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Sold out"}
              </span>
            </div>

            <div className="max-w-xs">
              <AddToCartButton product={product} />
            </div>

            <p className="text-xs text-ink-soft/80 font-normal mt-6 leading-relaxed max-w-sm">
              Ships to KS, MO, CO, NE & OK, or choose farm pickup at checkout. Must be 21+ with valid ID on delivery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

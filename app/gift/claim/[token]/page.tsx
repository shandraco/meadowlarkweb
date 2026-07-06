import { notFound } from "next/navigation";
import { getGiftByToken } from "@/lib/gift-memberships";
import { getPlanById } from "@/lib/subscriptions";
import ClaimForm from "@/components/gift/ClaimForm";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Claim your gift | Meadowlark Farm" };

export default async function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const gift = await getGiftByToken(token);
  if (!gift) notFound();

  const plan = gift.plan_id ? await getPlanById(gift.plan_id) : null;

  if (gift.status === "claimed") {
    return (
      <section className="pt-36 pb-40 min-h-[60vh]">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="section-label mb-3">Already claimed</p>
          <p className="text-ink-soft font-light">
            This gift has already been redeemed. If you think that&apos;s a mistake, reply to your original email.
          </p>
        </div>
      </section>
    );
  }

  if (gift.status === "cancelled" || new Date(gift.expires_at) < new Date()) {
    return (
      <section className="pt-36 pb-40 min-h-[60vh]">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="section-label mb-3">Expired</p>
          <p className="text-ink-soft font-light">
            This claim link has expired. Get in touch and we&apos;ll sort it out.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-36 pb-28 min-h-[60vh]">
      <div className="max-w-xl mx-auto px-6 md:px-12">
        <p className="section-label mb-3">Gift #{gift.gift_number}</p>
        <h1 className="font-serif text-4xl md:text-5xl text-meadow mb-4">
          {gift.buyer_name.split(" ")[0]} sent you cider.
        </h1>
        <p className="text-ink-soft font-light mb-6">
          You&apos;ve got a <span className="text-cider">{plan?.name ?? "Cider Club"}</span> membership waiting —
          {plan && ` ${plan.bottles_per_shipment} bottles per shipment, ${plan.cadence}.`}
        </p>
        {gift.message && (
          <div className="bg-wheat-dark border-l-4 border-sunflower p-4 mb-8 italic text-ink font-light">
            &ldquo;{gift.message}&rdquo;
            <p className="not-italic text-xs text-stone mt-2">— {gift.buyer_name}</p>
          </div>
        )}
        <ClaimForm token={token} />
        <p className="text-xs text-stone font-light text-center mt-6">
          {plan && `Retail value: ${formatUSD(gift.price_cents)}`}
        </p>
      </div>
    </section>
  );
}

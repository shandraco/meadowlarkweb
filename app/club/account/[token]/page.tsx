import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSubscriptionByToken,
  getPlanById,
  getShipmentsForSubscription,
} from "@/lib/subscriptions";
import MemberPortal from "@/components/club/MemberPortal";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Membership | Meadowlark Cider Club" };

export default async function MemberAccountPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const subscription = await getSubscriptionByToken(token);
  if (!subscription) notFound();

  const [plan, shipments] = await Promise.all([
    subscription.plan_id ? getPlanById(subscription.plan_id) : Promise.resolve(null),
    getShipmentsForSubscription(subscription.id),
  ]);

  return (
    <section className="pt-36 pb-28 md:pb-40">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <Link href="/cider-club" className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow">
          ← Cider Club
        </Link>
        <p className="section-label mt-6 mb-2">Your account</p>
        <h1 className="font-serif text-5xl md:text-6xl text-ink mb-10">Hello, {subscription.customer_name.split(" ")[0]}.</h1>

        <MemberPortal subscription={subscription} plan={plan} shipments={shipments} token={token} />
      </div>
    </section>
  );
}

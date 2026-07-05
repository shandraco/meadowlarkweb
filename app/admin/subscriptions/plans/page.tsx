import { getAllPlans } from "@/lib/subscriptions";
import PlanEditor from "@/components/admin/PlanEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cider Club Plans | Meadowlark Admin" };

export default async function PlansPage() {
  const plans = await getAllPlans();

  return (
    <div>
      <p className="section-label mb-2">Cider Club</p>
      <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none mb-8">Plans</h1>

      <div className="grid gap-8">
        {plans.map((p) => (
          <div key={p.id} className="border border-meadow/10 bg-paper p-6 md:p-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-serif text-2xl text-ink">{p.name}</h2>
              <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${p.active ? "bg-meadow/15 text-meadow" : "bg-stone/20 text-stone"}`}>
                {p.active ? "Live" : "Hidden"}
              </span>
            </div>
            <PlanEditor plan={p} />
          </div>
        ))}
        <div className="border border-meadow/15 bg-paper-dark/40 p-6 md:p-8">
          <h2 className="font-serif text-2xl text-meadow mb-4">Add a new plan</h2>
          <PlanEditor />
        </div>
      </div>
    </div>
  );
}

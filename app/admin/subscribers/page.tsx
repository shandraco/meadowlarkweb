import { getSeasonSubscribers, SEASON_TOPICS } from "@/lib/season-subs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Season Reminders | Meadowlark Admin" };

export default async function SubscribersPage() {
  const subscribers = await getSeasonSubscribers();
  const topicLabels = new Map<string, string>(SEASON_TOPICS.map((t) => [t.id, t.label]));

  const countsByTopic: Record<string, number> = {};
  for (const s of subscribers) for (const t of s.topics) countsByTopic[t] = (countsByTopic[t] ?? 0) + 1;

  return (
    <div>
      <p className="section-label mb-2">Marketing</p>
      <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none mb-3">Season reminders</h1>
      <p className="text-ink-soft font-light mb-10 max-w-2xl">
        Everyone who signed up for a heads-up about specific seasons. Send a short note before each event — the point is
        &ldquo;peach season is starting&rdquo; not a wall of text.
      </p>

      <h2 className="font-serif text-2xl text-meadow mb-4">By topic</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {SEASON_TOPICS.map((t) => (
          <div key={t.id} className="border border-meadow/10 bg-paper-dark/50 p-5">
            <p className="text-xs tracking-widest uppercase font-light text-stone mb-1">{t.label}</p>
            <p className="font-serif text-3xl text-meadow">{countsByTopic[t.id] ?? 0}</p>
            <p className="text-xs text-ink-soft/70 font-light">{t.when}</p>
          </div>
        ))}
      </div>

      <h2 className="font-serif text-2xl text-meadow mb-4">Subscribers</h2>
      {subscribers.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No one yet. The public sign-up widget is on the homepage.
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper-dark/40 text-left">
                {["Email", "Phone", "Topics", "Joined"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-paper-dark/20">
                  <td className="px-4 py-3 text-ink">{s.email}</td>
                  <td className="px-4 py-3 text-ink-soft font-light">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-soft font-light">
                    {s.topics.map((t) => topicLabels.get(t) ?? t).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-stone/70 font-light whitespace-nowrap">
                    {new Date(s.confirmed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

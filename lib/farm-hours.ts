// Simple open/closed calculator for the farm's stated hours (Wed–Sun, 10–5,
// Fri until 6:30). Used by the "Open now" pill in the hero + quick-facts.
// Kept dependency-free so it can render on either server or client without
// a locale library.

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sun..Sat

interface DayHours {
  open: number; // minutes since midnight
  close: number;
}

const HOURS: Partial<Record<DayIndex, DayHours>> = {
  // Wed–Sun 10–5, Friday until 6:30. Mon/Tue closed.
  3: { open: 10 * 60, close: 17 * 60 }, // Wed
  4: { open: 10 * 60, close: 17 * 60 }, // Thu
  5: { open: 10 * 60, close: 18 * 60 + 30 }, // Fri
  6: { open: 10 * 60, close: 17 * 60 }, // Sat
  0: { open: 10 * 60, close: 17 * 60 }, // Sun
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Central time — the farm's tz. Uses Intl to compute without pulling a
// full date library in.
function nowInCentral(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const y = Number(get("year"));
  const m = Number(get("month"));
  const d = Number(get("day"));
  const h = Number(get("hour")) % 24;
  const min = Number(get("minute"));
  const s = Number(get("second"));
  return new Date(y, m - 1, d, h, min, s);
}

export interface FarmStatus {
  open: boolean;
  today: string; // "Wed", "Mon", ...
  todayLabel: string; // e.g. "10am–5pm" or "Closed today"
  nextOpenLabel?: string; // e.g. "Opens Wed 10am"
  closesInMinutes?: number; // present when currently open
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hh12 = ((h + 11) % 12) + 1;
  const suffix = h < 12 ? "am" : "pm";
  return m === 0 ? `${hh12}${suffix}` : `${hh12}:${String(m).padStart(2, "0")}${suffix}`;
}

export function getFarmStatus(): FarmStatus {
  const now = nowInCentral();
  const day = now.getDay() as DayIndex;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const today = HOURS[day];

  if (today && minutesNow >= today.open && minutesNow < today.close) {
    return {
      open: true,
      today: DAY_NAMES[day],
      todayLabel: `${formatTime(today.open)}–${formatTime(today.close)}`,
      closesInMinutes: today.close - minutesNow,
    };
  }

  const todayLabel = today
    ? `${formatTime(today.open)}–${formatTime(today.close)}`
    : "Closed today";

  // Find next open day.
  for (let offset = today && minutesNow < today.open ? 0 : 1; offset < 8; offset++) {
    const idx = ((day + offset) % 7) as DayIndex;
    const spec = HOURS[idx];
    if (!spec) continue;
    const opensIn = offset === 0 ? "later today" : `${DAY_NAMES[idx]} ${formatTime(spec.open)}`;
    return {
      open: false,
      today: DAY_NAMES[day],
      todayLabel,
      nextOpenLabel: offset === 0 ? `Opens ${formatTime(spec.open)}` : `Opens ${opensIn}`,
    };
  }

  return { open: false, today: DAY_NAMES[day], todayLabel };
}

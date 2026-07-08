"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import { createIncident } from "@/app/admin/incidents/actions";
import type { IncidentSeverity } from "@/lib/types";

const CATEGORY_OPTIONS = [
  "Wildlife",
  "Equipment",
  "Weather / storm",
  "Pest / disease",
  "Irrigation",
  "Safety",
  "Vandalism",
  "Other",
];
const SEVERITY_OPTIONS: { value: IncidentSeverity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const label = "block text-xs tracking-widest uppercase font-light text-stone mb-2";
const input =
  "w-full border border-meadow/20 bg-paper px-3 py-2 text-ink focus:outline-none focus:border-meadow transition-colors";

export default function IncidentForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [f, setF] = useState({
    title: "",
    category: "Wildlife",
    severity: "medium" as IncidentSeverity,
    details: "",
    locationNote: "",
    photoUrl: "",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "locating" | "error">("idle");
  const [geoError, setGeoError] = useState<string | null>(null);

  function captureLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("error");
      setGeoError("This device/browser doesn't support geolocation. You can still note the location in text.");
      return;
    }
    setGeoState("locating");
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGeoState("idle");
      },
      (err) => {
        setGeoState("error");
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable it in your browser, or note the location in text."
            : "Couldn't get a location fix. Try again outdoors, or note the location in text.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await createIncident({
        title: f.title,
        details: f.details || undefined,
        category: f.category,
        severity: f.severity,
        photoUrl: f.photoUrl || undefined,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        locationNote: f.locationNote || undefined,
      });
      if (res.ok) {
        router.push("/admin/incidents");
        router.refresh();
      } else {
        setError(res.error ?? "Could not save the incident.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <label className={label}>Title</label>
        <input
          className={input}
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Downed limb blocking orchard row 12"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Category</label>
          <select className={input} value={f.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Severity</label>
          <select
            className={input}
            value={f.severity}
            onChange={(e) => set("severity", e.target.value as IncidentSeverity)}
          >
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Details</label>
        <textarea
          className={`${input} min-h-[120px]`}
          value={f.details}
          onChange={(e) => set("details", e.target.value)}
          placeholder="What happened, what's affected, what needs doing."
        />
      </div>

      <div>
        <label className={label}>Photo</label>
        <ImageUpload value={f.photoUrl} onChange={(url) => set("photoUrl", url)} />
      </div>

      <div>
        <label className={label}>Location</label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={captureLocation}
            className="btn-outline text-xs"
            disabled={geoState === "locating"}
          >
            {geoState === "locating" ? "Locating…" : coords ? "Update GPS location" : "Use my current location"}
          </button>
          {coords && (
            <span className="text-sm text-ink-soft font-light">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}{" "}
              <span className="text-stone">(±{Math.round(coords.accuracy)}m)</span>
              {" · "}
              <a
                href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-meadow underline"
              >
                map
              </a>
            </span>
          )}
        </div>
        {geoError && <p className="text-cider text-sm mt-2">{geoError}</p>}
        <input
          className={`${input} mt-3`}
          value={f.locationNote}
          onChange={(e) => set("locationNote", e.target.value)}
          placeholder="Optional: describe the spot (e.g. NE corner, by the pond)"
        />
      </div>

      {error && <p className="text-cider text-sm">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Log incident"}
        </button>
        <button type="button" onClick={() => router.push("/admin/incidents")} className="text-sm text-stone hover:text-meadow">
          Cancel
        </button>
      </div>
    </form>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { ProgramInput, SetActiveInput, firstIssue, uuid } from "@/lib/validation";

export interface ProgramResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const UpdateProgramInput = z.object({ id: uuid }).and(ProgramInput);

function revalidateAll() {
  revalidatePath("/admin/field-trips");
  revalidatePath("/visit/field-trips");
}

export async function createProgram(input: unknown): Promise<ProgramResult> {
  await requireAdmin();
  const parsed = ProgramInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("field_trip_programs")
    .insert({
      name: p.name,
      description: p.description || null,
      price_per_student_cents: p.pricePerStudentCents,
      min_students: p.minStudents,
      max_students: p.maxStudents,
      season_start_month: p.seasonStartMonth,
      season_end_month: p.seasonEndMonth,
      schedule: p.schedule,
      teacher_notes: p.teacherNotes || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "field_trip_program",
    entityId: data.id,
    summary: `Created program "${p.name}"`,
    after: { ...p, id: data.id },
  });
  revalidateAll();
  return { ok: true, id: data.id };
}

export async function updateProgram(input: unknown): Promise<ProgramResult> {
  await requireAdmin();
  const parsed = UpdateProgramInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("field_trip_programs").select("*").eq("id", p.id).maybeSingle();
  if (!before) return { ok: false, error: "Program not found." };

  const { error } = await supabase
    .from("field_trip_programs")
    .update({
      name: p.name,
      description: p.description || null,
      price_per_student_cents: p.pricePerStudentCents,
      min_students: p.minStudents,
      max_students: p.maxStudents,
      season_start_month: p.seasonStartMonth,
      season_end_month: p.seasonEndMonth,
      schedule: p.schedule,
      teacher_notes: p.teacherNotes || null,
    })
    .eq("id", p.id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "field_trip_program",
    entityId: p.id,
    summary: `Updated program "${p.name}"`,
    before,
    after: p,
  });
  revalidateAll();
  return { ok: true, id: p.id };
}

export async function setProgramActive(input: unknown): Promise<ProgramResult> {
  await requireAdmin();
  const parsed = SetActiveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, active } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("field_trip_programs").select("id, name, active").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Program not found." };

  const { error } = await supabase.from("field_trip_programs").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "field_trip_program",
    entityId: id,
    summary: `${active ? "Published" : "Hid"} program "${before.name}"`,
    before: { active: before.active },
    after: { active },
  });
  revalidateAll();
  return { ok: true, id };
}

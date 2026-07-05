"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ProgramInput {
  name: string;
  description: string;
  pricePerStudentCents: number;
  minStudents: number;
  maxStudents: number;
  seasonStartMonth: number | null;
  seasonEndMonth: number | null;
  schedule: { time: string; activity: string }[];
  teacherNotes: string;
}

export interface ProgramResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function revalidateAll() {
  revalidatePath("/admin/field-trips");
  revalidatePath("/visit/field-trips");
}

export async function createProgram(input: ProgramInput): Promise<ProgramResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Program name required." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("field_trip_programs")
    .insert({
      name: input.name.trim(),
      description: input.description.trim() || null,
      price_per_student_cents: input.pricePerStudentCents,
      min_students: input.minStudents,
      max_students: input.maxStudents,
      season_start_month: input.seasonStartMonth,
      season_end_month: input.seasonEndMonth,
      schedule: input.schedule,
      teacher_notes: input.teacherNotes.trim() || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id: data!.id as string };
}

export async function updateProgram(id: string, input: ProgramInput): Promise<ProgramResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("field_trip_programs")
    .update({
      name: input.name.trim(),
      description: input.description.trim() || null,
      price_per_student_cents: input.pricePerStudentCents,
      min_students: input.minStudents,
      max_students: input.maxStudents,
      season_start_month: input.seasonStartMonth,
      season_end_month: input.seasonEndMonth,
      schedule: input.schedule,
      teacher_notes: input.teacherNotes.trim() || null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id };
}

export async function setProgramActive(id: string, active: boolean): Promise<ProgramResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("field_trip_programs").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id };
}

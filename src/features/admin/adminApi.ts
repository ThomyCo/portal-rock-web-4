import { supabase } from "../../lib/supabase";
export type BandEditorInput = {
  id?: string;
  name: string;
  slug: string;
  summary: string;
  formedYear: number;
  countryCode: string;
  sourceUrl: string;
  longitude?: number;
  latitude?: number;
  published: boolean;
};
export function validatePublish(input: BandEditorInput) {
  if (!input.published) return;
  if (input.summary.trim().length < 20)
    throw new Error("La reseña debe tener al menos 20 caracteres.");
  if (!input.sourceUrl.startsWith("https://"))
    throw new Error("Agrega una fuente HTTPS.");
  if (input.latitude == null || input.longitude == null)
    throw new Error("Agrega la ubicación principal.");
}
export async function saveBand(input: BandEditorInput) {
  validatePublish(input);
  const payload = {
    name: input.name,
    slug: input.slug,
    summary: input.summary,
    formed_year: input.formedYear,
    country_code: input.countryCode,
    published: input.published,
  };
  const query = input.id
    ? supabase.from("bands").update(payload).eq("id", input.id)
    : supabase.from("bands").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}
export async function moderateReport(
  reportId: string,
  decision: "resolve-hide" | "dismiss",
) {
  const { data, error } = await supabase.rpc("moderate_report", {
    report_id: reportId,
    decision,
  });
  if (error) throw error;
  return data;
}
export async function requestBandSync(bandId: string, providers: string[]) {
  const { data, error } = await supabase.functions.invoke("sync-band", {
    body: { bandId, providers },
  });
  if (error) throw error;
  return data;
}

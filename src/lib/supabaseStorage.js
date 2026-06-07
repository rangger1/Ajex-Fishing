import { createClient } from "@supabase/supabase-js";

export const SUPABASE_BUCKET = "ajex-fishing";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getPublicUrl(path) {
  if (!supabase || !path) return "";

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(file, path, options = {}) {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  options.onProgress?.(15);

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || "image/jpeg",
      upsert: false
    });

  if (error) throw error;

  options.onProgress?.(85);

  return {
    path: data.path,
    publicUrl: getPublicUrl(data.path)
  };
}

export async function deleteImage(pathOrUrl) {
  if (!supabase || !pathOrUrl) return;

  const path = extractStoragePath(pathOrUrl);
  if (!path) return;

  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
  if (error) throw error;
}

function extractStoragePath(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (!pathOrUrl.startsWith("http")) return pathOrUrl;

  const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  const [, path] = pathOrUrl.split(marker);

  return path ? decodeURIComponent(path.split("?")[0]) : "";
}

import { supabase } from "./supabaseStorage";

function mapGalleryRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    createdAt: row.created_at
  };
}

export async function getGallery({ limit = 24, offset = 0 } = {}) {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { data, error } = await supabase
    .from("gallery")
    .select("id, title, description, category, image_url, storage_path, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data || []).map(mapGalleryRow);
}

export async function createGallery({ title, description, category, imageUrl, storagePath }) {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { data, error } = await supabase
    .from("gallery")
    .insert([
      {
        title,
        description,
        category,
        image_url: imageUrl,
        storage_path: storagePath
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return mapGalleryRow(data);
}

export async function updateGallery(id, changes) {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const payload = {
    ...(changes.title !== undefined ? { title: changes.title } : {}),
    ...(changes.description !== undefined ? { description: changes.description } : {}),
    ...(changes.category !== undefined ? { category: changes.category } : {}),
    ...(changes.imageUrl !== undefined ? { image_url: changes.imageUrl } : {}),
    ...(changes.storagePath !== undefined ? { storage_path: changes.storagePath } : {})
  };

  const { data, error } = await supabase
    .from("gallery")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return mapGalleryRow(data);
}

export async function deleteGallery(id) {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw error;
}

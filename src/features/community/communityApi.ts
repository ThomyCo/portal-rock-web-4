import { hasSupabase, supabase } from "../../lib/supabase";
export type Post = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles?: { display_name: string; username: string } | null;
};
export type PostPage = { items: Post[]; nextCursor: string | null };
export const demoPosts: Post[] = [
  {
    id: "demo-1",
    author_id: "demo",
    body: "¿Qué ciudad debería ser la próxima parada del mapa? Estoy siguiendo la escena de Manchester.",
    created_at: new Date().toISOString(),
    profiles: { display_name: "Archivo Sonoro", username: "archivo" },
  },
  {
    id: "demo-2",
    author_id: "demo",
    body: "Volví a escuchar Dynamo de Soda Stereo. Sus texturas siguen sonando adelantadas.",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    profiles: { display_name: "Luna Distorsión", username: "luna" },
  },
];
export function validatePost(body: string) {
  const n = body.trim().length;
  if (n < 1 || n > 1200)
    throw new Error("La publicación debe tener entre 1 y 1,200 caracteres.");
}
export async function listPosts(
  cursor?: string,
  bandId?: string,
): Promise<PostPage> {
  if (!hasSupabase) return { items: demoPosts, nextCursor: null };
  let q = supabase
    .from("topics")
    .select("id,body,created_at,author_id,profiles(display_name,username)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20);
  if (cursor) q = q.lt("created_at", cursor);
  if (bandId) q = q.eq("band_id", bandId);
  const { data, error } = await q;
  if (error) throw error;
  const items = (data ?? []) as unknown as Post[];
  return {
    items,
    nextCursor: items.length === 20 ? items.at(-1)!.created_at : null,
  };
}
export async function createPost(body: string, bandId?: string): Promise<Post> {
  validatePost(body);
  const { data: user } = await supabase.auth.getUser();
  if (!user.user || !user.user.email_confirmed_at)
    throw new Error("Confirma tu correo antes de publicar.");
  const { data, error } = await supabase
    .from("topics")
    .insert({
      body: body.trim(),
      title: body.trim().slice(0, 80),
      author_id: user.user.id,
      band_id: bandId,
    })
    .select("id,body,created_at,author_id")
    .single();
  if (error) throw error;
  return data as Post;
}
export async function createComment(topicId: string, body: string) {
  const text = body.trim();
  if (text.length < 1 || text.length > 800)
    throw new Error("El comentario debe tener entre 1 y 800 caracteres.");
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Inicia sesión para comentar.");
  const { data, error } = await supabase
    .from("comments")
    .insert({ topic_id: topicId, body: text, author_id: user.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function setReaction(
  topicId: string,
  type: "rock" | "love" | "insightful" | null,
) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Inicia sesión para reaccionar.");
  await supabase
    .from("reactions")
    .delete()
    .eq("user_id", data.user.id)
    .eq("topic_id", topicId);
  if (type) {
    const { error } = await supabase
      .from("reactions")
      .insert({ user_id: data.user.id, topic_id: topicId, reaction: type });
    if (error) throw error;
  }
}

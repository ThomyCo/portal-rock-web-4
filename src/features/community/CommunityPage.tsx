import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { listPosts, type Post } from "./communityApi";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import { useCommunityRealtime } from "./useCommunityRealtime";
export function CommunityPage() {
  const { user } = useAuth(),
    client = useQueryClient(),
    { data, isPending, error, refetch } = useQuery({
      queryKey: ["community"],
      queryFn: () => listPosts(),
    });
  const merge = useCallback(
    (post: Post) =>
      client.setQueryData(
        ["community"],
        (old: { items: Post[]; nextCursor: null } | undefined) =>
          old
            ? {
                ...old,
                items: [post, ...old.items.filter((x) => x.id !== post.id)],
              }
            : old,
      ),
    [client],
  );
  useCommunityRealtime(merge);
  return (
    <main className="community-page">
      <section className="community-head">
        <p className="eyebrow">FRECUENCIA ABIERTA</p>
        <h1>La conversación sigue sonando.</h1>
        <p>Historias, recomendaciones y hallazgos de la comunidad.</p>
      </section>
      {user ? (
        <PostComposer onCreated={() => void refetch()} />
      ) : (
        <p className="sign-in-note">
          Inicia sesión y confirma tu correo para publicar.
        </p>
      )}
      {isPending ? (
        <p role="status">Cargando conversaciones…</p>
      ) : error ? (
        <button onClick={() => void refetch()}>Reintentar</button>
      ) : (
        <section className="feed">
          {data?.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      )}
    </main>
  );
}

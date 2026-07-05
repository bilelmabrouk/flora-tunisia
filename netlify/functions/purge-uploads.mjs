// Uploads are no longer stored server-side (the identify function keeps nothing), so there is
// nothing to purge. This inert stub is kept only so an old scheduled reference cannot error.
export default async () => new Response("no server-side uploads are stored; nothing to purge");

/** Prefixes a root-relative asset path (e.g. "/images/foo.png") with Astro's configured base path. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

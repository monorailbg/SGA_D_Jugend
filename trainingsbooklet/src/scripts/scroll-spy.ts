export function initScrollSpy(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  if (!links.length) return;

  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.getAttribute('data-nav-link') ?? ''))
    .filter((el): el is HTMLElement => el !== null);

  const setActive = (id: string) => {
    for (const link of links) {
      link.classList.toggle('is-active', link.getAttribute('data-nav-link') === `#${id}`);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
  );

  for (const section of sections) observer.observe(section);
}

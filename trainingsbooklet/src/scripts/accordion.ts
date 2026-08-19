export function initAccordions(): void {
  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLButtonElement>('.accordion-trigger');
    if (!trigger) return;
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!isOpen));
    trigger.classList.toggle('is-open', !isOpen);
    panel.classList.toggle('is-open', !isOpen);
  });
}

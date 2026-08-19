export function initPhaseSelect(): void {
  const select = document.getElementById('phase-select') as HTMLSelectElement | null;
  if (!select) return;

  select.addEventListener('change', () => {
    const phaseId = select.value;
    if (!phaseId) return;

    const row = document.querySelector<HTMLElement>(`[data-phase-row="${phaseId}"]`);
    const section = document.getElementById('ueberblick');
    const target = row ?? section;
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (row) {
      row.classList.add('is-highlighted');
      window.setTimeout(() => row.classList.remove('is-highlighted'), 1800);
    }

    select.value = '';
    select.blur();
  });
}

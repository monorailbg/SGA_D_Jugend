const HASH = '459c4e435476a777263aeb379824d52abb3d44445e34af54a9603bc3dc7aab34';
const STORAGE_KEY = 'sga_auth';

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function checkPassword(): Promise<void> {
  const input = $('pw-input') as HTMLInputElement;
  const hash = await sha256Hex(input.value);
  if (hash === HASH) {
    sessionStorage.setItem(STORAGE_KEY, hash);
    $('pw-gate').style.display = 'none';
  } else {
    $('pw-err').style.display = 'block';
    input.value = '';
    input.focus();
  }
}

export function initPasswordGate(): void {
  if (sessionStorage.getItem(STORAGE_KEY) === HASH) {
    $('pw-gate').style.display = 'none';
  }
  const input = $('pw-input') as HTMLInputElement;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void checkPassword();
  });
  $('pw-btn').addEventListener('click', () => void checkPassword());
}

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#e8f0fc',
        paper: '#ffffff',
        ink: '#0a1929',
        muted: '#546e7a',
        line: '#c8d8f0',
        green: '#1565C0',
        'green-d': '#0d47a1',
        soft: '#f0f5ff',
      },
      fontFamily: {
        ui: ['var(--font-ui)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

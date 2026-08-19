import { defineConfig } from 'astro/config';

// GitHub Pages serves this project under /Trainingsbooklet-SGA-D/, but Vercel
// (and any host serving from the domain root) needs base "/". Vercel sets
// the VERCEL env var automatically during its builds, so we detect it here
// instead of hardcoding one target.
const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  site: isVercel ? undefined : 'https://sgechert.github.io',
  base: isVercel ? '/' : '/Trainingsbooklet-SGA-D',
  outDir: './dist',
});

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trainingsbooklet D-Jugend – SGA',
  description: 'Digitales Trainingsbooklet der D-Jugend, SG Kleinolbersdorf-Altenhain e.V.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="font-ui antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { IBM_Plex_Mono, Manrope } from 'next/font/google';
import './globals.css';

const sans = Manrope({ variable: '--font-manrope', subsets: ['latin'] });
const mono = IBM_Plex_Mono({ variable: '--font-ibm-plex-mono', subsets: ['latin'], weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'Monster Beverage, Tech Stocks & the Geography of Demand',
  description: 'A sourced 25-year return comparison and country-level sales test of Monster Energy versus tech-industry concentration.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${mono.variable} antialiased`}>{children}</body></html>;
}

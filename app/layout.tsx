import type { Metadata } from 'next';
import { IBM_Plex_Mono, Manrope } from 'next/font/google';
import './globals.css';
import { siteHeader, siteFooter } from './site-navigation';

const sans = Manrope({ variable: '--font-manrope', subsets: ['latin'] });
const mono = IBM_Plex_Mono({ variable: '--font-ibm-plex-mono', subsets: ['latin'], weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'Monster Beverage, Tech Stocks & the Geography of Demand',
  description: 'A sourced 25-year return comparison and country-level sales test of Monster Energy versus tech-industry concentration.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="ig-document"><head><link rel="stylesheet" href="/assets/site-shell.css?v=47b7776797"/><script src="/assets/site-shell.js?v=47b7776797" defer/></head><body className={`${sans.variable} ${mono.variable} antialiased ig-site`} data-site-kind="app" data-site-route="/monster-tech-correlation/"><div className="ig-shell-mount" dangerouslySetInnerHTML={{__html:siteHeader}} />{children}<div className="ig-shell-mount" dangerouslySetInnerHTML={{__html:siteFooter}} /></body></html>;
}

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TB4 KVM Field Guide',
  description:
    'An interactive, evidence-bound design review for an open-source Thunderbolt 4 KVM.',
  openGraph: {
    title: 'TB4 KVM Field Guide',
    description: 'Understand every signal before we route a PCB.',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1731,
        height: 909,
        alt: 'Two laptops feeding a Thunderbolt 4 KVM switch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TB4 KVM Field Guide',
    description: 'Understand every signal before we route a PCB.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

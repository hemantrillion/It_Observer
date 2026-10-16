import './globals.css';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'InfraTrace // Gmail Telemetry Observatory',
  description: 'Enterprise Infrastructure Observatory in Gmail Shell',
  icons: {
    icon: '/infra_trace_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className={`${roboto.className} font-sans bg-white text-[#1f1f1f] min-h-screen antialiased flex flex-col`}>
        {children}
      </body>
    </html>
  );
}

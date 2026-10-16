import './globals.css';
import type { Metadata } from 'next';

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
    <html lang="en">
      <body className="bg-white text-black min-h-screen antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}

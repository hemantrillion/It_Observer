import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Infrastructure Observatory // 30-A',
  description: 'Monochrome Neo-Brutalist Telemetry & Health Monitoring Platform',
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

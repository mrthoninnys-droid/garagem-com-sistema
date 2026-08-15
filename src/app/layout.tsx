import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Garagem.Com - Sistema de Gestão',
  description: 'Pizzaria & Delivery Garagem.Com',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-neutral-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
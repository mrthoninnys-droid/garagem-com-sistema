import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Garagem.Com - Sistema de Gestão',
  description: 'Pizzaria & Delivery Garagem.Com',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
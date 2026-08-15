import './globals.css';

export const metadata = {
  title: 'Garagem.Com - Sistema de Gestão',
  description: 'Pizzaria & Delivery Garagem.Com',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-neutral-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
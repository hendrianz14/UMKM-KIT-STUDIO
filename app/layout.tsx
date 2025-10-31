import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UKM Kits - Your Digital Partner',
  description: 'Buat Konten Sosial Media Profesional dengan AI. Hasilkan gambar, caption menarik, dan desain template siap posting dalam hitungan detik.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

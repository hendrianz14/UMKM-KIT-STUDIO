import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UMKM KitStudio - Your Digital Partner',
  description: 'Buat Konten Sosial Media Profesional dengan AI. Hasilkan gambar, caption menarik, dan desain template siap posting dalam hitungan detik.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}

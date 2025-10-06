import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import HeadNav from '@/components/HeadNav';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UMKM KitStudio - Your Digital Partner',
  description: 'Buat Konten Sosial Media Profesional dengan AI. Hasilkan gambar, caption menarik, dan desain template siap posting dalam hitungan detik.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-800 font-sans antaliyased`}>
        <HeadNav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

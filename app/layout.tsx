import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/components/ui/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistem Absensi - BSM',
  description: 'Web aplikasi absensi karyawan PT Bumi Sarana Maju',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-bg text-ink`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
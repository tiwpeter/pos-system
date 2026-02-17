import type { Metadata } from 'next';
import { Sarabun } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: 'POS System | ระบบจัดการร้านค้า',
  description: 'ระบบ Point of Sale สำหรับจัดการเอกสาร ลูกค้า และสินค้า',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${sarabun.variable} font-sarabun antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #334155',
            },
          }}
        />
      </body>
    </html>
  );
}

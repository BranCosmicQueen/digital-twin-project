import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Digital Twin — Centro de Distribución',
  description:
    'Gemelo Digital interactivo de un centro de distribución logístico. Visualización 3D, simulaciones de entrada y salida de inventario.',
  keywords: ['digital twin', 'logística', 'centro de distribución', '3D', 'simulación'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

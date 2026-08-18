import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import Header from '@/app/components/Header';
import CookieBanner from '@/app/components/CookieBanner';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Review de Procesos de Selección | Transparencia en Hiring",
    template: "%s | Review de Procesos de Selección"
  },
  description: "Descubre experiencias reales de candidatos en procesos de selección. Consulta reviews anónimas de empresas como Glovo, Amazon, Inditex y más.",
  keywords: "procesos de selección, reviews de empresas, hiring transparente, ghosting, feedback, entrevistas",
  authors: [{ name: "Review de Procesos" }],
  creator: "Review de Procesos",
  publisher: "Review de Procesos",
  robots: "index, follow",
  openGraph: {
    title: "Review de Procesos de Selección",
    description: "Descubre experiencias reales de candidatos en procesos de selección. Transparencia en hiring.",
    url: "https://tu-dominio.vercel.app",
    siteName: "Review de Procesos",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Review de Procesos de Selección",
    description: "Descubre experiencias reales de candidatos en procesos de selección.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body 
        className="min-h-screen flex flex-col bg-gray-50"
        suppressHydrationWarning
      >
        {/* Header - Barra de navegación */}
        <Header />

        {/* Contenido principal */}
        <main className="flex-1">
          {children}
        </main>

        {/* Cookie Banner */}
        <CookieBanner />

        {/* Footer */}
        <footer className="bg-white border-t py-4 sm:py-6 mt-auto">
          <div className="max-w-4xl mx-auto px-4 text-center text-xs sm:text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700 transition">
              Política de Privacidad
            </Link>
            <span className="mx-2">•</span>
            <span>Review de Procesos de Selección</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
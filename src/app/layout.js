// src/app/layout.js
import "./globals.css"; 
import localFont from "next/font/local";

// Import Geist Sans dan Geist Mono dari local folder
const geistSans = localFont({
  src: "/fonts/GeistVF.woff",   // BUKAN ./../public/fonts
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "/fonts/GeistMonoVF.woff",  // BUKAN ./../public/fonts
  variable: "--font-geist-mono",
  weight: "100 900",
});


// Metadata website
export const metadata = {
  title: "LEADS UPN Veteran Jakarta",
  description: "Sistem pembelajaran digital",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/images/logo/leads_poppins.png" type="image/png" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/font-awesome/css/font-awesome.min.css"
        />
      </head>
      <body className="antialiased font-sans bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}

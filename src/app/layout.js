// src/app/layout.js
import localFont from "next/font/local";
import "./globals.css"; 

// Pastikan menggunakan jalur absolut yang benar ke folder public/fonts
const geistSans = localFont({
  src: "/fonts/GeistVF.woff",  // Jalur absolut dari root proyek
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "/fonts/GeistMonoVF.woff", // Jalur absolut dari root proyek
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "LEADS UPN Veteran Jakarta",
  description: "Sistem pembelajaran digital",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/images/logo/leads_poppins.png" type="image/png" />
        
        {/* Title and Meta Description */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        
        {/* Menambahkan Font Awesome CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/font-awesome/css/font-awesome.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

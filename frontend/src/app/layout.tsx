import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space Close Calls",
  description: "NASA APOD and near-Earth asteroid dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(8,12,24,0.85)",
            position: "sticky",
            top: 0,
            backdropFilter: "blur(10px)",
            zIndex: 10,
          }}
        >
          <strong style={{ letterSpacing: 0.3 }}>Space Close Calls</strong>
          <nav style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/">APOD</Link>
            <Link href="/asteroids">Asteroids</Link>
            <Link href="/favorites">Favorites</Link>
          </nav>
        </header>
        {children}
        <footer style={{ padding: "20px", fontSize: 14 }}>
          <a href="https://ismailcodes17.github.io/my-portfolio/">Ismail Jeylani</a>
        </footer>
      </body>
    </html>
  );
}

import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata = {
  title: "Pathfinder Demo",
  description: "EWOR application demo",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
          <Nav />
          <p className="small" style={{ marginTop: 12 }}>
            Demo-mode: localStorage + template guidance. Next: swap in Python API.
          </p>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }
        `}} />
      </body>
    </html>
  );
}

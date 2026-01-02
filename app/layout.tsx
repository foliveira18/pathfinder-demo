import "./globals.css";
import DemoTopBar from "@/components/DemoTopBar";
import Footer from "@/components/Footer";
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
        <DemoTopBar />

        <div className="container">
          {children}

          <Nav />

          {/* Keep your original note if you like */}
          <p className="small" style={{ marginTop: 12 }}>
            Demo-mode: localStorage + template guidance. Next: swap in Python AI guidance.
          </p>

          <Footer />
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

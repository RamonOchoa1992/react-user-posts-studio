import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    default: "User Posts Studio",
    template: "%s · User Posts Studio",
  },
  description:
    "Explora usuarios, sus métricas y publicaciones en una experiencia master-detail construida con Next.js, TypeScript estricto y shadcn/ui.",
  applicationName: "User Posts Studio",
};

export const viewport: Viewport = {
  // Android: the on-screen keyboard shrinks the layout, so bottom sheets stay above it.
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delay={300}>
            {children}
            <Toaster position="bottom-right" mobileOffset={{ bottom: "5.5rem" }} />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

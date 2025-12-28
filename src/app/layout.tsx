import NextAuthSessionProvider from "@/lib/session-provider";
import "./globals.css";
import "./editor.css";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Instrument_Serif, Inter } from "next/font/google";

const inter = Inter({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const instrument = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata = {
  title: "Pluto",
  description:
    "A seamless platform to create, organize, and share documents. Harness the power of an intuitive WYSIWYG editor to craft content, organize it into collections, and generate public links for effortless sharing. With AI-powered chat, interact with your data in real-time, enhancing productivity and collaboration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body className="min-h-screen w-full  bg-neutral-100 dark:bg-neutral-900">
        <ThemeProvider attribute="class" defaultTheme="system">
          <NuqsAdapter>
            <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}

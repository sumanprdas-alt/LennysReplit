import "./globals.css";
import { Metadata } from "next";
import { SessionProvider } from "./providers";
export const metadata: Metadata = {
  title: "Sage — Strategic clarity for builders.",
  description: "Sage helps founders and product leaders think better, decide wisely, and build enduring products. Powered with valuable insights from Lenny's Podcast.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="min-h-screen"><SessionProvider>{children}</SessionProvider></body></html>);
}

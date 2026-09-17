import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleSwarm from "@/components/ParticleSwarm";

export const metadata: Metadata = {
  title: "OptiForge 2026 — Student Algorithm Design Challenge",
  description:
    "A premier computational intelligence competition featuring Genetic Algorithms, PSO, Ant Colony Optimization, and Fuzzy Logic. Organized by IEEE EMBS Student Chapter × IEEE CIS Local Chapter, Vardhaman College of Engineering.",
  keywords: [
    "OptiForge",
    "IEEE EMBS",
    "IEEE CIS",
    "Vardhaman College of Engineering",
    "Computational Intelligence",
    "Genetic Algorithms",
    "Particle Swarm Optimization",
    "Ant Colony Optimization",
    "Fuzzy Logic",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-primary text-brand-white selection:bg-teal-accent selection:text-bg-primary flex flex-col relative">
        <ParticleSwarm />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

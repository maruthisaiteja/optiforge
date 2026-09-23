import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleSwarm from "@/components/ParticleSwarm";

export const metadata: Metadata = {
  title: "OptiForge 2026 — Hackathon Algorithm Design",
  description:
    "A premier computational intelligence hackathon algorithm design challenge featuring 9 innovation themes. Organized by IEEE EMBS Student Chapter × IEEE CIS Local Chapter, Vardhaman College of Engineering on 30th September 2026.",
  keywords: [
    "OptiForge",
    "OptiForge 2026",
    "Hackathon Algorithm Design",
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
    <html lang="en">
      <body className="min-h-screen bg-bg-primary text-brand-white selection:bg-cyan-accent/30 selection:text-deepNavy flex flex-col relative">
        <ParticleSwarm />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

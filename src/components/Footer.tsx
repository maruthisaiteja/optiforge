import React from "react";
import Link from "next/link";
import { Cpu, ShieldCheck, Mail, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-navy-border/60 text-brand-muted text-sm pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-navy-deep border border-teal-accent/40 flex items-center justify-center text-teal-accent">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-brand-white">
                OPTIFORGE <span className="text-teal-accent">2026</span>
              </span>
            </div>
            <p className="text-brand-muted text-xs leading-relaxed max-w-md">
              A premier student algorithm design challenge centered on Computational Intelligence
              techniques: Genetic Algorithms, Particle Swarm Optimization, Ant Colony Optimization,
              and Fuzzy Logic. Featuring instant sandboxed auto-benchmarking and expert faculty evaluation.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded bg-navy-deep/80 border border-navy-border text-brand-white font-mono">
                Organized by IEEE Vardhaman Student Branch
              </span>
              <span className="px-2.5 py-1 rounded bg-teal-accent/10 border border-teal-accent/30 text-teal-accent">
                IEEE EMBS × IEEE CIS
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-xs uppercase tracking-wider text-brand-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#tracks" className="hover:text-teal-accent transition-colors">
                  Problem Tracks (4 CI Domains)
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-teal-accent transition-colors">
                  Challenge Workflow & Rules
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-teal-accent transition-colors">
                  Team Registration (₹50/member)
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-teal-accent transition-colors">
                  Live Dynamic Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-accent transition-colors">
                  Team / Judge / Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Venue & Contacts */}
          <div className="space-y-3">
            <h4 className="font-display text-xs uppercase tracking-wider text-brand-white">
              Event Details
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-accent shrink-0 mt-0.5" />
                <span>
                  Vardhaman College of Engineering, Kacharam, Shamshabad, Hyderabad, Telangana 501218
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-electric-violet shrink-0" />
                <span>Date: 25th September 2026 (9:00 AM - 4:00 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-accent shrink-0" />
                <span>embs.cis@vardhaman.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-navy-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-4">
          <p>
            © 2026 IEEE Vardhaman Student Branch · IEEE EMBS Student Chapter & IEEE CIS Local Chapter.
            All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-brand-dim">
              Official E-Certificates of Participation & Excellence will be awarded.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

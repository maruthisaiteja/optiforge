import React from "react";
import Link from "next/link";
import { MapPin, Mail, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = 2026;

  const footerSections = [
    {
      title: "Chapter",
      links: [
        { name: "About Us", href: "https://ieee-embs-vce.vercel.app/about", external: true },
        { name: "Team", href: "https://ieee-embs-vce.vercel.app/team", external: true },
        { name: "Achievements", href: "https://ieee-embs-vce.vercel.app/achievements", external: true },
        { name: "Announcements", href: "https://ieee-embs-vce.vercel.app/announcements", external: true },
      ],
    },
    {
      title: "Programs",
      links: [
        { name: "Events", href: "https://ieee-embs-vce.vercel.app/events", external: true },
        { name: "Gallery", href: "https://ieee-embs-vce.vercel.app/gallery", external: true },
        { name: "Resources", href: "https://ieee-embs-vce.vercel.app/resources", external: true },
        { name: "Membership", href: "https://ieee-embs-vce.vercel.app/membership", external: true },
      ],
    },
    {
      title: "Connect",
      links: [
        { name: "Contact", href: "https://ieee-embs-vce.vercel.app/contact", external: true },
        { name: "OptiForge 2026", href: "/", external: false },
        { name: "IEEE EMBS Global", href: "https://www.embs.org", external: true },
        { name: "IEEE Vardhaman SB", href: "https://www.ieee.org", external: true },
      ],
    },
  ];

  return (
    <footer
      style={{
        background: "rgba(23,33,33,0.97)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
      className="text-white pt-16 pb-12 transition-colors"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Chapter Branding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <p className="text-[13px] font-black text-white tracking-wide uppercase">
                IEEE EMBS
              </p>
              <p className="text-xs text-white/50 font-medium">
                Vardhaman College of Engineering Student Chapter
              </p>
            </div>

            <p className="text-xs text-white/40 leading-relaxed max-w-sm">
              The IEEE Engineering in Medicine and Biology Society chapter — connecting
              students with the global biomedical engineering community.
            </p>

            <div className="space-y-2 text-xs text-white/40 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#087F8C]" />
                <span className="leading-snug">
                  Vardhaman College of Engineering, Shamshabad, Hyderabad — 501218
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-[#087F8C]" />
                <a
                  href="mailto:ieeevce@vardhaman.org"
                  className="hover:text-white transition-colors"
                >
                  ieeevce@vardhaman.org
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#00629B]/20 text-[#12A8C4] border border-[#00629B]/40">
                IEEE CIS × IEEE EMBS
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#772583]/20 text-[#A855F7] border border-[#772583]/40">
                OptiForge 2026
              </span>
            </div>
          </div>

          {/* Nav Columns: Chapter, Programs, Connect */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <p className="text-[11px] font-black font-mono uppercase tracking-widest text-white/30">
                {section.title}
              </p>
              <div className="space-y-2.5">
                {section.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block text-xs text-white/50 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/30">
            © {currentYear} IEEE EMBS Vardhaman College of Engineering Student Chapter. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#087F8C] animate-pulse" />
            <p className="text-[11px] text-white/30 font-medium">
              Student Branch · Hyderabad, India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Trophy,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Layers,
  Sparkles,
  Download,
  Eye,
  CheckSquare,
  Radio,
  Brain,
  Scan,
  ActivitySquare,
  Bot,
  ExternalLink,
  ShieldAlert,
  FileCode,
  Users,
  ChevronDown,
  Terminal
} from "lucide-react";
import CoverageMapVisualization from "@/components/CoverageMapVisualization";

export default function LandingPage() {
  const targetTime = new Date("2026-09-30T09:00:00+05:30").getTime();
  const eventEndTime = new Date("2026-09-30T16:00:00+05:30").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });
  const [eventStatus, setEventStatus] = useState<"upcoming" | "live" | "completed">("upcoming");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      
      if (now >= eventEndTime) {
        setEventStatus("completed");
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      
      if (now >= targetTime) {
        setEventStatus("live");
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const diff = targetTime - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, mins, secs });
      setEventStatus("upcoming");
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime, eventEndTime]);

  const workflow = [
    "REGISTER",
    "FORM TEAM",
    "SELECT THEME",
    "PAY ₹100 / MEMBER",
    "CHALLENGE",
    "BUILD & OPTIMIZE",
    "AI EVALUATION",
    "FINAL PANEL",
    "WIN"
  ];

  const schedule = [
    { num: "01", time: "09:00–12:30", title: "1st Round", desc: "AI evaluation" },
    { num: "02", time: "12:30–13:15", title: "Lunch Break", desc: "Networking and lunch break. Teams regroup, analyze leaderboard metrics, and adjust strategy." },
    { num: "03", time: "13:15–15:00", title: "2nd Round", desc: "AI evaluation" },
    { num: "04", time: "15:00–16:00", title: "Final Panel Evaluation & Results", desc: "Live defense and presentation before the domain expert faculty jury, followed by felicitation and awards ceremony." }
  ];

  const faqs = [
    { q: "Who can participate?", a: "Students officially." },
    { q: "How many members?", a: "2-4 members." },
    { q: "Registration fee?", a: "₹100 per participant." },
    { q: "Payment?", a: "Online through UPI." },
    { q: "Different colleges?", a: "Allowed based on official rules." },
    { q: "Prior AI knowledge?", a: "Basic programming required, AI/algo knowledge helps." },
    { q: "What to bring?", a: "Laptop, charger, student ID, Team ID, tools." },
    { q: "Certificates?", a: "Provided for participation and winning." }
  ];

  const checklist = [
    "Valid College ID",
    "Laptop",
    "Charger",
    "Dev Tools",
    "Team ID",
    "Presentation Material"
  ];

  return (
    <div className="bg-bg-primary text-brand-white min-h-screen font-sans">
      
      {/* 1. HERO SECTION & 2. STRENGTHEN THE HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-navy-border bg-navy-border/20 text-teal-accent mb-8">
          <Sparkles className="w-4 h-4" />
          <span>IEEE EMBS × IEEE CIS · Vardhaman College of Engineering</span>
        </div>
        
        <p className="text-teal-accent font-bold tracking-[0.2em] mb-4 text-sm sm:text-base">
          BUILD. OPTIMIZE. INNOVATE.
        </p>
        
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-4 text-brand-white">
          OPTIFORGE <span className="text-teal-accent">2026</span>
        </h1>
        
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-300">
          Hackathon & Algorithm Design Challenge
        </h2>
        
        <p className="max-w-3xl text-gray-400 text-lg sm:text-xl leading-relaxed mb-10">
          A Computational Intelligence Challenge combining Algorithm Design, AI, Optimization, Intelligent Systems and Healthcare Innovation.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm font-medium text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-accent" />
            <span>30 September 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-accent" />
            <span>9:00 AM – 4:00 PM IST</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-accent" />
            <span>Vardhaman College of Engineering, Hyderabad</span>
          </div>
        </div>

        {/* 7. FIX THE COUNTDOWN */}
        <div className="mb-12">
          {eventStatus === "upcoming" && (
            <div className="flex gap-4 justify-center">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.mins },
                { label: "Secs", value: timeLeft.secs },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center bg-navy-border/20 border border-navy-border rounded-xl p-4 min-w-[80px]">
                  <span className="text-3xl font-mono font-bold text-teal-accent">{String(item.value).padStart(2, '0')}</span>
                  <span className="text-xs uppercase tracking-wider text-gray-400 mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          )}
          {eventStatus === "live" && (
            <div className="bg-teal-accent/20 border border-teal-accent text-teal-accent px-8 py-4 rounded-xl font-bold text-xl tracking-wider">
              OPTIFORGE 2026 IS LIVE
            </div>
          )}
          {eventStatus === "completed" && (
            <div className="bg-gray-800/50 border border-gray-700 text-gray-400 px-8 py-4 rounded-xl font-bold text-xl tracking-wider">
              OPTIFORGE 2026 — EVENT COMPLETED
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="bg-teal-accent text-bg-primary font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            REGISTER YOUR TEAM <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#themes" className="border border-navy-border bg-navy-border/20 text-brand-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-navy-border/40 transition-colors">
            EXPLORE CHALLENGE
          </a>
        </div>
      </section>

      {/* 4. WHAT IS OPTIFORGE? */}
      <section className="py-20 border-t border-navy-border bg-black/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-brand-white">WHAT IS OPTIFORGE?</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            OPTIFORGE 2026 is a computational intelligence challenge where teams design, implement and optimize intelligent solutions to real-world problems.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed mb-10">
            The event brings together Artificial Intelligence, Algorithm Design, Optimization, Machine Learning, Biomedical Computing and Intelligent Systems through a competitive multi-round format.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-navy-border/20 border border-navy-border rounded-lg px-6 py-3 font-bold text-teal-accent tracking-wider">
              6 THEMES
            </div>
            <div className="bg-navy-border/20 border border-navy-border rounded-lg px-6 py-3 font-bold text-teal-accent tracking-wider">
              2 EVALUATION ROUNDS
            </div>
            <div className="bg-navy-border/20 border border-navy-border rounded-lg px-6 py-3 font-bold text-teal-accent tracking-wider">
              1 FINAL PANEL
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMPETITION WORKFLOW VISUAL */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-brand-white">COMPETITION WORKFLOW</h2>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {workflow.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-navy-border/20 border border-navy-border px-4 py-3 rounded-lg text-sm font-bold tracking-wide whitespace-nowrap text-brand-white">
                {step}
              </div>
              {idx < workflow.length - 1 && (
                <ArrowRight className="w-5 h-5 text-teal-accent hidden md:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 6. OFFICIAL EVENT SCHEDULE */}
      <section className="py-20 border-t border-navy-border bg-black/20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-brand-white">OFFICIAL EVENT SCHEDULE</h2>
          <div className="space-y-4">
            {schedule.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 bg-navy-border/10 border border-navy-border p-6 rounded-xl hover:bg-navy-border/20 transition-colors">
                <div className="md:w-1/4 font-mono text-teal-accent font-bold flex flex-col justify-center">
                  <span className="text-sm opacity-50 mb-1">{item.num}</span>
                  <span className="text-lg">{item.time}</span>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-xl font-bold mb-2 text-brand-white">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PARTICIPANT DASHBOARD PREVIEW */}
      <section className="py-20 max-w-7xl mx-auto px-6 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-brand-white">PARTICIPANT DASHBOARD</h2>
        <div className="w-full max-w-3xl bg-[#0F172A] border border-navy-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#1E293B] px-6 py-4 border-b border-navy-border flex items-center gap-3">
            <Terminal className="w-5 h-5 text-teal-accent" />
            <span className="font-mono text-sm font-bold text-gray-300">Terminal - Participant Portal</span>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Team ID</p>
                <p className="text-lg font-mono font-bold text-brand-white">OF-26-9042</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Theme</p>
                <p className="text-lg font-bold text-teal-accent">Medical Imaging</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Score</p>
                <p className="text-lg font-mono font-bold text-brand-white">--</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-green-900/20 border border-green-900/50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-300">Registration</span>
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">CONFIRMED</span>
              </div>
              <div className="flex justify-between items-center bg-green-900/20 border border-green-900/50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-300">Payment</span>
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">PAID</span>
              </div>
              <div className="flex justify-between items-center bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-300">Challenge</span>
                <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center bg-amber-900/20 border border-amber-900/50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-300">Submission</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">OPEN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. BEFORE YOU ARRIVE SECTION */}
      <section className="py-20 border-t border-navy-border bg-black/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-brand-white">BEFORE YOU ARRIVE</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-navy-border/10 border border-navy-border p-4 rounded-xl">
                <CheckSquare className="w-5 h-5 text-teal-accent shrink-0" />
                <span className="text-sm font-medium text-gray-200 text-left">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-brand-white">FAQ</h2>
        <div className="grid gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-navy-border/10 border border-navy-border p-6 rounded-xl">
              <h3 className="text-lg font-bold text-brand-white mb-2">{faq.q}</h3>
              <p className="text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 12. STRONG FINAL CTA */}
      <section className="py-24 border-t border-navy-border bg-black/40 text-center px-6">
        <h2 className="text-4xl sm:text-5xl font-black mb-6 text-brand-white">READY TO FORGE YOUR SOLUTION?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Build intelligent systems. Optimize your ideas. Defend your solution.
        </p>
        <p className="text-teal-accent font-bold tracking-wider mb-10 text-sm">
          OPTIFORGE 2026 | IEEE EMBS × IEEE CIS · Vardhaman College of Engineering
        </p>
        <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-teal-accent text-bg-primary font-bold px-10 py-5 rounded-xl text-lg hover:opacity-90 transition-opacity">
          REGISTER YOUR TEAM <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* 13. BRANDING HIERARCHY */}
      <footer className="py-8 border-t border-navy-border text-center bg-bg-primary">
        <p className="text-sm font-medium text-gray-500 tracking-wider">
          OPTIFORGE 2026 · IEEE EMBS × IEEE CIS · Vardhaman College of Engineering
        </p>
      </footer>
    </div>
  );
}

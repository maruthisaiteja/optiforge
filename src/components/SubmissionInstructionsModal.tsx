"use client";

import React from "react";
import { X, CheckCircle2, AlertTriangle, Target, GitBranch, ExternalLink, ShieldCheck, Zap, FileCode, CheckCheck, Eye, Layers } from "lucide-react";

interface SubmissionInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmissionInstructionsModal({
  isOpen,
  onClose,
}: SubmissionInstructionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white text-[#102A43] rounded-2xl border border-gray-200 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructions-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 id="instructions-modal-title" className="text-xl font-bold font-display text-[#102A43]">
            Instructions
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close instructions modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-6 text-sm text-[#334E68] leading-relaxed">
          
          {/* 1. Before You Begin */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-base text-[#102A43] flex items-center gap-2">
              <span className="text-[#00629B] font-mono">1.</span> Before You Begin
            </h3>
            <p className="text-xs text-[#627D98]">
              Make sure the following prerequisites are completed:
            </p>
            <ul className="space-y-1.5 text-xs text-[#334E68] pl-2">
              <li className="flex items-start gap-2">
                <span className="text-[#00629B] font-bold mt-0.5">•</span>
                <span>The AI platform that you are going to use is downloaded and set up on your system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00629B] font-bold mt-0.5">•</span>
                <span>Git is installed and configured on your machine</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00629B] font-bold mt-0.5">•</span>
                <span>You have an active GitHub account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00629B] font-bold mt-0.5">•</span>
                <span>You are able to create and manage public repositories</span>
              </li>
            </ul>
          </div>

          {/* 2. Important Rules */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950">
            <h3 className="font-bold text-base text-amber-900 flex items-center gap-2">
              <span className="text-amber-700 font-mono">2.</span> Important Rules
            </h3>
            <ul className="space-y-1.5 text-xs text-amber-900 pl-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold mt-0.5">•</span>
                <span>Maximum <strong>3 attempts</strong> allowed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold mt-0.5">•</span>
                <span>The repository size must be <strong>less than 10 MB</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold mt-0.5">•</span>
                <span>The GitHub repository must be <strong>public</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold mt-0.5">•</span>
                <span>The repository should contain <strong>only one branch</strong> (e.g. <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">main</code>).</span>
              </li>
              <li className="flex items-start gap-2 text-red-700 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                <span>Failure to follow these rules may result in your submission not being evaluated.</span>
              </li>
            </ul>
          </div>

          {/* 3. Challenge Expectations */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-base text-[#102A43] flex items-center gap-2">
              <span className="text-[#00629B] font-mono">3.</span> Challenge Expectations
            </h3>
            <p className="text-xs text-[#627D98]">
              Your solution should demonstrate:
            </p>
            <ul className="space-y-1.5 text-xs text-[#334E68] pl-2">
              <li className="flex items-start gap-2">
                <span className="text-[#00629B] font-bold mt-0.5">•</span>
                <span>Ability to build a smart, dynamic assistant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00629B] font-bold mt-0.5">•</span>
                <span>Logical decision making based on user context</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00629B] font-bold mt-0.5">•</span>
                <span>Practical and real-world usability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00629B] font-bold mt-0.5">•</span>
                <span>Clean, modular, and maintainable code</span>
              </li>
            </ul>
            <p className="text-xs text-[#486581] italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              Participants must choose one of the provided challenge verticals and design their solution around that persona and logic.
            </p>
          </div>

          {/* 4. How to Work on Your Project */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-base text-[#102A43] flex items-center gap-2">
              <span className="text-[#00629B] font-mono">4.</span> How to Work on Your Project
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                <strong className="text-[#00629B] block mb-1">Step 1: Setup Repository</strong>
                Create a new repository on GitHub and ensure the repository is set to public.
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                <strong className="text-[#00629B] block mb-1">Step 2: AI Platform Sync</strong>
                Open your AI platform and clone your repository inside the AI platform workspace.
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                <strong className="text-[#00629B] block mb-1">Step 3: Build & Iterate</strong>
                Build your solution through prompting and coding. Regularly commit and push your progress.
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                <strong className="text-[#00629B] block mb-1">Step 4: Branch Discipline</strong>
                Keep all work within a single main branch for automated ingestion.
              </div>
            </div>
          </div>

          {/* 5. What to Submit */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-base text-[#102A43] flex items-center gap-2">
              <span className="text-[#00629B] font-mono">5.</span> What to Submit
            </h3>
            <div className="text-xs text-[#627D98] flex items-center gap-1.5">
              <span>Note: For a detailed guide on how to submit, please refer to the document</span>
              <a
                href="https://docs.google.com/document/d/1yw0RLAkfp5TBYajwMRHaxZFc6zOgElKkj2Z-B9HxrWk/edit?tab=t.0#heading=h.sbdvih9v5ho"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00629B] font-bold underline inline-flex items-center gap-0.5 hover:text-blue-800"
              >
                [Link] <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-[#334E68] font-medium">Your submission must include:</p>
            <ul className="space-y-1.5 text-xs text-[#334E68] pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>A public GitHub repository link</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Complete project code inside the repository</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span>A structured README explaining:</span>
                  <div className="mt-1 pl-3 text-[#486581] space-y-0.5">
                    <div>• Your chosen vertical</div>
                    <div>• Approach and algorithmic logic</div>
                    <div>• How the solution works end-to-end</div>
                    <div>• Any assumptions or operational constraints made</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* 6. Evaluation Focus Areas */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-base text-[#102A43] flex items-center gap-2">
              <span className="text-[#00629B] font-mono">6.</span> Evaluation Focus Areas
            </h3>
            <p className="text-xs text-[#627D98]">
              Submissions will be autonomously reviewed and verified across:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-gray-200 bg-white">
                <strong className="text-[#102A43] block">Code Quality (20%)</strong>
                <span className="text-[#627D98]">Structure, readability, PEP-484 type hints, modularity, and maintainability.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-gray-200 bg-white">
                <strong className="text-[#102A43] block">Security (12%)</strong>
                <span className="text-[#627D98]">Safe and responsible implementation, zero exposed API keys or secrets in source.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-gray-200 bg-white">
                <strong className="text-[#102A43] block">Efficiency (18%)</strong>
                <span className="text-[#627D98]">Optimal use of resources, algorithmic latency, and optional live responsive demo URL.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-gray-200 bg-white">
                <strong className="text-[#102A43] block">Testing (18%)</strong>
                <span className="text-[#627D98]">Validation of functionality via pytest/unittest suites, test cases, and mathematical assertions.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-gray-200 bg-white">
                <strong className="text-[#102A43] block">Accessibility (10%)</strong>
                <span className="text-[#627D98]">Inclusive and usable design, structured documentation, and demo walkthrough media.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-gray-200 bg-white">
                <strong className="text-[#102A43] block">Problem Statement Alignment (12%)</strong>
                <span className="text-[#627D98]">Semantic correlation between declared problem objectives and actual codebase logic.</span>
              </div>
            </div>
          </div>

          {/* 7. How Your Work is Evaluated */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-base text-[#102A43] flex items-center gap-2">
              <span className="text-[#00629B] font-mono">7.</span> How Your Work is Evaluated
            </h3>
            <p className="text-xs text-[#627D98]">
              Our evaluation looks at different parts of your submission. Use these impact tiers to guide your focus, as your score in each tier directly shapes your final result:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-red-50/60 border border-red-200">
                <div className="flex items-center gap-1.5 font-bold text-red-900 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-200 text-red-900 uppercase tracking-wider font-mono">High Impact</span>
                  <span>Core Architecture, Testing Rigor & Problem Alignment</span>
                </div>
                <p className="text-red-950/80 leading-relaxed">
                  These are the most important parts of your project. Doing great here will heavily drive a high overall score, while missing these points will drastically lower your standing.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-200 text-blue-900 uppercase tracking-wider font-mono">Medium Impact</span>
                  <span>Security Hygiene, Secret Scans & Modularity</span>
                </div>
                <p className="text-blue-950/80 leading-relaxed">
                  These parameters check how well your solution works under the surface. Doing great here will steadily elevate your score, while a miss will moderately lower your standing.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-200 text-emerald-900 uppercase tracking-wider font-mono">Low Impact</span>
                  <span>Final Polish, Presentation & Demo Media</span>
                </div>
                <p className="text-emerald-950/80 leading-relaxed">
                  These criteria look at the final layers of polish. Excelling here will give that fine-tuned boost to your score, needed to reach the top percentiles.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-[#2B529E] hover:bg-[#1E3A78] text-white font-medium text-xs shadow-md hover:shadow-lg transition-all cursor-pointer font-sans"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

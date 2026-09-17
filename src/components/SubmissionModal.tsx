"use client";

import React, { useState } from "react";
import { AlertTriangle, Upload, X, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

interface SubmissionModalProps {
  isOpen: boolean;
  attemptNumber: number;
  filename: string;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  isSubmitting: boolean;
}

export default function SubmissionModal({
  isOpen,
  attemptNumber,
  filename,
  onClose,
  onConfirm,
  isSubmitting,
}: SubmissionModalProps) {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-navy-border/80 shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 text-brand-muted hover:text-brand-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Banner */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-accent/15 border border-orange-accent/30 flex items-center justify-center text-orange-accent shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-brand-white">
              Confirm Submission: Attempt {attemptNumber} of 3
            </h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              Each team has strictly <span className="text-brand-white font-semibold">3 attempts</span> in
              total. Submitting will consume attempt{" "}
              <span className="text-orange-accent font-mono font-bold">#{attemptNumber}</span>.
            </p>
          </div>
        </div>

        {/* File summary */}
        <div className="p-3.5 rounded-xl bg-bg-secondary border border-navy-border/60 flex items-center justify-between text-xs font-mono">
          <span className="text-brand-muted">Attached File:</span>
          <span className="text-teal-accent font-semibold">{filename}</span>
        </div>

        {/* Written Approach Notes */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-brand-white">
            Brief Approach Notes & Parameter Tuning (Optional for Judges):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            placeholder="e.g., Implemented adaptive crossover with roulette selection, tuned inertia w=0.72..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent resize-none transition-colors"
          />
          <p className="text-[11px] text-brand-muted">
            Judges will reference these notes alongside your code during final expert evaluation.
          </p>
        </div>

        {/* Safeguard Notice */}
        <div className="p-3 rounded-lg bg-navy-deep/40 border border-teal-accent/20 text-[11px] text-brand-muted flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-teal-accent shrink-0 mt-0.5" />
          <span>
            Your code will be immediately benchmarked against our sandbox environment. Your best score
            will be updated on the live leaderboard automatically.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-brand-muted hover:text-brand-white hover:bg-bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(notes)}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-semibold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                <span>Benchmarking Sandbox...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Confirm & Submit Attempt {attemptNumber}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

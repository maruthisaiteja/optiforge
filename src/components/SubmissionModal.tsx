"use client";

import React, { useState } from "react";
import { AlertTriangle, Upload, X, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";

interface SubmissionModalProps {
  isOpen: boolean;
  attemptNumber: number;
  filename: string;
  isLivePatch?: boolean;
  onClose: () => void;
  onConfirm: (approachNotes: string, whatChangedNotes: string) => void;
  isSubmitting: boolean;
}

export default function SubmissionModal({
  isOpen,
  attemptNumber,
  filename,
  isLivePatch = false,
  onClose,
  onConfirm,
  isSubmitting,
}: SubmissionModalProps) {
  const [approachNotes, setApproachNotes] = useState("");
  const [whatChangedNotes, setWhatChangedNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const requiresWhatChanged = attemptNumber > 1 && !isLivePatch;

  const handleFormSubmit = () => {
    if (requiresWhatChanged && (!whatChangedNotes || !whatChangedNotes.trim())) {
      setValidationError("A mandatory 'What changed and why' reflection note is required for Attempt " + attemptNumber + ".");
      return;
    }
    setValidationError(null);
    onConfirm(approachNotes, whatChangedNotes);
  };

  const bannerClass = isLivePatch
    ? "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-orange-accent/15 border-orange-accent/30 text-orange-accent"
    : "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-teal-accent/15 border-teal-accent/30 text-teal-accent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-navy-border/80 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
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
          <div className={bannerClass}>
            {isLivePatch ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-brand-white">
              {isLivePatch
                ? "Stage 7: Live Patch Submission"
                : `Confirm Submission: Attempt ${attemptNumber} of 3`}
            </h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              {isLivePatch ? (
                <span className="text-orange-accent font-semibold">
                  ⚠️ ZERO AI ALLOWED. Your code will be benchmarked on the live surprise constraint suite.
                </span>
              ) : (
                <>
                  Each team has strictly <span className="text-brand-white font-semibold">3 attempts</span> in total.
                  Submitting will consume attempt{" "}
                  <span className="text-teal-accent font-mono font-bold">#{attemptNumber}</span>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* File summary */}
        <div className="p-3.5 rounded-xl bg-bg-secondary border border-navy-border/60 flex items-center justify-between text-xs font-mono">
          <span className="text-brand-muted">Attached File:</span>
          <span className="text-teal-accent font-semibold">{filename}</span>
        </div>

        {/* Mandatory 'What Changed and Why' Note for Attempt 2 and 3 */}
        {requiresWhatChanged && (
          <div className="space-y-2 p-3.5 rounded-xl bg-electric-violet/10 border border-electric-violet/30">
            <label className="block text-xs font-semibold text-brand-white flex items-center justify-between">
              <span>What Changed & Why? (Mandatory Reflection)</span>
              <span className="text-[10px] text-orange-accent font-mono">* Required for Attempt {attemptNumber}</span>
            </label>
            <textarea
              value={whatChangedNotes}
              onChange={(e) => {
                setWhatChangedNotes(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isSubmitting}
              rows={3}
              placeholder="e.g., In response to the 20% nursing staff reduction, increased penalty weight on consecutive shifts from 1.5 to 3.2 and adjusted population mutation rate..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-electric-violet resize-none transition-colors"
            />
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Domain judges review this reflection during the viva to verify your algorithmic reasoning and adaptation strategy.
            </p>
          </div>
        )}

        {/* Written Approach Notes */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-brand-white">
            Approach Notes & Parameter Configuration (Optional):
          </label>
          <textarea
            value={approachNotes}
            onChange={(e) => setApproachNotes(e.target.value)}
            disabled={isSubmitting}
            rows={2}
            placeholder="e.g., GA parameters: pop=80, crossover=0.85 (2-point), mutation=0.04 (adaptive)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent resize-none transition-colors"
          />
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Safeguard Notice */}
        <div className="p-3 rounded-lg bg-navy-deep/40 border border-teal-accent/20 text-[11px] text-brand-muted flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-teal-accent shrink-0 mt-0.5" />
          <span>
            Code is analyzed via AST for algorithmic integrity and executed against benchmark test cases.
            Leaderboard will reflect your latest best score.
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
            onClick={handleFormSubmit}
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
                <span>{isLivePatch ? "Submit Live Patch" : `Confirm & Submit Attempt ${attemptNumber}`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
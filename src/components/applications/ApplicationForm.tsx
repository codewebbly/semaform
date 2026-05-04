"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { applicationSchema } from "@/lib/validations/application";

interface Props {
  rfpId: string;
  defaultNarrative: string;
  defaultBudgetNotes: string;
}

const TEXTAREA_CLASS =
  "block w-full rounded-[6px] border border-[#E5E4E0] px-3 py-2.5 text-sm bg-white text-[#1A1A18] placeholder:text-[#9B9A96] focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/20 focus:border-[#1A6BFF] transition-colors resize-none leading-relaxed";

export function ApplicationForm({ rfpId, defaultNarrative, defaultBudgetNotes }: Props) {
  const router = useRouter();
  const [narrative,   setNarrative]   = useState(defaultNarrative);
  const [budgetNotes, setBudgetNotes] = useState(defaultBudgetNotes);
  const [error,       setError]       = useState("");
  const [isLoading,   setIsLoading]   = useState(false);

  const narrativeTooShort = narrative.trim().length > 0 && narrative.trim().length < 50;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = applicationSchema.safeParse({
      rfpId,
      proposalNarrative: narrative,
      budgetNotes,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to submit application.");
        return;
      }

      router.push(`/nonprofit/rfps/${rfpId}/apply`);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Proposal narrative */}
      <div>
        <Label htmlFor="narrative" required>Proposal narrative</Label>
        <p className="text-xs text-[#9B9A96] mb-2">
          Describe how your work aligns with this RFP and what you would do with the funding.
        </p>
        <textarea
          id="narrative"
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          rows={9}
          className={TEXTAREA_CLASS}
          required
        />
        <div className="flex items-center justify-between mt-1.5">
          {narrativeTooShort ? (
            <p className="text-xs text-[#D97706]">Minimum 50 characters required</p>
          ) : (
            <span />
          )}
          <p className={`text-xs tabular-nums ml-auto ${
            narrative.length < 50
              ? "text-[#9B9A96]"
              : "text-[#16A34A]"
          }`}>
            {narrative.length} characters
          </p>
        </div>
      </div>

      {/* Budget notes */}
      <div>
        <Label htmlFor="budgetNotes" required>Budget notes</Label>
        <p className="text-xs text-[#9B9A96] mb-2">
          Summarize how the requested funds would be allocated and used.
        </p>
        <textarea
          id="budgetNotes"
          value={budgetNotes}
          onChange={(e) => setBudgetNotes(e.target.value)}
          rows={4}
          className={TEXTAREA_CLASS}
          required
        />
      </div>

      {error && (
        <div className="rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-3">
          <p className="text-sm text-[#DC2626]">{error}</p>
        </div>
      )}

      <div className="pt-1 flex items-center gap-4">
        <Button type="submit" size="lg" isLoading={isLoading}>
          Submit application
        </Button>
        <p className="text-xs text-[#9B9A96]">You can only apply once per RFP.</p>
      </div>

    </form>
  );
}

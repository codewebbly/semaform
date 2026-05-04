"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { rfpSchema } from "@/lib/validations/rfp";

interface Props {
  sourceType?: "MANUAL" | "IMPORTED";
  redirectTo?: string;
}

const TEXTAREA_CLASS =
  "block w-full rounded-[6px] border border-[#E5E4E0] px-3 py-2 text-sm bg-white text-[#1A1A18] placeholder:text-[#9B9A96] focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/20 focus:border-[#1A6BFF] transition-colors resize-none";

const DATE_CLASS =
  "block w-full rounded-[6px] border border-[#E5E4E0] px-3 py-2 text-sm bg-white text-[#1A1A18] h-9 focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/20 focus:border-[#1A6BFF] transition-colors";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-[#9B9A96] uppercase tracking-wider mb-4">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-[#E5E4E0]" />;
}

export function RFPForm({ sourceType = "MANUAL", redirectTo = "/donor/rfps" }: Props) {
  const router = useRouter();
  const [title,               setTitle]               = useState("");
  const [description,         setDescription]         = useState("");
  const [fundingAmount,       setFundingAmount]       = useState("");
  const [deadline,            setDeadline]            = useState("");
  const [focusAreas,          setFocusAreas]          = useState("");
  const [geographies,         setGeographies]         = useState("");
  const [eligibilityCriteria, setEligibilityCriteria] = useState("");
  const [error,               setError]               = useState("");
  const [isLoading,           setIsLoading]           = useState(false);

  const minDate = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = rfpSchema.safeParse({
      title,
      description,
      fundingAmount,
      deadline,
      focusAreas:   focusAreas.split(",").map((s) => s.trim()).filter(Boolean),
      geographies:  geographies.split(",").map((s) => s.trim()).filter(Boolean),
      eligibilityCriteria,
      sourceType,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/rfps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create RFP.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Basics ──────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" required>Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Clean Water Access Grant 2025"
            required
          />
        </div>
        <div>
          <Label htmlFor="description" required>Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe the grant purpose, funding priorities, and what you're looking for in applicants…"
            className={TEXTAREA_CLASS}
            required
          />
          <p className="mt-1.5 text-[11px] text-[#9B9A96]">
            This appears on the public RFP card and is used by the AI matching engine.
          </p>
        </div>
      </div>

      <Divider />

      {/* ── Funding ─────────────────────────────── */}
      <div>
        <SectionLabel>Funding</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fundingAmount" required>Amount (USD)</Label>
            <Input
              id="fundingAmount"
              type="number"
              min="1"
              step="1000"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
              placeholder="500000"
              required
            />
          </div>
          <div>
            <Label htmlFor="deadline" required>Application deadline</Label>
            <input
              id="deadline"
              type="date"
              min={minDate}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={DATE_CLASS}
              required
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* ── Targeting ───────────────────────────── */}
      <div>
        <SectionLabel>Targeting</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label htmlFor="focusAreas" required>
              Focus areas{" "}
              <span className="text-[#9B9A96] font-normal">(comma-separated)</span>
            </Label>
            <Input
              id="focusAreas"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              placeholder="Education, Clean Water, Healthcare"
              required
            />
          </div>
          <div>
            <Label htmlFor="geographies" required>
              Geographies{" "}
              <span className="text-[#9B9A96] font-normal">(comma-separated)</span>
            </Label>
            <Input
              id="geographies"
              value={geographies}
              onChange={(e) => setGeographies(e.target.value)}
              placeholder="Sub-Saharan Africa, United States"
              required
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* ── Requirements ────────────────────────── */}
      <div>
        <SectionLabel>Requirements</SectionLabel>
        <div>
          <Label htmlFor="eligibilityCriteria" required>Eligibility criteria</Label>
          <textarea
            id="eligibilityCriteria"
            value={eligibilityCriteria}
            onChange={(e) => setEligibilityCriteria(e.target.value)}
            rows={4}
            placeholder="501(c)(3) organizations with a minimum 3-year operating history…"
            className={TEXTAREA_CLASS}
            required
          />
        </div>
      </div>

      {/* ── Banners ─────────────────────────────── */}
      {sourceType === "IMPORTED" && (
        <div className="rounded-[6px] bg-[#FAF5FF] border border-[#DDD6FE] px-3.5 py-3">
          <p className="text-sm text-[#7C3AED]">
            This RFP will be listed as an <strong>External Grant</strong> visible to all nonprofits.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-3">
          <p className="text-sm text-[#DC2626]">{error}</p>
        </div>
      )}

      {/* ── Submit ──────────────────────────────── */}
      <div className="pt-1">
        <Button type="submit" size="lg" isLoading={isLoading}>
          {sourceType === "IMPORTED" ? "Import RFP" : "Post RFP"}
        </Button>
      </div>

    </form>
  );
}

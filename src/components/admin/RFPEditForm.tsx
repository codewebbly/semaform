"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { rfpSchema } from "@/lib/validations/rfp";

interface InitialValues {
  title: string;
  description: string;
  fundingAmount: number;
  deadline: string;
  focusAreas: string[];
  geographies: string[];
  eligibilityCriteria: string;
  published: boolean;
}

interface Props {
  rfpId: string;
  initial: InitialValues;
}

const TEXTAREA_CLASS =
  "block w-full rounded-[6px] border border-[#E5E4E0] px-3 py-2 text-sm bg-white text-[#1A1A18] placeholder:text-[#9B9A96] focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/20 focus:border-[#1A6BFF] transition-colors resize-none";

export function RFPEditForm({ rfpId, initial }: Props) {
  const router = useRouter();
  const [title,               setTitle]               = useState(initial.title);
  const [description,         setDescription]         = useState(initial.description);
  const [fundingAmount,       setFundingAmount]       = useState(String(initial.fundingAmount));
  const [deadline,            setDeadline]            = useState(initial.deadline.split("T")[0]);
  const [focusAreas,          setFocusAreas]          = useState(initial.focusAreas.join(", "));
  const [geographies,         setGeographies]         = useState(initial.geographies.join(", "));
  const [eligibilityCriteria, setEligibilityCriteria] = useState(initial.eligibilityCriteria);
  const [published,           setPublished]           = useState(initial.published);
  const [error,               setError]               = useState("");
  const [isLoading,           setIsLoading]           = useState(false);

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
      sourceType: "IMPORTED",
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/rfps/${rfpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, published }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update RFP.");
        return;
      }

      router.push("/admin/rfps/queue");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="title" required>Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          className={TEXTAREA_CLASS}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="fundingAmount" required>Funding amount (USD)</Label>
          <Input
            id="fundingAmount"
            type="number"
            min="1"
            step="1000"
            value={fundingAmount}
            onChange={(e) => setFundingAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="deadline" required>Application deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="focusAreas" required>
          Focus areas{" "}
          <span className="text-[#9B9A96] font-normal">(comma-separated)</span>
        </Label>
        <Input
          id="focusAreas"
          value={focusAreas}
          onChange={(e) => setFocusAreas(e.target.value)}
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
          required
        />
      </div>

      <div>
        <Label htmlFor="eligibilityCriteria" required>Eligibility criteria</Label>
        <textarea
          id="eligibilityCriteria"
          value={eligibilityCriteria}
          onChange={(e) => setEligibilityCriteria(e.target.value)}
          rows={3}
          className={TEXTAREA_CLASS}
          required
        />
      </div>

      <label className="flex items-center gap-3 rounded-[6px] bg-[#F8F8F7] border border-[#E5E4E0] px-4 py-3 cursor-pointer">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-[#E5E4E0] accent-[#1A6BFF]"
        />
        <span className="text-sm font-medium text-[#1A1A18]">
          Published — visible to nonprofits
        </span>
      </label>

      {error && (
        <div className="rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-3">
          <p className="text-sm text-[#DC2626]">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" size="lg" isLoading={isLoading}>
          Save changes
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

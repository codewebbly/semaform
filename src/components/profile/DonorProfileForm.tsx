"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { donorProfileSchema } from "@/lib/validations/profile";
import { DONOR_BUDGET_RANGES } from "@/lib/constants";

interface Props {
  initialData?: {
    orgName: string;
    mission: string;
    focusAreas: string[];
    geographies: string[];
    annualBudgetRange: string;
  };
}

const fieldClass =
  "block w-full rounded-[6px] border border-[#E5E4E0] px-3 py-2 text-sm bg-white text-[#1A1A18] placeholder:text-[#9B9A96] focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/20 focus:border-[#1A6BFF] transition-colors";

export function DonorProfileForm({ initialData }: Props) {
  const router = useRouter();
  const [orgName,           setOrgName]           = useState(initialData?.orgName ?? "");
  const [mission,           setMission]           = useState(initialData?.mission ?? "");
  const [focusAreas,        setFocusAreas]        = useState(initialData?.focusAreas.join(", ") ?? "");
  const [geographies,       setGeographies]       = useState(initialData?.geographies.join(", ") ?? "");
  const [annualBudgetRange, setAnnualBudgetRange] = useState(initialData?.annualBudgetRange ?? "");
  const [error,             setError]             = useState("");
  const [isLoading,         setIsLoading]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = donorProfileSchema.safeParse({
      orgName,
      mission,
      focusAreas:  focusAreas.split(",").map((s) => s.trim()).filter(Boolean),
      geographies: geographies.split(",").map((s) => s.trim()).filter(Boolean),
      annualBudgetRange,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/profile/donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save profile.");
        return;
      }

      router.push("/donor/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="orgName" required>Organization name</Label>
        <Input
          id="orgName"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="All States Foundation"
          required
        />
      </div>

      <div>
        <Label htmlFor="mission" required>Mission statement</Label>
        <textarea
          id="mission"
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          rows={4}
          placeholder="Describe your foundation's mission and funding priorities…"
          className={fieldClass}
          required
        />
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
          placeholder="Education, Healthcare, Environment"
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
          placeholder="United States, Sub-Saharan Africa"
          required
        />
      </div>

      <div>
        <Label htmlFor="annualBudgetRange" required>Annual grantmaking budget</Label>
        <select
          id="annualBudgetRange"
          value={annualBudgetRange}
          onChange={(e) => setAnnualBudgetRange(e.target.value)}
          className={fieldClass}
          required
        >
          <option value="">Select range…</option>
          {DONOR_BUDGET_RANGES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-3">
          <p className="text-sm text-[#DC2626]">{error}</p>
        </div>
      )}

      <div className="pt-1">
        <Button type="submit" size="lg" isLoading={isLoading}>
          {initialData ? "Update profile" : "Save and continue"}
        </Button>
      </div>
    </form>
  );
}

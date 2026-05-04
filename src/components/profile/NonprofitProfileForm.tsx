"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { nonprofitProfileSchema } from "@/lib/validations/profile";
import { SDG_GOALS, NONPROFIT_BUDGET_RANGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  initialData?: {
    orgName:      string;
    mission:      string;
    focusAreas:   string[];
    serviceAreas: string[];
    annualBudget: string;
    sdgAlignment: string[];
  };
}

const FIELD_CLASS =
  "block w-full rounded-[6px] border border-[#E5E4E0] px-3 py-2 text-sm bg-white text-[#1A1A18] placeholder:text-[#9B9A96] focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/20 focus:border-[#1A6BFF] transition-colors";

export function NonprofitProfileForm({ initialData }: Props) {
  const router = useRouter();
  const [orgName,      setOrgName]      = useState(initialData?.orgName ?? "");
  const [mission,      setMission]      = useState(initialData?.mission ?? "");
  const [focusAreas,   setFocusAreas]   = useState(initialData?.focusAreas.join(", ") ?? "");
  const [serviceAreas, setServiceAreas] = useState(initialData?.serviceAreas.join(", ") ?? "");
  const [annualBudget, setAnnualBudget] = useState(initialData?.annualBudget ?? "");
  const [sdgAlignment, setSdgAlignment] = useState<string[]>(initialData?.sdgAlignment ?? []);
  const [error,        setError]        = useState("");
  const [isLoading,    setIsLoading]    = useState(false);

  function toggleSdg(sdg: string) {
    setSdgAlignment((prev) =>
      prev.includes(sdg) ? prev.filter((s) => s !== sdg) : [...prev, sdg]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = nonprofitProfileSchema.safeParse({
      orgName,
      mission,
      focusAreas:   focusAreas.split(",").map((s) => s.trim()).filter(Boolean),
      serviceAreas: serviceAreas.split(",").map((s) => s.trim()).filter(Boolean),
      annualBudget,
      sdgAlignment,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/profile/nonprofit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save profile.");
        return;
      }

      router.push("/nonprofit/dashboard");
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
          placeholder="Your Nonprofit Name"
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
          placeholder="Describe your organization's mission…"
          className={FIELD_CLASS}
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
        <Label htmlFor="serviceAreas" required>
          Service areas{" "}
          <span className="text-[#9B9A96] font-normal">(comma-separated)</span>
        </Label>
        <Input
          id="serviceAreas"
          value={serviceAreas}
          onChange={(e) => setServiceAreas(e.target.value)}
          placeholder="Northeast US, Sub-Saharan Africa"
          required
        />
      </div>

      <div>
        <Label htmlFor="annualBudget" required>Annual operating budget</Label>
        <select
          id="annualBudget"
          value={annualBudget}
          onChange={(e) => setAnnualBudget(e.target.value)}
          className={FIELD_CLASS}
          required
        >
          <option value="">Select range…</option>
          {NONPROFIT_BUDGET_RANGES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>
          SDG alignment{" "}
          <span className="text-[#9B9A96] font-normal">(select all that apply)</span>
        </Label>
        <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto border border-[#E5E4E0] rounded-[6px] p-3 bg-[#F8F8F7]">
          {SDG_GOALS.map((sdg) => (
            <label
              key={sdg}
              className={cn(
                "flex items-center gap-2 cursor-pointer text-xs px-2 py-1.5 rounded-[4px] transition-colors",
                sdgAlignment.includes(sdg)
                  ? "bg-[#EEF4FF] text-[#1A6BFF]"
                  : "text-[#6B6A66] hover:text-[#1A1A18]"
              )}
            >
              <input
                type="checkbox"
                checked={sdgAlignment.includes(sdg)}
                onChange={() => toggleSdg(sdg)}
                className="rounded accent-[#1A6BFF] shrink-0"
              />
              {sdg}
            </label>
          ))}
        </div>
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

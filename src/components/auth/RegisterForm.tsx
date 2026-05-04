"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { registerSchema } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

const ROLES = [
  { value: "NONPROFIT", label: "Nonprofit" },
  { value: "DONOR",     label: "Donor / Foundation" },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<"DONOR" | "NONPROFIT">("NONPROFIT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = registerSchema.safeParse({ email, password, role });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Registration failed.");
        return;
      }

      router.push("/auth/login?registered=true");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role segmented control */}
      <div>
        <Label required>Account type</Label>
        <div className="flex rounded-[6px] border border-[#E5E4E0] bg-[#F8F8F7] p-[3px] gap-1 mt-0.5">
          {ROLES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={cn(
                "flex-1 text-sm py-1.5 px-3 rounded-[4px] font-medium transition-colors",
                role === value
                  ? "bg-white text-[#1A1A18] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-[#6B6A66] hover:text-[#1A1A18]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="reg-email" required>Email address</Label>
        <Input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <Label htmlFor="reg-password" required>Password</Label>
        <Input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          required
        />
      </div>

      {error && (
        <div className="rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-3">
          <p className="text-sm text-[#DC2626]">{error}</p>
        </div>
      )}

      <div className="pt-1">
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Create account
        </Button>
      </div>
    </form>
  );
}

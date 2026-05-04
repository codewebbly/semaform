"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm({ registered }: { registered?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;

      if (role === "DONOR") router.push("/donor/dashboard");
      else if (role === "NONPROFIT") router.push("/nonprofit/dashboard");
      else if (role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {registered && (
        <div className="rounded-[6px] bg-[#F0FDF4] border border-[#BBF7D0] px-3.5 py-3">
          <p className="text-sm text-[#16A34A] font-medium">Account created — sign in below.</p>
        </div>
      )}
      <div>
        <Label htmlFor="email" required>Email address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password" required>Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
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
          Sign in
        </Button>
      </div>
    </form>
  );
}

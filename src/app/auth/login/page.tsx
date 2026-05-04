import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

interface Props {
  searchParams: { registered?: string };
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">

        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-[6px] bg-[#1A6BFF] flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="4" cy="7" r="2" fill="white" />
              <circle cx="10" cy="7" r="2" fill="white" />
              <line x1="6" y1="7" x2="8" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1A1A18] tracking-tight">
            Handshake Impact Engine
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[12px] border border-[#E5E4E0] px-8 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#1A1A18]">Welcome back</h1>
            <p className="mt-1 text-sm text-[#6B6A66]">
              Sign in to continue to your account.
            </p>
          </div>
          <LoginForm registered={searchParams.registered === "true"} />
        </div>

        <p className="mt-4 text-center text-sm text-[#6B6A66]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#1A6BFF] font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  suspended: boolean;
}

export function SuspendButton({ userId, suspended }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!confirm(suspended ? "Unsuspend this user?" : "Suspend this user? They will be unable to log in."))
      return;
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: !suspended }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-medium px-3 py-1.5 rounded-[6px] border transition-colors disabled:opacity-50 ${
        suspended
          ? "border-[#BBF7D0] text-[#16A34A] bg-[#F0FDF4] hover:bg-[#DCFCE7]"
          : "border-[#FECACA] text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2]"
      }`}
    >
      {loading ? "…" : suspended ? "Unsuspend" : "Suspend"}
    </button>
  );
}

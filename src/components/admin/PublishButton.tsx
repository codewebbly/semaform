"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  rfpId: string;
  published: boolean;
}

export function PublishButton({ rfpId, published }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (
      !confirm(
        published
          ? "Unpublish this RFP? It will be hidden from nonprofits."
          : "Publish this RFP? It will become visible to all nonprofits."
      )
    )
      return;
    setLoading(true);
    try {
      await fetch(`/api/admin/rfps/${rfpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
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
        published
          ? "border-[#E5E4E0] text-[#6B6A66] bg-white hover:bg-[#F8F8F7]"
          : "border-[#BFDBFE] text-[#1A6BFF] bg-[#EEF4FF] hover:bg-[#DBEAFE]"
      }`}
    >
      {loading ? "…" : published ? "Unpublish" : "Publish"}
    </button>
  );
}

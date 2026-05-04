import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  switch (session.user.role) {
    case "DONOR":     redirect("/donor/dashboard");
    case "NONPROFIT": redirect("/nonprofit/dashboard");
    case "ADMIN":     redirect("/admin/dashboard");
    default:          redirect("/auth/login");
  }
}

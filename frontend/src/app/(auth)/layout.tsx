"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/store/AuthContext";
import { AUTH_ROUTES } from "@/features/auth/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(AUTH_ROUTES.DASHBOARD);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) return null;
  return <>{children}</>;
}

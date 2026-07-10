import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/features/auth/constants";

export default function HomePage() {
  redirect(AUTH_ROUTES.REGISTER);
}

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  LOGIN_BUTTON_LABEL,
  LOGIN_BUTTON_SUBMITTING_LABEL,
} from "./../../constants";

export interface LoginFormProps {
  values: { email: string; password: string };
  errors: { email?: string; password?: string };
  isSubmitting: boolean;
  onChange: (field: "email" | "password", value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function LoginForm({
  values,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form
      method="post"
      action="#"
      onSubmit={onSubmit}
      className="w-full max-w-sm flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Input
          type="email"
          placeholder="Email address"
          aria-label="Email address"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          disabled={isSubmitting}
          error={!!errors.email}
          errorMessage={errors.email}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Input
          type="password"
          placeholder="Password"
          aria-label="Password"
          name="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => onChange("password", e.target.value)}
          disabled={isSubmitting}
          error={!!errors.password}
          errorMessage={errors.password}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full"
      >
        {isSubmitting ? LOGIN_BUTTON_SUBMITTING_LABEL : LOGIN_BUTTON_LABEL}
      </Button>
    </form>
  );
}

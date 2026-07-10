"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/api/services/AuthService";
import { ApiError } from "@/lib/api/core/ApiError";
import type { TokenObtainPair } from "@/lib/api/models/TokenObtainPair";
import { useAuth } from "../../store/AuthContext";
import {
  LOGIN_GENERIC_ERROR,
  LOGIN_INVALID_CREDENTIALS_ERROR,
  EMAIL_INVALID_ERROR,
  PASSWORD_REQUIRED_ERROR,
  AUTH_ROUTES,
} from "../../constants";

interface LoginValues {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

interface UseLoginReturn {
  values: LoginValues;
  errors: LoginErrors;
  formError?: string;
  isSubmitting: boolean;
  handleChange: (field: "email" | "password", value: string) => void;
  handleSubmit: (event: React.FormEvent) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function useLogin(): UseLoginReturn {
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (field: "email" | "password", value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the field's error immediately
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;

    // Reset form error
    setFormError(undefined);

    // Client-side validation
    const newErrors: LoginErrors = {};

    if (!values.email || !isValidEmail(values.email)) {
      newErrors.email = EMAIL_INVALID_ERROR;
    }

    if (!values.password) {
      newErrors.password = PASSWORD_REQUIRED_ERROR;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // `access`/`refresh` are readOnly response-only fields that drf-spectacular
      // still lists as "required" on the shared request/response schema, so the
      // generated `TokenObtainPair` type demands them even for a login request body.
      // The cast is safe: the server ignores/overwrites them and always returns both.
      const response = await AuthService.authLoginCreate({
        email: values.email,
        password: values.password,
      } as TokenObtainPair);

      // Login was successful; call the auth context's login function
      await login({
        access: response.access,
        refresh: response.refresh,
      });

      // Redirect to dashboard
      router.replace(AUTH_ROUTES.DASHBOARD);

      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);

      if (error instanceof ApiError && error.status === 401) {
        // Invalid credentials; show generic message without confirming email exists
        setFormError(LOGIN_INVALID_CREDENTIALS_ERROR);
        return;
      }

      if (error instanceof ApiError && error.status === 400) {
        // DRF returns errors in format: { field: ["message", ...] }
        const body = error.body as Record<string, string[] | string> | undefined;

        if (body && typeof body === "object") {
          const fieldErrors: LoginErrors = {};

          if (body.email) {
            const emailMessages = Array.isArray(body.email)
              ? body.email
              : [body.email];
            fieldErrors.email = emailMessages[0];
          }

          if (body.password) {
            const passwordMessages = Array.isArray(body.password)
              ? body.password
              : [body.password];
            fieldErrors.password = passwordMessages[0];
          }

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
          }
        }
      }

      // For network errors, non-400/401 responses, or unparseable bodies
      setFormError(LOGIN_GENERIC_ERROR);
    }
  };

  return {
    values,
    errors,
    formError,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}

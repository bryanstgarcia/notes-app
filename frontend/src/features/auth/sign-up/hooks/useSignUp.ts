"use client";

import { useState } from "react";
import { AuthService } from "@/lib/api/services/AuthService";
import { ApiError } from "@/lib/api/core/ApiError";
import type { Register } from "@/lib/api/models/Register";
import {
  PASSWORD_MIN_LENGTH,
  SIGN_UP_GENERIC_ERROR,
  EMAIL_INVALID_ERROR,
  PASSWORD_TOO_SHORT_ERROR,
} from "./../../constants";

interface SignUpValues {
  email: string;
  password: string;
}

interface SignUpErrors {
  email?: string;
  password?: string;
}

interface UseSignUpReturn {
  values: SignUpValues;
  errors: SignUpErrors;
  formError?: string;
  isSubmitting: boolean;
  isSuccess: boolean;
  handleChange: (field: "email" | "password", value: string) => void;
  handleSubmit: (event: React.FormEvent) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function useSignUp(): UseSignUpReturn {
  const [values, setValues] = useState<SignUpValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field: "email" | "password", value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;

    setFormError(undefined);

    const newErrors: SignUpErrors = {};

    if (!values.email || !isValidEmail(values.email)) {
      newErrors.email = EMAIL_INVALID_ERROR;
    }

    if (!values.password || values.password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = PASSWORD_TOO_SHORT_ERROR;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // `id`/`username` are readOnly response-only fields that drf-spectacular
      // still lists as "required" on the shared request/response schema, so the
      // generated `Register` type demands them even for a registration request body.
      // The cast is safe: the server assigns and returns both; the client never sets them.
      await AuthService.authRegisterCreate({
        email: values.email,
        password: values.password,
      } as Register);

      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);

      if (error instanceof ApiError && error.status === 400) {
        // DRF returns errors in format: { field: ["message", ...] }
        const body = error.body as Record<string, string[] | string> | undefined;

        if (body && typeof body === "object") {
          const fieldErrors: SignUpErrors = {};

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

      // For network errors, non-400 responses, or unparseable bodies
      setFormError(SIGN_UP_GENERIC_ERROR);
    }
  };

  return {
    values,
    errors,
    formError,
    isSubmitting,
    isSuccess,
    handleChange,
    handleSubmit,
  };
}

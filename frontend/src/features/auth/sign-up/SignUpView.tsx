"use client";

import Image from "next/image";
import catIllustration from "@/assets/cat.png";
import { useSignUp } from "./hooks/useSignUp";
import { SignUpForm } from "./components/SignUpForm";
import { TextLink } from "@/components/ui/TextLink";
import {
  SIGN_UP_HEADING,
  SIGN_UP_LOGIN_LINK_LABEL,
  AUTH_ROUTES,
} from "../constants";

export function SignUpView() {
  const {
    values,
    errors,
    formError,
    isSubmitting,
    isSuccess,
    handleChange,
    handleSubmit,
  } = useSignUp();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background px-4">
      <main className="flex flex-col items-center w-full max-w-md gap-10 py-16">
        <Image
          src={catIllustration}
          alt="Illustration of a sleeping cat"
          className="w-48 h-auto mx-auto mb-8"
          priority
        />

        <h1 className="font-title font-bold text-brown text-center text-5xl">
          {SIGN_UP_HEADING}
        </h1>
        {formError && (
          <div
            role="alert"
            className="w-full bg-red-100 border border-red-300 rounded-lg p-4 text-red-600 text-sm"
          >
            {formError}
          </div>
        )}
        <div className="flex flex-col gap-4 w-full justify-center items-center">
          {!isSuccess ? (
            <SignUpForm
              values={values}
              errors={errors}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="text-center flex flex-col gap-4 items-center">
              <p className="text-brown text-base">
                Welcome! Your account has been created successfully.
              </p>
              <TextLink href={AUTH_ROUTES.LOGIN} className="font-bold">
                Go to Login
              </TextLink>
            </div>
          )}

          <div className="text-center mt-4">
            <TextLink href={AUTH_ROUTES.LOGIN}>
              {SIGN_UP_LOGIN_LINK_LABEL}
            </TextLink>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import Image from "next/image";
import cactusIllustration from "@/assets/cactus.png";
import { useLogin } from "./hooks/useLogin";
import { LoginForm } from "./components/LoginForm";
import { TextLink } from "@/components/ui/TextLink";
import {
  LOGIN_HEADING,
  LOGIN_REGISTER_LINK_LABEL,
  AUTH_ROUTES,
} from "./../constants";

export function LoginView() {
  const {
    values,
    errors,
    formError,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useLogin();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background px-4">
      <main className="flex flex-col items-center w-full max-w-md gap-10 py-16">
        <Image
          src={cactusIllustration}
          alt="Illustration of a cactus"
          className="w-32 h-auto mx-auto mb-8"
          priority
        />

        <h1 className="font-title font-bold text-brown text-center text-5xl">
          {LOGIN_HEADING}
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
          <LoginForm
            values={values}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          <div className="text-center mt-4">
            <TextLink href={AUTH_ROUTES.REGISTER}>
              {LOGIN_REGISTER_LINK_LABEL}
            </TextLink>
          </div>
        </div>
      </main>
    </div>
  );
}

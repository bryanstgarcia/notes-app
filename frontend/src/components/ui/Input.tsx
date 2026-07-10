"use client";

import React from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  error?: boolean;
  errorMessage?: string;
  className?: string;
}

const DEFAULT_INPUT_TYPE: React.HTMLInputTypeAttribute = "text";
const TOGGLE_ICON_SIZE_CLASSES = "w-5 h-5 flex justify-center items-center";
const PASSWORD_VISIBILITY_LABELS = {
  show: "Show password",
  hide: "Hide password",
} as const;

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.07706 9.38876C1.93634 9.62636 2.01488 9.93305 2.25248 10.0738C2.49007 10.2145 2.79676 10.1359 2.93748 9.89835L2.50727 9.64356L2.07706 9.38876ZM3.64673 7.7196L3.21652 7.4648L2.07706 9.38876L2.50727 9.64356L2.93748 9.89835L4.07694 7.97439L3.64673 7.7196Z" fill="#957139"/>
      <path d="M3.00012 7C6.00012 9 10.0001 9 13.0001 7" stroke="#957139" strokeLinecap="round"/>
      <path d="M4.67518 10.7114C4.63082 10.984 4.81581 11.2409 5.08837 11.2852C5.36092 11.3296 5.61783 11.1446 5.66219 10.872L5.16868 10.7917L4.67518 10.7114ZM5.62302 8.00002L5.12951 7.9197L4.67518 10.7114L5.16868 10.7917L5.66219 10.872L6.11652 8.08033L5.62302 8.00002Z" fill="#957139"/>
      <path d="M6.99988 11.0001C6.99986 11.2762 7.2237 11.5001 7.49985 11.5001C7.77599 11.5001 7.99986 11.2763 7.99988 11.0002L7.49988 11.0001L6.99988 11.0001ZM7.50004 8.50006L7.00004 8.50003L6.99988 11.0001L7.49988 11.0001L7.99988 11.0002L8.00004 8.5001L7.50004 8.50006Z" fill="#957139"/>
      <path d="M10.0097 11.0981C10.0639 11.3688 10.3273 11.5445 10.5981 11.4903C10.8688 11.4361 11.0445 11.1727 10.9903 10.9019L10.5 11L10.0097 11.0981ZM9.99994 8.50004L9.50965 8.59811L10.0097 11.0981L10.5 11L10.9903 10.9019L10.4902 8.40197L9.99994 8.50004Z" fill="#957139"/>
      <path d="M12.5902 10.2866C12.7484 10.5129 13.0601 10.5681 13.2865 10.4099C13.5128 10.2517 13.568 9.93999 13.4098 9.71366L13 10.0001L12.5902 10.2866ZM11.602 8.00011L11.1922 8.28658L12.5902 10.2866L13 10.0001L13.4098 9.71366L12.0118 7.71365L11.602 8.00011Z" fill="#957139"/>
    </svg>
  );
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = DEFAULT_INPUT_TYPE,
      error,
      errorMessage,
      disabled,
      className,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const errorMessageId = React.useId();

    const baseFieldClasses =
      "w-full h-14 rounded-2xl border-[1.5px] bg-cream font-sans text-base text-brown placeholder:text-brown/50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const borderAndRingClasses = error
      ? "border-red-600 focus-visible:ring-red-600"
      : "border-brown focus-visible:ring-brown";

    const paddingClasses = type === "password" ? "pl-5 pr-12" : "pl-5 pr-5";

    const resolvedType =
      type === "password" ? (showPassword ? "text" : "password") : type;

    const inputClassName = `${baseFieldClasses} ${borderAndRingClasses} ${paddingClasses}${className ? ` ${className}` : ""}`;

    const input = (
      <input
        ref={ref}
        type={resolvedType}
        className={inputClassName}
        disabled={disabled}
        aria-invalid={error || undefined}
        aria-describedby={error && errorMessage ? errorMessageId : undefined}
        {...rest}
      />
    );

    return (
      <>
        {type === "password" ? (
          <div className="relative">
            {input}
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword
                  ? PASSWORD_VISIBILITY_LABELS.hide
                  : PASSWORD_VISIBILITY_LABELS.show
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-brown hover:text-brown/70 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              <span
                aria-hidden="true"
                className={TOGGLE_ICON_SIZE_CLASSES}
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </span>
            </button>
          </div>
        ) : (
          input
        )}
        {error && errorMessage && (
          <p
            role="alert"
            id={errorMessageId}
            className="mt-1.5 text-sm text-red-600 font-sans"
          >
            {errorMessage}
          </p>
        )}
      </>
    );
  }
);

Input.displayName = "Input";

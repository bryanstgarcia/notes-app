import React from "react";

export type CloseButtonSize = "sm" | "md" | "lg";

const DEFAULT_CLOSE_BUTTON_SIZE: CloseButtonSize = "md";
const DEFAULT_CLOSE_BUTTON_LABEL = "Close";

const SIZE_STYLES: Record<CloseButtonSize, string> = {
  sm: "p-2",
  md: "p-2.5",
  lg: "p-1",
};

const ICON_SIZE_STYLES: Record<CloseButtonSize, string> = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export interface CloseButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  size?: CloseButtonSize;
  className?: string;
}

export const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ size = DEFAULT_CLOSE_BUTTON_SIZE, className, ...rest }, ref) => {
    const sizeClasses = SIZE_STYLES[size];

    const baseClasses =
      "cursor-pointer inline-flex items-center justify-center rounded-full text-brown transition-colors duration-150 hover:bg-brown-light active:bg-brown-light active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const computedClassName = `${baseClasses} ${sizeClasses}${className ? ` ${className}` : ""}`;

    const { "aria-label": ariaLabel, ...restWithoutAriaLabel } = rest;

    return (
      <button
        ref={ref}
        type={restWithoutAriaLabel.type ?? "button"}
        aria-label={ariaLabel ?? DEFAULT_CLOSE_BUTTON_LABEL}
        className={computedClassName}
        {...restWithoutAriaLabel}
      >
        <span aria-hidden="true" className={ICON_SIZE_STYLES[size]}>
          <CloseIcon />
        </span>
      </button>
    );
  }
);

CloseButton.displayName = "CloseButton";

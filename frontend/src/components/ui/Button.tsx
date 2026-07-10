import React from "react";

export type ButtonSize = "sm" | "md" | "lg";

const DEFAULT_BUTTON_SIZE: ButtonSize = "md";

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-sm gap-1.5",
  md: "h-12 px-8 text-base gap-2",
  lg: "h-14 px-10 text-lg gap-2.5",
};

const ICON_SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  children: React.ReactNode;
  size?: ButtonSize;
  icon?: React.ReactNode;
  // className is optional and used for layout/spacing composition only (margin, width in a flex/grid parent).
  // Must NOT be used to override background, border, or text color.
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, size = DEFAULT_BUTTON_SIZE, icon, className, ...rest }, ref) => {
    const baseClasses =
      "cursor-pointer inline-flex items-center justify-center rounded-full border-[1.5px] border-brown bg-cream font-sans font-bold text-brown whitespace-nowrap transition-colors duration-150";

    const sizeClasses = SIZE_STYLES[size];

    const stateClasses =
      "hover:bg-brown-light focus-visible:bg-brown-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:bg-brown-light active:scale-[0.98] transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const computedClassName = `${baseClasses} ${sizeClasses} ${stateClasses}${className ? ` ${className}` : ""}`;

    return (
      <button
        ref={ref}
        type={rest.type ?? "button"}
        className={computedClassName}
        {...rest}
      >
        {children}
        {icon && (
          <span
            aria-hidden="true"
            className={`flex items-center justify-center ${ICON_SIZE_STYLES[size]}`}
          >
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

import Link from "next/link";
import React from "react";

export interface TextLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "className"> {
  children: React.ReactNode;
  className?: string;
}

export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ children, className, ...rest }, ref) => {
    const baseClasses =
      "text-brown text-sm no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm transition-colors duration-150";

    const computedClassName = `${baseClasses}${className ? ` ${className}` : ""}`;

    return (
      <Link ref={ref} className={computedClassName} {...rest}>
        {children}
      </Link>
    );
  }
);

TextLink.displayName = "TextLink";

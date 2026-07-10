import React, { useEffect, useRef } from "react";

export interface EditableFieldProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "className"
  > {
  variant?: "title" | "content";
  className?: string;
}

export const EditableField = React.forwardRef<
  HTMLTextAreaElement,
  EditableFieldProps
>(({ variant = "content", className, ...rest }, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = ref && typeof ref !== "function" ? ref : internalRef;

  // Auto-grow the textarea as content changes
  useEffect(() => {
    const textarea =
      typeof textareaRef === "function" ? internalRef.current : textareaRef?.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [rest.value, textareaRef]);

  const isTitle = variant === "title";
  const baseClasses =
    "w-full bg-transparent border-none resize-none focus-visible:outline-none rounded";

  const variantClasses = isTitle
    ? "font-title font-bold text-2xl text-black placeholder-black"
    : "font-sans text-base text-black placeholder-black";

  const computedClassName = `${baseClasses} ${variantClasses}${className ? ` ${className}` : ""}`;

  return (
    <textarea
      ref={textareaRef}
      className={computedClassName}
      {...rest}
    />
  );
});

EditableField.displayName = "EditableField";

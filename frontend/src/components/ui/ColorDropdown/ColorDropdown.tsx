"use client";

import React from "react";
import { useColorDropdown } from "./useColorDropdown";

export type CategoryColor = "blue" | "yellow" | "green" | "orange";

export interface DropdownOption {
  id: string;
  label: string;
  color: CategoryColor;
}

export interface CategoryDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (id: string) => void;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PLACEHOLDER = "Select a category";
const NO_CATEGORIES_MESSAGE = "No categories available";

const CATEGORY_COLOR_CLASSES: Record<CategoryColor, string> = {
  blue: "bg-blue",
  yellow: "bg-yellow",
  green: "bg-green",
  orange: "bg-orange",
};

const DOT_SIZE_CLASSES = "w-3 h-3";

function ColorDot({ color }: { color: CategoryColor }) {
  return (
    <div
      className={`inline-block ${DOT_SIZE_CLASSES} rounded-full flex-shrink-0 ${CATEGORY_COLOR_CLASSES[color]}`}
      aria-hidden="true"
    />
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export const ColorDropdown = React.forwardRef<
  HTMLButtonElement,
  CategoryDropdownProps
>(
  (
    {
      options,
      value,
      onChange,
      defaultValue,
      placeholder,
      disabled = false,
      className,
    },
    forwardedRef
  ) => {
    const {
      wrapperRef,
      panelRef,
      triggerRef,
      open,
      activeIndex,
      currentValue,
      selectedOption,
      triggerId,
      listboxId,
      selectOption,
      handleTriggerClick,
      handleTriggerKeyDown,
      handlePanelKeyDown,
      handleWrapperBlur,
    } = useColorDropdown(
      options,
      value,
      onChange,
      defaultValue,
      disabled,
      forwardedRef
    );
    const triggerButtonClasses = `w-full h-12 flex items-center justify-between gap-2 rounded-xl border-[1px] border-brown ${open ? "bg-brown-light" : "bg-cream"} px-3 font-sans text-base transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none hover:bg-brown-light active:bg-brown-light`;
    const labelSpanClasses = `flex-1 min-w-0 truncate text-left ${selectedOption ? "text-brown" : "text-brown/50"}`;
    const chevronClasses = `w-5 h-5 text-brown flex-shrink-0 transition-transform duration-150${open ? " rotate-180" : ""}`;
    const panelClasses = `absolute left-0 top-full mt-2 w-full z-10 rounded-2xl border-[1.5px] border-brown bg-cream py-2 focus-visible:outline-none`;
    const optionClasses = `flex items-center gap-3 px-5 py-2.5 font-sans text-base text-brown cursor-pointer truncate transition-colors duration-150 hover:bg-brown-light`;
    const emptyStateClasses = `px-5 py-2.5 font-sans text-base text-brown/50`;

    return (
      <div
        ref={wrapperRef}
        className={`relative${className ? ` ${className}` : ""}`}
        onBlur={handleWrapperBlur}
      >
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          className={triggerButtonClasses}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
        >
          {currentValue && selectedOption ? (
            <ColorDot color={selectedOption.color} />
          ) : null}
          <span
            className={labelSpanClasses}
            title={
              selectedOption
                ? selectedOption.label
                : placeholder ?? DEFAULT_PLACEHOLDER
            }
          >
            {selectedOption
              ? selectedOption.label
              : placeholder ?? DEFAULT_PLACEHOLDER}
          </span>
          <span aria-hidden="true" className={chevronClasses}>
            <ChevronDownIcon />
          </span>
        </button>

        {open && (
          <ul
            ref={panelRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            className={panelClasses}
            aria-activedescendant={
              options.length > 0
                ? `${listboxId}-option-${options[activeIndex].id}`
                : undefined
            }
            onKeyDown={handlePanelKeyDown}
          >
            {options.length === 0 ? (
              <li className={emptyStateClasses}>{NO_CATEGORIES_MESSAGE}</li>
            ) : (
              options.map((option, index) => (
                <li
                  key={option.id}
                  id={`${listboxId}-option-${option.id}`}
                  role="option"
                  aria-selected={option.id === currentValue}
                  className={`${optionClasses}${activeIndex === index ? " bg-brown-light" : ""}`}
                  onClick={() => selectOption(option)}
                >
                  <ColorDot color={option.color} />
                  <span className="truncate" title={option.label}>
                    {option.label}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    );
  }
);
ColorDropdown.displayName = "ColorDropdown";
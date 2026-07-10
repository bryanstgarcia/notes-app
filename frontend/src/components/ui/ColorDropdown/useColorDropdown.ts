import React from "react";
import type { DropdownOption } from "./ColorDropdown";

interface UseCategoryDropdownReturn {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLUListElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  activeIndex: number;
  currentValue: string | undefined;
  selectedOption: DropdownOption | undefined;
  triggerId: string;
  listboxId: string;
  selectOption: (option: DropdownOption) => void;
  handleTriggerClick: () => void;
  handleTriggerKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  handlePanelKeyDown: (e: React.KeyboardEvent<HTMLUListElement>) => void;
  handleWrapperBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
}

export function useColorDropdown(
  options: DropdownOption[],
  value: string | undefined,
  onChange: ((id: string) => void) | undefined,
  defaultValue: string | undefined,
  disabled: boolean,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>
): UseCategoryDropdownReturn {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const panelRef = React.useRef<HTMLUListElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  React.useImperativeHandle(
    forwardedRef,
    () => triggerRef.current as HTMLButtonElement
  );

  const reactId = React.useId();
  const triggerId = `${reactId}-trigger`;
  const listboxId = `${reactId}-listbox`;

  const selectedOption = options.find((opt) => opt.id === currentValue);

  const selectOption = (option: DropdownOption) => {
    onChange?.(option.id);
    if (!isControlled) setInternalValue(option.id);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerClick = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        const selectedIndex = options.findIndex((opt) => opt.id === currentValue);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return next;
    });
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const key = e.key;

    if (key === "Enter" || key === " ") {
      e.preventDefault();
      setOpen(true);
      const selectedIndex = options.findIndex((opt) => opt.id === currentValue);
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      setTimeout(() => panelRef.current?.focus(), 0);
    } else if (key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      const selectedIndex = options.findIndex((opt) => opt.id === currentValue);
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      setTimeout(() => panelRef.current?.focus(), 0);
    }
  };

  const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const key = e.key;

    if (key === "ArrowDown") {
      e.preventDefault();
      if (options.length > 0) {
        setActiveIndex((i) => (i + 1) % options.length);
      }
    } else if (key === "ArrowUp") {
      e.preventDefault();
      if (options.length > 0) {
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
      }
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      if (options.length > 0) {
        selectOption(options[activeIndex]);
      }
    } else if (key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  React.useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [open]);

  const handleWrapperBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      wrapperRef.current &&
      e.relatedTarget &&
      !wrapperRef.current.contains(e.relatedTarget as Node)
    ) {
      setOpen(false);
    }
  };

  React.useEffect(() => {
    if (!open) return;

    const selectedIndex = options.findIndex((opt) => opt.id === currentValue);
    if (selectedIndex >= 0) {
      // Intentional: we need to re-clamp activeIndex to prevent out-of-bounds access
      // when options array changes while panel is open (spec requirement)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(selectedIndex);
    } else {
      setActiveIndex(0);
    }
  }, [options, open, currentValue]);

  React.useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  return {
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
  };
}

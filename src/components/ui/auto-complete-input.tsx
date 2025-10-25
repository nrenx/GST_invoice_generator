import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type AutoCompleteOption = {
  value: string;
  label?: string;
  keywords?: string[];
};

export interface AutoCompleteInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string;
  options: AutoCompleteOption[];
  onChange: (value: string) => void;
  onOptionSelect?: (option: AutoCompleteOption) => void;
  emptyMessage?: string;
}

export const AutoCompleteInput = React.forwardRef<HTMLInputElement, AutoCompleteInputProps>(
  (
    {
      options,
      value = "",
      onChange,
      onOptionSelect,
      emptyMessage = "No options found",
      className,
      disabled,
      onFocus,
      onBlur,
      placeholder,
      ...rest
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const [open, setOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

    const normalizedValue = value.trim().toLowerCase();

    const filteredOptions = React.useMemo(() => {
      if (!normalizedValue) {
        return options;
      }

      return options.filter((option) => {
        const optionValue = option.value.toLowerCase();
        const optionLabel = (option.label ?? option.value).toLowerCase();
        if (optionValue.includes(normalizedValue) || optionLabel.includes(normalizedValue)) {
          return true;
        }

        if (option.keywords?.some((keyword) => keyword.toLowerCase().includes(normalizedValue))) {
          return true;
        }

        return false;
      });
    }, [normalizedValue, options]);

    React.useEffect(() => {
      if (!open) {
        setHighlightedIndex(-1);
      } else if (filteredOptions.length > 0) {
        setHighlightedIndex(0);
      }
    }, [open, filteredOptions]);

    React.useEffect(() => {
      if (!open) {
        return;
      }

      const handlePointerDown = (event: PointerEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      window.addEventListener("pointerdown", handlePointerDown);
      return () => window.removeEventListener("pointerdown", handlePointerDown);
    }, [open]);

    const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
      if (!disabled) {
        setOpen(true);
      }
    };

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }
      onChange(event.target.value);
      if (!open) {
        setOpen(true);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        setOpen(true);
        return;
      }

      if (!open) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev + 1;
          return next >= filteredOptions.length ? 0 : next;
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? filteredOptions.length - 1 : next;
        });
      } else if (event.key === "Enter") {
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          event.preventDefault();
          const option = filteredOptions[highlightedIndex];
          handleSelectOption(option);
        } else {
          setOpen(false);
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    const handleSelectOption = (option: AutoCompleteOption) => {
      onChange(option.value);
      onOptionSelect?.(option);
      setOpen(false);
      setHighlightedIndex(-1);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    };

    return (
      <div ref={containerRef} className="relative">
        <Input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          disabled={disabled}
          value={value}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={cn("pr-8", className)}
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Toggle options"
          className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground"
          onMouseDown={(event) => {
            event.preventDefault();
            if (disabled) {
              return;
            }
            const nextOpen = !open;
            setOpen(nextOpen);
            if (nextOpen) {
              requestAnimationFrame(() => inputRef.current?.focus());
            }
          }}
        >
          <ChevronsUpDown className="h-4 w-4" />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            {filteredOptions.length > 0 ? (
              <ul role="listbox" className="py-1 text-sm">
                {filteredOptions.map((option, index) => {
                  const isActive = index === highlightedIndex;
                  return (
                    <li
                      key={`${option.value}-${index}`}
                      role="option"
                      aria-selected={isActive}
                      className={cn(
                        "cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                        isActive && "bg-accent text-accent-foreground",
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectOption(option)}
                    >
                      {option.label ?? option.value}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
            )}
          </div>
        )}
      </div>
    );
  },
);

AutoCompleteInput.displayName = "AutoCompleteInput";

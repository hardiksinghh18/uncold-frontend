"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  icon?: React.ReactNode;
  size?: "sm" | "md";
  align?: "left" | "right";
  ariaLabel?: string;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  icon,
  size = "md",
  align = "left",
  ariaLabel,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const buttonSizeClasses =
    size === "sm"
      ? "px-2.5 py-1.5 text-[11px] rounded-lg gap-1.5"
      : "px-3 py-2 text-xs rounded-xl gap-2";

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || selected?.label}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center justify-between font-medium transition-all cursor-pointer border ${buttonSizeClasses} ${
          open
            ? "bg-white/[0.09] border-white/25 text-white shadow-sm"
            : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-zinc-200"
        }`}
      >
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          {icon && <span className="text-zinc-400">{icon}</span>}
          <span>{selected?.label}</span>
        </span>
        <ChevronDown
          size={size === "sm" ? 12 : 13}
          className={`text-zinc-400 transition-transform duration-150 ${
            open ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute mt-1.5 min-w-[190px] z-50 rounded-xl bg-[#0e1017]/95 backdrop-blur-xl border border-white/12 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.85)] p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.1] text-white font-medium"
                    : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs leading-tight truncate">{opt.label}</div>
                  {opt.description && (
                    <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                      {opt.description}
                    </div>
                  )}
                </div>
                {isSelected && <Check size={13} className="text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

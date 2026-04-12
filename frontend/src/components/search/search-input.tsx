'use client';

import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

/** Search input — auto-focus, clear button, submit on Enter */
export function SearchInput({
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  placeholder = 'Tìm kiếm sản phẩm...',
  className,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
      className={cn('relative', className)}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
          aria-label="Xoa"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </form>
  );
}

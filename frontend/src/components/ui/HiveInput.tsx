import { useState, useRef, useEffect } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

/* ── Shared base style ── */
const baseStyle = [
  'w-full bg-surface-container-highest/60',
  'border border-outline-variant/20 rounded-xl px-4 py-3 text-sm',
  'text-on-surface font-sans',
  'placeholder:text-outline',
  'outline-none transition-default',
  'focus:border-honey/40 focus:bg-surface-container-highest',
  'focus:shadow-[0_0_0_3px_rgba(245,166,35,0.08)]',
].join(' ');

/* ── Label ── */
function Label({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[0.7rem] font-semibold text-on-surface-variant uppercase tracking-wider"
    >
      {children}
    </label>
  );
}

/* ── Input ── */
interface HiveInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function Input({ label, error, id, className = '', ...props }: HiveInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <input
        id={id}
        className={`${baseStyle} ${error ? 'border-error/50 focus:border-error/60' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}

/* ── Textarea ── */
interface HiveTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

function Textarea({ label, error, id, className = '', ...props }: HiveTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <textarea
        id={id}
        className={`${baseStyle} resize-y min-h-[80px] ${error ? 'border-error/50' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}

/* ── Custom Select ── */
export interface HiveSelectOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

interface HiveSelectProps {
  label?: string;
  id?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: HiveSelectOption[];
  placeholder?: string;
  className?: string;
}

function Select({ label, id, value, onChange, options, placeholder, className = '' }: HiveSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <div
          id={id}
          tabIndex={0}
          className={`${baseStyle} pr-10 cursor-pointer flex items-center gap-2 ${className}`}
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(!open);
            }
          }}
        >
          {selected ? (
            <>
              {selected.icon && <span>{selected.icon}</span>}
              <span className="truncate">{selected.label}</span>
            </>
          ) : (
            <span className="text-outline truncate">{placeholder || 'Pilih...'}</span>
          )}
        </div>
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {open && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface-container-highest/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 animate-fade-up origin-top">
            <div className="max-h-[240px] overflow-y-auto scrollbar-thin p-1.5 flex flex-col gap-0.5">
              {options.length === 0 ? (
                <div className="px-3 py-4 text-sm text-on-surface-variant text-center">Tidak ada opsi</div>
              ) : (
                options.map((opt) => (
                  <div
                    key={opt.value}
                    className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-sm rounded-xl transition-all duration-200
                      ${value === opt.value 
                        ? 'bg-honey/15 text-honey font-semibold' 
                        : 'text-on-surface hover:bg-white/5'}`}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    {opt.icon && <span className={`${value === opt.value ? 'opacity-100' : 'opacity-70'}`}>{opt.icon}</span>}
                    <span className="truncate flex-1">{opt.label}</span>
                    {value === opt.value && (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const HiveInput = Object.assign(Input, {
  Textarea,
  Select,
  Label,
});

import { useRef } from 'react';

interface HiveMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
  placeholder?: string;
  className?: string;
}

const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function HiveMessageInput({
  value,
  onChange,
  onSend,
  sending = false,
  placeholder = 'Tulis pesan...',
  className = '',
}: HiveMessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`px-4 py-3 border-t border-outline-variant/10 shrink-0 ${className}`}>
      <div className="flex items-end gap-3 max-w-[1200px] mx-auto w-full">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={e => {
              onChange(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="block w-full bg-surface-container-high/60 border border-outline-variant/20 rounded-2xl py-3 px-4 text-sm text-on-surface outline-none resize-none font-sans transition-all placeholder:text-outline focus:border-honey/40 focus:bg-surface-container-high shadow-inner"
            style={{ maxHeight: '120px', minHeight: '46px' }}
          />
        </div>
        <button
          onClick={onSend}
          disabled={!value.trim() || sending}
          className={[
            'w-[46px] h-[46px] rounded-xl flex items-center justify-center shrink-0 border-none transition-all duration-300',
            value.trim() && !sending
              ? 'bg-honey text-[#1a0e00] shadow-[0_4px_16px_rgba(245,166,35,0.3)] hover:shadow-[0_6px_24px_rgba(245,166,35,0.45)] hover:scale-105 cursor-pointer'
              : 'bg-honey/40 text-[#1a0e00]/50 cursor-not-allowed',
          ].join(' ')}
          title="Kirim (Enter)"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-[#1a0e00]/30 border-t-[#1a0e00] rounded-full animate-spin" />
          ) : (
            <span>
              <IconSend />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

'use client';

import { type ReactNode, useEffect } from 'react';

interface HiveModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function HiveModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: HiveModalProps) {
  /* Lock body scroll when open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={[
          'relative w-full',
          maxWidth,
          'hive-card p-5 md:p-8',
          'shadow-2xl shadow-black/30',
          'animate-scale-in',
          'max-h-[90vh] overflow-y-auto',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-bold mb-6 text-on-surface">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}

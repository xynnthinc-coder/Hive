'use client';

import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastId = 0;
let addToastFn: ((msg: string, type: 'success' | 'error') => void) | null = null;

/** Call from anywhere to show a toast */
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  addToastFn?.(message, type);
}

export default function HiveToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message, type) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    return () => { addToastFn = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            'px-5 py-2.5 rounded-2xl text-sm font-medium',
            'shadow-lg border animate-slide-up',
            'backdrop-blur-md max-w-[90vw] break-words text-center',
            t.type === 'success'
              ? 'bg-secondary/15 text-secondary border-secondary/20'
              : 'bg-error/15 text-error border-error/20',
          ].join(' ')}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

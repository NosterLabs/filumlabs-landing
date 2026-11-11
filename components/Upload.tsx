'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ACCEPT } from '@/lib/files';
import { setPendingFile } from '@/lib/pending';

// Hands a file to /cotizar: from a button, or dropped anywhere on the wrapped area.
function useSend() {
  const router = useRouter();
  return (file: File) => {
    setPendingFile(file);
    router.push('/cotizar');
  };
}

export function UploadButton({ label = 'Cotizar mi archivo', className = 'btn' }: { label?: string; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const send = useSend();
  return (
    <>
      <button type="button" className={className} onClick={() => input.current?.click()}>
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) send(f);
        }}
      />
    </>
  );
}

export function DropArea({ className, children, label }: { className?: string; children: ReactNode; label: string }) {
  const send = useSend();
  const [drag, setDrag] = useState(false);
  return (
    <section
      className={className}
      aria-label={label}
      data-drag={drag || undefined}
      onDragOver={(e) => {
        if (![...e.dataTransfer.types].includes('Files')) return;
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) send(f);
      }}
    >
      {children}
    </section>
  );
}

import * as React from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, children }: DialogProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">{children}</div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

export function DialogPanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-float', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={['text-lg font-semibold text-[color:var(--color-foreground)]', className].filter(Boolean).join(' ')} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={['mt-1 text-sm text-[color:var(--color-muted)]', className].filter(Boolean).join(' ')} {...props} />;
}

export default Dialog;

import * as React from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, overlayVariants } from '../../utils/motion';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <HeadlessDialog as="div" className="relative z-[60]" open={open} onClose={onClose} static>
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-md"
          />

          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex min-h-full items-center justify-center p-4">
              <HeadlessDialog.Panel
                as={motion.div}
                variants={modalVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="w-full max-w-lg relative bg-surface border border-border-light rounded-2xl shadow-float flex flex-col max-h-[90vh]"
              >
                {children}
              </HeadlessDialog.Panel>
            </div>
          </div>
        </HeadlessDialog>
      )}
    </AnimatePresence>
  );
}

export function DialogPanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('w-full flex flex-col', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <HeadlessDialog.Title
      as="h3"
      className={clsx('text-xl font-semibold tracking-tight text-[color:var(--color-foreground)]', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <HeadlessDialog.Description
      className={clsx('mt-2 text-sm text-[color:var(--color-foreground-secondary)]', className)}
      {...props}
    />
  );
}

export default Dialog;

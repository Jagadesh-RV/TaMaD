import * as React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Drawer({ open, onClose, children }: DrawerProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/35" />
        </Transition.Child>

        <div className="fixed inset-y-0 right-0 flex max-w-full">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div className="w-[420px] max-w-full border-l border-border bg-surface p-6 shadow-float">{children}</div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Drawer;

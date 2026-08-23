import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export type ContextMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
};

export type ContextMenuProps = {
  items: ContextMenuItem[];
  children: React.ReactNode;
};

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleScroll = () => closeMenu();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Adjust position if it goes off screen
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      if (position.x + rect.width > viewportWidth) {
        newX = position.x - rect.width;
      }
      if (position.y + rect.height > viewportHeight) {
        newY = position.y - rect.height;
      }

      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
    }
  }, [isOpen, position]);

  return (
    <>
      <div onContextMenu={handleContextMenu} className="inline-block w-full">
        {children}
      </div>

      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                zIndex: 1000,
              }}
              className="w-48 rounded-xl border border-border bg-surface shadow-float py-1 overflow-hidden"
            >
              {items.map((item, index) => {
                if (item.divider) {
                  return <div key={index} className="h-px w-full bg-border-light my-1" />;
                }
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onClick();
                      closeMenu();
                    }}
                    className={clsx(
                      'flex w-full items-center gap-2 px-3 py-1.5 text-[13px] font-medium transition-colors outline-none hover:bg-surface-active',
                      item.danger ? 'text-danger hover:bg-danger-ghost' : 'text-foreground hover:text-accent'
                    )}
                  >
                    {item.icon && <span className="opacity-70">{item.icon}</span>}
                    {item.label}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

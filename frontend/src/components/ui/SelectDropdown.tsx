import * as React from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { clsx } from 'clsx';
import { ChevronDown, Check } from 'lucide-react';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
};

export function SelectDropdown({
  value,
  onChange,
  options,
  className,
  buttonClassName,
  placeholder = 'Select an option'
}: SelectDropdownProps) {
  const selectedOption = React.useMemo(() => 
    options.find((opt) => opt.value === value), 
  [options, value]);

  return (
    <div className={clsx('relative w-full', className)}>
      <Listbox value={value} onChange={onChange}>
        <ListboxButton
          className={clsx(
            'flex w-full items-center justify-between rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition-all focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/15',
            buttonClassName
          )}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : <span className="text-[color:var(--color-muted)]">{placeholder}</span>}
          </span>
          <ChevronDown
            className="h-4 w-4 text-[color:var(--color-muted)]"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom start"
          className={clsx(
            'z-[100] mt-1 max-h-60 w-[var(--button-width)] overflow-auto rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-1 text-base shadow-xl focus:outline-none sm:text-sm [--anchor-gap:4px]'
          )}
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              className={({ active }) =>
                clsx(
                  'relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors',
                  active ? 'bg-[color:var(--color-surface-hover)] text-[color:var(--color-accent)]' : 'text-[color:var(--color-foreground)]'
                )
              }
              value={option.value}
            >
              {({ selected, active }) => (
                <>
                  <span
                    className={clsx(
                      'block truncate',
                      selected ? 'font-medium' : 'font-normal'
                    )}
                  >
                    {option.label}
                  </span>
                  {selected ? (
                    <span
                      className={clsx(
                        'absolute inset-y-0 left-0 flex items-center pl-3',
                        active ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-accent)]'
                      )}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}

export default SelectDropdown;

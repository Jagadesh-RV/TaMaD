import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

const renderDialog = (overrides: Partial<ComponentProps<typeof ConfirmDialog>> = {}) => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <ConfirmDialog open title="Delete project?" onConfirm={onConfirm} onClose={onClose} {...overrides} />,
  );
  return { onConfirm, onClose };
};

describe('ConfirmDialog', () => {
  it('renders title and message', () => {
    renderDialog({ message: 'This cannot be undone.' });
    expect(screen.getByText('Delete project?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('uses Confirm/Cancel default labels', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('uses custom labels when provided', () => {
    renderDialog({ confirmLabel: 'Delete', cancelLabel: 'Keep' });
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm is clicked', () => {
    const { onConfirm } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel is clicked', () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state and disables both actions', () => {
    renderDialog({ loading: true });
    expect(screen.getByRole('button', { name: 'Please wait…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('does not render anything when closed', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Delete project?')).not.toBeInTheDocument();
  });
});

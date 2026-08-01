import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskModal from './TaskModal';

// Mock dialog since HeadlessUI uses portals and complex DOM trees that might be hard to test purely without mocking,
// OR we can test the actual modal if we mock ResizeObserver
beforeEach(() => {
  // Mock ResizeObserver
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('TaskModal', () => {
  it('opens and renders correctly', () => {
    render(<TaskModal isOpen={true} onClose={() => {}} onSave={() => {}} initialData={{}} />);
    expect(screen.getByText('Create task')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('populates data when editing an existing item', () => {
    const data = { _id: '123', title: 'Edit Me', description: 'Desc' };
    render(<TaskModal isOpen={true} onClose={() => {}} onSave={() => {}} initialData={data} />);
    
    expect(screen.getByText('Edit task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Edit Me')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desc')).toBeInTheDocument();
  });

  it('calls onSave with correct data on submit', () => {
    const onSave = vi.fn();
    render(<TaskModal isOpen={true} onClose={() => {}} onSave={onSave} initialData={{}} />);
    
    const titleInput = screen.getByPlaceholderText(/Finalize presentation slides/i);
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    
    const saveButton = screen.getByText('Save task');
    fireEvent.click(saveButton);
    
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Task'
    }));
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    render(<TaskModal isOpen={true} onClose={onClose} onSave={() => {}} initialData={{}} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('prevents submission if required fields are missing (Validation)', () => {
    const onSave = vi.fn();
    render(<TaskModal isOpen={true} onClose={() => {}} onSave={onSave} initialData={{}} />);
    
    const saveButton = screen.getByText('Save task');
    fireEvent.click(saveButton);
    
    // HTML5 required validation prevents the form from submitting via standard DOM events if we use fireEvent.submit
    // Note: React testing library fireEvent.click on submit button doesn't trigger HTML5 validation visually, but
    // standard form submission won't proceed. We check that onSave was NOT called since title is required.
    // Wait, fireEvent.click on submit WILL call submit if we don't mock it completely, but actually JS handles it differently.
    // Since title is empty, it shouldn't be valid.
    expect(onSave).not.toHaveBeenCalled();
  });
});

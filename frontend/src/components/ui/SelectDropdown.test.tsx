import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SelectDropdown from './SelectDropdown';

describe('SelectDropdown', () => {
  const options = [
    { value: 'epic', label: 'Epic' },
    { value: 'story', label: 'Story' },
    { value: 'task', label: 'Task' }
  ];

  it('renders with placeholder when no value matches', () => {
    render(<SelectDropdown value="" onChange={() => {}} options={options} placeholder="Pick an issue" />);
    expect(screen.getByText('Pick an issue')).toBeInTheDocument();
  });

  it('renders the selected value', () => {
    render(<SelectDropdown value="story" onChange={() => {}} options={options} />);
    expect(screen.getByText('Story')).toBeInTheDocument();
  });

  it('opens dropdown and allows selecting an option', async () => {
    const onChange = vi.fn();
    render(<SelectDropdown value="story" onChange={onChange} options={options} />);
    
    // Open the dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Find the option
    const epicOption = screen.getByText('Epic');
    fireEvent.click(epicOption);
    
    expect(onChange).toHaveBeenCalledWith('epic');
  });

  it('supports keyboard navigation', () => {
    const onChange = vi.fn();
    render(<SelectDropdown value="task" onChange={onChange} options={options} />);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    
    // Pressing Enter should open it
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    
    // Headless UI handles keyboard events internally; testing specific DOM states in JSDOM for HeadlessUI is tricky
    // but we can verify it mounts the listbox.
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    // Escape should close it
    fireEvent.keyDown(listbox, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

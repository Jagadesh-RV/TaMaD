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

});

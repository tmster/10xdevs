import React from 'react';
import { vi } from 'vitest';

// Automatyczne mockowanie komponentów UI
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    React.createElement('button', props, children),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
    React.createElement('textarea', props),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
    React.createElement('input', props),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { children?: React.ReactNode }) =>
    React.createElement('label', props, children),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
    React.createElement('div', { role: 'alert', ...props }, children),
  AlertDescription: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
    React.createElement('div', props, children),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: (props: React.HTMLAttributes<HTMLDivElement> & { value?: number }) =>
    React.createElement('div', {
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': props.value,
      ...props
    }),
}));

vi.mock('@/hooks/useApiError', () => ({
  useApiError: () => ({ handleApiError: vi.fn() }),
}));

export const mockOnSubmit = vi.fn();
export const resetMocks = () => {
  mockOnSubmit.mockReset();
};
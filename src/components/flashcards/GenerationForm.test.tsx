import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerationForm } from '../../../tests/mocks/GenerationFormMock';
import { mockOnSubmit, resetMocks } from '../../../tests/mocks/generationFormMocks';

describe('GenerationForm - text length validation', () => {
  const isLoading = false;

  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
  });

  it('should disable submit button when text is below minimum length', () => {
    // Arrange
    render(<GenerationForm onSubmit={mockOnSubmit} isLoading={isLoading} />);
    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });
    const textArea = screen.getByRole('textbox', { name: /text for flashcard generation/i });

    // Act - Enter text below minimum length (999 characters)
    fireEvent.change(textArea, { target: { value: 'a'.repeat(999) } });

    // Assert
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when text is above maximum length', () => {
    // Arrange
    render(<GenerationForm onSubmit={mockOnSubmit} isLoading={isLoading} />);
    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });
    const textArea = screen.getByRole('textbox', { name: /text for flashcard generation/i });

    // Act - Enter text above maximum length (10001 characters)
    fireEvent.change(textArea, { target: { value: 'a'.repeat(10001) } });

    // Assert
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when text is exactly at minimum length', () => {
    // Arrange
    render(<GenerationForm onSubmit={mockOnSubmit} isLoading={isLoading} />);
    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });
    const textArea = screen.getByRole('textbox', { name: /text for flashcard generation/i });

    // Act - Enter text at exact minimum length (1000 characters)
    fireEvent.change(textArea, { target: { value: 'a'.repeat(1000) } });

    // Assert
    expect(submitButton).not.toBeDisabled();
  });

  it('should enable submit button when text is exactly at maximum length', () => {
    // Arrange
    render(<GenerationForm onSubmit={mockOnSubmit} isLoading={isLoading} />);
    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });
    const textArea = screen.getByRole('textbox', { name: /text for flashcard generation/i });

    // Act - Enter text at exact maximum length (10000 characters)
    fireEvent.change(textArea, { target: { value: 'a'.repeat(10000) } });

    // Assert
    expect(submitButton).not.toBeDisabled();
  });

  it('should not call onSubmit when form is submitted with invalid text length', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<GenerationForm onSubmit={mockOnSubmit} isLoading={isLoading} />);
    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });
    const textArea = screen.getByRole('textbox', { name: /text for flashcard generation/i });

    // Act - Enter invalid text length and try to submit
    fireEvent.change(textArea, { target: { value: 'a'.repeat(500) } });
    await user.click(submitButton);

    // Assert
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit when form is submitted with valid text length', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<GenerationForm onSubmit={mockOnSubmit} isLoading={isLoading} />);
    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });
    const textArea = screen.getByRole('textbox', { name: /text for flashcard generation/i });
    const maxCardsInput = screen.getByRole('spinbutton', { name: /maximum number of flashcards/i });

    // Act - Enter valid text length and submit
    fireEvent.change(textArea, { target: { value: 'a'.repeat(1500) } });
    fireEvent.change(maxCardsInput, { target: { value: 5 } });
    await user.click(submitButton);

    // Assert
    expect(mockOnSubmit).toHaveBeenCalledWith('a'.repeat(1500), 5);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('should display appropriate error message when text is too short', () => {
    // Arrange
    render(<GenerationForm onSubmit={mockOnSubmit} isLoading={isLoading} />);
    const textArea = screen.getByRole('textbox', { name: /text for flashcard generation/i });

    // Act - Enter text below minimum length
    fireEvent.change(textArea, { target: { value: 'a'.repeat(500) } });

    // Assert
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent(/please enter at least 1000 characters/i);
    expect(errorMessage).toHaveTextContent(/500 more needed/i);
  });

  it('should display appropriate error message when text is too long', () => {
    // Arrange
    render(<GenerationForm onSubmit={mockOnSubmit} isLoading={isLoading} />);
    const textArea = screen.getByRole('textbox', { name: /text for flashcard generation/i });

    // Act - Enter text above maximum length
    fireEvent.change(textArea, { target: { value: 'a'.repeat(10500) } });

    // Assert
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent(/text is too long/i);
    expect(errorMessage).toHaveTextContent(/500 over limit/i);
  });
});
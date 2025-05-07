import { describe, it, vi, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";

describe("Button Component", () => {
  // Test 1: Button renders with label
  it("renders with the correct label", () => {
    render(<Button label="Click me" />);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  // Test 2: Button handles click events
  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);

    const button = screen.getByText("Click me");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test 3: Button respects disabled state
  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} disabled />);

    const button = screen.getByText("Click me");
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  // Test 4: Button renders with different variants
  it("renders with correct styling based on variant", () => {
    const { rerender } = render(<Button label="Primary" variant="primary" />);
    let button = screen.getByText("Primary");
    expect(button).toHaveClass("bg-blue-600");

    rerender(<Button label="Primary" variant="secondary" />);
    button = screen.getByText("Primary");
    expect(button).toHaveClass("bg-gray-200");

    rerender(<Button label="Primary" variant="danger" />);
    button = screen.getByText("Primary");
    expect(button).toHaveClass("bg-red-600");
  });

  // Test 5: Button accepts custom className
  it("applies custom className", () => {
    render(<Button label="Custom" className="custom-class" />);
    const button = screen.getByText("Custom");
    expect(button).toHaveClass("custom-class");
  });
});

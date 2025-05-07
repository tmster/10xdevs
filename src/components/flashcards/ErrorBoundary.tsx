import { Component, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Flashcards component error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>{this.state.error?.message || "An unexpected error occurred"}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

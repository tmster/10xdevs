import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission will be implemented later
    // This is just UI implementation
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            If an account exists with that email, we've sent instructions to reset your password. Please check your
            inbox.
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <a href="/login" className="font-medium text-primary hover:text-primary/90">
            Return to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>

      <div className="text-center text-sm mt-4">
        <a href="/login" className="font-medium text-primary hover:text-primary/90">
          Back to login
        </a>
      </div>
    </form>
  );
}

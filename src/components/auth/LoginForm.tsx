import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        redirect: "follow",
      });

      // If the response is a redirect (status 3xx), follow it
      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      // Handle error responses
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to sign in. Please try again.");
        setIsLoading(false);
        return;
      }

      // If not redirected but successful, go to flashcards list
      window.location.href = "/flashcards/list";
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

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
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <div className="text-center text-sm mt-4">
        <span className="text-muted-foreground">Don't have an account?</span>{" "}
        <a
          href="/register"
          className="font-medium text-primary hover:text-primary/90"
        >
          Sign up
        </a>
      </div>
    </form>
  );
}
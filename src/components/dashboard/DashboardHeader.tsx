import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DashboardHeaderProps {
  username: string;
  lastLoginDate: Date;
}

export function DashboardHeader({ username, lastLoginDate }: DashboardHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome back, {username}!</CardTitle>
        <CardDescription>
          Last login: {lastLoginDate.toLocaleDateString()} at {lastLoginDate.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

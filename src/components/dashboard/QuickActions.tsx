import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Settings } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  description: string;
}

const actions: QuickAction[] = [
  {
    id: "create",
    label: "Create Flashcards",
    icon: <PlusCircle className="w-5 h-5" />,
    path: "/flashcards/create",
    description: "Create new flashcards manually",
  },
  {
    id: "generate",
    label: "Generate Flashcards",
    icon: <FileText className="w-5 h-5" />,
    path: "/flashcards/generate",
    description: "Generate flashcards using AI",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    path: "/settings",
    description: "Manage your account settings",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {actions.map((action) => (
            <Button key={action.id} variant="outline" className="w-full justify-start gap-2 h-auto py-4" asChild>
              <a href={action.path}>
                {action.icon}
                <div className="flex flex-col items-start">
                  <span className="font-medium">{action.label}</span>
                  <span className="text-sm text-muted-foreground">{action.description}</span>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

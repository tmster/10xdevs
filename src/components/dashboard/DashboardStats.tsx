import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatisticsDTO } from "@/types";

interface DashboardStatsProps {
  stats: StatisticsDTO;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Flashcards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{stats.flashcards.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Accepted:</span>
              <span className="font-medium text-green-600">{stats.flashcards.by_status.accepted}</span>
            </div>
            <div className="flex justify-between">
              <span>Rejected:</span>
              <span className="font-medium text-red-600">{stats.flashcards.by_status.rejected}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{stats.generations.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Generated:</span>
              <span className="font-medium">{stats.generations.cards_generated}</span>
            </div>
            <div className="flex justify-between">
              <span>Acceptance Rate:</span>
              <span className="font-medium text-blue-600">{(stats.generations.acceptance_rate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlashcardsListFilters } from "./FlashcardsIndexView";

/**
 * Props for the Header component
 * @interface HeaderProps
 */
interface HeaderProps {
  /** Callback for when the create button is clicked */
  onCreateClick: () => void;
  /** Callback for when filters are changed */
  onFilterChange: (filters: FlashcardsListFilters) => void;
  /** Current filter state */
  filters: FlashcardsListFilters;
}

/**
 * Header component for the flashcards list view
 * Contains the title, create button, and filter controls
 *
 * @component
 * @example
 * ```tsx
 * <Header
 *   onCreateClick={() => {}}
 *   onFilterChange={(filters) => {}}
 *   filters={{ sort: "created_at", order: "desc" }}
 * />
 * ```
 */
export function Header({ onCreateClick, onFilterChange, filters }: HeaderProps) {
  /**
   * Handles changes to individual filter values
   * @param key - The filter key to update
   * @param value - The new filter value
   */
  const handleFilterChange = (key: keyof FlashcardsListFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Flashcards</CardTitle>
        <Button onClick={onCreateClick} aria-label="Create new flashcard">
          Create Flashcard
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4" role="search" aria-label="Flashcard filters">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => handleFilterChange("status", value)}
            aria-label="Filter by status"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.source || "all"}
            onValueChange={(value) => handleFilterChange("source", value)}
            aria-label="Filter by source"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="ai-full">AI Generated</SelectItem>
              <SelectItem value="ai-edited">AI Edited</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${filters.sort}_${filters.order}`}
            onValueChange={(value) => {
              const [sort, order] = value.split("_");
              onFilterChange({
                ...filters,
                sort: sort as "created_at" | "updated_at",
                order: order as "asc" | "desc",
              });
            }}
            aria-label="Sort flashcards"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at_desc">Newest first</SelectItem>
              <SelectItem value="created_at_asc">Oldest first</SelectItem>
              <SelectItem value="updated_at_desc">Recently updated</SelectItem>
              <SelectItem value="updated_at_asc">Least recently updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

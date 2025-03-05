"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Category {
  _id: string;
  name: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  isLoading?: boolean;
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}: CategoryTabsProps) {
  if (isLoading) {
    return (
      <div className="p-2 sm:p-3 border-b">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-3 border-b">
      <ScrollArea className="w-full">
        <div className="min-w-max">
          <Tabs
            defaultValue={selectedCategory || "all"}
            value={selectedCategory || "all"}
            onValueChange={(value) => onSelectCategory(value === "all" ? null : value)}
            className="w-full"
          >
            <TabsList className="h-10 p-1">
              <TabsTrigger
                value="all"
                className="rounded-md px-3 text-sm h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                Todos
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category._id}
                  value={category._id}
                  className="rounded-md px-3 text-sm h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
} 
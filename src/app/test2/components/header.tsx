import { Search, SlidersHorizontal, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-foreground hover:bg-accent hover:text-accent-foreground">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>

      <div className="flex flex-1 max-w-xl mx-4 md:mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents, fields..."
            className="w-full pl-10 pr-12 bg-background border-border"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-accent"
          >
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border-2 border-primary/20">
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

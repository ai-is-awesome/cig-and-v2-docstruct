import { useState } from "react";

import {
  FileText,
  Plus,
  Edit,
  Upload,
  Layers,
  Code,
  Mail,
  Server,
  Download,
  Database,
  Settings,
  BarChart3,
  GitBranch,
  Shield,
  ShieldCheck,
  Users,
  FileBarChart,
  CheckSquare,
  CreditCard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  icon: React.ElementType;
  href?: string;
}

interface NavSection {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Documents",
    icon: FileText,
    items: [
      { title: "Create New", icon: Plus, href: "/" },
      { title: "Edit", icon: Edit, href: "/" },
    ],
  },
  {
    title: "Input channels",
    icon: Upload,
    items: [
      { title: "Manual", icon: Layers },
      { title: "Bulk", icon: Layers },
      { title: "API", icon: Code },
      { title: "Email", icon: Mail },
      { title: "FTP", icon: Server },
    ],
  },
  {
    title: "Output channels",
    icon: Download,
    items: [
      { title: "API", icon: Code },
      { title: "Email", icon: Mail },
      { title: "DB", icon: Database },
    ],
  },
  {
    title: "Automation",
    icon: Settings,
    items: [
      { title: "Rule Builder", icon: GitBranch, href: "/rule-engine" },
      { title: "Workflows", icon: BarChart3, href: "/workflow/view" },
    ],
  },
  {
    title: "Admin",
    icon: Shield,
    items: [
      { title: "Super admin", icon: Shield },
      { title: "Users & roles", icon: Users, href: "/client-users" },
      {
        title: "Roles & Permissions",
        icon: ShieldCheck,
        href: "/client-users?tab=roles",
      },
      { title: "Reports", icon: FileBarChart },
      { title: "Checker UI", icon: CheckSquare, href: "/doc-viewer" },
      {
        title: "Third Party Access",
        icon: Shield,
        href: "/client-registration",
      },
      { title: "Billing", icon: CreditCard },
    ],
  },
];

interface AppSidebarProps {
  activePage?:
    | "documents"
    | "rule"
    | "doc-viewer"
    | "third-party"
    | "workflows";
}

export function AppSidebar({ activePage = "documents" }: AppSidebarProps) {
  const getInitialActive = () => {
    if (activePage === "rule") return "Rule";
    if (activePage === "doc-viewer") return "Checker UI";
    if (activePage === "third-party") return "Third Party Access";
    if (activePage === "workflows") return "Workflows";
    return "Edit";
  };
  const getInitialSections = () => {
    if (activePage === "rule") return ["Rule engine"];
    if (activePage === "doc-viewer") return ["Admin"];
    if (activePage === "third-party") return ["Admin"];
    if (activePage === "workflows") return ["Automation"];
    return ["Documents"];
  };
  const [activeItem, setActiveItem] = useState(getInitialActive());
  const [openSections, setOpenSections] = useState<string[]>(
    getInitialSections()
  );

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleItemClick = (item: NavItem) => {
    setActiveItem(item.title);
    if (item.href) {
      //   navigate(item.href);
    }
  };

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarContent className="pt-4">
        {navSections.map((section) => (
          <SidebarGroup key={section.title} className="px-2">
            <Collapsible
              open={openSections.includes(section.title)}
              onOpenChange={() => toggleSection(section.title)}
            >
              <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground">
                <section.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{section.title}</span>
                {openSections.includes(section.title) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="mt-1">
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            "ml-4 pl-4 text-sm text-muted-foreground transition-all hover:text-foreground cursor-pointer",
                            activeItem === item.title &&
                              "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          )}
                        >
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

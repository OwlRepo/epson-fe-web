import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  Bell,
} from "lucide-react";

export function SidebarExample() {
  const [collapsed, setCollapsed] = useState(true);

  // Custom navigation items for the demo
  const customNavItems = [
    {
      icon: <HomeIcon className="text-gray-500" />,
      label: "Dashboard",
      isActive: true,
      href: "#",
    },
    {
      icon: <LayoutDashboard className="text-gray-500" />,
      label: "Projects",
      href: "#",
      subItems: [
        { label: "All Projects", href: "#all-projects" },
        { label: "In Progress", href: "#in-progress" },
        { label: "Completed", href: "#completed" },
      ],
    },
    {
      icon: <Users className="text-gray-500" />,
      label: "Team",
      href: "#",
    },
    {
      icon: <Calendar className="text-gray-500" />,
      label: "Calendar",
      href: "#",
      subItems: [
        { label: "Month View", href: "#month" },
        { label: "Week View", href: "#week" },
        { label: "Day View", href: "#day" },
      ],
    },
    {
      icon: <Bell className="text-gray-500" />,
      label: "Notifications",
      href: "#",
    },
    {
      icon: <Settings className="text-gray-500" />,
      label: "Settings",
      href: "#",
      subItems: [
        { label: "Account", href: "#account" },
        { label: "Preferences", href: "#preferences" },
        { label: "Security", href: "#security" },
      ],
    },
    {
      icon: <HelpCircle className="text-gray-500" />,
      label: "Help Center",
      href: "#",
    },
  ];

  // Custom logo
  const customLogo = (
    <div className="h-8 w-full bg-purple-700 rounded flex items-center justify-center">
      <span className="font-bold text-white">MY PORTAL</span>
    </div>
  );

  // Custom collapsed logo
  const customCollapsedLogo = (
    <div className="h-8 w-8 bg-purple-700 rounded flex items-center justify-center">
      <span className="font-bold text-white text-sm">MP</span>
    </div>
  );

  // Custom footer items
  const customFooterItems = [
    <div
      key="footer1"
      className="h-10 bg-purple-600/80 rounded flex items-center justify-center"
    >
      <span className="text-xs text-white">Company Name</span>
    </div>,
    <div
      key="footer2"
      className="h-10 bg-purple-600/80 rounded flex items-center justify-center"
    >
      <span className="text-xs text-white">v1.0.2</span>
    </div>,
  ];

  // Custom collapsed footer items
  const customCollapsedFooterItems = [
    <div
      key="collapsed-footer1"
      className="h-8 w-8 bg-purple-600/80 rounded flex items-center justify-center"
    >
      <span className="text-xs text-white">CN</span>
    </div>,
    <div
      key="collapsed-footer2"
      className="h-8 w-8 bg-purple-600/80 rounded flex items-center justify-center"
    >
      <span className="text-xs text-white">v1</span>
    </div>,
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Sidebar Component</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => setCollapsed(!collapsed)}
              size="sm"
              variant={collapsed ? "default" : "outline"}
            >
              {collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </Button>
            <p className="text-sm font-medium text-muted-foreground">
              {collapsed
                ? "✨ Hover over icons to see the submenus with pointing arrows"
                : "Click on menu items with dropdown indicators to expand submenus"}
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden h-[600px] relative bg-background">
            <Sidebar
              defaultCollapsed={collapsed}
              className="absolute left-0 top-0 h-full"
              navItems={customNavItems}
              logo={customLogo}
              collapsedLogo={customCollapsedLogo}
              footerItems={customFooterItems}
              collapsedFooterItems={customCollapsedFooterItems}
            />
            <div
              className={`${collapsed ? "pl-[60px]" : "pl-[240px]"} p-4 transition-all duration-300 h-full`}
            >
              <div className="bg-muted/30 rounded-lg h-full p-4 flex flex-col items-center justify-center gap-4">
                <div className="text-center max-w-md">
                  <p className="text-lg font-medium mb-2">Main content area</p>
                  {collapsed ? (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-800">
                      <p className="font-medium mb-1">
                        Try hovering over these icons:
                      </p>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-left">
                        <li>
                          <strong>Projects icon</strong>: Shows submenu with an
                          arrow pointing to the icon
                        </li>
                        <li>
                          <strong>Calendar icon</strong>: Shows submenu with
                          different view options
                        </li>
                        <li>
                          <strong>Settings icon</strong>: Shows account,
                          preferences and security options
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <p>
                      Try clicking on menu items with dropdown indicators to
                      expand their submenus
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <pre className="text-sm">
          {`// Basic usage with custom navigation items, logos and footers
<Sidebar 
  navItems={customNavItems}
  logo={customLogo}
  collapsedLogo={customCollapsedLogo}
  footerItems={customFooterItems}
  collapsedFooterItems={customCollapsedFooterItems}
/>

// Example of a custom nav item with submenus
const navItems = [
  {
    icon: <Calendar />,
    label: "Calendar",
    subItems: [
      { label: "Month View", href: "#month" },
      { label: "Week View", href: "#week" },
    ],
  },
  // more nav items...
];

// When sidebar is collapsed, submenus appear on hover with pointing arrows
// When expanded, submenus toggle on click`}
        </pre>
      </div>
    </section>
  );
}

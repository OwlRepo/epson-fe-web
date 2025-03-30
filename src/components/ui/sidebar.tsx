import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  Settings,
  Users,
  FileText,
  HelpCircle,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

interface SubItem {
  label: string;
  href: string;
}

interface NavItemConfig {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  subItems?: SubItem[];
}

interface SidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
  navItems?: NavItemConfig[];
  logo?: React.ReactNode;
  footerItems?: React.ReactNode[];
  collapsedLogo?: React.ReactNode;
  collapsedFooterItems?: React.ReactNode[];
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  collapsed?: boolean;
  subItems?: SubItem[];
}

const NavItem = ({
  icon,
  label,
  isActive,
  href,
  onClick,
  collapsed,
  subItems,
}: NavItemProps) => {
  const [showSubmenu, setShowSubmenu] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const itemRef = React.useRef<HTMLDivElement>(null);
  const submenuContainerRef = React.useRef<HTMLDivElement | null>(null);

  const hasSubItems = subItems && subItems.length > 0;

  const updateSubmenuPosition = React.useCallback(() => {
    if (
      collapsed &&
      showSubmenu &&
      itemRef.current &&
      submenuContainerRef.current
    ) {
      const rect = itemRef.current.getBoundingClientRect();
      submenuContainerRef.current.style.setProperty(
        "--submenu-top-position",
        `${rect.top}px`
      );
    }
  }, [collapsed, showSubmenu]);

  // Update position when submenu visibility changes
  React.useEffect(() => {
    updateSubmenuPosition();
    // Add window resize listener to update position
    window.addEventListener("resize", updateSubmenuPosition);
    return () => window.removeEventListener("resize", updateSubmenuPosition);
  }, [showSubmenu, updateSubmenuPosition]);

  const handleMouseEnter = () => {
    if (collapsed && hasSubItems) {
      setShowSubmenu(true);
    }
  };

  const handleMouseLeave = () => {
    if (collapsed) {
      setShowSubmenu(false);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={itemRef}
    >
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start px-3 py-2 h-10 font-normal text-gray-700",
          collapsed && "justify-center px-0",
          isActive ? "bg-gray-100" : "hover:bg-gray-50",
          hasSubItems && !collapsed && "justify-between",
          hasSubItems && collapsed && "hover:bg-gray-100"
        )}
        asChild={!!href && !hasSubItems}
        onClick={hasSubItems ? toggleExpand : onClick}
      >
        {href && !hasSubItems ? (
          <Link
            to={href}
            className={cn(
              "flex items-center gap-2",
              collapsed && "justify-center"
            )}
          >
            {icon}
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center gap-2",
                collapsed && "justify-center w-full"
              )}
            >
              {icon}
              {!collapsed && <span className="truncate">{label}</span>}
            </div>
            {hasSubItems && !collapsed && (
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-200 text-gray-400",
                  isExpanded && "transform rotate-180"
                )}
              />
            )}
          </>
        )}
      </Button>

      {/* Submenu for non-collapsed state */}
      {hasSubItems && !collapsed && isExpanded && (
        <div className="pl-8 mt-1 space-y-1 border-l border-gray-200 ml-3">
          {subItems.map((item, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              asChild
            >
              <Link to={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      )}

      {/* Floating submenu for collapsed state */}
      {hasSubItems && collapsed && showSubmenu && (
        <div
          ref={submenuContainerRef}
          className="fixed z-50 left-[60px] bg-white border border-gray-200 rounded-md shadow-md py-2 px-1 min-w-[220px] max-h-[calc(100vh-250px)] overflow-auto"
          style={{ top: "var(--submenu-top-position, 0)" }}
        >
          {/* Arrow pointing to the menu item */}
          <div className="absolute w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-[-45deg] left-[-5px] top-[18px] z-10" />

          <div className="font-medium px-3 py-2 text-sm border-b border-gray-200 mb-2 flex items-center text-gray-700">
            {icon && <span className="mr-2">{icon}</span>}
            {label}
          </div>
          <div className="space-y-1 overflow-y-auto px-1">
            {subItems.map((item, idx) => (
              <Button
                key={idx}
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                asChild
              >
                <Link to={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Default nav items
const defaultNavItems: NavItemConfig[] = [
  {
    icon: <HomeIcon className="text-gray-500" />,
    label: "Home",
    isActive: true,
    href: "#",
  },
  {
    icon: <LayoutDashboard className="text-gray-500" />,
    label: "Dashboard",
    href: "#",
    subItems: [
      { label: "Overview", href: "#overview" },
      { label: "Departments", href: "#departments" },
      { label: "Entry & Exit Points", href: "#entry-exit" },
    ],
  },
  {
    icon: <Users className="text-gray-500" />,
    label: "Employees",
    href: "#",
  },
  {
    icon: <FileText className="text-gray-500" />,
    label: "Attendance Monitoring",
    href: "#",
    subItems: [
      { label: "Daily Reports", href: "#daily" },
      { label: "Weekly Summary", href: "#weekly" },
      { label: "Monthly Analytics", href: "#monthly" },
    ],
  },
  {
    icon: <Settings className="text-gray-500" />,
    label: "Settings",
    href: "#",
    subItems: [
      { label: "User Settings", href: "#user-settings" },
      { label: "System Settings", href: "#system-settings" },
      { label: "Permissions", href: "#permissions" },
    ],
  },
  {
    icon: <HelpCircle className="text-gray-500" />,
    label: "Help & Support",
    href: "#",
  },
];

// Default logo
const defaultLogo = (
  <div className="h-8 w-full bg-blue-800 rounded flex items-center justify-center">
    <span className="font-bold text-white">EPSON</span>
  </div>
);

// Default footer items
const defaultFooterItems = [
  <div
    key="footer1"
    className="h-10 bg-blue-800/80 rounded flex items-center justify-center"
  >
    <span className="text-xs text-white">Footer Logo 1</span>
  </div>,
  <div
    key="footer2"
    className="h-10 bg-blue-800/80 rounded flex items-center justify-center"
  >
    <span className="text-xs text-white">Footer Logo 2</span>
  </div>,
];

// Default collapsed footer items
const defaultCollapsedFooterItems = [
  <div
    key="collapsed-footer1"
    className="h-8 w-8 bg-blue-800/80 rounded flex items-center justify-center"
  >
    <span className="text-xs text-white">1</span>
  </div>,
  <div
    key="collapsed-footer2"
    className="h-8 w-8 bg-blue-800/80 rounded flex items-center justify-center"
  >
    <span className="text-xs text-white">2</span>
  </div>,
];

export function Sidebar({
  className,
  defaultCollapsed = false,
  navItems = defaultNavItems,
  logo = defaultLogo,
  footerItems = defaultFooterItems,
  collapsedLogo,
  collapsedFooterItems = defaultCollapsedFooterItems,
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out h-screen",
        collapsed ? "w-[60px]" : "w-[240px]",
        className
      )}
      data-collapsed={collapsed}
    >
      {/* Header with logo */}
      <div
        className={cn(
          "flex items-center p-4 border-b border-gray-200",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed ? logo : collapsedLogo}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
            collapsed ? (collapsedLogo ? "ml-auto" : "mx-auto") : "ml-auto"
          )}
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item, index) => (
          <NavItem
            key={`nav-item-${index}`}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
            href={item.href}
            onClick={item.onClick}
            collapsed={collapsed}
            subItems={item.subItems}
          />
        ))}
      </nav>

      {/* Footer with additional brand elements */}
      {(footerItems.length > 0 || collapsedFooterItems.length > 0) && (
        <div className="p-4 border-t border-gray-200 mt-auto">
          {!collapsed ? (
            <div className="space-y-2">
              {footerItems.map((item, index) => (
                <React.Fragment key={`footer-item-${index}`}>
                  {item}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {collapsedFooterItems.map((item, index) => (
                <React.Fragment key={`collapsed-footer-item-${index}`}>
                  {item}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
